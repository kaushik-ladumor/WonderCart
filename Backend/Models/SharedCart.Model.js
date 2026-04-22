const mongoose = require("mongoose");

const sharedCartSchema = new mongoose.Schema({
  shareId: {
    type: String,
    unique: true,
    required: true // UUID
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Snapshot of cart at time of sharing
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      productName: String,
      productImage: String,
      price: Number,
      quantity: {
        type: Number,
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }
  ],
  // If owner purchased → true
  isCartPurchased: {
    type: Boolean,
    default: false
  },
  // Track who opened
  openedBy: [
    {
       userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
       },
       openedAt: {
         type: Date,
         default: Date.now
       }
    }
  ],
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("SharedCart", sharedCartSchema);
