const express = require("express");
const ReviewRouter = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");

const {
  addReview,
  getReview,
  deleteReview,
  checkEligibility,
  voteHelpful,
  reportReview,
  getMyReviews,
  updateReview
} = require("../Controllers/Review.Controller");
const Authorization = require("../Middlewares/Auth");

ReviewRouter.post("/add", Authorization, requireVerification, addReview);
ReviewRouter.get("/check-eligibility", Authorization, checkEligibility);
ReviewRouter.post("/helpful/:reviewId", Authorization, voteHelpful);
ReviewRouter.post("/report/:reviewId", Authorization, reportReview);
ReviewRouter.get("/my-reviews", Authorization, getMyReviews);
ReviewRouter.get("/:id", getReview);
ReviewRouter.put("/:reviewId", Authorization, updateReview);
ReviewRouter.delete("/:reviewId", Authorization, deleteReview);

module.exports = ReviewRouter;
