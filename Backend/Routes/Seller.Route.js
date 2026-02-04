const express = require("express");
const sellerRouter = express.Router();
const authenticated = require("../Middlewares/Auth");
const {
    sellerDashboard,
    trackOrder
} = require("../Controllers/Seller.Controller");

sellerRouter.get("/dashboard", authenticated, sellerDashboard);


module.exports = sellerRouter;
