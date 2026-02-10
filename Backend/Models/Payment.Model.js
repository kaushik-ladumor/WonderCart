const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Razorpay"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
        transactionId: {
            type: String, // Razorpay Payment ID
        },
        razorpayOrderId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
