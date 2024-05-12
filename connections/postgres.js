const { Pool } = require('pg')
const logger = require('../logger/logger')

function createConnectionPool() {
    const credentials = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        ssl: true,
    }

    const pool = new Pool(credentials)
    pool.connect((err, client, done) => {
        if (err) {
            logger.error(`Error connect to postgres DB: ${err.message}`)
            throw err
        } else {
            logger.info(`Postgres DB connected on port: ${credentials.port}`)
            global._postgresDB = client
        }
    })
}

module.exports = {
    createConnectionPool
}