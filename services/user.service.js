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

const lockUser = async (data) => {
    const { userId, lock } = data
    const _lock = lock ? 1 : 0

    const result = await userRepo.lockUser(userId, _lock)
    if (result.rowCount > 0) {
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    }
    return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!')
}

module.exports = {
    getAllTeacher,
    getAllRoles,
    searchUsers,
    lockUser
}