const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const { verifyToken } = require('../middleware/jwt.middleware')
const { verifyRole } = require('../middleware/role.middleware')
const logger = require('../logger/logger')

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