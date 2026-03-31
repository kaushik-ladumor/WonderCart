const express = require("express");
const mainRouter = express.Router();

const userRouter = require("./User.Route");
const productRouter = require("./Product.Route");
const WishListRouter = require("./WishList.Route");
const ReviewRouter = require("./Review.Route.Js");
const cartRouter = require("./Cart.Route");
const orderRouter = require("./Order.Route");
const sellerRouter = require("./Seller.Route");
const adminRouter = require("./Admin.Route");
const ChatRouter = require("./Chat.Route");
const visualSearchRouter = require("./ViesualSearch.Route");
const emailRouter = require("./Email.Route");

const sellerReviewRouter = require("./SellerReview.Route");
const topSellerRouter = require("./TopSeller.Route");
const dealRoutes = require("./deals");

// Root API test
mainRouter.get("/", (req, res) => {
    res.send("API Calling Successful");
});

// Routes
mainRouter.use("/user", userRouter);
mainRouter.use("/product", productRouter);
mainRouter.use("/wishlist", WishListRouter);
mainRouter.use("/review", ReviewRouter);
mainRouter.use("/cart", cartRouter);
mainRouter.use("/order", orderRouter);
mainRouter.use("/seller", sellerRouter);
mainRouter.use("/seller-review", sellerReviewRouter);
mainRouter.use("/admin", adminRouter);
mainRouter.use("/email", emailRouter);
mainRouter.use("/chat", ChatRouter);
mainRouter.use("/visual-search", visualSearchRouter);
mainRouter.use("/api/top-sellers", topSellerRouter);
mainRouter.use("/api/deals", dealRoutes);

module.exports = mainRouter;