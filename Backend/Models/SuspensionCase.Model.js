const mongoose = require("mongoose");

const suspensionCaseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED_REINSTATED", "RESOLVED_PERMANENT_BAN"],
      default: "ACTIVE",
    },
    reasonCode: {
      type: String,
      required: true,
    },
    description: String,
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaintIds: [String],
    appealDeadline: {
      type: Date,
      required: true,
    },
    appealContent: {
      explanation: String,
      evidenceLinks: [String],
      submittedAt: Date,
    },
    frozenAt: {
      type: Date,
      default: Date.now,
    },
    frozenBalance: {
      type: Number,
      required: true,
    },
    deductionLedger: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        amount: Number,
        reason: String,
        processedAt: { type: Date, default: Date.now },
        refundId: String,
      },
    ],
    payoutReleasedAt: Date,
    payoutId: String,
    notes: [
      {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuspensionCase", suspensionCaseSchema);
