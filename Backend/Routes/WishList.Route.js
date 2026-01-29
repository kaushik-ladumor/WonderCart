const express = require("express");
const WishListRouter = express.Router();
const {getItem, addItem, removeItem} = require('../Controllers/WishList.Controller');
const Authorization = require('../Middlewares/Auth');

WishListRouter.get("/", Authorization, getItem);
WishListRouter.post("/add", Authorization, addItem);
WishListRouter.delete(
  "/remove/:productId",
  Authorization,
  removeItem
);

module.exports = WishListRouter;

