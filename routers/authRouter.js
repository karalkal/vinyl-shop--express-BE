const express = require('express')
const authRouter = express.Router()
const { register, login, google, userIsAdmin } = require('../controllers/Auth')
const adminAuthorization = require('../middleware/adminAuthorization')
const { StatusCodes } = require('http-status-codes')


authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/google', google)
authRouter.get('/admin', adminAuthorization, async (req, res, next) => {
    const isAdmin = req.user.is_admin
<<<<<<< HEAD
    res.status(StatusCodes.OK).send(isAdmin)        // true or false
=======
    res.status(StatusCodes.OK).send(isAdmin)
>>>>>>> fb13eb08e34de9eda573498db41f67c08da0e8e7
})

module.exports = authRouter

