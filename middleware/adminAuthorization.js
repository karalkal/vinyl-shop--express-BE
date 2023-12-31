const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { createCustomError } = require('../errors/custom-error')


const adminAuthorization = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(createCustomError(`Invalid or missing token`, StatusCodes.UNAUTHORIZED))
  }
  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // attach the user to request
    if (!payload.user.is_admin){
      return next(createCustomError(`Insufficient privileges to access this route`, StatusCodes.UNAUTHORIZED))
    }
    req.user = payload.user   //attach the user object as prop to req
    next()
  } catch (error) {
    return next(createCustomError(`Error: ${error}`, StatusCodes.UNAUTHORIZED))
  }
}

module.exports = adminAuthorization
