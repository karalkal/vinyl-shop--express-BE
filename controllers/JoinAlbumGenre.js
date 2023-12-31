const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')
const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')


const getAllAlbumGenres = (req, res, next) => {
    pool.query(`SELECT 	album.id as "Album ID", genre.id as "Genre ID", 
                album.name as "Album Name", album.band_name as "Band", genre.name as "Genre" from album
                    RIGHT JOIN album_genre
                    on album.id = album_genre.album_id
                    LEFT JOIN genre 
                    on genre.id = album_genre.genre_id
                    GROUP by album.id, album.name, album.band_name, genre.id, genre.name;`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const getAlbumGenreById = (req, res, next) => {
    const { albumId, genreId } = req.params
    const albumIdIsInteger = idIntegerValidator(albumId);
    const genreIdIsInteger = idIntegerValidator(genreId)
    if (!albumIdIsInteger || !genreIdIsInteger) {
        return next(createCustomError('Album and Genre IDs must be positive integers', StatusCodes.BAD_REQUEST));
    }
    pool.query(`SELECT 	genre.name as "Genre", album.* from album
                    LEFT JOIN album_genre
                    on album.id = album_genre.album_id
                    LEFT JOIN genre 
                    on genre.id = album_genre.genre_id
                    WHERE album.id = ${albumId} and genre.id=${genreId};`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No result for albumID:${albumId}/genreID:${genreId} found`, StatusCodes.NOT_FOUND))
        }

        res.status(StatusCodes.OK).json(results.rows[0])
    })
}

const createAlbumGenre = (req, res, next) => {
    const { albumId, genreId } = req.body   // in body, not params
    const albumIdIsInteger = idIntegerValidator(albumId);
    const genreIdIsInteger = idIntegerValidator(genreId)
    if (!albumIdIsInteger || !genreIdIsInteger) {
        return next(createCustomError('Album and Genre IDs must be positive integers', StatusCodes.BAD_REQUEST));
    }

    const insertQuery = createInsertQuery("album_genre", { albumId, genreId })  // table_name, send args as object

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create record in album_genre`, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.CREATED).json(results.rows[0])
    })
}

const deleteAlbumGenre = (req, res, next) => {
    const { albumId, genreId } = req.params
    const albumIdIsInteger = idIntegerValidator(albumId);
    const genreIdIsInteger = idIntegerValidator(genreId)
    if (!albumIdIsInteger || !genreIdIsInteger) {
        return next(createCustomError('Album and Genre IDs must be positive integers', StatusCodes.BAD_REQUEST));
    }

    const deleteQuery = createDeleteQuery("album_genre", albumId, genreId)  // table_name, send args as object

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No albumGenre with id ${albumGenreId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

// updating this table is an overkill, makes more sense to delete and then re-create


module.exports = { getAllAlbumGenres, getAlbumGenreById, createAlbumGenre, deleteAlbumGenre }