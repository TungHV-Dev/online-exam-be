const jwt = require('jsonwebtoken')
const fs = require('fs')
const userRepo = require('../repositories/user.repo')
const constant = require('../utils/constant')
const logger = require('../logger/logger')

const verifyToken = async (req, res, next) => {
    try {
        let token = ''
        const authHeader = req.headers.authorization
        if (authHeader.startsWith('Bearer ')){
            token = authHeader.substring(7, authHeader.length);
        }

        if (!token) {
            return res.status(constant.HTTP_STATUS_CODE.FORBIDDEN_REQUEST).json({
                code: -1,
                message: 'Cần token để xác thực request!'
            })
        }

        const publicKey = fs.readFileSync('./online_exam_public_key.pem', 'utf8')
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ['RS256']
        })

        const user = await userRepo.getUserByIdAndName(decoded.userId || 0, decoded.userName || '')
        if (!user) {
            return res.status(constant.HTTP_STATUS_CODE.UNAUTHORIZED).json({
                code: -1,
                message: 'Token không thuộc về người dùng nào trong hệ thống!'
            })
        }

        if (user.is_locked === 1) {
            return res.status(constant.HTTP_STATUS_CODE.UNAUTHORIZED).json({
                code: -1,
                message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!'
            })
        }

        req.roleId = user.role_id
        req.userId = user.user_id
    } catch (err) {
        logger.error(`Exception while verify jwt token: ${err?.message}`)

        let message = ''
        if (err instanceof jwt.TokenExpiredError) {
            message = 'Token hết hạn. Vui lòng đăng nhập lại!'
        } else {
            message = 'Token không hợp lệ. Vui lòng kiểm tra lại!'
        }

        return res.status(constant.HTTP_STATUS_CODE.UNAUTHORIZED).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: message
        })
    }

    return next()
}


module.exports = {
    verifyToken
}