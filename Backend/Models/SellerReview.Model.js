const mongoose = require("mongoose");

const sellerReviewSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellerProfile",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  status: {
    type: String,
    enum: ["published", "flagged", "hidden"],
    default: "published",
  },
}, { timestamps: true });

// Prevent duplicate reviews for the same order by the same user
sellerReviewSchema.index({ user: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("SellerReview", sellerReviewSchema);
