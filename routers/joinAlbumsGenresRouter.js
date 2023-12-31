const express = require('express');
const { getAllAlbumGenres, getAlbumGenreById, createAlbumGenre, deleteAlbumGenre } = require('../controllers/JoinAlbumGenre')
const userAuthentication = require('../middleware/userAuthentication');
const adminAuthorization = require('../middleware/adminAuthorization');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const joinAlbumsGenresRouter = express.Router({ mergeParams: true });
// all routes are restricted, accessible to is_admin only
joinAlbumsGenresRouter.use(userAuthentication)
joinAlbumsGenresRouter.use(adminAuthorization)

joinAlbumsGenresRouter.get("/", getAllAlbumGenres);
joinAlbumsGenresRouter.get("/:albumId/:genreId", getAlbumGenreById);
joinAlbumsGenresRouter.post("/", createAlbumGenre);
joinAlbumsGenresRouter.delete("/:albumId/:genreId", deleteAlbumGenre);
// updating this table is an overkill, makes more sense to delete and then re-create

module.exports = joinAlbumsGenresRouter