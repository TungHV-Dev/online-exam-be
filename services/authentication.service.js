const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const userRepo = require('../repositories/user.repo')
const roleRepo = require('../repositories/role.repo')
const constant = require('../utils/constant')
const { ResponseService } = require('../model/response')
const logger = require('../logger/logger')
const moment = require('moment')

const registerUser = async (data) => {
    try {
        const { username, password, roleId, fullName, dateOfBirth, gender, email, phoneNumber, address } = data

        // Kiểm tra user đã tồn tại chưa
        let userExist = null
        userExist = await userRepo.getUserByUsername(username)
        if (userExist) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tên người dùng đã tồn tại trong hệ thống!')
        }
    
        userExist = await userRepo.getUserByEmail(email)
        if (userExist) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Email đã tồn tại trong hệ thống!')
        }
    
        // Tạo mật khẩu mã hóa và lưu thông tin user
        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)
        
        const userInsertedResult = await userRepo.insertUser({
            user_name: username,
            password_hash: passwordHash,
            full_name: fullName,
            role_id: roleId,
            email: email,
            gender: gender,
            address: address,
            phone_number: phoneNumber,
            date_of_birth: dateOfBirth
        })
    
        if (userInsertedResult.rowCount > 0 && userInsertedResult.rows[0]?.user_id) {
            return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
        }
    
        return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tạo người dùng thất bại')
    } catch (err) {
        throw err
    }
}

const login = async (data) => {
    try {
        const { username, password } = data
        // Kiểm tra xem user có tồn tại hay không
        const user = await userRepo.getUserByUsername(username)
        if (!user) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Người dùng không tồn tại trong hệ thống!')
        }

        logger.info(`User ${user.user_id} login at ${new Date()}. Information: is_locked = ${user.is_locked}, login_failed_counter = ${user.login_failed_counter}, lock_until_time = ${new Date(user.lock_until_time)}`)

        if (user.is_locked === 1) {
            if (user.lock_until_time) {
                if (new Date(user.lock_until_time) > new Date()) {
                    // Tài khoản bị khoá 15 phút
                    return new ResponseService(
                        constant.RESPONSE_CODE.FAIL, 
                        `Tài khoản đã bị khóa. Vui lòng chờ tới ${moment(new Date(user.lock_until_time)).format(constant.DATE_FORMAT.YYYY_MM_DD_HH_mm_ss)} hoặc liên hệ quản trị viên!`
                    )
                } else {
                    // Hết thời gian khoá tài khoản, reset số lần đăng nhập sai về 0 và mở khoá
                    await userRepo.updateLockUserInfor(Number(user.user_id), true)
                }
            } else {
                // Tài khoản bị khoá vô thời hạn (trường lock_until_time nhận giá trị null)
                return new ResponseService(
                    constant.RESPONSE_CODE.FAIL,
                    'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!'
                )
            }
        }

        // Kiểm tra password
        const passwordHashInDb = user.password_hash || ''
        const checkPassword = bcrypt.compareSync(password, passwordHashInDb)
        if (!checkPassword) {
            await userRepo.updateLockUserInfor(Number(user.user_id), false) // Cập nhật số lần đăng nhập thất bại vào DB

            if (Number(user.login_failed_counter) + 1 < 5) {             
                return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!')
            } else {
                return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tài khoản đã bị khoá 15 phút do nhập sai mật khẩu quá 5 lần!')
            }
        }

        // Generate access token
        const functionCodes = []
        const functionList = await roleRepo.getPermissionByRoleId(user.role_id)
        functionList.map(func => {
            functionCodes.push(func.function_code)
        })
        // Tạo payload của JWT token
        const claim = {
            userId: user.user_id,
            userName: user.user_name,
            fullName: user.full_name,
            email: user.email,
            functionCodes: functionCodes
        }
        const privateKey = fs.readFileSync('./online_exam_private_key.pem', 'utf8')
        const jwtToken = jwt.sign(claim, privateKey, {
            algorithm: 'RS256',
            expiresIn: '4h'
        })
        
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', {
            accessToken: jwtToken
        })
    } catch (err) {
        throw err
    }
}

const resetPassword = async (data) => {
    try {
        const { username, newPassword } = data
        // Kiểm tra xem user có tồn tại hay không
        const user = await userRepo.getUserByUsername(username)
        if (!user) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Người dùng không tồn tại trong hệ thống!')
        }

        // Tạo mật khẩu mã hóa mới và lưu thông tin user
        const saltRounds = 10
        const newPasswordHash = bcrypt.hashSync(newPassword, saltRounds)

        const resultUpdate = await userRepo.updatePasswordUser(user.user_id, newPasswordHash)
        if (resultUpdate.rowCount === 0) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Cập nhật mật khẩu thất bại')
        }

        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    } catch (err) {
        throw err
    }
}

const changePassword = async (data) => {
    try {
        const { username, password, newPassword } = data
        // Kiểm tra xem user có tồn tại hay không
        const user = await userRepo.getUserByUsername(username)
        if (!user) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Người dùng không tồn tại trong hệ thống!')
        }

        // Kiểm tra mật khẩu hiện tại có chính xác không
        const passwordHashInDb = user.password_hash || ''
        const checkPassword = bcrypt.compareSync(password, passwordHashInDb)
        if (!checkPassword) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại!')
        }

        // Tạo mật khẩu mã hóa mới và lưu thông tin user
        const saltRounds = 10
        const newPasswordHash = bcrypt.hashSync(newPassword, saltRounds)

        const resultUpdate = await userRepo.updatePasswordUser(user.user_id, newPasswordHash)
        if (resultUpdate.rowCount === 0) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Cập nhật mật khẩu thất bại')
        }

        return new ResponseService(constant.RESPONSE_CODE.SUCCESS)
    } catch (err) {
        throw err
    }
}

module.exports = {
    registerUser,
    login,
    resetPassword,
    changePassword
}