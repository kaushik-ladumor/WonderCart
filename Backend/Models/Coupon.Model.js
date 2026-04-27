const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    
    // TYPE 1: percentage, TYPE 2: flat, TYPE 3: free_shipping
    // TYPE 4: welcome, TYPE 5: loyalty, TYPE 6: referral
    couponType: {
        type: String,
        enum: ['percentage', 'flat', 'free_shipping', 'welcome', 'loyalty', 'referral'],
        required: true
    },

    discountAmount: {
        type: Number,
        required: true,
        min: 0
    },

    maxDiscount: {
        type: Number,
        min: 0
    },

    minOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },

    // Total number of times this coupon can be used across all users
    usageLimitTotal: {
        type: Number,
        default: null // null means unlimited
    },

    // How many times one user can use this coupon
    usageLimitPerUser: {
        type: Number,
        default: 1
    },

    // Number of users who have used this coupon
    usedCount: {
        type: Number,
        default: 0
    },

    // Schedule and Validity
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    neverExpires: {
        type: Boolean,
        default: false
    },

    // Audience Targeting
    targetType: {
        type: String,
        enum: ['all', 'new_users', 'specific_users', 'local_users'],
        default: 'all'
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    targetCity: String,
    targetRegion: String,

    // Inventory Targeting
    targetCategory: String, // Optional: Applies only to specific category
    targetProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],

    // Payment Restriction
    allowedPaymentMethods: [{
        type: String,
        enum: ['Razorpay', 'COD', 'Wallet']
    }],

    status: {
        type: String,
        enum: ['active', 'inactive', 'paused'],
        default: 'active'
    },

    // For Referral Type
    referrerRewardAmount: {
        type: Number,
        default: 0
    },
    referralCodeOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

module.exports = mongoose.model("Coupon", CouponSchema);

