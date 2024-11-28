const express = require('express')
const router = express.Router()
const constant = require('../utils/constant')
const classService = require('../services/class.service')
const examService = require('../services/exam.service')
const classValidator = require('../validation/class.validator')
const { verifyToken } = require('../middleware/jwt.middleware')
const { verifyRole } = require('../middleware/role.middleware')
const logger = require('../logger/logger')

router.get('/not-join-list', [verifyToken, verifyRole('view_class_tab')], async (req, res) => {
    try {
        const userId = req.query.userId
        const result = await classService.getPublishedClassList(false, userId, req.roleId)
        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
            data: result.data
        })
    } catch (e) {
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/joined-list', [verifyToken, verifyRole('view_class_tab')], async (req, res) => {
    try {
        const userId = req.query.userId
        const result = await classService.getPublishedClassList(true, userId, req.roleId)
        return res.status(constant.HTTP_STATUS_CODE.OK).json({
            code: constant.RESPONSE_CODE.SUCCESS,
            message: constant.RESPONSE_MESSAGE.SUCCESS,
            data: result.data
        })
    } catch (e) {
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/create', [verifyToken, verifyRole('create_class')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/join', [verifyToken, verifyRole('join_class')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/detail', [verifyToken, verifyRole('view_class_detail')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/document-list', [verifyToken, verifyRole('view_class_detail')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.post('/add-document', [verifyToken, verifyRole('add_document')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/need-done', [verifyToken, verifyRole('view_list_exam_need_done')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/exam/created-list', [verifyToken, verifyRole('view_list_exam_created')], async (req, res) => {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})

router.get('/all-subjects', [verifyToken], async (req, res) => {
    try {
        const result = await classService.getMasterDataSubjects()
        if (result.resultCode === constant.RESPONSE_CODE.SUCCESS) {
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
        logger.error(`Exception at router ${req.originalUrl}: ${e?.message}`)
        return res.status(e.status || constant.HTTP_STATUS_CODE.INTERNAL_SERVER).json({
            code: constant.RESPONSE_CODE.FAIL,
            message: e?.message || constant.RESPONSE_MESSAGE.SYSTEM_ERROR
        })
    }
})


module.exports = router