const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')

const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')


const getCartByUserId = (req, res, next) => {
    const { userId } = req.params
    const idIsInteger = idIntegerValidator(userId);
    if (!idIsInteger) {
        return next(createCustomError('User id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    // middleware creates req.user
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('You ain\'t gonna go there', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT cart.id AS "Cart ID", cart.cart_no AS "Cart No",
    db_user.id as "User ID", db_user.email as "User email",
    album.id as "Album ID", album.name as "Album Name", album.band_name as "Band Name", 
    album.quantity as "Quantity", album.price as "Price"
    FROM cart
    JOIN album ON cart.album_id = album.id
    JOIN db_user on cart.user_id = db_user.id
    WHERE cart.user_id = ${userId};`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount < 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No data related to user ${userId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

// USED FOR ADDING ITEMS TO CART - 
// here each "cart" object will contain relation album - user with a specific cartNumber which is not id
const createCartItem = async (req, res, next) => {
    const cartData = req.body
    // all must be inetegers
    const cartNoIsInteger = idIntegerValidator(cartData.cart_no);
    const albumIdIsInteger = idIntegerValidator(cartData.album_id);
    const userIdIsInteger = idIntegerValidator(cartData.user_id);
    if (!cartNoIsInteger || !albumIdIsInteger || !userIdIsInteger) {
        return next(createCustomError('All fields must be positive integers', StatusCodes.BAD_REQUEST));
    }

    // only admins and the user themselves can access this route- middleware creates req.user
    // NB - Here userId is not param but is within body
    const userId = req.body.user_id
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('You ain\'t gonna go there', StatusCodes.BAD_REQUEST));
    }

    const insertQuery = createInsertQuery("cart", cartData)

    pool.query(insertQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create cart`, StatusCodes.BAD_REQUEST))
        }
        // If all is good
        res.status(StatusCodes.CREATED).json({ "msg": `added to cart: ${JSON.stringify(results.rows[0])}` })
    })
}

// will get ID which is unique PK (not cart number), also user_id to check if authorised to remove
const removeCartItem = async (req, res, next) => {
    // all must be inetegers
    const cartIDIsInteger = idIntegerValidator(req.body.id);
    if (!cartIDIsInteger) {
        return next(createCustomError('cart ID must be positive integer', StatusCodes.BAD_REQUEST));
    }

    // only admins and the user themselves can access this route- middleware creates req.user
    // NB - Here userId is not param but is within body
    if (Number(req.body.user_id) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('You ain\'t gonna go there', StatusCodes.BAD_REQUEST));
    }

    const deleteQuery = createDeleteQuery("cart", "remove_single", req.body.id, req.body.user_id);

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount < 1) {
            return next(createCustomError(`No cart with id ${req.body.id} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

// EMPTY cart by cart number (NOT id) - body has cart_no and user_id
const emptyCart = (req, res, next) => {
    const cartData = req.body
    // all must be inetegers
    const cartNoIsInteger = idIntegerValidator(cartData.cart_no);
    const userIdIsInteger = idIntegerValidator(cartData.user_id);
    if (!cartNoIsInteger || !userIdIsInteger) {
        return next(createCustomError('All fields must be positive integers', StatusCodes.BAD_REQUEST));
    }

    // only admins and the user themselves can access this route- middleware creates req.user
    // NB - Here userId is not param but is within body
    const userId = req.body.user_id
    const cartNo = req.body.cart_no
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('You ain\'t gonna go there', StatusCodes.BAD_REQUEST));
    }
    // does not work like below with cart_no send as argument
    // text = 'DELETE FROM ' + tableName + ' WHERE $1 = $2;'

    const deleteQuery = createDeleteQuery("cart", "empty", cartNo, userId)
    console.log(deleteQuery)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount < 1) {
            return next(createCustomError(`No cart with number ${cartNo} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}


module.exports = { getCartByUserId, createCartItem, removeCartItem, emptyCart }
