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

module.exports = {
    formatObjectData
}