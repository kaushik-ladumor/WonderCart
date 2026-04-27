const mongoose = require("mongoose");

const CouponUsageSchema = new mongoose.Schema({
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    discountApplied: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['locked', 'used', 'released'],
        default: 'locked'
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for checking usage limits per user efficiently
CouponUsageSchema.index({ user: 1, coupon: 1 });
CouponUsageSchema.index({ order: 1 });

module.exports = mongoose.model("CouponUsage", CouponUsageSchema);
