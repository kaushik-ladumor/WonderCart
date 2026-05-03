const SellerReview = require("../Models/SellerReview.Model");
const SellerProfile = require("../Models/SellerProfile.Model");
const SubOrder = require("../Models/SubOrder.Model");
const User = require("../Models/User.Model");
const mongoose = require("mongoose");
const { sendNotification, notifyAdmins } = require("../Utils/notificationHelper");

/**
 * Update Seller average_rating and total_reviews
 */
const updateSellerStats = async (sellerId) => {
  try {
    const stats = await SellerReview.aggregate([
      { $match: { seller: sellerId, status: "published" } },
      {
        $group: {
          _id: "$seller",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await SellerProfile.findOneAndUpdate(
        { user: sellerId },
        {
          average_rating: Math.round(stats[0].avgRating * 10) / 10,
          total_reviews: stats[0].totalReviews,
        }
      );
    }
  } catch (error) {
    console.error("Error updating seller stats:", error);
  }
};

/**
 * Create a new seller review
 */
const createSellerReview = async (req, res) => {
  try {
    const { subOrderId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating (1-5) is required" });
    }

    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Validation rules
    if (subOrder.status !== "delivered") {
      return res.status(400).json({ success: false, message: "Reviews only allowed after delivery" });
    }

    if (subOrder.isSellerReviewed || subOrder.isSellerReviewSkipped) {
      return res.status(400).json({ success: false, message: "Review already submitted or skipped" });
    }

    // Check for spam/duplicates (Mongoose index handles this, but good to check explicitly)
    const existing = await SellerReview.findOne({ user: userId, order: subOrderId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Duplicate review detected" });
    }

    const sellerId = subOrder.seller;

    const review = await SellerReview.create({
      seller: sellerId,
      user: userId,
      order: subOrderId,
      rating,
      comment: comment?.substring(0, 500),
    });

    // Mark order as reviewed
    subOrder.isSellerReviewed = true;
    await subOrder.save();

    // Update seller stats
    await updateSellerStats(sellerId);

    // Notify seller
    const buyer = await User.findById(userId);
    await Notification.create({
      user: sellerId,
      role: "seller",
      type: "seller_review",
      message: `⭐ You received a new ${rating}-star review from ${buyer?.name || "a customer"}`,
      orderId: subOrder.masterOrder,
    });

    if (global.io) {
      global.io.to(`seller-${sellerId}`).emit("notification", {
        type: "seller_review",
        message: `⭐ New ${rating}-star review received`,
      });
    }

    // 📩 Notification for Admin
    notifyAdmins({
      type: "SELLER_REVIEW",
      message: `Seller received a new ${rating}-star review from ${buyer?.name || "a customer"}`,
      orderId: subOrderId,
    });

    res.status(201).json({ success: true, message: "Thanks for your feedback!", review });
  } catch (error) {
    console.error("Create seller review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Skip a seller review
 */
const skipSellerReview = async (req, res) => {
  try {
    const { subOrderId } = req.body;
    const subOrder = await SubOrder.findById(subOrderId);

    if (!subOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    subOrder.isSellerReviewSkipped = true;
    await subOrder.save();

    res.json({ success: true, message: "Review skipped" });
  } catch (error) {
    console.error("Skip seller review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get reviews for a specific seller
 */
const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await SellerReview.find({ seller: sellerId, status: "published" })
      .populate("user", "name profile")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get reviews for the authenticated seller
 */
const getMyReviews = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const reviews = await SellerReview.find({ seller: sellerId, status: "published" })
      .populate("user", "name profile username")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get Top Rated Sellers
 */
const getTopSellers = async (req, res) => {
  try {
    const sellers = await SellerProfile.find({ profileStatus: "active" })
      .sort({ average_rating: -1, total_reviews: -1 })
      .limit(10)
      .select("shopName average_rating total_reviews shopLogo businessAddress");

    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createSellerReview,
  skipSellerReview,
  getSellerReviews,
  getMyReviews,
  getTopSellers,
};
