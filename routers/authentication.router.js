const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const authenValidator = require('../validation/authentication.validator')
const authenService = require('../services/authentication.service')

router.post('/register', async (req, res) => {
    try {
        const registerData = req.body
        const validatiton = authenValidator.registerValidator(registerData)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.BAD_REQUEST).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID
            })
        }

        const resultCode = await authenService.registerUser(registerData)
        if (resultCode == 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.NOT_FOUND,
            message: constant.RESPONSE_MESSAGE.NOT_FOUND,
        })
    } catch (e) {
        console.log('Exception at router /auth/register: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})


module.exports = router