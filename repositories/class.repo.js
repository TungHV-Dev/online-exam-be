const insertClass = async (teacherId, classCode, className, description) => {
    const commandSql = 
        `insert into "class" (teacher_id, class_code, class_name, description, created_time, updated_time, is_deleted)
        values ($1, $2, $3, $4, now(), now(), 0)
        returning class_id;`
    
    const response = await _postgresDB.query(commandSql, [teacherId, classCode, className, description])
    return response
}

const getClassById = async (classId) => {
    const querySql = 
        `select * from "class" where class_id = $1::integer and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [classId])
    return response.rows[0]
}

const checkUserExistInClass = async (classId, userId) => {
    const querySql = 
        `select * from user_class where class_id = $1 and user_id = $2 and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [classId, userId])
    return response.rows[0]
}

const addUserToClass = async (classId, userId) => {
    const commandSql = 
        `insert into user_class (user_id, class_id, created_time, updated_time, is_deleted)
        values ($1, $2, now(), now(), 0)
        returning id;`
    
    const response = await _postgresDB.query(commandSql, [userId, classId])
    return response
}

module.exports = {
    insertClass,
    getClassById,
    checkUserExistInClass,
    addUserToClass
}