const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const { verifyToken } = require('../middleware/jwt.middleware')
const { verifyRole } = require('../middleware/role.middleware')
const authenValidator = require('../validation/authentication.validator')
const authenService = require('../services/authentication.service')
const logger = require('../logger/logger')


router.post('/register', [verifyToken, verifyRole('view_admin_tab')], async (req, res) => {
    try {
        const registerData = req.body
        const validatiton = authenValidator.registerValidator(registerData)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.BAD_REQUEST).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID
            })
        }

        const response = await authenService.registerUser(registerData)
        if (response.resultCode === constant.RESPONSE_CODE.FAIL) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: response.message || constant.RESPONSE_MESSAGE.FAIL,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
        })
    } catch (e) {
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const loginData = req.body
        const validatiton = authenValidator.loginValidator(loginData)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.BAD_REQUEST).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID
            })
        }

        const response = await authenService.login(loginData)
        if (response.resultCode === constant.RESPONSE_CODE.FAIL) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: response.message || constant.RESPONSE_MESSAGE.FAIL,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
            data: response.data
        })
    } catch (e) {
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/reset-password', [verifyToken, verifyRole('view_admin_tab')], async (req, res) => {
    try {
        const data = req.body
        const validatiton = authenValidator.resetPasswordValidator(data)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.BAD_REQUEST).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID
            })
        }

        const response = await authenService.resetPassword(data)
        if (response.resultCode === constant.RESPONSE_CODE.FAIL) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: response.message || constant.RESPONSE_MESSAGE.FAIL,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
        })
    } catch (e) {
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})


module.exports = router