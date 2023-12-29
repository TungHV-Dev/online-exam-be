const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const classService = require('../services/class.service')

router.get('/published-list', async (req, res) => {
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
        console.log('Exception at router /class/published-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/create', async (req, res) => {
    try {
        const resultCode = await classService.createNewClass(req.body)
        if (resultCode == 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
            })
        }

        if (resultCode == -2) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: constant.RESPONSE_MESSAGE.INPUT_INVALID,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/create: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/join', async (req, res) => {
    try {
        const result = await classService.joinPublishedClass()
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
        console.log('Exception at router /class/join: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/member-list', async (req, res) => {
    try {
        const result = await classService.getMemberList()
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
        console.log('Exception at router /class/members-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/document-list', async (req, res) => {
    try {
        const result = await classService.getDocumentList()
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
        console.log('Exception at router /class/document-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/detail', async (req, res) => {
    try {
        const result = await classService.getClassDetail()
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
        console.log('Exception at router /class/detail: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/add-document', async (req, res) => {
    try {
        const result = await classService.addDocument()
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
        console.log('Exception at router /class/join: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/list', async (req, res) => {
    try {
        const result = await classService.getExamList()
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
        console.log('Exception at router /class/exam/list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/view', async (req, res) => {
    try {
        const result = await classService.viewExam()
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
        console.log('Exception at router /class/exam/view: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/exam/create', async (req, res) => {
    try {
        const result = await classService.createExam()
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
        console.log('Exception at router /class/exam/create: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/exam/update', async (req, res) => {
    try {
        const result = await classService.createExam()
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
        console.log('Exception at router /class/exam/update: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/exam/join', async (req, res) => {
    try {
        const result = await classService.joinExam()
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
        console.log('Exception at router /class/exam/join: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})



module.exports = router