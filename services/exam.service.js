const { ResponseService } = require('../model/response')
const { LANGUAGE_MAP } = require('../utils/master-data')
const constant = require('../utils/constant')
const axios = require("axios");
const classRepo = require('../repositories/class.repo')
const examRepo = require('../repositories/exam.repo')
const logger = require('../logger/logger');
const MASTER_DATA = require('../utils/master-data');
const moment = require('moment')

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

const createExam = async (data, roleId, userId) => {
    const { classId, examName, description, totalMinutes, publish, questions, teacherId, subjectId, isInStorage } = data

    const classExist = await classRepo.getClassById(classId)
    if (classExist && roleId !== MASTER_DATA.ROLE.ROLE_ID.ADMIN) {
        if (classExist.teacher_id !== teacherId) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tạo bài thi thất bại. Người dùng không phải giáo viên của lớp học!')
        }
    }

    const insertExamResult = await examRepo.insertExam(examName, description, questions.length, totalMinutes, Number(publish), subjectId, Number(isInStorage), Number(userId))
    if (insertExamResult.rowCount === 0 || !insertExamResult.rows[0].exam_id) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    const examId = Number(insertExamResult.rows[0].exam_id)

    if (classExist) {
        const insertExamClassRs = await examRepo.insertExamClass(examId, classId)
        if (insertExamClassRs.rowCount === 0 || !insertExamClassRs.rows[0].id) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
        }
    }

    if (questions.length > 0) {
        const insertQuestionResult = await examRepo.insertQuestions(examId, questions)
        if (insertQuestionResult.rowCount !== questions.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
        }

        const questionIds = insertQuestionResult.rows
        let resultList = []
        let testcaseList = []

        for (let i = 0; i < questions.length; i++) {
            const questionId = questionIds[i].question_id
            const questionResults = questions[i]?.results?.map(result => {
                result.questionId = questionId
                result.isCorrect = Number(result.isCorrect)
                return result
            }) || []
            resultList.push(...questionResults)

            const testcases = questions[i]?.testcases?.map(testcase => {
                testcase.questionId = questionId
                testcase.isSampleCase = Number(testcase.isSampleCase)
                return testcase
            }) || []
            testcaseList.push(...testcases)
        }

        if (resultList.length > 0) {
            const insertResult = await examRepo.insertResults(resultList)
            if (insertResult.rowCount !== resultList.length) {
                return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra khi lưu đáp án. Vui lòng kiểm tra lại!')
            }
        }
        
        if (testcaseList.length > 0) {
            const insertTestCase = await examRepo.insertTestCases(testcaseList)
            if (insertTestCase.rowCount !== testcaseList.length) {
                return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra khi lưu test case. Vui lòng kiểm tra lại!')
            }
        }
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', examId)
}

const updateExam = async (data, roleId) => {
    const { examId, classId, examName, description, totalMinutes, publish, questions, teacherId } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId !== MASTER_DATA.ROLE.ROLE_ID.ADMIN) {
        if (classExist.teacher_id !== teacherId) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Cập nhật bài thi thất bại. Người dùng không phải giáo viên của lớp học!')
        }
    }

    const updateExamResult = await examRepo.updateExam(examId, examName, description, questions.length, totalMinutes, Number(publish))
    if (updateExamResult.rowCount === 0) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    // Xóa các câu hỏi, đáp án, test case cũ đi để insert mới (câu hỏi xóa sau cùng)
    await Promise.all([
        examRepo.deleteTestCases(examId),
        examRepo.deleteResults(examId)
    ])
    await examRepo.deleteQuestions(examId)

    if (questions.length > 0) {
        const insertQuestionResult = await examRepo.insertQuestions(examId, questions)
        if (insertQuestionResult.rowCount !== questions.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
        }

        const questionIds = insertQuestionResult.rows
        let resultList = []
        let testcaseList = []

        for (let i = 0; i < questions.length; i++) {
            const questionId = questionIds[i].question_id
            const questionResults = questions[i]?.results?.map(result => {
                result.questionId = questionId
                result.isCorrect = Number(result.isCorrect)
                return result
            }) || []
            resultList.push(...questionResults)

            const testcases = questions[i]?.testcases?.map(testcase => {
                testcase.questionId = questionId
                testcase.isSampleCase = Number(testcase.isSampleCase)
                return testcase
            }) || []
            testcaseList.push(...testcases)
        }

        if (resultList.length > 0) {
            const insertResult = await examRepo.insertResults(resultList)
            if (insertResult.rowCount !== resultList.length) {
                return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra khi lưu đáp án. Vui lòng kiểm tra lại!')
            }
        }
        
        if (testcaseList.length > 0) {
            const insertTestCase = await examRepo.insertTestCases(testcaseList)
            if (insertTestCase.rowCount !== testcaseList.length) {
                return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra khi lưu test case. Vui lòng kiểm tra lại!')
            }
        }
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', examId)
}

const deleteExam = async (data, roleId) => {
    const { classId, teacherId, examId } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId !== MASTER_DATA.ROLE.ROLE_ID.ADMIN) {
        if (classExist.teacher_id !== teacherId) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Xóa bài thi thất bại. Người dùng không phải giáo viên của lớp học!')
        }
    }

    await Promise.all([
        examRepo.deleteTestCases(examId),
        examRepo.deleteResults(examId)
    ])
    await examRepo.deleteQuestions(examId)

    const deletedExam = await examRepo.deleteExam(examId)
    if (deletedExam.rowCount === 0) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
}

