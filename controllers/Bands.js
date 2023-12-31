const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')
const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')

const getAllBands = (req, res, next) => {
    pool.query('SELECT id, name, country FROM band ORDER BY id ASC', (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const getBandById = (req, res, next) => {
    const { bandId } = req.params
    const idIsInteger = idIntegerValidator(bandId);
    if (!idIsInteger) {
        return next(createCustomError('Band id must be positive integer', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT *,
                        array (SELECT album.name from album 
                            where band.name = album.band_name
                            order by album.release_year
                ) as discography
                FROM band
                WHERE band.id = ${bandId}`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        /*  If id not found, not error but Result obj has rowCount: 0
            BUT if (results.rowCount && results.rowCount !== 1) IS NOT OK
            Because results.rowCount == 0 hence results.rowCount == false and ignores second check (facepalm)
            console.log("ROWS:\n", results.rowCount, results.rowCount == false)   // DEMO     
        */
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No band with id ${bandId} found`, StatusCodes.NOT_FOUND))
        }

        res.status(StatusCodes.OK).json(results.rows[0])
    })
}

const createBand = (req, res, next) => {
    // from authentication middleware we must have user prop attached to req
    const bandData = req.body;
    // These cannot be NULL, validation will be carried out in FE beforehand anyway
    const undefinedProperty = verifyNonNullableFields("band", bandData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    // If containing minimum required data
    const insertQuery = createInsertQuery("band", bandData)

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create band`, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.CREATED).json(results.rows[0])
    })
}

const deleteBand = (req, res, next) => {
    const { bandId } = req.params
    const idIsInteger = idIntegerValidator(bandId);
    if (!idIsInteger) {
        return next(createCustomError('Band id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const deleteQuery = createDeleteQuery("band", bandId)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No band with id ${bandId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

const updateBand = (req, res, next) => {
    const { bandId } = req.params;
    const updatedBandData = req.body;

    const idIsInteger = idIntegerValidator(bandId);
    if (!idIsInteger) {
        return next(createCustomError('Band id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const undefinedProperty = verifyNonNullableFields("band", updatedBandData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot update: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const updateQuery = createUpdateQuery("band", bandId, updatedBandData);

    pool.query(updateQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No band with id ${bandId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


module.exports = { getAllBands, getBandById, createBand, deleteBand, updateBand }
