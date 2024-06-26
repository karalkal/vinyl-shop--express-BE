const { StatusCodes } = require('http-status-codes')
const { pool } = require('../db/connect')

const { createInsertQuery, createDeleteQuery, createUpdateQuery, createSelectQuery } = require('../utils-validators/queryCreators')
const { idIntegerValidator, verifyNonNullableFields } = require('../utils-validators/validators')
const { createCustomError } = require('../errors/custom-error')

// If regular user, they can view their own orders only
const getAllOrders = (req, res, next) => {
    // getting req.user from auth middleware
    const whereClause = req.user.is_admin ? '  ' : `AND purchase.user_id = ${req.user.userId}`;

    const selectQuery = createSelectQuery("purchase", whereClause);

    pool.query(selectQuery, (error, results) => {
        if (error) {
            console.log(error)
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        // if nothing return empty array
        res.status(StatusCodes.OK).json(results.rows)
    })
}

// NOT IMPLEMENTED - SKIP 
const getOrdersByUserAndOrderId = (req, res, next) => {
    // middleware creates req.user
    const { userId, orderId } = req.params
    // only admins and the user themselves can access this route
    if (Number(userId) !== req.user.userId && !req.user.is_admin) {
        return next(createCustomError('Regular users can view their own orders only', StatusCodes.BAD_REQUEST));
    }

    pool.query(`SELECT * FROM purchase            
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
    // albumsOrdered contains objects with album data AND AMOUNT REQUESTED for each item
    let count_items = 0;
    for (let al of req.body.albumsOrdered) {
        count_items += al.amountRequested
    }

    // console.log("req.BODY", req.body, "\nreq.USER", req.user);
    const orderData = {
        total: Number((req.body.totalFromFE).toFixed(2)),
        user_id: req.user.userId,
        count_items,
    }
    // Validations
    const undefinedProperty = verifyNonNullableFields("purchase", orderData);
    if (undefinedProperty) {
        return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
    }

    // Create entry in purchase table, attach returned purchaseId to req, next(), next middleware will insert in intermediary table AlbumOrder
    const insertQuery = createInsertQuery("purchase", orderData);
    pool.query(insertQuery, (error, results) => {
        if (error) {
            console.log(error)
            return next(createCustomError(error, StatusCodes.BAD_REQUEST))
        }
        // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
        if (results.rowCount && results.rowCount !== 1) {
            return next(createCustomError(`Could not create purchase`, StatusCodes.BAD_REQUEST))
        }
        req.body.purchaseId = results.rows[0].id;      // record created successfully -->> get purchaseId
        // console.log("first query ran", req.body);
        next();
    })
}

/** This function will be called once a new order/purchase has been created.
    It will create records in intermediary table AlbumOrder
    for each COPY of album ordered  */
const createAlbumOrderEntry = async (req, res, next) => {
    const { purchaseId, albumsOrdered } = req.body;
    for (let album of albumsOrdered) {
        // create orderData obj to send to query creator
        const orderData = { purchaseId, albumId: album.id };

        // More than one copy of each album could be ordered (see amountRequested), hence inner loop
        // for each album copy ordered create separate entry in the table
        for (let copyNo = 1; copyNo <= album.amountRequested; copyNo++) {
            const insertQuery = createInsertQuery("album_purchase", orderData);
            // console.log("\n++++\nalbumId:", album.id, "\ncopiesOrdered:", album.amountRequested, "\ncopyNo.:", copyNo, "\n++++\n")
            // console.log("------\nfor purchase:", purchaseId, "\ninsertQuery receives:", orderData)

            try {
                await pool.query(insertQuery);      // await is key here!
            } catch (error) {
                console.log(error)
                return next(createCustomError(error, StatusCodes.BAD_REQUEST))
            }
        }

    }
    // if all is good
    res.status(StatusCodes.CREATED).json(req.body)
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


module.exports = { getAllOrders, getOrdersByUserAndOrderId, createOrder, createAlbumOrderEntry, deleteOrder, updateOrder }
