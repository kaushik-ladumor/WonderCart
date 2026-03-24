const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  source: {
    type: String,
    enum: ["razorpay", "order_payment", "refund", "admin_bonus", "seller_payout"],
    required: true,
  },
  description: String,
  refId: String, // MasterOrder ID or Razorpay Payment ID
}, { timestamps: true });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
