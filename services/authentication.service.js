const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRepo = require('../repositories/user.repo')
const masterData = require('../utils/master-data')
const constant = require('../utils/constant')
const { ResponseService } = require('../model/response')

const registerUser = async (data) => {
    const { username, password, roleId, fullName, dateOfBirth, gender, email, phoneNumber, address } = data

    let userExist = null
    userExist = await userRepo.getUserByUsername(username)
    if (userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tên người dùng đã tồn tại trong hệ thống!')
    }

    userExist = await userRepo.getUserByEmail(email)
    if (userExist) {
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Email đã tồn tại trong hệ thống!')
    }

    const saltRounds = 10
    const passwordHash = bcrypt.hashSync(password, saltRounds)

    const userInsertedResult = await userRepo.insertUser({
        user_name: username,
        password_hash: passwordHash,
        full_name: fullName,
        role_id: roleId,
        gender: gender,
        address: address,
        phone_number: phoneNumber,
        email: email
    })

    if (userInsertedResult.rowCount > 0 && userInsertedResult.rows[0].user_id) {
        new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    }

    return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tạo người dùng thất bại')
}

module.exports = {
    registerUser
}