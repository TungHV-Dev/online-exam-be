const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')

router.get('/', async (req, res) => {
    try {
        
    } catch (e) {
        console.log('Exception while get chart data: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})


module.exports = router