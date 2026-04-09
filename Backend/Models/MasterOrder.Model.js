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
    enum: ["pending", "paid", "failed", "COD_PENDING", "partially_refunded", "refunded"],
    default: "pending",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "partially_shipped",
      "shipped",
      "delivered",
      "cancelled",
      "partially_fulfilled",
      "return_in_progress"
    ],
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

// Helper to compute Master Status from sub-orders (following the requested logic)
masterOrderSchema.methods.computeStatus = async function() {
  const SubOrder = mongoose.model("SubOrder");
  const subs = await SubOrder.find({ _id: { $in: this.subOrders } });
  
  if (!subs || subs.length === 0) return "pending";

  const statuses = subs.map(s => s.status);

  if (statuses.every(s => s === "pending")) return "pending";
  if (statuses.every(s => s === "confirmed")) return "confirmed";
  if (statuses.every(s => s === "cancelled")) return "cancelled";
  if (statuses.every(s => s === "delivered")) return "delivered";

  if (statuses.some(s => s === "cancelled")) {
    const others = statuses.filter(s => s !== "cancelled");
    if (others.every(o => o === "delivered")) return "partially_fulfilled";
  }

  if (statuses.some(s => s === "returned")) return "return_in_progress";

  const anyShipped = statuses.some(s => s === "shipped");
  const allDeliveredOrShippedOrCancelled = statuses.every(s => ["shipped", "delivered", "cancelled"].includes(s));
  if (anyShipped) {
    return allDeliveredOrShippedOrCancelled ? "shipped" : "partially_shipped";
  }

  const anyProcessing = statuses.some(s => ["processing", "packed"].includes(s));
  if (anyProcessing) return "processing";

  return "pending"; // Default
};

module.exports = mongoose.model("MasterOrder", masterOrderSchema);
