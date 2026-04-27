const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  from: String,
  to: String,
  timestamp: { type: Date, default: Date.now },
  changed_by: { type: String, default: "system" },
  reason: String
}, { _id: false });

const subOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  color: { type: String },
  size: { type: String },
  category: { type: String },
}, { _id: false });

const subOrderSchema = new mongoose.Schema({
  subOrderId: { type: String, required: true }, // e.g., ORD-12345-A
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [subOrderItemSchema],
  status: {
    type: String,
    enum: [
      "placed", 
      "confirmed", 
      "processing", 
      "shipped", 
      "out_for_delivery", 
      "delivered", 
      "cancelled", 
      "return_requested", 
      "returned", 
      "refunded"
    ],
    default: "placed",
  },
  subTotal: { type: Number, required: true },
  shippingAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  vendorPayoutAmount: { type: Number, default: 0 },
  statusHistory: [statusHistorySchema],
  trackingNumber: String,
  trackingUrl: String,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  returnedAt: Date,
  payoutStatus: { type: String, enum: ["pending", "released"], default: "pending" },
  payoutReleasedAt: Date,
});

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipcode: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    masterOrderId: { type: String, unique: true }, // e.g., ORD-12345
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subOrders: [subOrderSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "partially_refunded", "refunded"],
      default: "pending",
    },
    // Master status is computed, but we store it for easy querying.
    // It must be recalculated whenever a sub-order changes.
    status: {
      type: String,
      enum: [
        "placed", 
        "confirmed", 
        "processing", 
        "shipped", 
        "out_for_delivery", 
        "delivered", 
        "cancelled", 
        "return_requested", 
        "returned", 
        "refunded"
      ],
      default: "placed",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paymentGatewayRef: String,
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    
    // --- Gamification System Fields ---
    pointsAwarded: {
      type: Boolean,
      default: false,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    // ----------------------------------
  },
  { timestamps: true }
);

orderSchema.methods.computeStatus = function() {
  const subs = this.subOrders;
  if (!subs || subs.length === 0) return "placed";

  // Prioritize "most progressed" status but handle cancellations correctly
  const statusesByWeight = {
    "cancelled": -1,
    "placed": 1,
    "confirmed": 2,
    "processing": 3,
    "shipped": 4,
    "out_for_delivery": 5,
    "delivered": 6,
    "return_requested": 7,
    "returned": 8,
    "refunded": 9
  };

  const activeSubs = subs.filter(s => s.status !== "cancelled");
  
  if (activeSubs.length === 0) return "cancelled";

  // Find the minimum progress among non-cancelled orders to determine master state
  // e.g., if one item is shipped and one is confirmed, master is "confirmed" or "processing"
  // For simplicity in a multi-vendor app, we can use the "majority" or "minimum" logic.
  // Using 'minimum' logic here to ensure user knows full order status.
  let minWeight = Infinity;
  let masterStatus = "placed";

  activeSubs.forEach(s => {
    const weight = statusesByWeight[s.status] || 0;
    if (weight < minWeight) {
      minWeight = weight;
      masterStatus = s.status;
    }
  });

  return masterStatus;
};

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ masterOrderId: 1 });
orderSchema.index({ "subOrders.vendor": 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;