const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')

const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')

// If regular user, they can view their own orders only
const getAllOrders = (req, res, next) => {
    // getting req.user from auth middleware
    const whereClause = req.user.is_admin ? '' : `WHERE purchase.user_id = ${req.user.userId}`

    pool.query(`SELECT * FROM purchase ${whereClause} ORDER BY id ASC `, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

/*
// REDUNDANT
const getOrderByOrderId = (req, res, next) => {
    const { orderId } = req.params
    const idIsInteger = idIntegerValidator(orderId);
    if (!idIsInteger) {
        return next(createCustomError('Order id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    pool.query(`SELECT distinct purchase.*,
            array(
                SELECT album.id 
                from album 
                LEFT JOIN cart 
                on cart.album_id = album.id
                WHERE cart.cart_no = purchase.cart_no
                ) as albums_ordered
            from purchase 
            
            where purchase.id = ${orderId};`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No order with id ${orderId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows[0])
    })
}
*/

const getOrdersByUserAndOrderId = (req, res, next) => {
    // middleware creates req.user
    const { userId, orderId } = req.params
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('Regular users can view their own orders only', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT *, array(
            SELECT album.id 
            from album 
            LEFT JOIN cart 
            on cart.album_id = album.id
            LEFT JOIN purchase 
            on purchase.cart_no = cart.cart_no
            WHERE cart.user_id = ${userId}
            AND purchase.id = ${orderId}

            ) as albums_ordered
            FROM purchase            
            WHERE purchase.user_id = ${userId}
            AND purchase.id = ${orderId}
            `, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount === 0) {            // create error object ---> go to next middleware, eventually errorHandler
            return next(createCustomError(`No order ${orderId} for user ${userId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}

const createOrder = async (req, res, next) => {
    // First check if the user is creating order for themselves - you cannot allow user 1 to create order for user 2
    // only admins and the user themselves can access this route- middleware creates req.user
    // NB - Here userId is not param but is within body
    if (Number(req.body.user_id) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('You cannot create orders for other users, obviously', StatusCodes.BAD_REQUEST));
    }

    const orderData = req.body
    // Validations
    const undefinedProperty = verifyNonNullableFields("order", orderData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const insertQuery = createInsertQuery("purchase", orderData)

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

const deleteOrder = (req, res, next) => {
    const { orderId } = req.params
    const idIsInteger = idIntegerValidator(orderId);
    if (!idIsInteger) {
        return next(createCustomError('Order id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const deleteQuery = createDeleteQuery("purchase", orderId)

    pool.query(deleteQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No order with id ${orderId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.NO_CONTENT).send()
    })
}

const updateOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const updatedOrderData = req.body;
    const idIsInteger = idIntegerValidator(orderId);
    if (!idIsInteger) {
        return next(createCustomError('User id must be positive integer', StatusCodes.BAD_REQUEST));
    }
    const undefinedProperty = verifyNonNullableFields("purchase", updatedOrderData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot update: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    const updateQuery = createUpdateQuery("purchase", orderId, updatedOrderData);
    console.log(updateQuery)

    pool.query(updateQuery, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {
            return next(createCustomError(`No order with id ${orderId} found`, StatusCodes.NOT_FOUND))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


module.exports = { getAllOrders, getOrdersByUserAndOrderId, createOrder, deleteOrder, updateOrder }
