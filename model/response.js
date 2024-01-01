class ResponseValidator {
    constructor(valid = true, message = '') {
        this.valid = valid
        this.message = message
    }
}

class ResponseService {
    constructor(resultCode = 0, message = '') {
        this.resultCode = resultCode
        this.message = message
    }
}

module.exports = {
    ResponseValidator,
    ResponseService
}