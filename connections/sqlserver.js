const sql = require('mssql');

const createConnectionSqlServer = function() {
    try {
        const config = {
            server: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 9032),
            database: process.env.DB_NAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            pool: {
                min: 0,
                idleTimeoutMillis: 60000
            },
            options: {
                encrypt: false, // for azure
                trustServerCertificate: true // change to true for local dev / self-signed certs
            }
        }

        sql.connect(config).then((data) => {
            if (data) {
                console.log(`Connected to SQL Server successfully: ${config.server}:${config.port} - ${config.database}`)
                global._sqlserver = data
            }
        })
    } catch (e) {
        console.log('Exception while connecting to SQL server: ', e?.message)
        throw e
    }
}


module.exports = {
    createConnectionSqlServer
}