const userRepo = require('../repositories/user.repo')
const roleRepo = require('../repositories/role.repo')
const masterData = require('../utils/master-data')

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

module.exports = {
    getAllTeacher,
    getAllRoles,
    searchUsers
}