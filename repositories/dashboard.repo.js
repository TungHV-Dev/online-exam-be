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

}



module.exports = {
    getOverviewData,
    getNearestJoinedExamNumber
}