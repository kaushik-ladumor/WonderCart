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

    dealType: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping'],
        required: true
    },

    discount: {
        type: Number,
        required: true,
        min: 0
    },

    maxDiscount: {
        type: Number,
        min: 0
    },

    targetType: {
        type: String,
        enum: ['all', 'new_users', 'loyal_users', 'specific_users'],
        default: 'all'
    },
    targetRole: {
        type: String,
        enum: ['user', 'seller', 'admin'],
        default: 'user'
    },
    targetCategory: {
        type: String,
        default: null
    },

    minCompletedOrders: {
        type: Number,
        default: 0,
        min: 0
    },

    minOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },

    isFirstOrderOnly: {
        type: Boolean,
        default: false
    },

    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    perUserLimit: {
        type: Number,
        default: 1,
        min: 0
    },

    startDate: Date,

    expirationDate: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }

}, { timestamps: true });

module.exports = mongoose.model("Coupon", CouponSchema);
