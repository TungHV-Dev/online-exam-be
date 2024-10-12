require('dotenv').config()
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const logger = require('./logger/logger')
global.XMLHttpRequest = require('xhr2')

const postgresConnection = require('./connections/postgres')
postgresConnection.createConnectionPool()

const bodyParser = require('body-parser')
const port = Number(process.env.PORT || 9000)

const app = express()

// Cấu hình server
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.json({ limit: process.env.REQUEST_BODY_SIZE_LIMIT }))
app.use(bodyParser.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_SIZE_LIMIT }));

app.use(session({
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    optionsSuccessStatus: 200
}))

// Cấu hình ghi log request lên server
app.use((req, res, next) => {
    let log = `[${req.method}] ${req.originalUrl}`
    if (req.body) {
        if (req.originalUrl.includes('/login')) {
            log = log.concat(` { "username": "${req.body.username || ''}" }`)
        } else {
            log = log.concat(` ${JSON.stringify(req.body)}`)
        }
    }

    logger.info(log)
    next();
  });

// Cấu hình router API
const authApi = require('./routers/authentication.router')
const dashboardApi = require('./routers/dashboard.router')
const classApi = require('./routers/class.router')
const examApi = require('./routers/exam.router')
const userApi = require('./routers/user.router')

app.get('/health-check', (req, res) => {
    res.status(200).json({ 
        code: 200, 
        message: `Server is running on port ${port}` 
    })
})

app.use('/online-exam-api/auth', authApi)
app.use('/online-exam-api/dashboard', dashboardApi)
app.use('/online-exam-api/class', classApi)
app.use('/online-exam-api/exam', examApi)
app.use('/online-exam-api/user', userApi)

app.listen(port, () => {
    logger.info(`Server is running on port: ${port}`)
})