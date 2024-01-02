const { LEARNING_STATUS } = require('../utils/master-data')

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
        `insert into user_class (user_id, class_id, status, created_time, updated_time, is_deleted)
        values ($1, $2, $3, now(), now(), 0)
        returning id;`
    
    const response = await _postgresDB.query(commandSql, [userId, classId, LEARNING_STATUS.TO_DO])
    return response
}

const getClassListUserNotJoin = async (userId) => {
    const querySql = 
        `select
            c.class_id, c.class_code, c.class_name, u.full_name as teacher_name,
            (
                select count(uc2.user_id) from user_class uc2 where uc2.class_id = c.class_id and uc2.is_deleted = 0
            ) as total_student,
            (
                select count(e.exam_id) from exam e where e.class_id = c.class_id and e.is_published = 1 and e.is_deleted = 0
            ) as total_exam
        from "class" c 
        left join users u on u.user_id = c.teacher_id and u.is_deleted = 0
        where 
            c.is_deleted = 0
            and not exists (
                select uc.id from user_class uc 
                where uc.class_id = c.class_id and uc.user_id = $1 and is_deleted = 0 
                limit 1
            );`
    
    const response = await _postgresDB.query(querySql, [userId])
    return response.rows
}

const getClassListUserJoined = async (userId) => {
    const querySql = 
        `select 
            c.class_id, c.class_code, c.class_name, c.description, uc.status
        from "class" c 
        inner join user_class uc on uc.class_id = c.class_id and uc.is_deleted = 0
        where c.is_deleted = 0 and uc.user_id = $1;`
    
    const response = await _postgresDB.query(querySql, [userId])
    return response.rows
}

module.exports = {
    insertClass,
    getClassById,
    checkUserExistInClass,
    addUserToClass,
    getClassListUserNotJoin,
    getClassListUserJoined
}