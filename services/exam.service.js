const { ResponseService } = require('../model/response')
const { LANGUAGE_MAP } = require('../utils/master-data')
const constant = require('../utils/constant')
const axios = require("axios");
const examRepo = require('../repositories/exam.repo')
const logger = require('../logger/logger');
const MASTER_DATA = require('../utils/master-data');

const compileCode = async (examId, questionNumber, language, code) => {
    if (!LANGUAGE_MAP[language]) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Ngôn ngữ lập trình không được support. Vui lòng kiểm tra lại')
    }

    // Kiểm tra câu hỏi có tồn tại hay không
    const questionExist = await examRepo.getQuestionByExamIdAndQuestionNumber(examId, questionNumber)
    if (!questionExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Câu hỏi không tồn tại. Vui lòng kiểm tra lại!')
    }

    // Lấy ra tất cả test case của question
    const testcases = await examRepo.getTestCasesByQuestionId(Number(questionExist.question_id || 0))
    if (!testcases || testcases.length === 0) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Không tìm thấy test case cho câu hỏi!')
    }

    let configPistonAPI = {
        method: 'post',
        url: 'https://emkc.org/api/v2/piston/execute',
        headers: {
            'Content-Type': 'application/json'
        },
        data: ''
    }

    let numberOfTestPass = 0
    let errorMessage = ''
    for (const testcase of testcases) {
        let inputTest = String(testcase.input_data) || ''
        let outputTest = String(testcase.expected_output).trimEnd() || ''

        let data = {
            "language": LANGUAGE_MAP[language].language,
            "version": LANGUAGE_MAP[language].version,
            "files": [
                {
                    "name": "main",
                    "content": code
                }
            ],
            "stdin": inputTest
        }
        configPistonAPI.data = data

        try {
            // Call API của Piston để thực thi code
            const apiResult = await axios(configPistonAPI)
            let executeResult = apiResult.data.run
            if (executeResult.code === 0) {
                let outputExecute = executeResult.stdout?.trimEnd('\n')
                if (outputExecute === outputTest) {
                    numberOfTestPass++
                }
            } else {
                if (!errorMessage) {
                    errorMessage = executeResult.stderr
                }
            }
        } catch (err) {
            logger.error(`Exception when compile code: ${err?.message}`)
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra trong quá trình compile code. Vui lòng thử lại sau!')
        }
    }

    const result = {
        totalTestCase: Number(questionExist.total_test_cases || 0),
        totalTestCasePass: numberOfTestPass,
        executeMessage: errorMessage
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', result)
}

const submitExamResult = async (data, userId) => {
    const { examId, startTime, endTime, questionResults } = data

    const exam = await examRepo.getExamById(examId)
    if (!exam) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Bài thi không tồn tại hoặc đã bị xóa khỏi hệ thống!')
    }

    // Tính điểm của bài thi
    const totalQuestion = Number(exam?.total_question || 0)
    const scorePerQuestion = 10 / totalQuestion
    let totalScore = 0

    const questions = await examRepo.getQuestionsByExamId(examId)
    const results = await examRepo.getResultsByExamId(examId)

    let questionMap = new Map()
    for (const question of questionResults) {
        if (question.questionType !== MASTER_DATA.QUESTION_TYPE.TYPE_4) {
            questionMap.set(question.questionNumber, question.results)
        } else {
            questionMap.set(question.questionNumber, question.sourceCode)
        }
    }

    let userResultInsert = []
    for (const question of questions) {
        if (question.question_type !== MASTER_DATA.QUESTION_TYPE.TYPE_4) {
            // Tính toán điểm của câu hỏi loại 1,2,3
            let resultMap = new Map()
            results?.filter(x => x.question_id === question.question_id)?.map(x => {
                resultMap.set(x.result_key, {
                    resultValue: x.result_value,
                    isCorrect: Boolean(x.is_correct)
                })
            })

            let userResults = questionMap.get(question.question_number)
            let pass = true

            for (const result of userResults) {
                const examResult = resultMap.get(result.resultKey)
                if (question.question_type === MASTER_DATA.QUESTION_TYPE.TYPE_3) {
                    if (examResult.resultValue !== result.userResult) {
                        pass = false
                    }
                    userResultInsert.push({
                        questionId: question.question_id,
                        choosedResultKey: result.resultKey,
                        choosedResultValue: result.userResult
                    })
                } else {
                    if ((examResult.isCorrect && !result.userChoosed) || (!examResult.isCorrect && result.userChoosed)) {
                        pass = false
                    }
                    if (result.userChoosed) {
                        userResultInsert.push({
                            questionId: question.question_id,
                            choosedResultKey: result.resultKey,
                            choosedResultValue: result.userResult
                        })
                    }
                }
            }

            if (pass) {
                totalScore += scorePerQuestion
            }
        } else {
            // Tính toán điểm của câu hỏi loại 4
            const sourceCode = questionMap.get(question.question_number)
            const compileResult = await compileCode(examId, Number(question.question_number), sourceCode?.language || '', sourceCode?.submitedCode || '')
            let totalCorrectTestCases = 0

            if (compileResult.resultCode !== constant.RESPONSE_CODE.FAIL) {
                totalCorrectTestCases = compileResult.data.totalTestCasePass
                totalScore += scorePerQuestion * compileResult.data.totalTestCasePass / compileResult.data.totalTestCase
            }

            userResultInsert.push({
                questionId: question.question_id,
                totalCorrectTestCases: totalCorrectTestCases,
                submittedCode: sourceCode?.submitedCode || ''
            })
        }
    }

    // Lưu kết quả làm bài
    const insertResult1 = await examRepo.insertAttempt(userId, exam?.class_id || 0, examId, startTime, endTime, Number(totalScore.toFixed(2)))
    if (insertResult1.rowCount === 0 || !insertResult1.rows[0].attempt_id) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    const attemptId = insertResult1.rows[0].attempt_id
    if (userResultInsert.length > 0) {
        const insertResult2 = await examRepo.insertAttemptAnswer(attemptId, userResultInsert)
        if (insertResult2.rowCount !== userResultInsert.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
        }
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', {
        score: totalScore
    })
}


module.exports = {
    compileCode,
    submitExamResult
}