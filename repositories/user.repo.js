const pgSql = require('yesql').pg

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

const getUsersPaging = async (searchValue, offsetValue = 0, limitValue = 10) => {
    const querySql = 
        `select 
            u.user_id, u.user_name, u.full_name, r.role_id, r.role_name, u.date_of_birth, u.email, u.phone_number
        from users u
        left join roles r on r.role_id = u.role_id
        where 
            (
                lower(u.user_name) like concat('%', lower(:search::text), '%') 
                or lower(u.full_name) like concat('%', lower(:search::text), '%')
            )
            and u.is_deleted = 0 and u.is_locked = 0
        order by u.user_name
        offset :offset
        limit :limit `

    const totalSql = 
        `select count(u.user_id) as total
        from users u
        left join roles r on r.role_id = u.role_id
        where
            (
                lower(u.user_name) like concat('%', lower(:search::text), '%') 
                or lower(u.full_name) like concat('%', lower(:search::text), '%')
            )
            and u.is_deleted = 0 and u.is_locked = 0;`

    const dataSearch = await _postgresDB.query(pgSql(querySql, { useNullForMissing: true }) ({
        search: searchValue,
        offset: offsetValue,
        limit: limitValue
    }))

    const totalSearch = await _postgresDB.query(pgSql(totalSql, { useNullForMissing: true }) ({
        search: searchValue,
    }))
    return {
        data: dataSearch.rows,
        total: totalSearch.rows[0].total
    }
}

module.exports = {
    getUsers,
    insertUser,
    getUserByUsername,
    getUserByEmail,
    getUsersPaging
}