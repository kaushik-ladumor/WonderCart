const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Supporting 6 Deal Types: Single, Bundle, Category, Flash, BOGO, Coupon
  dealType: {
    type: String,
    enum: ['single', 'bundle', 'category', 'flash', 'bogo', 'coupon'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  
  // product_ids for single/multi, category for category-wide
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  category: { type: String },
  
  // BOGO Fields: Buy N Get M
  buyQuantity: { type: Number, default: 1 },
  getQuantity: { type: Number, default: 1 },
  
  discountType: {
    type: String,
    enum: ['flat', 'percent'],
    default: 'percent'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 1,
    max: 70 // Max 70% as per rule
  },
  minOrderValue: { type: Number, default: 0 },
  
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  
  // Snapshot of stock at creation
  maxUses: {
    type: Number,
    required: true
  },
  currentUses: {
    type: Number,
    default: 0
  },
  
  couponCode: { type: String, sparse: true },
  
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'live', 'paused', 'expired', 'rejected'],
    default: 'pending'
  },
  
  adminNote: { type: String },
  
  // Commission Logic: Flat ₹50 (5000 paise)
  commissionAmountPaise: {
    type: Number,
    default: 5000 
  },
  commissionPaid: {
    type: Boolean,
    default: false
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

dealSchema.index({ status: 1 });
dealSchema.index({ startDateTime: 1 });
dealSchema.index({ endDateTime: 1 });

module.exports = mongoose.model('Deal', dealSchema);
