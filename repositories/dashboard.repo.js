const getOverviewData = async () => {
    const sqlQuery = 
        `select
            (select count(class_id) from "class" where is_deleted = 0) as total_class,
            (select count(user_id) from users where role_id = 3 and is_deleted = 0) as total_student,
            (select count(exam_id) from exam where is_published = 1 and is_deleted = 0) as total_exam,
            (select count(id) from user_exam where is_deleted = 0) as total_joined_exam,
            (select coalesce(avg(coalesce(score, 0)), 0) from user_exam where is_deleted = 0) as avg_score;`

    const response = await _postgresDB.query(sqlQuery, [])
    return response.rows[0]
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

const getTopClassHasMaxAvgScore = async (topNumber) => {
    const sqlQuery = 
        `select
            c.class_id, c.class_code, c.class_name, top_5.total_joined_exam, top_5.avg_score,
            (
                select count(uc.user_id) from user_class uc 
                where uc.class_id = c.class_id and uc.is_deleted = 0
            ) as total_student,
            (
                select count(e.exam_id) from exam e 
                where e.class_id = c.class_id and e.is_published = 1 and e.is_deleted = 0 
            ) as total_exam
        from (
            select class_id, avg(score) as avg_score, count(id) as total_joined_exam
            from user_exam
            where is_deleted  = 0
            group by class_id
            order by avg_score
            limit $1
        ) as top_5
        inner join "class" c on c.class_id = top_5.class_id
        where c.is_deleted = 0;`
    
    const response = await _postgresDB.query(sqlQuery, [topNumber])
    return response.rows
}

module.exports = {
    getOverviewData,
    getNearestJoinedExamNumber,
    getTopClassHasMaxAvgScore
}