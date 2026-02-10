const express = require('express');
const mainRouter = express.Router();

const userRouter = require('./User.Route');
const productRouter = require('./Product.Route');
const WishListRouter = require('./WishList.Route');
const ReviewRouter = require('./Review.Route.Js');
const cartRouter = require('./Cart.Route');
const orderRouter = require('./Order.Route');
const sellerRouter = require('./Seller.Route');
const adminRouter = require('./Admin.Route');

mainRouter.get("/", () => {
    console.log("Api Calling Successful");
});

mainRouter.use("/user", userRouter);
mainRouter.use("/product", productRouter);
mainRouter.use("/wishlist", WishListRouter);
mainRouter.use("/review", ReviewRouter);
mainRouter.use("/cart", cartRouter);
mainRouter.use("/order", orderRouter);
mainRouter.use("/seller", sellerRouter);
mainRouter.use("/admin", adminRouter);

module.exports = mainRouter;