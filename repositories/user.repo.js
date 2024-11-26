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

const getUserById = async (profileId) => {
    const querySql = 
        `select 
            u.user_id, u.user_name, u.full_name, r.role_id, r.role_name, 
            u.email, u.gender, u.address, u.phone_number, u.date_of_birth, u.is_locked
        from users u
        inner join roles r on r.role_id = u.role_id 
        where u.user_id = $1::integer and u.is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [profileId])
    return response.rows[0]
}

const getUserByUsername = async (username) => {
    const querySql = `select * from users where user_name = $1::text and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [username])
    return response.rows[0]
}

const getUserByEmail = async (email) => {
    const querySql = `select * from users where email = $1::text and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [email])
    return response.rows[0]
}

const getUserByIdAndName = async (userId, userName) => {
    const querySql = 
        `select * from users 
        where 
            user_id = $1::integer 
            and user_name = $2::text 
            and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [userId, userName])
    return response.rows[0]
}

const getUsersPaging = async (searchValue, offsetValue = 0, limitValue = 10) => {
    const querySql = 
        `select 
            u.user_id, u.user_name, u.full_name, r.role_id, r.role_name, u.full_name, 
            u.gender, u.date_of_birth, u.email, u.phone_number, u.address, u.is_locked
        from users u
        left join roles r on r.role_id = u.role_id
        where 
            (
                lower(u.user_name) like concat('%', lower(:search::text), '%') 
                or lower(u.full_name) like concat('%', lower(:search::text), '%')
            )
            and u.is_deleted = 0
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
            and u.is_deleted = 0;`

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

const lockUser = async (userId, lock) => {
    const commandSql = `update users set is_locked = $1 where user_id = $2 and is_deleted = 0;`
    const response = await _postgresDB.query(commandSql, [lock, userId])
    return response
}

const getStudentsByClassId = async (classId) => {
    const querySql = 
        `select u.user_id, u.user_name , u.full_name 
        from user_class uc 
        inner join users u on u.user_id = uc.user_id and uc.is_deleted = 0
        where uc.class_id = $1::integer and u.is_deleted = 0 and u.is_locked = 0;`
    
    const response = await _postgresDB.query(querySql, [classId])
    return response.rows
}

const updatePasswordUser = async (userId, newPassword) => {
    const commandSql = `update users set password_hash = $1::text where user_id = $2::integer and is_deleted = 0;`
    const response = await _postgresDB.query(commandSql, [newPassword, userId])
    return response
}

const updateUserInfor = async (fullName, roleId, dateOfBirth, gender, email, phoneNumber, address, userId) => {
    const commandSql = 
        `update users 
        set 
            full_name = $1::text, role_id = $2::integer, date_of_birth = $3::text, 
            gender = $4::text, email = $5::text, phone_number = $6::text, address = $7::text 
        where user_id = $8::integer and is_deleted = 0;`
    const response = await _postgresDB.query(commandSql, [fullName, roleId, dateOfBirth, gender, email, phoneNumber, address, userId])
    return response
}

module.exports = {
    getUsers,
    insertUser,
    getUserByUsername,
    getUserById,
    getUserByEmail,
    getUserByIdAndName,
    getUsersPaging,
    getStudentsByClassId,
    lockUser,
    updatePasswordUser,
    updateUserInfor
}