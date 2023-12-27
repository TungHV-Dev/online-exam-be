const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const classService = require('../services/class.service')

router.get('/published-class', async (req, res) => {
    try {
        const type = req.query.type
        const userId = req.query.userId

        const result = await classService.getPublishedClassList(type, userId)
        if (result) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.NOT_FOUND,
            message: constant.RESPONSE_MESSAGE.NOT_FOUND,
        })
    } catch (e) {
        console.log('Exception at router /class/published-class: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})


module.exports = router