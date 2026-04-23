const express = require("express");
const sellerReviewRouter = express.Router();
const authenticated = require("../Middlewares/Auth");

const {
  createSellerReview,
  skipSellerReview,
  getSellerReviews,
  getMyReviews,
  getTopSellers
} = require("../Controllers/SellerReview.Controller");

// Customer routes
sellerReviewRouter.post("/create", authenticated, createSellerReview);
sellerReviewRouter.post("/skip", authenticated, skipSellerReview);

// Seller routes
sellerReviewRouter.get("/my-reviews", authenticated, getMyReviews);

// Public routes
sellerReviewRouter.get("/top-sellers", getTopSellers);
sellerReviewRouter.get("/:sellerId", getSellerReviews);

module.exports = sellerReviewRouter;
