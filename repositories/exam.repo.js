const insertExam = async (classId, examName, description, totalQuestion, totalMinutes, publish) => {
    const commandSql = 
        `insert into exam 
            (class_id, exam_name, description, total_question, total_minutes, is_published, created_time, updated_time, is_deleted)
        values 
            ($1::integer, $2::text, $3::text, $4::integer, $5::integer, $6::integer, now(), now(), 0)
        returning exam_id;`
    const response = await _postgresDB.query(commandSql, [classId, examName, description, totalQuestion, totalMinutes, publish])
    return response
}

const insertQuestions = async (examId, questions) => {
    let commandSql = 
        `insert into questions 
            (exam_id, question_number, question_type, question_content, created_time, updated_time, is_deleted)
        values `

    let index = 0
    let params = []
    for (let i = 0; i < questions.length; i++) {
        commandSql += ` ($${++index}::integer, $${++index}::integer, $${++index}::text, $${++index}::text, now(), now(), 0)`
        if (i < questions.length - 1) {
            commandSql += ','
        }

        params.push(examId, Number(questions[i].questionNumber), questions[i].questionType || '', questions[i].questionContent || '')
    }

    commandSql += ' returning question_id;'
    const response = await _postgresDB.query(commandSql, params)
    return response
}

const insertResults = async (results) => {
    let commandSql = 
        `insert into results 
            (question_id, result_key, result_value, is_correct, created_time, updated_time, is_deleted)
        values `
    
    let index = 0
    let params = []
    for (let i = 0; i < results.length; i++) {
        commandSql += ` ($${++index}::integer, $${++index}::integer, $${++index}::text, $${++index}::integer, now(), now(), 0)`
        if (i < results.length - 1) {
            commandSql += ','
        }

        params.push(results[i].questionId, results[i].resultKey, results[i].resultValue, results[i].isCorrect)
    }

    commandSql += ' returning result_id;'
    const response = await _postgresDB.query(commandSql, params)
    return response
}


module.exports = {
    insertExam,
    insertQuestions,
    insertResults
}