const express = require('express');
const { getAllBands, getBandById, createBand, deleteBand, updateBand } = require('../controllers/Bands');
const userAuthentication = require('../middleware/userAuthentication');
const adminAuthorization = require('../middleware/adminAuthorization');

// you need to set mergeParams: true on the router,
// if you want to access params from the parent router
const bandsRouter = express.Router({ mergeParams: true });

// auth middlewares - all routes apart from these with get method are restricted for non-admin users
bandsRouter.get("/", getAllBands);
bandsRouter.get("/:bandId", getBandById);
bandsRouter.post("/", adminAuthorization, createBand);
bandsRouter.delete("/:bandId", adminAuthorization, deleteBand);
bandsRouter.put("/:bandId", adminAuthorization, updateBand);


module.exports = bandsRouter
