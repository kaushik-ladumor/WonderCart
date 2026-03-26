const express = require("express");
const ReviewRouter = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");

const {
  addReview,
  getReview,
  deleteReview,
  checkEligibility,
  voteHelpful,
  reportReview
} = require("../Controllers/Review.Controller");
const Authorization = require("../Middlewares/Auth");

ReviewRouter.post("/add", Authorization, requireVerification, addReview);
ReviewRouter.get("/check-eligibility", Authorization, checkEligibility);
ReviewRouter.post("/helpful/:reviewId", Authorization, voteHelpful);
ReviewRouter.post("/report/:reviewId", Authorization, reportReview);
ReviewRouter.get("/:id", getReview);
ReviewRouter.delete("/:reviewId", Authorization, deleteReview);

module.exports = ReviewRouter;
