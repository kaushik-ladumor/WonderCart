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
    enum: ["pending", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled", "returned", "refund_processed"],
    default: "pending",
  },
  subTotal: { type: Number, required: true },
  shippingAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  vendorPayoutAmount: { type: Number, default: 0 },
  statusHistory: [statusHistorySchema],
  trackingNumber: String,
  trackingUrl: String,
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
      enum: ["pending", "confirmed", "processing", "partially_shipped", "shipped", "delivered", "cancelled", "partially_fulfilled", "return_in_progress"],
      default: "pending",
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
  },
  { timestamps: true }
);

// Helper to compute Master Status from sub-orders
orderSchema.methods.computeStatus = function() {
  const subs = this.subOrders;
  if (!subs || subs.length === 0) return "pending";

  const allPending = subs.every(s => s.status === "pending");
  if (allPending) return "pending";

  const allConfirmed = subs.every(s => s.status === "confirmed");
  if (allConfirmed) return "confirmed";

  const allCancelled = subs.every(s => s.status === "cancelled");
  if (allCancelled) return "cancelled";

  const allDelivered = subs.every(s => s.status === "delivered");
  if (allDelivered) return "delivered";

  const someCancelled = subs.some(s => s.status === "cancelled");
  const othersDelivered = subs.filter(s => s.status !== "cancelled").every(s => s.status === "delivered");
  if (someCancelled && othersDelivered) return "partially_fulfilled";

  const someReturn = subs.some(s => s.status === "returned");
  if (someReturn) return "return_in_progress";

  const anyShipped = subs.some(s => s.status === "shipped");
  const allShipped = subs.every(s => s.status === "shipped" || s.status === "delivered" || s.status === "cancelled");
  if (anyShipped) return allShipped ? "shipped" : "partially_shipped";

  const anyProcessing = subs.some(s => s.status === "processing" || s.status === "packed");
  if (anyProcessing) return "processing";

  return "pending"; // Default fallback
};

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ masterOrderId: 1 });
orderSchema.index({ "subOrders.vendor": 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

module.exports = Order;