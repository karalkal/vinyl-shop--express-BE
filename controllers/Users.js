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

    pool.query(`SELECT * FROM db_user WHERE db_user.id = ${userId}`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No user with id ${userId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows[0])
    })
}

// essentially identical to register in Auth, only different res.json and will have different access rights
const createUser = async (req, res, next) => {
    const userData = req.body
    // Validations
    const undefinedProperty = verifyNonNullableFields("db_user", userData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const passTooShort = stringLengthValidator(userData.password, 4, 35)  // min, max
    if (passTooShort) {
        return next(createCustomError(`Password must be between 4 and 35 chars`, StatusCodes.BAD_REQUEST));
    }
    const f_nameTooShort = stringLengthValidator(userData.f_name, 3, 44)  // min, max
    if (f_nameTooShort) {
        return next(createCustomError(`First Name must be between 3 and 44 chars`, StatusCodes.BAD_REQUEST));
    }
    const l_nameTooShort = stringLengthValidator(userData.l_name, 3, 44)  // min, max
    if (l_nameTooShort) {
        return next(createCustomError(`Last Name must be between 3 and 44 chars`, StatusCodes.BAD_REQUEST));
    }
    const emailIsValid = emailValidator(userData.email)    // regex checks for VALID
    if (!emailIsValid) {
        return next(createCustomError(`Invalid email format`, StatusCodes.BAD_REQUEST));
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10)
    userData.password_hash = await bcrypt.hash(userData.password, salt)
    delete userData.password    // just in case

    // Create the user and return jwt if successful, error if not
    const insertQuery = createInsertQuery("db_user", userData)

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create user`, StatusCodes.BAD_REQUEST))
        }
        // If all is good
        res.status(StatusCodes.CREATED).json(results.rows)
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
    const { userId } = req.params
    // middleware creates req.user
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('Only logged in user and admins can update this profile', StatusCodes.BAD_REQUEST));
    }
    const updatedUserData = req.body;

    const undefinedProperty = verifyNonNullableFields("db_user", updatedUserData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot update: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }
    // WILL BE GOOD TO ABSTRACT THIS, I HAVE IT IN REGISTER TOO
    const passTooShort = stringLengthValidator(updatedUserData.password, 4, 35)  // min, max
    if (passTooShort) {
        return next(createCustomError(`Password must be between 4 and 35 chars`, StatusCodes.BAD_REQUEST));
    }
    const f_nameTooShort = stringLengthValidator(updatedUserData.f_name, 3, 44)  // min, max
    if (f_nameTooShort) {
        return next(createCustomError(`First Name must be between 3 and 44 chars`, StatusCodes.BAD_REQUEST));
    }
    const l_nameTooShort = stringLengthValidator(updatedUserData.l_name, 3, 44)  // min, max
    if (l_nameTooShort) {
        return next(createCustomError(`Last Name must be between 3 and 44 chars`, StatusCodes.BAD_REQUEST));
    }
    const emailIsValid = emailValidator(updatedUserData.email)    // regex checks for VALID
    if (!emailIsValid) {
        return next(createCustomError(`Invalid email format`, StatusCodes.BAD_REQUEST));
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10)
    updatedUserData.password_hash = await bcrypt.hash(updatedUserData.password, salt)
    delete updatedUserData.password    // just in case

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


module.exports = { getAllUsers, getUserById, createUser, deleteUser, updateUser }
