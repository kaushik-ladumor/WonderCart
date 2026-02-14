const express = require("express");
const WishListRouter = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");
const { getItem, addItem, removeItem } = require('../Controllers/WishList.Controller');
const Authorization = require('../Middlewares/Auth');

WishListRouter.get("/", Authorization, getItem);
WishListRouter.post("/add", Authorization, requireVerification, addItem);
WishListRouter.delete(
  "/remove/:productId",
  Authorization,
  removeItem
);

module.exports = WishListRouter;

