const getUsers = async (condition) => {
    let whereSql = ' where 1 = 1 '

    let params = []
    let index = 0
    if (condition.roleId) {
        index++
        params.push(condition.roleId)
        whereSql += ` and role_id = $${index} `
    }

    whereSql += ' and is_deleted = 0 and is_locked = 0 '

    let querySql = 'select user_id, user_name, full_name from users ' + whereSql
    const response = await _postgresDB.query(querySql, params)
    return response.rows
}

module.exports = {
    getUsers
}