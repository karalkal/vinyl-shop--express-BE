const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')
const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')


const getAllAlbums = (req, res, next) => {
    pool.query('SELECT id, name, band_name, cover, release_year, colour, price FROM album ORDER BY id ASC', (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const getAlbumById = (req, res, next) => {
    const { albumId } = req.params
    const idIsInteger = idIntegerValidator(albumId);
    if (!idIsInteger) {
        return next(createCustomError('Album id must be positive integer', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT *, 
            array(
                SELECT genre.name 
                from genre 
                LEFT JOIN album_genre 
                ON genre.id = album_genre.genre_id
                WHERE album_genre.album_id = ${albumId}
                ) as genre_array
            from album
            where album.id = ${albumId};`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        /*  If id not found, not error but Result obj has rowCount: 0
            BUT if (results.rowCount && results.rowCount !== 1) IS NOT OK
            Because results.rowCount == 0 hence results.rowCount == false and ignores second check (facepalm)
            console.log("ROWS:\n", results.rowCount, results.rowCount == false)   // DEMO     
        */
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No album with id ${albumId} found`, StatusCodes.NOT_FOUND))
        }

        res.status(StatusCodes.OK).json(results.rows[0])
    })
}

const createAlbum = (req, res, next) => {
    const albumData = req.body

    // These cannot be NULL, validation will be carried out in FE beforehand anyway
    const undefinedProperty = verifyNonNullableFields("album", albumData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    // If containing minimum required data
    const insertQuery = createInsertQuery("album", albumData)

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create album`, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.CREATED).json(results.rows[0])
    })
}

const deleteAlbum = (req, res, next) => {
    const { albumId } = req.params
    const idIsInteger = idIntegerValidator(albumId);
    if (!idIsInteger) {
        return next(createCustomError('Album id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const deleteQuery = createDeleteQuery("album", albumId)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No album with id ${albumId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

const updateAlbum = (req, res, next) => {
    const { albumId } = req.params;
    const updatedAlbumData = req.body;

    const idIsInteger = idIntegerValidator(albumId);
    if (!idIsInteger) {
        return next(createCustomError('Album id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const undefinedProperty = verifyNonNullableFields("album", updatedAlbumData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot update: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const updateQuery = createUpdateQuery("album", albumId, updatedAlbumData);
    // console.log("QUERY PARAMS:\n", updateQuery)

    pool.query(updateQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No album with id ${albumId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


module.exports = { getAllAlbums, getAlbumById, createAlbum, deleteAlbum, updateAlbum }