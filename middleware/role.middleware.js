const roleRepo = require('../repositories/role.repo')
const constant = require('../utils/constant')

const verifyRole = (functionCode) => {
    return async (req, res, next) => {
        const roleId = req.roleId || 0
        const permission = await roleRepo.getPermissionByRoleIdAndFunctionCode(roleId, functionCode)
        if (!permission) {
            return res.status(constant.HTTP_STATUS_CODE.UNAUTHORIZED).json({
                code: -1,
                message: 'Tài khoản không được phân quyền sử dụng API này!'
            })
        }
        
        return next()
    }
}

module.exports = {
    verifyRole
}