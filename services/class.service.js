const { ResponseService } = require('../model/response')
const constant = require('../utils/constant')
const MASTER_DATA = require('../utils/master-data')
const classRepo = require('../repositories/class.repo')
const userRepo = require('../repositories/user.repo')
const examRepo = require('../repositories/exam.repo')

const getPublishedClassList = async (joined = true, userId, roleId) => {
    let classList = []

    if (joined === true) {
        classList = await classRepo.getClassListUserJoined(userId)
    } else {
        let _userId = userId
        if (roleId === MASTER_DATA.ROLE.ROLE_ID.ADMIN) {
            _userId = 0
        }
        classList = await classRepo.getClassListUserNotJoin(_userId)
    }
    
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', classList)
}

const createNewClass = async (payload) => {
    const teacherId = payload.teacherId || 0
    const classCode = payload.classCode || ''
    const className = payload.className || ''
    const description = payload.description || ''

    const classExist = await classRepo.getClassByClassCode(classCode)
    if (classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Mã lớp học đã tồn tại. Vui lòng kiểm tra lại!')
    }

    const result = await classRepo.insertClass(teacherId, classCode, className, description)
    if (result.rowCount > 0 && result.rows[0].class_id) {
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    }

    return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
}

const joinPublishedClass = async (data) => {
    const { classId, userId } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    const userExist = await classRepo.checkUserExistInClass(classId, userId)
    if (userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên đã tham gia lớp học. Vui lòng kiểm tra lại!')
    }

    const result = await classRepo.addUserToClass(classId, userId)
    if (result.rowCount > 0 && result.rows[0].id) {
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    }
    return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
}

const getClassDetail = async (data, roleId) => {
    const { classId, userId } = data
    const classExist = await classRepo.getClassByIdV2(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId === MASTER_DATA.ROLE.ROLE_ID.STUDENT) {
        const userExist = await classRepo.checkUserExistInClass(classId, userId)
        if (!userExist) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
        }
    }

    let result = {
        classCode: classExist.class_code,
        className: classExist.class_name,
        teacherName: `${classExist.teacher_full_name} (${classExist.teacher_user_name})`,
        description: classExist.description,
    }

    const students = await userRepo.getStudentsByClassId(classId)
    result.students = students
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', result)
}

const getListExamNeedDone = async (data, roleId) => {
    const { classId, userId, page, size } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId === MASTER_DATA.ROLE.ROLE_ID.STUDENT) {
        const userExist = await classRepo.checkUserExistInClass(classId, userId)
        if (!userExist) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
        }
    }

    const limit = size
    const offset = page * size

    const exams = await classRepo.getListExamNeedDonePaging(classId, offset, limit)
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', exams)
}

const getListExamCreated = async (data, roleId) => {
    const { classId, userId, page, size } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId === MASTER_DATA.ROLE.ROLE_ID.STUDENT) {
        const userExist = await classRepo.checkUserExistInClass(classId, userId)
        if (!userExist) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
        }
    }

    const limit = size
    const offset = page * size

    const exams = await classRepo.getListExamCreatedPaging(classId, offset, limit)
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', exams)
}

const getDocumentList = async (data, roleId) => {
    const { classId, userId, page, size } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId === MASTER_DATA.ROLE.ROLE_ID.STUDENT) {
        const userExist = await classRepo.checkUserExistInClass(classId, userId)
        if (!userExist) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
        }
    }

    const limit = size
    const offset = page * size

    const documents = await classRepo.getDocumentListPaging(classId, offset, limit)
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', documents)
}

const addDocument = async (data, roleId) => {
    const { classId, teacherId, fileName, filePath } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId !== MASTER_DATA.ROLE.ROLE_ID.ADMIN) {
        if (classExist.teacher_id !== teacherId) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Thêm tài liệu thất bại. Người dùng không phải giáo viên của lớp học!')
        }
    }

    const insertedResult = await classRepo.insertClassDocument(classId, fileName, filePath)
    if (insertedResult.rowCount > 0 && insertedResult.rows[0].document_id) {
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    }

    return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
}

const createExam = async (data, roleId) => {
    const { classId, examName, description, totalMinutes, publish, questions, teacherId } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    if (roleId !== MASTER_DATA.ROLE.ROLE_ID.ADMIN) {
        if (classExist.teacher_id !== teacherId) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tạo bài thi thất bại. Người dùng không phải giáo viên của lớp học!')
        }
    }

    const insertExamResult = await examRepo.insertExam(classId, examName, description, questions.length, totalMinutes, Number(publish))
    if (insertExamResult.rowCount === 0 || !insertExamResult.rows[0].exam_id) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    const examId = Number(insertExamResult.rows[0].exam_id)
    if (questions.length > 0) {
        const insertQuestionResult = await examRepo.insertQuestions(examId, questions)
        if (insertQuestionResult.rowCount !== questions.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
        }

        const questionIds = insertQuestionResult.rows
        let resultList = []

        for (let i = 0; i < questions.length; i++) {
            const questionId = questionIds[i].question_id
            const questionResults = questions[i]?.results?.map(result => {
                result.questionId = questionId
                result.isCorrect = Number(result.isCorrect)
                return result
            })
            resultList.push(...questionResults)
        }

        const insertResult = await examRepo.insertResults(resultList)
        if (insertResult.rowCount !== resultList.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
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

    // Xóa các câu hỏi và đáp án cũ đi để insert mới
    await examRepo.deleteResults(examId)
    await examRepo.deleteQuestions(examId)

    if (questions.length > 0) {
        const insertQuestionResult = await examRepo.insertQuestions(examId, questions)
        if (insertQuestionResult.rowCount !== questions.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
        }

        const questionIds = insertQuestionResult.rows
        let resultList = []

        for (let i = 0; i < questions.length; i++) {
            const questionId = questionIds[i].question_id
            const questionResults = questions[i]?.results?.map(result => {
                result.questionId = questionId
                result.isCorrect = Number(result.isCorrect)
                return result
            })
            resultList.push(...questionResults)
        }

        const insertResult = await examRepo.insertResults(resultList)
        if (insertResult.rowCount !== resultList.length) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
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

    await examRepo.deleteResults(examId)
    await examRepo.deleteQuestions(examId)

    const deletedExam = await examRepo.deleteExam(examId)
    if (deletedExam.rowCount === 0) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
}

const viewExam = async (data) => {
    const { examId, classId } = data

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
        questionList.push(questionItem)
    }
    result.questions = questionList
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', result)
}

const joinExam = async (data) => {

}

module.exports = {
    getPublishedClassList,
    createNewClass,
    joinPublishedClass,
    getClassDetail,
    getDocumentList,
    getListExamNeedDone,
    getListExamCreated,
    addDocument,
    createExam,
    updateExam,
    deleteExam,
    viewExam,
    joinExam
}