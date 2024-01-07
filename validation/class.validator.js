const { ResponseValidator } = require('../model/response')

const createClassValidator = function (data) {
    if (data.teacherId && data.classCode && data.className) {
        return new ResponseValidator(true)
    }

    return new ResponseValidator(false, 'Thông tin đầu vào không hợp lệ!')
}

const createExamValidator = function (data) {
    if (data.questions && Array.isArray(data.questions)) {
        return new ResponseValidator(true)
    }

    return new ResponseValidator(false, 'Thông tin đầu vào không hợp lệ!')
}

const updateExamValidator = function (data) {
    if (data.questions && Array.isArray(data.questions)) {
        return new ResponseValidator(true)
    }

    return new ResponseValidator(false, 'Thông tin đầu vào không hợp lệ!')
}

module.exports = {
    createClassValidator,
    createExamValidator,
    updateExamValidator
}