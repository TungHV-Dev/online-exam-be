const insertExam = async (examName, description, totalQuestion, totalMinutes, publish, subjectId, isInStorage, creatorId, examCode) => {
    const commandSql = 
        `insert into exam 
            (exam_name, description, total_question, total_minutes, is_published, created_time, updated_time, is_deleted, subject_id, is_in_storage, creator_id, exam_code)
        values 
            ($1::text, $2::text, $3::integer, $4::integer, $5::integer, now(), now(), 0, $6::integer, $7::integer, $8::integer, $9)
        returning exam_id;`
    const response = await _postgresDB.query(commandSql, [examName, description, totalQuestion, totalMinutes, publish, subjectId, isInStorage, creatorId, examCode])
    return response
}

const insertExamClass = async (exam_id, class_id) => {
    const commandSql = 
        `insert into exam_class (exam_id, class_id)
        values ($1::integer, $2::integer)
        returning id;`

    const response = await _postgresDB.query(commandSql, [exam_id, class_id])
    return response
}

const insertQuestions = async (examId, questions) => {
    let commandSql = 
        `insert into questions 
            (exam_id, question_number, question_type, question_content, created_time, updated_time, is_deleted, total_test_cases)
        values `

    let index = 0
    let params = []
    for (let i = 0; i < questions.length; i++) {
        commandSql += ` ($${++index}::integer, $${++index}::integer, $${++index}::text, $${++index}::text, now(), now(), 0, $${++index}::integer)`
        if (i < questions.length - 1) {
            commandSql += ','
        }

        params.push(examId, Number(questions[i].questionNumber), questions[i].questionType || '', questions[i].questionContent || '', Number(questions[i].testcases.length || 0))
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

const deleteExam = async (examId) => {
    const commandSql = `update exam set is_deleted = 1, updated_time = now() where exam_id = $1::integer;`
    const response = await _postgresDB.query(commandSql, [examId])
    return response
}

const deleteQuestions = async (examId) => {
    const commandSql = `delete from questions where exam_id = $1::integer;`
    const response = await _postgresDB.query(commandSql, [examId])
    return response
}

const deleteResults = async (examId) => {
    const commandSql = 
        `delete from results where question_id in (select question_id from questions where exam_id = $1::integer);`
    const response = await _postgresDB.query(commandSql, [examId])
    return response
}

const updateExam = async (examId, examName, description, totalQuestion, totalMinutes, publish) => {
    const commandSql = 
        `update exam 
        set 
            exam_name = $1::text, description = $2::text, total_question = $3::integer, 
            total_minutes = $4::integer, is_published = $5::integer, updated_time = now()
        where exam_id = $6::integer and is_deleted = 0;`
    
    const response = await _postgresDB.query(commandSql, [examName, description, totalQuestion, totalMinutes, publish, examId])
    return response
}

const pushExamToStorage = async (examId) => {
    const commandSql = 
        `update exam 
        set 
            is_in_storage = 1, updated_time = now()
        where exam_id = $1::integer and is_published = 1 and is_deleted = 0;`
    
    const response = await _postgresDB.query(commandSql, [examId])
    return response
}

const getExamById = async (examId) => {
    const querySql = `select * from exam where exam_id = $1::integer and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [examId])
    return response.rows[0]
}

const getExambyExamCode = async (examCode) => {
    const querySql = 
        `select * from exam where exam_code = $1 and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [examCode])
    return response.rows[0]
}

const getQuestionsByExamId = async (examId) => {
    const querySql = 
        `select * from questions where exam_id = $1::integer and is_deleted = 0
        order by question_number`
    const response = await _postgresDB.query(querySql, [examId])
    return response.rows
}

const getResultsByExamId = async (examId) => {
    const querySql = 
        `select * from results r
        where 
            r.question_id in (
                select q.question_id from questions q where q.exam_id = $1::integer and q.is_deleted = 0
            ) and r.is_deleted = 0
        order by r.question_id, r.result_key asc;`
    const response = await _postgresDB.query(querySql, [examId])
    return response.rows
}

const insertAttempt = async (userId, classId, examId, startTime, endTime, score) => {
    const commandSql = 
        `insert into attempts (user_id, class_id, exam_id, start_time, end_time, score, created_time, updated_time, is_deleted)
        values ($1::integer, $2::integer, $3::integer, $4, $5, $6::numeric, now(), now(), 0)
        returning attempt_id;`
    const response = await _postgresDB.query(commandSql, [userId, classId, examId, startTime, endTime, score])
    return response
}

const insertAttemptAnswer = async (attemptId, userResults) => {
    let commandSql = 
        `insert into attempt_answer (attempt_id, question_id, choosed_result_key, choosed_result_value, submitted_code, total_correct_test_cases)
        values `

    let index = 0
    let params = []
    for (let i = 0; i < userResults.length; i++) {
        commandSql += ` ($${++index}::integer, $${++index}::integer, $${++index}::integer, $${++index}::text, $${++index}::text, $${++index}::integer)`
        if (i < userResults.length - 1) {
            commandSql += ','
        }

        params.push(
            attemptId, 
            userResults[i].questionId, 
            userResults[i].choosedResultKey || null, 
            userResults[i].choosedResultValue || '', 
            userResults[i].submittedCode || '', 
            userResults[i].totalCorrectTestCases || null
        )
    }

    const response = await _postgresDB.query(commandSql, params)
    return response
}

const getAttempt = async (userId, classId, examId) => {
    const querySql = 
        `select * from attempts ue
        where ue.user_id = $1::integer and ue.class_id = $2::integer and ue.exam_id = $3::integer and ue.is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [userId, classId, examId])
    return response.rows[0]
}

const getAttemptAnswer = async (attempt_id) => {
    const querySql = 
        `select * from attempt_answer aa 
        where aa.attempt_id = $1::integer;`
    const response = await _postgresDB.query(querySql, [attempt_id])
    return response.rows
}

const insertTestCases = async (testcases) => {
    let commandSql = 
        `insert into test_cases
            (question_id, input_data, expected_output, is_sample_case, created_time, updated_time, is_deleted)
        values `
    
    let index = 0
    let params = []
    for (let i = 0; i < testcases.length; i++) {
        commandSql += ` ($${++index}::integer, $${++index}::text, $${++index}::text, $${++index}::integer, now(), now(), 0)`
        if (i < testcases.length - 1) {
            commandSql += ','
        }

        params.push(testcases[i].questionId, testcases[i].inputData, testcases[i].expectedOutput, testcases[i].isSampleCase)
    }

    commandSql += ' returning test_case_id;'
    const response = await _postgresDB.query(commandSql, params)
    return response
}

const deleteTestCases = async (examId) => {
    const commandSql = 
        `delete from test_cases where question_id in (select question_id from questions where exam_id = $1::integer);`
    const response = await _postgresDB.query(commandSql, [examId])
    return response
}

const getTestCasesByExamId = async (examId, getOnlySampleCase = false) => {
    let querySql = 
        `select * from test_cases t
        where 
            t.question_id in (
                select q.question_id from questions q where q.exam_id = $1::integer and q.is_deleted = 0
            ) `

    if (getOnlySampleCase) {
        querySql += ' and t.is_sample_case = 1 '
    }
    querySql += ' and t.is_deleted = 0 order by t.question_id, t.test_case_id asc '

    const response = await _postgresDB.query(querySql, [examId])
    return response.rows
}

const getQuestionByExamIdAndQuestionNumber = async (examId, questionNumber) => {
    const querySql = 
        `select * from questions where exam_id = $1::integer and question_number = $2::integer and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [examId, questionNumber])
    return response.rows[0]
}

