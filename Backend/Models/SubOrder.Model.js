const mongoose = require("mongoose");

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
    quantity: Number,
    price: Number,
    color: String,
    size: String,
  }],
  subTotal: Number,
  shippingCost: Number,
  platformCommission: Number,
  sellerPayout: Number, // subTotal - platformCommission
  status: {
    type: String,
    enum: [
      "PLACED",
      "CONFIRMED", // Payment verified
      "PROCESSING", // Seller packing
      "READY_TO_SHIP", // Seller marked ready
      "SHIPPED", // Courier picked up
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "COD_COLLECTED", // For COD
      "PAYOUT_RELEASED" // After delivery/confirmation
    ],
    default: "PLACED",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "COD_PENDING"],
    default: "pending",
  },
  trackingId: String,
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
  payoutReleasedAt: Date,
  
  // Fulfillment SLA
  handlingTimeDays: Number, // Copied from seller profile
  mustShipBy: Date,
  isSlaBreach: { type: Boolean, default: false },
  
  // Delivery Zone (for EDD calculation)
  zone: String, // Local, Zone A, Zone B, Zone C
}, { timestamps: true });

module.exports = mongoose.model("SubOrder", subOrderSchema);
