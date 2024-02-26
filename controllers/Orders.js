const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')

const { createInsertQuery, createDeleteQuery, createUpdateQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')

// If regular user, they can view their own orders only
const getAllOrders = (req, res, next) => {
    // getting req.user from auth middleware
    const whereClause = req.user.is_admin ? '' : `WHERE purchase.user_id = ${req.user.userId}`;

    pool.query(`SELECT *, 
                array (SELECT album.id from album LEFT JOIN album_purchase on album_purchase.album_id = album_purchase.id) 
                as albums_ordered 
        from purchase ${whereClause} 
        ORDER BY id ASC;`, (error, results) => {
        if (error) {
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        res.status(StatusCodes.OK).json(results.rows)
    })
}


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
    if (req.body.userEmail !== req.user.email && !req.user.is_admin) {
        return next(createCustomError('You cannot create orders for other users, obviously', StatusCodes.BAD_REQUEST));
    }
    // Don't forget - user can order numerous copies of same item
    // console.log(JSON.stringify(req.body))
    let count_items = 0;
    for (let al of req.body.albumsOrdered) {
        count_items += al.amountRequested
    }

    const orderData = {
        total: req.body.totalFromFE,
        user_id: req.user.userId,
        count_items
    }
    // Validations
    const undefinedProperty = verifyNonNullableFields("purchase", orderData);
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
            return next(createCustomError(`Could not create purchase`, StatusCodes.BAD_REQUEST))
        }
        // If all is good, try to create intermediary table entry first and if successful, then return ok
        const purchaseId = results.rows[0].id
        createAlbumOrderEntry(purchaseId, req.body.albumsOrdered, req, res, next)

        res.status(StatusCodes.CREATED).json(results.rows)
    })
}

// This function will be called once a new order/purchase has been created
async function createAlbumOrderEntry(purchaseId, albums, req, res, next) {
    for (let album of albums) {
        let copiesOrdered = Number(album.amountRequested);
        let albumId = album.id;
        // can actually create orderData here as inner loop just deals with copiesOrdered 
        const orderData = { purchaseId, albumId }

        // for each album copy ordered separate entry in the table
        for (let copyNo = 1; copyNo <= copiesOrdered; copyNo++) {

            const insertQuery = createInsertQuery("album_purchase", orderData);

            pool.query(insertQuery, (error, results) => {
                if (error) {
                    return next(createCustomError(error, StatusCodes.BAD_REQUEST))
                }
                if (results.rowCount && results.rowCount !== 1) {
                    return next(createCustomError(`Could not write in album_purchase table`, StatusCodes.BAD_REQUEST))
                }
                return
                // res.status(StatusCodes.CREATED).json(results.rows)
            })
        }
    }
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
