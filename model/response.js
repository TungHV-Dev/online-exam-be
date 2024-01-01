class ResponseValidator {
    constructor(valid = true, message = '') {
        this.valid = valid
        this.message = message
    }
}

class ResponseService {
    constructor(resultCode = 0, message = '', data = null) {
        this.resultCode = resultCode
        this.message = message
        this.data = data
    }
}

module.exports = {
    ResponseValidator,
    ResponseService
}