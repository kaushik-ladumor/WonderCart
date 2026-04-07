const User = require("../Models/User.Model");
const WalletTransaction = require("../Models/WalletTransaction.Model");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order to top up the wallet balance
 */
const topUpWallet = async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount < 100) {
    return res.status(400).json({ success: false, message: "Minimum top-up amount is ₹100" });
  }

  try {
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `wallet_topup_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Verify wallet payment and update balance
 */
const verifyWalletTopUp = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
  const userId = req.user.userId;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    if (global.io) {
      global.io.to(`buyer-${userId}`).emit("wallet-update", {
        balance: user.walletBalance,
        message: `₹${amount} added successfully to your wallet.`
      });
    }

    await WalletTransaction.create({
      user: userId,
      amount,
      type: "credit",
      source: "razorpay",
      description: "Wallet recharge",
      refId: razorpay_payment_id,
    });

    res.status(200).json({ success: true, balance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get wallet total balance and last 20 transactions
 */
const getWalletStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("walletBalance");
    const transactions = await WalletTransaction.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ 
      success: true, 
      balance: user.walletBalance, 
      transactions 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  topUpWallet,
  verifyWalletTopUp,
  getWalletStatus,
};
