const { Pool } = require('pg')
const logger = require('../logger/logger')

function createConnectionPool() {
    global.connectPostgreCount++
    logger.info(`Server is connecting to Postgres DB time: ${global.connectPostgreCount}`)

    const credentials = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false // Nếu bạn không sử dụng chứng chỉ SSL hợp lệ
        }
    }

    const pool = new Pool(credentials)
    pool.connect((err, client, done) => {
        if (err) {
            if (global.connectPostgreCount > 5) {
                logger.error(`Error connect to postgres DB: ${err.message}`)
                throw err
            } else {
                createConnectionPool()
            } 
        } else {
            logger.info(`Server is connected to Postgres DB on port: ${credentials.port}`)
            global._postgresDB = client
        }
    })
}

module.exports = {
    createConnectionPool
}