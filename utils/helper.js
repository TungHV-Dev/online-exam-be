const moment = require('moment')

const formatObjectData = (object) => {
    if (object instanceof Object) {
        const keys = Object.keys(object)
        for (const key of keys) {
            if (typeof(object[key]) == 'string') {
                object[key] = object[key].trim()
            }
        }
    }

    return object
}

const getLastSevenDay = (format = 'YYYY-MM-DD') => {
    let result = []

    for (let i = 0; i < 7; i++) {
        let thisDate = new Date()
        let date = new Date(thisDate.setDate(thisDate.getDate() - i))
        result.push(moment(date).format(format))
    }
    
    return result
}

module.exports = {
    formatObjectData,
    getLastSevenDay
}