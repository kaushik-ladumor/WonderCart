const mongoose = require("mongoose");

const topSellerSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
    },
    previousRank: {
      type: Number,
      default: null, // Used for rising fast feature
    },
    category: {
      type: String,
      required: true,
    },
    shopName: {
      type: String,
      default: "WonderCart Seller",
    },
  },
  { timestamps: true }
);

// Indexes for fast querying
topSellerSchema.index({ rank: 1 });
topSellerSchema.index({ category: 1, rank: 1 });
topSellerSchema.index({ rank: 1, previousRank: 1 }); 

const TopSeller = mongoose.models.TopSeller || mongoose.model("TopSeller", topSellerSchema);
module.exports = TopSeller;
