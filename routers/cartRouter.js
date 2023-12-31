const express = require('express');
const { getCartByUserId, createCartItem, removeCartItem, emptyCart } = require('../controllers/Cart');
const userAuthentication = require('../middleware/userAuthentication');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const cartRouter = express.Router({ mergeParams: true });

cartRouter.get("/:userId", userAuthentication, getCartByUserId);
cartRouter.put("/add", userAuthentication, createCartItem);   // used to add items
cartRouter.delete("/remove", userAuthentication, removeCartItem); // used to remove items
cartRouter.delete("/", userAuthentication, emptyCart);  // empty cart


module.exports = cartRouter
