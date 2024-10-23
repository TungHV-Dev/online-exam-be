const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const examValidator = require('../validation/exam.validator')
const examService = require('../services/exam.service')
const { verifyToken } = require('../middleware/jwt.middleware')
const { verifyRole } = require('../middleware/role.middleware')
const logger = require('../logger/logger')


router.post('/compile-code', async (req, res) => {
    try {
        const validatiton = examValidator.complieCodeValidator(req.body)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID,
            })
        }

        const examId = Number(req.body.examId)
        const questionNumber = Number(req.body.questionNumber)
        const code = req.body.code
        const language = req.body.language

        const response = await examService.compileCode(examId, questionNumber, language, code)
        if (response.resultCode !== constant.RESPONSE_CODE.SUCCESS) {
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

router.get('/search', async (req, res) => {
    try {
        const page = req.query.page || 0
        const size = req.query.size || 10
        
        
        



        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.NOT_FOUND,
            message: constant.RESPONSE_MESSAGE.NOT_FOUND,
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