const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')
const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')


const getAllGenres = (req, res, next) => {
    pool.query('SELECT id, name FROM genre ORDER BY id ASC', (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const getGenreById = (req, res, next) => {
    const { genreId } = req.params
    const idIsInteger = idIntegerValidator(genreId);
    if (!idIsInteger) {
        return next(createCustomError('Genre id must be positive integer', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT genre.name,
                array(
                    SELECT album.name
                    from album 
                    LEFT JOIN album_genre 
                    ON album.id = album_genre.album_id
                    WHERE album_genre.genre_id = ${genreId}
                    ) as album_array
                FROM genre
                WHERE genre.id = ${genreId};`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No genre with id ${genreId} found`, StatusCodes.NOT_FOUND))
        }

        res.status(StatusCodes.OK).json(results.rows[0])
    })
}

const createGenre = (req, res, next) => {
    const genreData = req.body
    const undefinedProperty = verifyNonNullableFields("genre", genreData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }
    const insertQuery = createInsertQuery("genre", genreData)

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create genre`, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.CREATED).json(results.rows[0])
    })
}

const deleteGenre = (req, res, next) => {
    const { genreId } = req.params
    const idIsInteger = idIntegerValidator(genreId);
    if (!idIsInteger) {
        return next(createCustomError('Genre id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const deleteQuery = createDeleteQuery("genre", genreId)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No genre with id ${genreId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

const updateGenre = (req, res, next) => {
    const { genreId } = req.params;
    const updatedGenreData = req.body;

    const idIsInteger = idIntegerValidator(genreId);
    if (!idIsInteger) {
        return next(createCustomError('Genre id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const undefinedProperty = verifyNonNullableFields("genre", updatedGenreData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot update: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const updateQuery = createUpdateQuery("genre", genreId, updatedGenreData);

    pool.query(updateQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No genre with id ${genreId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


module.exports = { getAllGenres, getGenreById, createGenre, deleteGenre, updateGenre }