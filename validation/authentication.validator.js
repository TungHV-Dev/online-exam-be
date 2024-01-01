const { ResponseValidator } = require('../model/validator')

const registerValidator = function (data) {
    // check username
    if (!checkUserNameValid(data.username)) {
        return new ResponseValidator(false, 'Tên đăng nhập không hợp lệ!')
    }

    // check password
    if (!checkPasswordValid(data.password)) {
        return new ResponseValidator(false, 'Mật khẩu không hợp lệ!')
    }

    // check email
    if (!checkEmailValid(data.email)) {
        return new ResponseValidator(false, 'Email không hợp lệ!')
    }

    return new ResponseValidator(true)
}

const loginValidator = function () {

}

const changePasswordValidator = function () {

}

const checkUserNameValid = function (username) {
    // kiem tra trong chuoi co khoang trang khong
    let regex = /\s/
    if (regex.test(username)) {
        return false
    }

    // kiem tra trong chuoi co ky tu tieng Viet co dau khong
    regex = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ]/
    if (regex.test(username)) {
        return false
    }
    
    return true
}

const checkPasswordValid = function (password) {
    // Kiem tra do dai password co dat toi thieu 8 ky tu khong
    if (String(password).length < 8) {
        return false
    }

    let regex

    // Kiem tra password co chua it nhat 1 ky tu dac biet khong
    regex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/
    if (!regex.test(password)) {
        return false
    }

    // Kiem tra password co chua it nhat 1 ky tu so khong
    regex = /\d/
    if (!regex.test(password)) {
        return false
    }

    // Kiem tra password co chua it nhat 1 ky tu chu in hoa khong
    regex = /[A-Z]/
    if (!regex.test(password)) {
        return false
    }

    return true
}

const checkEmailValid = function (email) {
    // Kiem tra email co dung dinh dang hay khong
    let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    if (regex.test(email)) {
        return true
    }
    return false
}

module.exports = {
    registerValidator,
    loginValidator,
    changePasswordValidator
}