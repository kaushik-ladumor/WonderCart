const Review = require("../Models/Review.Model");
const Product = require("../Models/Product.Model");
const SubOrder = require("../Models/SubOrder.Model");
const Notification = require("../Models/Notification.Model");
const mongoose = require("mongoose");
const { sendNotification, notifyAdmins } = require("../Utils/notificationHelper");

const updateProductStats = async (productId) => {
  try {
    const id = new mongoose.Types.ObjectId(productId);
    const reviews = await Review.find({ product: id, status: "approved" });
    
    const reviewCount = reviews.length;
    let ratingAverage = 0;
    
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
      ratingAverage = totalRating / reviewCount;
    }

    const roundedRating = Math.round(ratingAverage * 10) / 10;

    await Product.findByIdAndUpdate(id, {
      reviewCount: reviewCount,
      ratingAverage: roundedRating,
    });

    // Also update TopSeller snapshot if it exists for this product
    const TopSeller = require("../Models/TopSeller.Model");
    await TopSeller.updateMany({ productId: id }, {
      reviewCount: reviewCount,
      rating: roundedRating
    });

    console.log(`[REVIEWS] Updated stats for product ${productId}: count=${reviewCount}, avg=${roundedRating}`);
  } catch (error) {
    console.error("Failed to update product stats:", error);
  }
};

const checkReviewEligibility = async (userId, productId, orderItemId) => {
  // 1. Validate ObjectIds to prevent CastError (Source of many 500 errors)
  if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(orderItemId)) {
    return { eligible: false, message: "Invalid product or order item ID" };
  }

  // 2. Seller cannot review their own products
  const product = await Product.findById(productId);
  if (!product) return { eligible: false, message: "Product not found" };
  if (String(product.owner) === String(userId)) {
    return { eligible: false, message: "Sellers cannot review their own products" };
  }

  // 3. Same user cannot leave 2 reviews for the same specific order item
  const existingReview = await Review.findOne({ user: userId, orderItem: orderItemId });
  if (existingReview) {
    return { eligible: false, message: "You have already reviewed this item" };
  }

  // 4. Find the specific order item and verify the BUYER (not just "not seller")
  const subOrder = await SubOrder.findOne({
    "items._id": orderItemId
  }).populate("masterOrder");

  if (!subOrder || !subOrder.masterOrder) {
    return { eligible: false, message: "Order item not found" };
  }
  
  // Verify ownership: The user requesting the review must be the one who placed the master order
  if (String(subOrder.masterOrder.user) !== String(userId)) {
    return { eligible: false, message: "You are not authorized to review this item" };
  }

  // 5. Order status must be DELIVERED
  if (subOrder.status !== "delivered") {
    return { eligible: false, message: "Item has not been delivered yet" };
  }

  return { eligible: true, product }; // Return product to avoid re-fetching
};

const checkEligibility = async (req, res) => {
  try {
    const { productId, orderItemId } = req.query;
    const userId = req.user.userId;

    const result = await checkReviewEligibility(userId, productId, orderItemId);
    // Remove product from response to keep it clean
    const { product, ...cleanResult } = result;
    return res.status(200).json({ success: true, ...cleanResult });
  } catch (err) {
    console.error("CHECK ELIGIBILITY ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { productId, rating, comment, images, orderItemId } = req.body;
    const userId = req.user.userId;

    if (!productId || !orderItemId || rating === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields: productId, orderItemId, or rating" });
    }

    const { eligible, message, product } = await checkReviewEligibility(userId, productId, orderItemId);
    if (!eligible) {
      return res.status(403).json({ success: false, message });
    }

    const review = new Review({
      product: productId,
      user: userId,
      orderItem: orderItemId,
      rating: Number(rating),
      comment: comment || "",
      images: images || [],
      status: "approved"
    });

    await review.save();

    // Update Product's review array
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    // Notify Seller
    if (product && product.owner) {
      await sendNotification({
        userId: product.owner,
        role: "seller",
        type: "REVIEW",
        message: `Your product "${product.name}" received a ${rating}-star review.`,
      });
    }

    // 📩 Notification for Admin
    notifyAdmins({
      type: "NEW_REVIEW",
      message: `Product "${product.name}" received a ${rating}-star review.`,
      orderId: orderItemId,
    });

    await updateProductStats(productId);

    // --- Gamification: Review Points ---
    try {
      const { addPoints } = require("../Services/GamificationService");
      if (product) {
        await addPoints(userId, 20, `Review for ${product.name}`);
      }
    } catch (gamiErr) {
      console.error("Gamification Error (Non-blocking):", gamiErr);
    }
    // ------------------------------------

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted.",
      data: review,
    });
  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    return res.status(500).json({ success: false, message: err.message || "Something went wrong. Try again." });
  }
};

const getReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviews = await Review.find({ product: id, status: "approved" })
      .populate("user", "username profile isVerified")
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    let ratingAverage = 0;
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
      ratingAverage = Math.round((totalRating / reviewCount) * 10) / 10;
    }

    // Sync DB stats if they are out of sync
    if (product.reviewCount !== reviewCount || product.ratingAverage !== ratingAverage) {
      await Product.findByIdAndUpdate(id, { reviewCount, ratingAverage });
    }

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        reviewCount,
        ratingAverage,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Admin or Reviewer can delete
    if (String(review.user) !== String(userId) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const productId = review.product;
    await Product.findByIdAndUpdate(productId, { $pull: { reviews: reviewId } });
    await review.deleteOne();
    await updateProductStats(productId);

    return res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const voteHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    // Simple 1-vote increment for now (user's request asks for helpful_count increment)
    await Review.findByIdAndUpdate(reviewId, { $inc: { helpful_count: 1 } });
    res.status(200).json({ success: true, message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const review = await Review.findByIdAndUpdate(reviewId, { $inc: { reported_count: 1 } }, { new: true });
    
    if (review.reported_count > 5) {
      review.status = "pending"; // Flag for admin
      await review.save();
      await updateProductStats(review.product);
    }

    res.status(200).json({ success: true, message: "Review reported" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviews = await Review.find({ user: userId })
      .populate("product", "name images variants")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (String(review.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    review.rating = rating !== undefined ? Number(rating) : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    review.images = images !== undefined ? images : review.images;

    await review.save();
    await updateProductStats(review.product);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addReview,
  getReview,
  deleteReview,
  checkEligibility,
  voteHelpful,
  reportReview,
  getMyReviews,
  updateReview,
};
