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
    console.log("HERE", isAdmin)
    res.status(StatusCodes.OK).send(isAdmin)
})

module.exports = authRouter

