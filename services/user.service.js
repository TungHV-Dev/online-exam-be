const userRepo = require('../repositories/user.repo')
const roleRepo = require('../repositories/role.repo')
const masterData = require('../utils/master-data')
const { ResponseService } = require('../model/response')
const constant = require('../utils/constant')

const getAllTeacher = async () => {
    const condition = {
        roleId: masterData.ROLE.ROLE_ID.TEACHER
    }

    const teachers = await userRepo.getUsers(condition)
    return teachers
}

const getAllExamCreators = async () => {
    const result = await Promise.all([
        userRepo.getUsers({ roleId: masterData.ROLE.ROLE_ID.ADMIN }),
        userRepo.getUsers({ roleId: masterData.ROLE.ROLE_ID.TEACHER })
    ])

    const admins = result[0] || []
    const teachers = result[1] || []
    const creators = [...admins, ...teachers]

    return creators
}

const getAllRoles = async () => {
    const roles = await roleRepo.getAllRoles()
    return roles
}

const searchUsers = async (page, size, searchValue) => {
    const limit = size
    const offset = page * size
    const result = await userRepo.getUsersPaging(searchValue, offset, limit)
    return result
}

const getUserInfor = async (profileId) => {
    const user = await userRepo.getUserById(profileId)
    return user
}

const lockUser = async (data) => {
    const { userId, lock } = data
    const _lock = lock ? 1 : 0

    const result = await userRepo.lockUser(userId, _lock)
    if (result.rowCount > 0) {
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    }
    return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
}

const updateUserInfor = async (data) => {
    const { userId, userName, fullName, roleId, dateOfBirth, gender, email, phoneNumber, address } = data

    let userExist = null

    // Kiểm tra xem người dùng có tồn tại trong hệ thống hay không
    userExist = await userRepo.getUserByIdAndName(userId, userName)
    if (!userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống!')
    }

    // Kiểm tra xem email mới đã có trong hệ thống và thuộc về người dùng khác hay không
    userExist = await userRepo.getUserByEmail(email)
    if (userExist && userExist.user_id !== userId) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Email đã tồn tại trong hệ thống!')
    }

    const updateResult = await userRepo.updateUserInfor(fullName, roleId, dateOfBirth, gender, email, phoneNumber, address, userId)
    if (updateResult.rowCount === 0) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
    }

    return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
}

module.exports = {
    getAllTeacher,
    getAllExamCreators,
    getAllRoles,
    searchUsers,
    getUserInfor,
    lockUser,
    updateUserInfor
}