const User = require("../Models/User.Model");
const WalletTransaction = require("../Models/WalletTransaction.Model");
const Notification = require("../Models/Notification.Model");
const { sendNotification } = require("../Utils/notificationHelper");

class ReferralService {
    /**
     * Process referral reward for the referrer when the referred user completes their first order.
     * @param {string} userId - The ID of the user who just placed an order.
     * @param {string} orderId - The ID of the master order.
     */
    static async processFirstOrderReward(userId, orderId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.referredBy) return;

            // Check if this is truly the user's first successful order
            const MasterOrder = require("../Models/MasterOrder.Model");
            const orderCount = await MasterOrder.countDocuments({ 
                user: userId, 
                paymentStatus: "paid",
                _id: { $ne: orderId } // Exclude current order if it's already marked paid
            });

            if (orderCount === 0) {
                const referrerId = user.referredBy;
                const rewardAmount = 100; // ₹100 reward

                const referrer = await User.findById(referrerId);
                if (referrer) {
                    // Credit referrer's wallet
                    referrer.walletBalance = (referrer.walletBalance || 0) + rewardAmount;
                    await referrer.save();

                    // Create Wallet Transaction
                    await WalletTransaction.create({
                        user: referrerId,
                        amount: rewardAmount,
                        type: "credit",
                        source: "referral_reward",
                        description: `Reward for referring ${user.username}`,
                        metadata: { referredUserId: userId, orderId }
                    });

                    // Send Notification to Referrer
                    sendNotification({
                        userId: referrerId,
                        role: 'buyer',
                        type: 'WALLET_UPDATE',
                        message: `Congratulations! You earned ₹${rewardAmount} because your friend ${user.username} made their first purchase.`,
                        data: { amount: rewardAmount }
                    });

                    console.log(`🎁 Referral reward of ₹${rewardAmount} given to ${referrer.username} for ${user.username}'s first order.`);
                }
            }
        } catch (error) {
            console.error("❌ Referral Reward Error:", error);
        }
    }
}

module.exports = ReferralService;
