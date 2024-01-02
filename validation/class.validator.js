const { ResponseValidator } = require('../model/response')

const createClassValidator = function (data) {
    if (data.teacherId && data.classCode && data.className) {
        return new ResponseValidator(true)
    }

    return new ResponseValidator(false, 'Thông tin đầu vào không hợp lệ!')
}

module.exports = {
    createClassValidator
}