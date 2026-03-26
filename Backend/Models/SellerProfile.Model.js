const mongoose = require("mongoose");

const categoryRequestSchema = new mongoose.Schema({
  category: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminNote: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
}, { timestamps: true });

const adminActionLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  adminName: String,
  action: { type: String, enum: ["approve", "reject", "request_info", "suspend", "category_approve", "category_reject"] },
  reason: String,
  timestamp: { type: Date, default: Date.now },
});

const addressBlockSchema = new mongoose.Schema({
  pinCode: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  country: { type: String, default: "India" },
}, { _id: false });

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // ── Profile Status ──
  profileStatus: {
    type: String,
    enum: ["email_pending", "email_verified", "submitted", "active", "rejected", "suspended"],
    default: "email_pending",
  },

  rejectionReason: String,
  adminMessage: String,

  // ── Step 1: Email Verification ──
  emailVerified: { type: Boolean, default: false },

  // ── Step 2: Business Details ──
  shopName: { type: String, trim: true },
  businessType: {
    type: String,
    enum: ["Individual / Sole Proprietor", "Partnership Firm", "Private Limited", "LLP", "Trust/NGO", ""],
    default: "",
  },
  sellerCategories: {
    type: [String],
    default: [],
    validate: [arr => arr.length <= 5, "Maximum 5 categories allowed"],
  },
  gstNumber: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  businessAddress: addressBlockSchema,
  warehouseAddress: addressBlockSchema,
  warehouseSameAsBusiness: { type: Boolean, default: false },
  supportEmail: { type: String, trim: true },
  supportPhone: { type: String, trim: true },

  // Document uploads (Cloudinary URLs)
  panCardDocument: String,
  identityDocument: String, // Aadhaar or Business Registration
  shopLogo: String,
  gstBill: String,

  // ── Step 3: Bank Account ──
  bankAccountHolder: { type: String, trim: true },
  bankAccountNumber: String,
  bankIfscCode: { type: String, trim: true },
  bankName: String,
  bankBranch: String,
  bankAccountType: {
    type: String,
    enum: ["Savings", "Current", ""],
    default: "",
  },

  // ── Step Completion Tracking ──
  step2Completed: { type: Boolean, default: false },
  step3Completed: { type: Boolean, default: false },

  // ── Category Requests ──
  categoryRequests: [categoryRequestSchema],

  // ── Admin Action Logs ──
  actionLogs: [adminActionLogSchema],

  // ── Logistics & Commission ──
  platformCommissionRate: { type: Number, default: 10 }, // Percentage
  handlingTimeDays: { type: Number, default: 2 }, // Days to pack/ship

  approvedAt: Date,
  
  // Rating Stats
  average_rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model("SellerProfile", sellerProfileSchema);
