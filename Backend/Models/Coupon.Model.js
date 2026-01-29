const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
});

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;