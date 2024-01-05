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

const getClassByIdV2 = async (classId) => {
    const querySql = 
        `select c.*, u.user_name as teacher_user_name, u.full_name as teacher_full_name
        from "class" c 
        inner join users u on u.user_id = c.teacher_id
        where c.class_id = $1::integer and c.is_deleted = 0;`
    
    const response = await _postgresDB.query(querySql, [classId])
    return response.rows[0]
}

const getClassByClassCode = async (classCode) => {
    const querySql = 
        `select * from "class" where class_code = $1::text and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [classCode])
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

const getListExamNeedDonePaging = async (classId, offset = 0, limit = 10) => {
    const querySql = 
        `select 
            e.exam_id, e.exam_name, e.total_question, e.total_minutes,
            case when ue.id is null then 0 else 1 end as status
        from exam e 
        left join user_exam ue on ue.exam_id = e.exam_id and ue.class_id = e.class_id and ue.is_deleted = 0
        where e.class_id = $1::integer and e.is_published = 1 and e.is_deleted = 0
        order by e.exam_name 
        offset $2::integer
        limit $3::integer;`

    const totalSql = 
        `select count(e.exam_id) as total
        from exam e 
        left join user_exam ue on ue.exam_id = e.exam_id and ue.class_id = e.class_id and ue.is_deleted = 0
        where e.class_id = $1::integer and e.is_published = 1 and e.is_deleted = 0;`

    const resultPaging = await Promise.all([
        _postgresDB.query(querySql, [classId, offset, limit]),
        _postgresDB.query(totalSql, [classId]),
    ])
    
    return {
        data: resultPaging[0].rows,
        total: Number(resultPaging[1].rows[0]?.total || 0)
    }
}

const getListExamCreatedPaging = async (classId, offset = 0, limit = 10) => {
    const querySql = 
        `select exam_id, exam_name, total_question, total_minutes, is_published 
        from exam 
        where class_id = $1::integer and is_deleted = 0
        order by exam_name 
        offset $2::integer
        limit $3::integer;`

    const totalSql = 
        `select count(exam_id) as total
        from exam 
        where class_id = $1::integer and is_deleted = 0;`

    const resultPaging = await Promise.all([
        _postgresDB.query(querySql, [classId, offset, limit]),
        _postgresDB.query(totalSql, [classId]),
    ])
        
    return {
        data: resultPaging[0].rows,
        total: Number(resultPaging[1].rows[0]?.total || 0)
    }
}

module.exports = {
    insertClass,
    getClassById,
    getClassByIdV2,
    getClassByClassCode,
    checkUserExistInClass,
    addUserToClass,
    getClassListUserNotJoin,
    getClassListUserJoined,
    getListExamNeedDonePaging,
    getListExamCreatedPaging
}