const express = require("express");
const sellerReviewRouter = express.Router();
const authenticated = require("../Middlewares/Auth");

const {
  createSellerReview,
  skipSellerReview,
  getSellerReviews,
  getTopSellers
} = require("../Controllers/SellerReview.Controller");

// Customer routes
sellerReviewRouter.post("/create", authenticated, createSellerReview);
sellerReviewRouter.post("/skip", authenticated, skipSellerReview);

// Public routes
sellerReviewRouter.get("/top-sellers", getTopSellers);
sellerReviewRouter.get("/:sellerId", getSellerReviews);

module.exports = sellerReviewRouter;
