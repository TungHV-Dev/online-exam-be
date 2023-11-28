require('dotenv').config()
const express = require('express')
const cors = require('cors')
const session = require('express-session')

global.XMLHttpRequest = require('xhr2')



const bodyParser = require('body-parser')
const port = Number(process.env.PORT || 9032)

const app = express()

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.json({ limit: process.env.SIZE_FILE_LIMIT }))
app.use(bodyParser.urlencoded({ extended: true, limit: process.env.SIZE_FILE_LIMIT }));

app.use(session({
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

app.use(cors({
    origin: '*',
    methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE',
    optionsSuccessStatus: 200
}))

const adminApi = require('./routers/admin.router')
const authApi = require('./routers/auth.router')

app.get('/health-check', (req, res) => {
    res.status(200).json({ code: 200, message: `Service is running on port ${port}` })
})

app.use('/online-exam-api/admin', adminApi)
app.use('/online-exam-api/auth', authApi)

app.listen(port, () => {
    console.log(`Server is running at port: ${port}`)
})