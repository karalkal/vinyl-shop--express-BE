const express = require('express')
const authRouter = express.Router()
const { register, login, google } = require('../controllers/Auth')


authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/google', google)

module.exports = authRouter
