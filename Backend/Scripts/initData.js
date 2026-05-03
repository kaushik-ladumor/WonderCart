const mongoose = require("mongoose");
const Mood = require("../Models/Mood.Model");
const Coupon = require("../Models/Coupon.Model");
require("dotenv").config();

const moods = [
  { name: "Happy", label: "Happy", emoji: "😊", isActive: true },
  { name: "Productive", label: "Productive", emoji: "🚀", isActive: true },
  { name: "Relaxed", label: "Relaxed", emoji: "🧘", isActive: true },
  { name: "Energetic", label: "Energetic", emoji: "⚡", isActive: true },
  { name: "Romantic", label: "Romantic", emoji: "❤️", isActive: true },
  { name: "Thoughtful", label: "Thoughtful", emoji: "🤔", isActive: true },
  { name: "Creative", label: "Creative", emoji: "🎨", isActive: true },
  { name: "Professional", label: "Professional", emoji: "💼", isActive: true },
  { name: "Adventurous", label: "Adventurous", emoji: "⛺", isActive: true },
  { name: "Elegant", label: "Elegant", emoji: "💎", isActive: true },
  { name: "Cozy", label: "Cozy", emoji: "☕", isActive: true },
  { name: "Playful", label: "Playful", emoji: "🧸", isActive: true },
  { name: "Minimalist", label: "Minimalist", emoji: "⚪", isActive: true },
  { name: "Bold", label: "Bold", emoji: "🦁", isActive: true },
  { name: "Focused", label: "Focused", emoji: "🎯", isActive: true },
];

const welcomeCoupon = {
  code: "WELCOME50",
  name: "Welcome Coupon",
  description: "Get ₹50 off on your first order!",
  couponType: "welcome",
  discountAmount: 50,
  minOrderValue: 299,
  usageLimitPerUser: 1,
  targetType: "all",
  status: "active",
  neverExpires: true
};

const init = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/WonderCart";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // 1. Init Moods
    for (const mood of moods) {
      await Mood.findOneAndUpdate({ name: mood.name }, mood, { upsert: true, new: true });
    }
    console.log("Moods initialized");

    // 2. Init Welcome Coupon
    await Coupon.findOneAndUpdate({ code: welcomeCoupon.code }, welcomeCoupon, { upsert: true, new: true });
    console.log("Welcome coupon initialized");

    process.exit(0);
  } catch (error) {
    console.error("Initialization error:", error);
    process.exit(1);
  }
};

init();
