const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const classService = require('../services/class.service')
const classValidator = require('../validation/class.validator')
const { verifyToken } = require('../middleware/jwt.middleware')
const { verifyRole } = require('../middleware/role.middleware')

router.get('/not-join-list', [verifyToken], async (req, res) => {
    try {
        const userId = req.query.userId
        const result = await classService.getPublishedClassList(false, userId, req.roleId)
        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
            data: result.data
        })
    } catch (e) {
        console.log('Exception at router /class/not-join-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/joined-list', [verifyToken], async (req, res) => {
    try {
        const userId = req.query.userId
        const result = await classService.getPublishedClassList(true, userId, req.roleId)
        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
            data: result.data
        })
    } catch (e) {
        console.log('Exception at router /class/joined-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/create', [verifyToken], async (req, res) => {
    try {
        const payload = req.body
        const validatiton = classValidator.createClassValidator(payload)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID,
            })
        }

        const response = await classService.createNewClass(payload)
        if (response.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: response.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/create: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/join', [verifyToken], async (req, res) => {
    try {
        const result = await classService.joinPublishedClass(req.body)
        if (result.resultCode == 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/join: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/detail', [verifyToken], async (req, res) => {
    try {
        const result = await classService.getClassDetail(req.query, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/detail: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/document-list', [verifyToken], async (req, res) => {
    try {
        const result = await classService.getDocumentList(req.query, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/document-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/add-document', [verifyToken], async (req, res) => {
    try {
        const result = await classService.addDocument(req.body, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/document-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/need-done', [verifyToken], async (req, res) => {
    try {
        const result = await classService.getListExamNeedDone(req.query, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/exam/need-done: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/created-list', [verifyToken], async (req, res) => {
    try {
        const result = await classService.getListExamCreated(req.query, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/exam/created-list: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/infor', [verifyToken], async (req, res) => {
    try {
        const result = await classService.viewExam(req.query)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/exam/infor: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/exam/create', [verifyToken], async (req, res) => {
    try {
        const payload = req.body

        const validatiton = classValidator.createExamValidator(payload)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID,
            })
        }

        const result = await classService.createExam(payload, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/create-exam: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/exam/update', [verifyToken], async (req, res) => {
    try {
        const payload = req.body

        const validatiton = classValidator.updateExamValidator(payload)
        if (!validatiton.valid) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.FAIL,
                message: validatiton.message || constant.RESPONSE_MESSAGE.INPUT_INVALID,
            })
        }

        const result = await classService.updateExam(payload, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
                data: result.data
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/create-exam: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/exam/delete', [verifyToken], async (req, res) => {
    try {
        const payload = req.body
        const result = await classService.deleteExam(payload, req.roleId)
        if (result.resultCode === 0) {
            return res.status(constant.HTTP_STATUS_CODE.OK).json({
                code: constant.RESPONSE_CODE.SUCCESS,
                message: constant.RESPONSE_MESSAGE.SUCCESS,
            })
        }

        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: result.message || constant.RESPONSE_MESSAGE.FAIL,
        })
    } catch (e) {
        console.log('Exception at router /class/exam/delete: ', e?.message)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})



module.exports = router