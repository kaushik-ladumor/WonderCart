const mongoose = require("mongoose");

const masterOrderSchema = new mongoose.Schema({
  orderId: { // Human readable, e.g., ORD-1001
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  walletAmount: {
    type: Number,
    default: 0,
  },
  onlineAmount: {
    type: Number,
    default: 0,
  },
  codFee: {
    type: Number,
    default: 0,
  },
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    enum: ["Razorpay", "Wallet", "Partial", "COD"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "COD_PENDING"],
    default: "pending",
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  // Sub-orders IDs
  subOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubOrder"
  }],
}, { timestamps: true });

module.exports = mongoose.model("MasterOrder", masterOrderSchema);
