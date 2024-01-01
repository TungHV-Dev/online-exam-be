const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const userRepo = require('../repositories/user.repo')
const masterData = require('../utils/master-data')
const constant = require('../utils/constant')
const { ResponseService } = require('../model/response')

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

        if (user.is_locked === 1) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!')
        }

        // Kiểm tra password
        const passwordHashInDb = user.password_hash || ''
        const checkPassword = bcrypt.compareSync(password, passwordHashInDb)
        if (!checkPassword) {
            return new ResponseService(constant.RESPONSE_CODE.FAIL, 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!')
        }
        
        // Generate access token
        const claim = {
            userId: user.user_id,
            userRole: user.role_id,
            userName: user.user_name,
            email: user.email
        }
        const privateKey = fs.readFileSync('./online_exam_private_key.pem', 'utf8')
        const jwtToken = jwt.sign(claim, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h'
        })
        return new ResponseService(constant.RESPONSE_CODE.SUCCESS, '', {
            accessToken: jwtToken
        })
    } catch (err) {
        throw err
    }
}

module.exports = {
    registerUser,
    login
}