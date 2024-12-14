const { LEARNING_STATUS } = require('../utils/master-data')

const insertClass = async (teacherId, classCode, className, subjectId, description) => {
    const commandSql = 
        `insert into "class" (teacher_id, class_code, class_name, description, created_time, updated_time, is_deleted, subject_id)
        values ($1, $2, $3, $4, now(), now(), 0, $5)
        returning class_id;`
    
    const response = await _postgresDB.query(commandSql, [teacherId, classCode, className, description, subjectId])
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
        `select c.*, u.user_name as teacher_user_name, u.full_name as teacher_full_name, s.subject_id, s.subject_code, s.subject_name
        from "class" c 
        inner join users u on u.user_id = c.teacher_id
        inner join subject s on s.subject_id = c.subject_id and s.is_deleted = 0
        where c.class_id = $1::integer and c.is_deleted = 0;`
    
    const response = await _postgresDB.query(querySql, [classId])
    return response.rows[0]
}

const getClassByClassIdAndTeacherId = async (classId, teacherId) => {
    const querySql = 
        `select * from "class" where class_id = $1::integer and teacher_id = $2::integer and is_deleted = 0;`
    
    const response = await _postgresDB.query(querySql, [classId, teacherId])
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
            c.class_id, c.class_code, c.class_name, u.full_name as teacher_name, s.subject_code, s.subject_name,
            (
                select count(uc2.user_id) from user_class uc2 where uc2.class_id = c.class_id and uc2.is_deleted = 0
            ) as total_student,
            (
                select count(e.exam_id) 
                from exam e
                where 
                    e.exam_id in (
                        select ec.exam_id from exam_class ec where ec.class_id = c.class_id
                    ) and e.is_published = 1 and e.is_deleted = 0
            ) as total_exam
        from "class" c 
        left join users u on u.user_id = c.teacher_id and u.is_deleted = 0
        left join subject s on s.subject_id = c.subject_id and s.is_deleted = 0
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
            c.class_id, c.class_code, c.class_name, c.description, uc.status, s.subject_code, s.subject_name
        from "class" c 
        inner join user_class uc on uc.class_id = c.class_id and uc.is_deleted = 0
        inner join subject s on s.subject_id = c.subject_id and s.is_deleted = 0
        where c.is_deleted = 0 and uc.user_id = $1;`
    
    const response = await _postgresDB.query(querySql, [userId])
    return response.rows
}

const getListExamNeedDonePaging = async (classId, userId, offset = 0, limit = 10) => {
    const querySql = 
        `select 
            e.exam_id, e.exam_name, e.total_question, e.total_minutes,
            case when ue.attempt_id is null then 0 else 1 end as status
        from exam e 
        left join attempts ue 
            on ue.exam_id = e.exam_id
            and ue.user_id = $1::integer and ue.is_deleted = 0
        where 
            e.exam_id in (
                select exam_id from exam_class ec where ec.class_id = $2::integer
            ) and e.is_published = 1 and e.is_deleted = 0
        order by e.exam_name 
        offset $3::integer
        limit $4::integer;`

    const totalSql = 
        `select count(e.exam_id) as total
        from exam e 
        left join attempts ue 
            on ue.exam_id = e.exam_id
            and ue.user_id = $1::integer and ue.is_deleted = 0
        where 
            e.exam_id in (
                select exam_id from exam_class ec where ec.class_id = $2::integer
            ) and e.is_published = 1 and e.is_deleted = 0;`

    const resultPaging = await Promise.all([
        _postgresDB.query(querySql, [userId, classId, offset, limit]),
        _postgresDB.query(totalSql, [userId, classId]),
    ])
    
    return {
        data: resultPaging[0].rows,
        total: Number(resultPaging[1].rows[0]?.total || 0)
    }
}

const getListExamCreatedPaging = async (classId, offset = 0, limit = 10) => {
    const querySql = 
        `select e.exam_id, e.exam_name, e.total_question, e.total_minutes, e.is_published, e.is_in_storage
        from exam e
        where
            e.exam_id in (
                select ec.exam_id from exam_class ec where ec.class_id = $1::integer
            ) and is_deleted = 0
        order by e.exam_name 
        offset $2::integer
        limit $3::integer;`

    const totalSql = 
        `select count(e.exam_id) as total
        from exam e
        where
            e.exam_id in (
                select ec.exam_id from exam_class ec where ec.class_id = $1::integer
            ) and is_deleted = 0;`

    const resultPaging = await Promise.all([
        _postgresDB.query(querySql, [classId, offset, limit]),
        _postgresDB.query(totalSql, [classId]),
    ])
        
    return {
        data: resultPaging[0].rows,
        total: Number(resultPaging[1].rows[0]?.total || 0)
    }
}

const getDocumentListPaging = async (classId, offset = 0, limit = 10) => {
    const querySql = 
        `select document_id, file_name, file_path 
        from class_document
        where class_id = $1::integer and is_deleted = 0
        order by file_name 
        offset $2::integer
        limit $3::integer;`

    const totalSql = 
        `select count(document_id) as total
        from class_document
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

const insertClassDocument = async (classId, fileName, filePath) => {
    const commandSql = 
        `insert into class_document (class_id, file_name, file_path, created_time, updated_time, is_deleted)
        values ($1::integer, $2::text, $3::text, now(), now(), 0)
        returning document_id;`

    const response = await _postgresDB.query(commandSql, [classId, fileName, filePath])
    return response
}

const getAllSubject = async () => {
    const querySql = 
        `select subject_id, subject_name from subject s where is_deleted = 0;`

    const response = await _postgresDB.query(querySql)
    return response.rows || []
}

const getAllClasses = async () => {
    const querySql = 
        `select class_id, class_code, class_name from class where is_deleted = 0;`

    const response = await _postgresDB.query(querySql)
    return response.rows || []
}

const getAllClassesByTeacherId = async (teacherId) => {
    const querySql = 
        `select class_id, class_code, class_name from class where teacher_id = $1::integer and is_deleted = 0;`

    const response = await _postgresDB.query(querySql, [teacherId])
    return response.rows || []
}

const getAllClassesByStudentId = async (studentId) => {
    const querySql = 
        `select c.class_id, c.class_code, c.class_name 
        from "class" c 
        inner join user_class uc on uc.class_id = c.class_id 
        where uc.user_id = $1::integer and uc.is_deleted = 0 and c.is_deleted = 0;`

    const response = await _postgresDB.query(querySql, [studentId])
    return response.rows || []
}

module.exports = {
    insertClass,
    getClassById,
    getClassByIdV2,
    getClassByClassIdAndTeacherId,
    getClassByClassCode,
    checkUserExistInClass,
    addUserToClass,
    getClassListUserNotJoin,
    getClassListUserJoined,
    getListExamNeedDonePaging,
    getListExamCreatedPaging,
    getDocumentListPaging,
    insertClassDocument,
    getAllSubject,
    getAllClasses,
    getAllClassesByTeacherId,
    getAllClassesByStudentId
}