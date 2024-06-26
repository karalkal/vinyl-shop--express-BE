const express = require('express');
const { getAllAlbums, findAlbums, getAlbumById, createAlbum, deleteAlbum, updateAlbum } = require('../controllers/Albums');
const adminAuthorization = require('../middleware/adminAuthorization');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const albumsRouter = express.Router({ mergeParams: true });

// anyone can view, only admins can create, update, delete
albumsRouter.get("/", getAllAlbums);
albumsRouter.get("/search", findAlbums);
albumsRouter.get("/:albumId", getAlbumById);
albumsRouter.post("/", adminAuthorization, createAlbum);
albumsRouter.delete("/:albumId", adminAuthorization, deleteAlbum);
albumsRouter.put("/:albumId", adminAuthorization, updateAlbum);


module.exports = albumsRouter
