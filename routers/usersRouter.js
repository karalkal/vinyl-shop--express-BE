const express = require('express');
const { getAllUsers, getUserById, deleteUser, updateUser } = require('../controllers/Users');
const adminAuthorization = require('../middleware/adminAuthorization');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const usersRouter = express.Router({ mergeParams: true });

usersRouter.get("/", adminAuthorization, getAllUsers);
usersRouter.get("/:userId", adminAuthorization, getUserById);
usersRouter.delete("/:userId", adminAuthorization, deleteUser);
usersRouter.put("/:userId", adminAuthorization, updateUser);


module.exports = usersRouter
