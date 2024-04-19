const express = require('express');
const { getAllUsers, getUserById, createUser, deleteUser, updateUser } = require('../controllers/Users');
const adminAuthorization = require('../middleware/adminAuthorization');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const usersRouter = express.Router({ mergeParams: true });

// only logged in users can see profiles (restricted data - no password, email, address etc)
usersRouter.get("/", adminAuthorization, getAllUsers);

// admins can create users on the fly, normal users use register instead
usersRouter.post("/", adminAuthorization, createUser);

// users restricted to view, update, delete own profiles only, admins allowed too
usersRouter.get("/:userId", adminAuthorization, getUserById);
usersRouter.delete("/:userId", adminAuthorization, deleteUser);
usersRouter.put("/:userId", adminAuthorization, updateUser);


module.exports = usersRouter
