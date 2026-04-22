const mongoose = require("mongoose");

const variantSizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    sizes: [variantSizeSchema],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: String,
    variants: [variantSchema],
    vector: [Number],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    // --- Ranking & Gamification Fields ---
    salesCount: { 
      type: Number, 
      default: 0 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    ratingAverage: { 
      type: Number, 
      default: 0 
    },
    rankScore: { 
      type: Number, 
      default: 0 
    },
    lastRankedAt: { 
      type: Date 
    },
    tags: {
      isTrending: { type: Boolean, default: false },
      isTopRated: { type: Boolean, default: false },
      isBestSeller: { type: Boolean, default: false },
      isNewArrival: { type: Boolean, default: false }
    },
    // --- Mood Based Shopping Fields ---
    moods: [{ type: String, lowercase: true }],
    moodAssignedBy: { 
      type: String, 
      enum: ["admin", "auto", "both", "none"], 
      default: "none" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
