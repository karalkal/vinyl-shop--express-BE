const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')
const bcrypt = require('bcryptjs')

const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields, stringLengthValidator, emailValidator } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')


const getAllUsers = (req, res, next) => {
    pool.query('SELECT id, f_name, l_name, city, country FROM db_user ORDER BY id ASC', (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const getUserById = (req, res, next) => {
    // middleware creates req.user
    const { userId } = req.params
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('Only logged in user and admins can view this profile', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT id, f_name, l_name, email, house_number, street_name, city, country, is_admin, 
                is_contributor FROM db_user WHERE db_user.id = ${userId}`, (error, results) => {        // all except password hash
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No user with id ${userId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows[0])
    })
}
const deleteUser = (req, res, next) => {
    const { userId } = req.params
    // middleware creates req.user
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('Only logged in user and admins can delete this profile', StatusCodes.BAD_REQUEST));
    }

    const deleteQuery = createDeleteQuery("db_user", userId)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No user with id ${userId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}
const updateUser = async (req, res, next) => {
    const { userId } = req.params;
    // middleware creates req.user
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('Only logged in user and admins can update this profile', StatusCodes.BAD_REQUEST));
    }

    const updatedUserData = req.body;
    // When implementing user updating their own profiles functionality,  
    // ensure users cannot update themselves with is_admin: true. 
    // These can be edited directly from DB only!
    // Overwrite is_admin like below
    // updatedUserData.is_admin = req.user.is_admin;
    // updatedUserData.is_contributor = req.user.is_contributor;
    // console.log("updatedUserData", updatedUserData)

    const updateQuery = createUpdateQuery("db_user", userId, updatedUserData);

    pool.query(updateQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No user with id ${userId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


module.exports = { getAllUsers, getUserById, deleteUser, updateUser }
