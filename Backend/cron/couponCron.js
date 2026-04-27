const cron = require('node-cron');
const Coupon = require('../Models/Coupon.Model');
const User = require('../Models/User.Model');
const MasterOrder = require('../Models/MasterOrder.Model');
const { sendNotification } = require('../Utils/notificationHelper');

const initCouponCron = () => {
    // 1. Expiry Reminders (Runs every day at 9:00 AM)
    cron.schedule('0 9 * * *', async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Calculate dates for 7 days and 1 day from now
            const sevenDaysLater = new Date(today);
            sevenDaysLater.setDate(today.getDate() + 7);
            
            const oneDayLater = new Date(today);
            oneDayLater.setDate(today.getDate() + 1);

            // Find coupons expiring on these dates
            const expiringSoon = await Coupon.find({
                status: 'active',
                neverExpires: false,
                endDate: {
                    $gte: oneDayLater,
                    $lte: sevenDaysLater
                }
            });

            for (const coupon of expiringSoon) {
                const daysLeft = Math.ceil((coupon.endDate - new Date()) / (1000 * 60 * 60 * 24));
                
                // Only notify on exact 7 days and 1 day marks
                if (daysLeft === 7 || daysLeft === 1) {
                    // Find users who have this coupon in their wallet (allowedUsers)
                    // We only notify if it's a targeted coupon or they've used it before
                    for (const userId of coupon.allowedUsers) {
                        sendNotification({
                            userId,
                            role: 'buyer',
                            type: 'COUPON_EXPIRY',
                            message: `Hurry! Your coupon "${coupon.code}" expires in ${daysLeft} day(s). Use it before it's gone!`,
                            data: { couponCode: coupon.code, daysLeft }
                        });
                    }
                }
            }
            console.log(`[COUPON CRON] Expiry reminders processed for ${expiringSoon.length} coupons.`);
        } catch (error) {
            console.error('[COUPON CRON] Expiry Reminder Error:', error.message);
        }
    });

    // 2. Loyalty Coupon Assignment (Runs every day at 10:00 AM)
    cron.schedule('0 10 * * *', async () => {
        try {
            // Find users who have completed 5 or more orders
            // This is a simplified version. A real one might check specific thresholds.
            const loyaltyThreshold = 5;
            
            const users = await User.find({ role: 'user' });
            
            // Find the generic loyalty coupon template
            const loyaltyCoupon = await Coupon.findOne({ couponType: 'loyalty', status: 'active' });
            if (!loyaltyCoupon) {
                console.log("[COUPON CRON] No active loyalty coupon template found.");
                return;
            }

            for (const user of users) {
                const orderCount = await MasterOrder.countDocuments({ user: user._id, status: 'delivered' });
                
                if (orderCount >= loyaltyThreshold) {
                    // Check if user already has this coupon
                    if (!loyaltyCoupon.allowedUsers.includes(user._id)) {
                        loyaltyCoupon.allowedUsers.push(user._id);
                        await loyaltyCoupon.save();

                        sendNotification({
                            userId: user._id,
                            role: 'buyer',
                            type: 'COUPON_RECEIVED',
                            message: `Congratulations! You've unlocked a special Loyalty Coupon "${loyaltyCoupon.code}" for being a frequent shopper.`,
                            data: { couponCode: loyaltyCoupon.code }
                        });
                        console.log(`[COUPON CRON] Loyalty coupon assigned to user: ${user.username}`);
                    }
                }
            }
        } catch (error) {
            console.error('[COUPON CRON] Loyalty Trigger Error:', error.message);
        }
    });

    console.log('[COUPON CRON] initialized successfully.');
};

module.exports = initCouponCron;