const getTestCasesByQuestionId = async (questionId) => {
    const querySql = 
        `select * from test_cases where question_id = $1::integer and is_deleted = 0;`
    const response = await _postgresDB.query(querySql, [questionId])
    return response.rows
}

const searchExam = async (limit, offset, subjectId, creatorId) => {
    let params = []
    let paramIndex = 0
    let condition = ''
    if (subjectId) {
        paramIndex++
        params.push(subjectId)
        condition += ` and e.subject_id = $${paramIndex}::integer `
    }

    if (creatorId) {
        paramIndex++
        params.push(creatorId)
        condition += ` and e.creator_id = $${paramIndex}::integer `
    }

    condition += ' and e.is_deleted = 0 and e.is_in_storage = 1 '
    condition = condition.trim()
    if (condition.startsWith('and')) {
        condition = condition.slice(3)
    }

    const querySql = 
        `select 
            e.exam_id, s.subject_name, e.exam_name, e.total_question, e.total_minutes, 
            e.creator_id, u.full_name, u.user_name, e.created_time, e.exam_code
        from exam e 
        left join subject s on s.subject_id = e.subject_id and s.is_deleted = 0
        left join users u on u.user_id = e.creator_id and u.is_deleted = 0
        where ${condition} 
        order by e.exam_name 
        offset $${++paramIndex}::integer
        limit $${++paramIndex}::integer;`

    const totalSql = 
        `select 
            count(e.exam_id) as total
        from exam e 
        left join subject s on s.subject_id = e.subject_id and s.is_deleted = 0
        left join users u on u.user_id = e.creator_id and u.is_deleted = 0
        where ${condition};`

    const response = await Promise.all([
        _postgresDB.query(querySql, [...params, offset, limit]),
        _postgresDB.query(totalSql, params)
    ])

    return {
        searchData: response[0]?.rows || [],
        total: response[1]?.rows[0]?.total || 0
    }
}

const deleteExamFromAllClasses = async (examId) => {
    const commandSql = 
        `delete from exam_class where exam_id = $1::integer`
    const response = await _postgresDB.query(commandSql, [examId])
    return response
}

module.exports = {
    insertExam,
    insertExamClass,
    insertQuestions,
    insertResults,
    deleteExam,
    deleteQuestions,
    deleteResults,
    updateExam,
    pushExamToStorage,
    getExamById,
    getExambyExamCode,
    getQuestionsByExamId,
    getResultsByExamId,
    insertAttempt,
    insertAttemptAnswer,
    getAttempt,
    getAttemptAnswer,
    insertTestCases,
    deleteTestCases,
    getTestCasesByExamId,
    getQuestionByExamIdAndQuestionNumber,
    getTestCasesByQuestionId,
    searchExam,
    deleteExamFromAllClasses
}