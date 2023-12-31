const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')
const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')


const getAllLabels = (req, res, next) => {
    pool.query('SELECT id, name FROM label ORDER BY id ASC', (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const getLabelById = (req, res, next) => {
    const { labelId } = req.params
    const idIsInteger = idIntegerValidator(labelId);
    if (!idIsInteger) {
        return next(createCustomError('Label id must be positive integer', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT *,
        array(
            SELECT album.name
            from album 
            WHERE album.label_name = label.name
            ) as album_array
            FROM label
            WHERE label.id = ${labelId};`
        , (error, results) => {
            if (error) {
                return next(createCustomError(error, StatusCodes.BAD_REQUEST))
            }
            if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
                return next(createCustomError(`No label with id ${labelId} found`, StatusCodes.NOT_FOUND))
            }

            res.status(StatusCodes.OK).json(results.rows[0])
        })
}

const createLabel = (req, res, next) => {
    const labelData = req.body
    const undefinedProperty = verifyNonNullableFields("label", labelData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }
    const insertQuery = createInsertQuery("label", labelData)

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create label`, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.CREATED).json(results.rows[0])
    })
}

const deleteLabel = (req, res, next) => {
    const { labelId } = req.params
    const idIsInteger = idIntegerValidator(labelId);
    if (!idIsInteger) {
        return next(createCustomError('Label id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const deleteQuery = createDeleteQuery("label", labelId)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No label with id ${labelId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

const updateLabel = (req, res, next) => {
    const { labelId } = req.params;
    const updatedLabelData = req.body;

    const idIsInteger = idIntegerValidator(labelId);
    if (!idIsInteger) {
        return next(createCustomError('Label id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const undefinedProperty = verifyNonNullableFields("label", updatedLabelData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot update: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const updateQuery = createUpdateQuery("label", labelId, updatedLabelData);

    pool.query(updateQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No label with id ${labelId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


module.exports = { getAllLabels, getLabelById, createLabel, deleteLabel, updateLabel }
