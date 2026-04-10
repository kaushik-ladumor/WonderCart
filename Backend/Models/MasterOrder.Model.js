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
  // Sub-orders IDs
  subOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubOrder"
  }],
}, { timestamps: true });

masterOrderSchema.methods.computeStatus = async function() {
  const SubOrder = mongoose.model("SubOrder");
  const subs = await SubOrder.find({ _id: { $in: this.subOrders } });
  
  if (!subs || subs.length === 0) return "placed";

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

module.exports = mongoose.model("MasterOrder", masterOrderSchema);
