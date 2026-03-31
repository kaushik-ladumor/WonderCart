const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealType: {
    type: String,
    enum: ['lightning', 'day_deal', 'coupon'],
    default: 'day_deal'
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 5,
    max: 80
  },
  originalPrice: {
    type: Number,
    required: true
  },
  dealPrice: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  stockLimit: {
    type: Number,
    default: 100
  },
  claimedCount: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'live', 'expired', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  category: {
    type: String
  },
  commissionPercent: {
    type: Number,
    default: 10
  },
  createdBy: {
    type: String,
    enum: ['seller', 'admin'],
    default: 'seller'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

dealSchema.index({ status: 1 });
dealSchema.index({ endTime: 1 });
dealSchema.index({ startTime: 1 });
dealSchema.index({ category: 1 });
dealSchema.index({ sellerId: 1 });

dealSchema.virtual('sellerEarnings').get(function() {
  return this.dealPrice - (this.dealPrice * this.commissionPercent / 100);
});

dealSchema.virtual('platformEarnings').get(function() {
  return this.dealPrice * this.commissionPercent / 100;
});

dealSchema.virtual('claimedPercent').get(function() {
  return (this.claimedCount / this.stockLimit) * 100;
});

module.exports = mongoose.model('Deal', dealSchema);
