const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    googleId: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    profile: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: String,
    expireCode: Date,
    resendCode: String,
    refreshToken: {
      type: String,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    // --- Suspension System Fields ---
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    activeSuspensionCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuspensionCase",
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    warningHistory: [
      {
        caseId: String,
        reason: String,
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        issuedAt: { type: Date, default: Date.now },
      },
    ],
    // -------------------------------

    addresses: [addressSchema],
    
    // --- Gamification System Fields ---
    rewardPoints: {
      type: Number,
      default: 0,
    },
    pointsHistory: [
      {
        points: Number,
        earnedOn: { type: Date, default: Date.now },
        expiresOn: Date,
        reason: String,
        status: {
          type: String,
          enum: ["active", "used", "expired"],
          default: "active",
        },
      },
    ],
    // ----------------------------------
    // --- Mood Based Shopping Fields ---
    lastMood: { type: String },
    moodHistory: [
      {
        mood: String,
        selectedAt: { type: Date, default: Date.now },
        productsSeen: { type: Number, default: 0 }
      }
    ],
    // ----------------------------------
    // --- Referral System Fields ---
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    // ----------------------------------
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
