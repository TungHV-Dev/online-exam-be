const { ResponseService } = require('../model/response')
const constant = require('../utils/constant')
const classRepo = require('../repositories/class.repo')
const userRepo = require('../repositories/user.repo')

const getPublishedClassList = async (joined = true, userId) => {
    let classList = []

    if (joined === true) {
        classList = await classRepo.getClassListUserJoined(userId)
    } else {
        classList = await classRepo.getClassListUserNotJoin(userId)
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

const getClassDetail = async (data) => {
    const { classId, userId } = data
    const classExist = await classRepo.getClassByIdV2(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    const userExist = await classRepo.checkUserExistInClass(classId, userId)
    if (!userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
    }

    let result = {
        classCode: classExist.class_code,
        teacherName: `${classExist.teacher_full_name} (${classExist.teacher_user_name})`,
        description: classExist.description,
    }

    const students = await userRepo.getStudentsByClassId(classId)
    result.students = students
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', result)
}

const getListExamNeedDone = async (data) => {
    const { classId, userId, page, size } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    const userExist = await classRepo.checkUserExistInClass(classId, userId)
    if (!userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
    }

    const limit = size
    const offset = page * size

    const exams = await classRepo.getListExamNeedDonePaging(classId, offset, limit)
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', exams)
}

const getListExamCreated = async (data) => {
    const { classId, userId, page, size } = data

    const classExist = await classRepo.getClassById(classId)
    if (!classExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Lớp học không tồn tại!')
    }

    const userExist = await classRepo.checkUserExistInClass(classId, userId)
    if (!userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Học viên chưa tham gia lớp học. Vui lòng kiểm tra lại!')
    }

    const limit = size
    const offset = page * size

    const exams = await classRepo.getListExamCreatedPaging(classId, offset, limit)
    return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', exams)
}

const addDocument = async () => {

}

const createExam = async () => {

}

const viewExam = async () => {

}

const joinExam = async () => {

}

module.exports = {
    getPublishedClassList,
    createNewClass,
    joinPublishedClass,
    getClassDetail,
    getListExamNeedDone,
    getListExamCreated,
    addDocument,
    createExam,
    viewExam,
    joinExam
}