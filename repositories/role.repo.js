const getAllRoles = async () => {
    const querySql = `select role_id, role_name from roles where is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [])
    return response.rows
}

const getPermissionByRoleIdAndFunctionCode = async (roleId, functionCode) => {
    const querySql = 
        `select af.function_id, af.function_code 
        from roles r 
        inner join role_app_function raf on raf.role_id = r.role_id and r.is_deleted = 0
        inner join app_function af on af.function_id = raf.function_id and af.is_deleted = 0
        where r.role_id = $1::integer and af.function_code = $2::text;`

    const response = await _postgresDB.query(querySql, [roleId, functionCode])
    return response.rows[0]
}

module.exports = {
    getAllRoles,
    getPermissionByRoleIdAndFunctionCode
}