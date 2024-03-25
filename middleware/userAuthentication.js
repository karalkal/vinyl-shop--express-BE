const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { createCustomError } = require('../errors/custom-error')


const userAuthentication = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  console.log("header", authHeader)

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(createCustomError(`Invalid or missing token`, StatusCodes.UNAUTHORIZED))
  }
  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // attach the user to request
    req.user = payload.user
    console.log("passed userAuth")
    next()
  } catch (error) {
    return next(createCustomError(`Error: ${error}`, StatusCodes.UNAUTHORIZED))
  }
}

module.exports = userAuthentication
