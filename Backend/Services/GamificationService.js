const User = require("../Models/User.Model");
const MasterOrder = require("../Models/MasterOrder.Model");
const { sendNotification } = require("../Utils/notificationHelper");

/**
 * addPoints(userId, points, reason)
 * - Add to pointsHistory with 1 month expiry
 * - Update rewardPoints total
 */
const addPoints = async (userId, points, reason) => {
  try {
    const expiresOn = new Date();
    expiresOn.setMonth(expiresOn.getMonth() + 1);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { rewardPoints: points },
        $push: {
          pointsHistory: {
            points,
            reason,
            earnedOn: new Date(),
            expiresOn,
            status: "active",
          },
        },
      },
      { new: true }
    );

    return user;
  } catch (error) {
    console.error("Error in addPoints:", error);
    throw error;
  }
};

/**
 * expirePoints() — cron job daily midnight
 * - Find all active entries where expiresOn <= now
 * - Mark as "expired"
 * - Deduct from rewardPoints
 * - Send expiry notification
 * - Send warning 7 days before
 */
const expirePoints = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // 1. Handle Expiry
    const usersWithExpiredPoints = await User.find({
      "pointsHistory": {
        $elemMatch: {
          status: "active",
          expiresOn: { $lte: now }
        }
      }
    });

    for (const user of usersWithExpiredPoints) {
      let totalExpired = 0;
      user.pointsHistory.forEach(entry => {
        if (entry.status === "active" && entry.expiresOn <= now) {
          entry.status = "expired";
          totalExpired += entry.points;
        }
      });

      if (totalExpired > 0) {
        user.rewardPoints = Math.max(0, user.rewardPoints - totalExpired);
        await user.save();
        
        await sendNotification({
          userId: user._id,
          role: "user",
          type: "POINTS_EXPIRED",
          message: `Your ${totalExpired} reward points have expired.`,
        });
      }
    }

    // 2. Handle Warning (7 days before)
    const startOfTargetDay = new Date(sevenDaysFromNow);
    startOfTargetDay.setHours(0, 0, 0, 0);
    const endOfTargetDay = new Date(sevenDaysFromNow);
    endOfTargetDay.setHours(23, 59, 59, 999);

    const usersToWarn = await User.find({
      "pointsHistory": {
        $elemMatch: {
          status: "active",
          expiresOn: { $gte: startOfTargetDay, $lte: endOfTargetDay }
        }
      }
    });

    for (const user of usersToWarn) {
        let warningPoints = 0;
        user.pointsHistory.forEach(entry => {
            if (entry.status === "active" && entry.expiresOn >= startOfTargetDay && entry.expiresOn <= endOfTargetDay) {
                warningPoints += entry.points;
            }
        });
        if (warningPoints > 0) {
            await sendNotification({
                userId: user._id,
                role: "user",
                type: "POINTS_EXPIRY_WARNING",
                message: `Warning: ${warningPoints} reward points will expire in 7 days.`,
            });
        }
    }

    console.log(`[EXPIRE POINTS CRON] Processed expiry for ${now.toDateString()}`);
  } catch (error) {
    console.error("Error in expirePoints:", error);
  }
};

/**
 * getActivePoints(userId)
 * - Return only active total
 */
const getActivePoints = async (userId) => {
  const user = await User.findById(userId).select("rewardPoints");
  return user ? user.rewardPoints : 0;
};

/**
 * redeemPoints(userId, pointsToRedeem)
 * - Deduct oldest points first (FIFO)
 * - Mark entries as "used"
 * - Update rewardPoints total
 * - Handles partial entry splitting
 */
const redeemPoints = async (userId, pointsToRedeem) => {
  const user = await User.findById(userId);
  if (!user || user.rewardPoints < pointsToRedeem) {
    throw new Error("Insufficient points for redemption");
  }

  let remainingToRedeem = pointsToRedeem;
  // Sort history by earnedOn to ensure FIFO (oldest first)
  user.pointsHistory.sort((a, b) => a.earnedOn - b.earnedOn);

  for (let i = 0; i < user.pointsHistory.length; i++) {
    const entry = user.pointsHistory[i];
    if (entry.status === "active") {
      if (entry.points <= remainingToRedeem) {
        remainingToRedeem -= entry.points;
        entry.status = "used";
      } else {
        // Partial use: split entry
        const leftoverPoints = entry.points - remainingToRedeem;
        
        // Update current entry to "used" with the amount redeemed
        entry.points = remainingToRedeem;
        entry.status = "used";
        
        // Add the leftover as a NEW active entry
        user.pointsHistory.push({
            points: leftoverPoints,
            earnedOn: entry.earnedOn,
            expiresOn: entry.expiresOn,
            reason: entry.reason + " (Remaining)",
            status: "active"
        });
        
        remainingToRedeem = 0;
      }
    }
    if (remainingToRedeem === 0) break;
  }

  user.rewardPoints = Math.max(0, user.rewardPoints - pointsToRedeem);
  await user.save();
  return user;
};

/**
 * applyRewardCoupon(orderId, userId, couponType)
 * - Validate user has enough active points
 * - Apply discount (max ₹50)
 * - Call redeemPoints()
 * - Update order total
 */
const applyRewardCoupon = async (orderId, userId, couponType) => {
    // 250 pts -> ₹25, 500 pts -> ₹50
    const pointsToRedeem = couponType === '25' ? 250 : (couponType === '50' ? 500 : null);
    const discountAmount = couponType === '25' ? 25 : (couponType === '50' ? 50 : 0);

    if (!pointsToRedeem) throw new Error("Invalid coupon type selected");

    const user = await User.findById(userId);
    if (!user || user.rewardPoints < pointsToRedeem) {
        throw new Error("Insufficient points to apply this coupon");
    }

    const order = await MasterOrder.findById(orderId);
    if (!order) throw new Error("Order not found");

    // Apply redemption logic (FIFO)
    await redeemPoints(userId, pointsToRedeem);

    // Update order financials
    order.couponDiscount += discountAmount;
    order.totalAmount = Math.max(0, order.totalAmount - discountAmount);
    await order.save();

    return order;
};

/**
 * onDeliveryConfirmed(orderId)
 * - Check pointsAwarded === false
 * - Award +100 points
 * - Set pointsAwarded = true
 */
const onDeliveryConfirmed = async (orderId) => {
    const order = await MasterOrder.findById(orderId);
    if (order && !order.pointsAwarded) {
        await addPoints(order.user, 100, `Order ${order.orderId} Delivered`);
        order.pointsAwarded = true;
        order.pointsEarned = 100;
        await order.save();
    }
};

/**
 * onOrderReturned(orderId)
 * - If pointsAwarded === true
 * - Deduct 95 points (keep only 5)
 * - Update pointsEarned = 5
 */
const onOrderReturned = async (orderId) => {
    const order = await MasterOrder.findById(orderId);
    if (order && order.pointsAwarded && order.pointsEarned === 100) {
        const user = await User.findById(order.user);
        if (user) {
            user.rewardPoints = Math.max(0, user.rewardPoints - 95);
            user.pointsHistory.push({
                points: -95,
                reason: `Reversal: Order ${order.orderId} Returned`,
                earnedOn: new Date(),
                expiresOn: new Date(), // Reversals don't need to expire or are already "used"
                status: "used"
            });
            await user.save();
            
            order.pointsEarned = 5;
            await order.save();
        }
    }
};

module.exports = {
  addPoints,
  expirePoints,
  getActivePoints,
  redeemPoints,
  applyRewardCoupon,
  onDeliveryConfirmed,
  onOrderReturned
};