const viewExam = async (data) => {
    const { examId } = data

    const exam = await examRepo.getExamById(examId)
    if (!exam) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Bài thi không tồn tại hoặc đã bị xóa khỏi hệ thống!')
    }

    const dataQueries = await Promise.all([
        examRepo.getQuestionsByExamId(examId),
        examRepo.getResultsByExamId(examId),
        examRepo.getTestCasesByExamId(examId, false)
    ])

    const questions = dataQueries[0] || []
    const results = dataQueries[1] || []
    const testcases = dataQueries[2] || []

    let result = {
        examId,
        examName: exam.exam_name,
        description: exam.description,
        totalMinutes: exam.total_minutes,
        publish: Boolean(exam.is_published),
    }

    let questionList = []
    for (const question of questions) {
        let questionItem = {
            questionNumber: question.question_number,
            questionType: question.question_type,
            questionContent: question.question_content
        }

        let resultList = results?.filter(x => x.question_id === question.question_id)?.sort((a, b) => a.result_key - b.result_key)?.map(x => {
            return {
                resultKey: x.result_key,
                resultValue: x.result_value,
                isCorrect: Boolean(x.is_correct)
            }
        })
        questionItem.results = resultList

        let testcaseList = testcases?.filter(x => x.question_id === question.question_id)?.map(x => {
            return {
                isSampleCase: Boolean(x.is_sample_case),
                inputData: x.input_data,
                expectedOutput: x.expected_output
            }
        })
        questionItem.testcases = testcaseList

        questionList.push(questionItem)
    }
    result.questions = questionList
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', result)
}

const viewExamByStudent = async (data, userId) => {
    const { examId, classId, actionType } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    const exam = await examRepo.getExamById(examId)
    if (!exam) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Bài thi không tồn tại hoặc đã bị xóa khỏi hệ thống!')
    }

    const questions = await examRepo.getQuestionsByExamId(examId)
    const results = await examRepo.getResultsByExamId(examId)
    const testcases = await examRepo.getTestCasesByExamId(examId, true)
    const attempt = await examRepo.getAttempt(userId, classId, examId)
    const userResults = await examRepo.getAttemptAnswer(attempt?.attempt_id || 0)

    let result = {
        examId,
        examName: exam.exam_name,
        description: exam.description,
        totalMinutes: exam.total_minutes,
        score: Number(attempt?.score || 0).toFixed(2)
    }

    let questionList = []
    for (const question of questions) {
        let questionItem = {
            questionNumber: question.question_number,
            questionType: question.question_type,
            questionContent: question.question_content
        }

        let resultList = null
        if (actionType === 'view') {
            const userResultForQuestion = userResults?.filter(x => x.question_id === question.question_id)
            const userResultMap = new Map()
            for (const rs of userResultForQuestion) {
                userResultMap.set(Number(rs.choosed_result_key), rs.choosed_result_value)
            }

            resultList = results?.filter(x => x.question_id === question.question_id)?.sort((a, b) => a.result_key - b.result_key)?.map(x => {
                return {
                    resultKey: x.result_key,
                    resultValue: x.result_value,
                    isCorrect: Boolean(x.is_correct),
                    userChoosed: userResultMap.has(Number(x.result_key)) ? true : false,
                    userResult: userResultMap.get(Number(x.result_key)) || ''
                }
            })
        } else {
            resultList = results?.filter(x => x.question_id === question.question_id)?.sort((a, b) => a.result_key - b.result_key)?.map(x => {
                return {
                    resultKey: x.result_key,
                    resultValue: x.result_value,
                    isCorrect: false,
                    userChoosed: false,
                    userResult: ''
                }
            })
        }
        questionItem.results = resultList

        let testcaseList = testcases?.filter(x => x.question_id === question.question_id)?.map(x => {
            return {
                isSampleCase: Boolean(x.is_sample_case),
                inputData: x.input_data,
                expectedOutput: x.expected_output
            }
        })
        questionItem.testcases = testcaseList

        questionList.push(questionItem)
    }
    result.questions = questionList
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', result)
}

const searchExam = async (page, size, subjectId, creatorId) => {
    const limit = size
    const offset = page * size

    let searchResult = await examRepo.searchExam(limit, offset, subjectId, creatorId)
    let formatedArr = []
    for (const item of searchResult.searchData) {
        formatedArr.push({
            examId: item.exam_id,
            subjectName: item.subject_name || '',
            examName: item.exam_name || '',
            totalQuestions: item.total_question || 0,
            totalMinutes: item.total_minutes || 0,
            creator: item.full_name && item.user_name ? `${item.full_name} (${item.user_name})` : item.user_name ? item.user_name : '',
            createdDate: item.created_time ? moment(item.created_time).format(constant.DATE_FORMAT.DD_MM_YYYY) : ''
        })
    }
    searchResult.searchData = formatedArr
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', searchResult)
}


module.exports = {
    compileCode,
    submitExamResult,
    createExam,
    updateExam,
    deleteExam,
    viewExam, 
    viewExamByStudent,
    searchExam
}