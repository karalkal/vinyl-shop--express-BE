const express = require('express');
const { getAllOrders, getOrdersByUserAndOrderId, createOrder, deleteOrder, updateOrder } = require('../controllers/Orders');
const userAuthentication = require('../middleware/userAuthentication');
const adminAuthorization = require('../middleware/adminAuthorization');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const ordersRouter = express.Router({ mergeParams: true });

// users can view their orders only, admins can see all orders
ordersRouter.get("/", userAuthentication, getAllOrders);
// url/order/id/id - users can view their orders, admins too
ordersRouter.get("/:userId/:orderId", userAuthentication, getOrdersByUserAndOrderId);
// this is the route where an order is placed
ordersRouter.post("/", userAuthentication, createOrder);
// admins only can remove orders
ordersRouter.delete("/:orderId", adminAuthorization, deleteOrder);
// admin access only - allowes changes to status to shipped, completed etc.
ordersRouter.put("/:orderId", adminAuthorization, updateOrder);


module.exports = ordersRouter
