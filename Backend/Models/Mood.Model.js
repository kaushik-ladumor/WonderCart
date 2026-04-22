const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ["admin", "auto"],
    default: "admin"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Mood", moodSchema);
