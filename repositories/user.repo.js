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

const insertUser = async (userInfor) => {
    const commandSql = 
        `insert into users 
            (user_name, password_hash, full_name, role_id, email, gender, address, phone_number, date_of_birth, created_time, updated_time, is_deleted, is_locked)
        values 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now(), 0, 0)
        returning user_id;`

    const response = await _postgresDB.query(commandSql, [
        userInfor.user_name,
        userInfor.password_hash,
        userInfor.full_name,
        userInfor.role_id,
        userInfor.email,
        userInfor.gender,
        userInfor.address,
        userInfor.phone_number,
        userInfor.date_of_birth
    ])
    return response
}

const getUserByUsername = async (username) => {
    const querySql = `select * from users where user_name = $1 and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [username])
    return response.rows[0]
}

const getUserByEmail = async (email) => {
    const querySql = `select * from users where email = $1 and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [email])
    return response.rows[0]
}

module.exports = {
    getUsers,
    insertUser,
    getUserByUsername,
    getUserByEmail
}