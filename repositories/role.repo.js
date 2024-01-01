const getAllRoles = async () => {
    const querySql = `select role_id, role_name from roles where is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [])
    return response.rows
}

module.exports = {
    getAllRoles
}