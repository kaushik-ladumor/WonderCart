const mongoose = require("mongoose");

const usedReferralSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    referredAt: {
        type: Date,
        default: Date.now
    },
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

module.exports = mongoose.model("UsedReferral", usedReferralSchema);
