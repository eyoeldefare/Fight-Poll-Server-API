'use strict';
const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const users = require('./routes/users')(router)
const polls = require('./routes/polls')(router)
const comments = require('./routes/comments')(router)
const notification = require('./routes/notification')(router)
const check = require('./routes/check')(router)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use('/', users)
app.use('/', polls)
app.use('/', comments)
app.use('/', notification)
app.use('/', check)
app.listen(port, () => console.log(`Listening at port ${port}`))