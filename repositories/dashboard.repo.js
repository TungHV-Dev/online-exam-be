const getOverviewData = async () => {
    const sqlQuery = 
        `select
            (select count(class_id) from "class" where is_deleted = 0) as total_class,
            (select count(user_id) from users where role_id = 3 and is_deleted = 0) as total_student,
            (select count(exam_id) from exam where is_published = 1 and is_deleted = 0) as total_exam,
            (select count(id) from user_exam where is_deleted = 0) as total_joined_exam,
            (select coalesce(avg(coalesce(score, 0)), 0) from user_exam where is_deleted = 0) as avg_score;`

    const response = await _postgresDB.query(sqlQuery, [])
    return response.rows
}

const getNearestJoinedExamNumber = async () => {
    const sqlQuery = 
        `select 
            to_char(created_time::date, 'DD-MM-YYYY') as exam_date, count(id) as joined_exam_number
        from user_exam
        where created_time::date >= (current_date - interval '6 days')::date and is_deleted = 0
        group by created_time::date
        order by created_time::date desc;`
    const response = await _postgresDB.query(sqlQuery, [])
    return response.rows
}



module.exports = {
    getOverviewData,
    getNearestJoinedExamNumber
}