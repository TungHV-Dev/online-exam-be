const insertClass = async (teacherId, classCode, className, description) => {
    const commandSql = 
        `insert into "class" (teacher_id, class_code, class_name, description, created_time, updated_time, is_deleted)
        values ($1, $2, $3, $4, now(), now(), 0)
        returning class_id;`
    
    const response = await _postgresDB.query(commandSql, [teacherId, classCode, className, description])
    return response
}

module.exports = {
    insertClass
}