const Coupon = require("../Models/Coupon.Model");
const CouponUsage = require("../Models/CouponUsage.Model");
const MasterOrder = require("../Models/MasterOrder.Model");
const User = require("../Models/User.Model");

class CouponService {
    /**
     * Validate a coupon code for a given user and cart
     */
    async validateCoupon(code, userId, items, subTotal, paymentMethod = null) {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            throw new Error("Coupon code not found. Please check and try again.");
        }

        if (coupon.status === 'inactive') {
            throw new Error("This coupon is currently inactive.");
        }

        if (coupon.status === 'paused') {
            throw new Error("This coupon has been paused due to budget limits.");
        }

        // CHECK 2 - Has the coupon expired?
        const now = new Date();
        if (!coupon.neverExpires && coupon.endDate && now > coupon.endDate) {
            throw new Error(`This coupon expired on ${coupon.endDate.toDateString()}.`);
        }

        if (coupon.startDate && now < coupon.startDate) {
            throw new Error("This coupon is not yet active.");
        }

        // CHECK 6 - Total usage limit
        if (coupon.usageLimitTotal !== null && coupon.usedCount >= coupon.usageLimitTotal) {
            throw new Error("This coupon is no longer available.");
        }

        // CHECK 3 - Per user usage limit
        const mongoose = require("mongoose");
        const usageCount = await CouponUsage.countDocuments({
            user: new mongoose.Types.ObjectId(userId),
            coupon: coupon._id,
            status: { $in: ['locked', 'used'] }
        });

        const limit = coupon.usageLimitPerUser || 1;
        if (usageCount >= limit) {
            throw new Error("You have already used this coupon.");
        }

        // CHECK 4 - Audience Targeting (New Users Only / Specific Users)
        if (coupon.targetType === 'new_users') {
            const orderCount = await MasterOrder.countDocuments({ user: userId, status: { $ne: 'cancelled' } });
            if (orderCount > 0) {
                throw new Error("This coupon is valid for new users on their first order only.");
            }
        } else if (coupon.targetType === 'specific_users') {
            if (!coupon.allowedUsers.includes(userId)) {
                throw new Error("This coupon is not valid for your account.");
            }
        }

        // CHECK 5 - Minimum order value
        if (subTotal < coupon.minOrderValue) {
            throw new Error(`Add ₹${coupon.minOrderValue - subTotal} more to your cart to use this coupon.`);
        }

        // Inventory Targeting
        let applicableItems = items;
        if (coupon.targetCategory) {
            applicableItems = items.filter(item => item.category === coupon.targetCategory);
            if (applicableItems.length === 0) {
                throw new Error(`This coupon applies only to items in the ${coupon.targetCategory} category.`);
            }
        }

        if (coupon.targetProducts && coupon.targetProducts.length > 0) {
            applicableItems = applicableItems.filter(item => coupon.targetProducts.includes(item.product.toString()));
            if (applicableItems.length === 0) {
                throw new Error("This coupon is not applicable to any items in your cart.");
            }
        }

        // Payment Restriction
        if (paymentMethod && coupon.allowedPaymentMethods && coupon.allowedPaymentMethods.length > 0) {
            if (!coupon.allowedPaymentMethods.includes(paymentMethod)) {
                throw new Error(`This coupon is only valid for payments via ${coupon.allowedPaymentMethods.join(', ')}.`);
            }
        }

        // Calculate Discount
        let discount = 0;
        const applicableSubTotal = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (coupon.couponType === 'percentage') {
            discount = Math.round((applicableSubTotal * coupon.discountAmount) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else if (coupon.couponType === 'flat' || coupon.couponType === 'welcome' || coupon.couponType === 'loyalty') {
            discount = Math.min(coupon.discountAmount, applicableSubTotal);
        } else if (coupon.couponType === 'free_shipping') {
            // Free shipping is handled by zeroing out delivery fee in checkout
            discount = 0; // The logic in checkout will use the type to waive shipping
        }

        return {
            coupon,
            discount,
            applicableItems
        };
    }

    /**
     * Lock a coupon for an order (called when order is placed)
     */
    async lockCoupon(couponId, userId, orderId, discountAmount) {
        const usage = await CouponUsage.create({
            coupon: couponId,
            user: userId,
            order: orderId,
            discountApplied: discountAmount,
            status: 'locked'
        });

        await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
        return usage;
    }

    /**
     * Mark coupon as used (called after successful payment)
     */
    async markAsUsed(orderId) {
        await CouponUsage.findOneAndUpdate(
            { order: orderId, status: 'locked' },
            { status: 'used' }
        );
    }

    /**
     * Release a coupon (called on cancellation of COD or failed payment)
     */
    async releaseCoupon(orderId) {
        const usage = await CouponUsage.findOneAndUpdate(
            { order: orderId, status: { $in: ['locked', 'used'] } },
            { status: 'released' }
        );

        if (usage) {
            await Coupon.findByIdAndUpdate(usage.coupon, { $inc: { usedCount: -1 } });
        }
    }

    /**
     * Auto-generate Welcome Coupon for new user
     */
    async generateWelcomeCoupon(userId) {
        // Find if there's an active welcome coupon template
        const template = await Coupon.findOne({ couponType: 'welcome', status: 'active', targetType: 'all' });
        if (template) {
            // In our system, the "welcome" type template itself is usable by any new user.
            // We don't necessarily need to generate a unique code per user unless specifically asked.
            // But the requirements say "Auto-assigned to user when they register".
            // So we can just ensure they see it in their wallet.
        }
    }
}

module.exports = new CouponService();
