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

    addresses: [addressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
