const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  from: String,
  to: String,
  timestamp: { type: Date, default: Date.now },
  changed_by: { type: String, default: "system" },
  reason: String
}, { _id: false });

const subOrderSchema = new mongoose.Schema({
  subOrderId: { // ORD-1001-A
    type: String,
    unique: true,
    required: true,
  },
  masterOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasterOrder",
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    image: String,
    quantity: Number,
    price: Number,
    color: String,
    size: String,
    category: String,
  }],
  subTotal: Number,
  shippingCost: Number,
  taxAmount: { type: Number, default: 0 },
  platformCommission: Number,
  sellerPayout: Number, 
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "refund_processed"
    ],
    default: "pending",
  },
  statusHistory: [statusHistorySchema],
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "partially_refunded", "refunded"],
    default: "pending",
  },
  trackingId: String,
  trackingUrl: String,
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  returnedAt: Date,
  payoutStatus: { type: String, enum: ["pending", "released"], default: "pending" },
  payoutReleasedAt: Date,
  isSellerReviewed: { type: Boolean, default: false },
  isSellerReviewSkipped: { type: Boolean, default: false },
  
  handlingTimeDays: Number,
  mustShipBy: Date,
  isSlaBreach: { type: Boolean, default: false },
  zone: String, 
  
  // Razorpay Route Integration
  razorpayTransferId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("SubOrder", subOrderSchema);
