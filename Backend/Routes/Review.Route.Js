const express = require("express");
const ReviewRouter = express.Router();
const {
  addReview,
  getReview,
  deleteReview,
} = require("../Controllers/Review.Controller");
const Authorization = require("../Middlewares/Auth");

ReviewRouter.post("/add", Authorization, addReview);
ReviewRouter.get("/:id", getReview);
ReviewRouter.delete("/:reviewId", Authorization, deleteReview);

module.exports = ReviewRouter;
