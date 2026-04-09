const express = require("express");
const dashboardRouter = express.Router();
const authenticated = require("../Middlewares/Auth"); 
const { getDashboardStats, getSellerEarnings } = require("../Controllers/Dashboard.Controller");

// Endpoint: GET /api/seller/dashboard/stats
dashboardRouter.get("/stats", authenticated, getDashboardStats);

// Endpoint: GET /api/seller/dashboard/earnings
dashboardRouter.get("/earnings", authenticated, getSellerEarnings);

module.exports = dashboardRouter;
