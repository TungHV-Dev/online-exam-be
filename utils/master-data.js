const MASTER_DATA = {
    ROLE: {
        ROLE_ID: {
            ADMIN: 1,
            TEACHER: 2,
            STUDENT: 3
        },
        ROLE_NAME: {
            ADMIN: 'ADMIN',
            TEACHER: 'TEACHER',
            STUDENT: 'STUDENT'
        }
    },
    LEARNING_STATUS: {
        TO_DO: 'To do',
        INPROGRESS: 'Inprogress',
        COMPLETED: 'Completed'
    },
    QUESTION_TYPE: {
        TYPE_1: 'Type_1',
        TYPE_2: 'Type_2',
        TYPE_3: 'Type_3',
        TYPE_4: 'Type_4'
    },
    LANGUAGE_MAP: {
        "c": { language: "c", version: "10.2.0" },
        "cpp": { language: "c++", version: "10.2.0" },
        "python": { language: "python", version: "3.10.0" },
    }
}


module.exports = MASTER_DATA