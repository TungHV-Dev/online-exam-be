const { Pool } = require('pg')

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
            console.log(`Error connect to postgres DB: ${credentials.host}:${credentials.port}`)
            throw err
        } else {
            console.log(`Postgres DB connected at port: ${credentials.port}`)
            global._postgresDB = client
        }
    })
}

module.exports = {
    createConnectionPool
}