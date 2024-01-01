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

module.exports = {
    getAllTeacher,
    getAllRoles
}