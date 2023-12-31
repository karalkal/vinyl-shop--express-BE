const { StatusCodes } = require('http-status-codes')
const { createCustomError } = require('../errors/custom-error')

const notFound = (req, res, next) => {
    return next(createCustomError('Route does not exist', StatusCodes.NOT_FOUND))
}

module.exports = notFound
