const classRepo = require('../repositories/class.repo')
const constant = require('../utils/constant')

const getPublishedClassList = async (type, userId) => {

    return []
}

const createNewClass = async (payload) => {
    const teacherId = payload.teacherId || 0
    const classCode = payload.classCode || ''
    const className = payload.className || ''
    const description = payload.description || ''

    if (teacherId && classCode && className && description) {
        const result = await classRepo.insertClass(teacherId, classCode, className, description)
        if (result.rowCount > 0 && result.rows[0].class_id) {
            return 0
        } else {
            return -1
        }
    }

    return -2
}

const joinPublishedClass = async () => {

}

const getMemberList = async () => {

}

const getDocumentList = async () => {

}

const getExamList = async () => {

}

const getClassDetail = async () => {

}

const addDocument = async () => {

}

const createExam = async () => {

}

const viewExam = async () => {

}

const joinExam = async () => {

}

module.exports = {
    getPublishedClassList,
    createNewClass,
    joinPublishedClass,
    getMemberList,
    getDocumentList,
    getExamList,
    getClassDetail,
    addDocument,
    createExam,
    viewExam,
    joinExam
}