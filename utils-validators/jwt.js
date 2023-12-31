
const jwt = require('jsonwebtoken')
require('dotenv').config()

function createJWT(userId, email, is_contributor, is_admin) {
    const token = jwt.sign(
        {
            user:
                { userId: userId, email: email, is_contributor: is_contributor, is_admin: is_admin }
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    )
    return token
}


module.exports = { createJWT }