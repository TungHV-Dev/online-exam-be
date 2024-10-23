const { ResponseValidator } = require('../model/response')

const complieCodeValidator = function (data) {
    if (data.examId && data.questionNumber && data.code && data.language) {
        return new ResponseValidator(true)
    }

    return new ResponseValidator(false, 'Thông tin đầu vào không hợp lệ!')
}

module.exports = {
    complieCodeValidator
}