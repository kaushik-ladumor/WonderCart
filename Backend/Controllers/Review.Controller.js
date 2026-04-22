const Review = require("../Models/Review.Model");
const Product = require("../Models/Product.Model");
const SubOrder = require("../Models/SubOrder.Model");
const Notification = require("../Models/Notification.Model");
const mongoose = require("mongoose");

const updateProductStats = async (productId) => {
  const reviews = await Review.find({ product: productId, status: "approved" });

  const reviewCount = reviews.length;
  const ratingAverage =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  await Product.findByIdAndUpdate(productId, {
    reviewCount,
    ratingAverage: Math.round(ratingAverage * 10) / 10,
  });
};

const checkReviewEligibility = async (userId, productId, orderItemId) => {
  // 1. Seller cannot review their own products
  const product = await Product.findById(productId);
  if (!product) return { eligible: false, message: "Product not found" };
  if (String(product.owner) === String(userId)) {
    return { eligible: false, message: "Sellers cannot review their own products" };
  }

  // 2. Same user cannot leave 2 reviews for same product across all orders
  const existingProductReview = await Review.findOne({ user: userId, product: productId });
  if (existingProductReview) {
    return { eligible: false, message: "You have already reviewed this product" };
  }

  // 3. Find the specific order item
  const order = await SubOrder.findOne({
    "items._id": orderItemId,
    seller: { $ne: userId } // Extra check
  });

  if (!order) return { eligible: false, message: "Order not found" };
  
  // 5. Order status must be DELIVERED
  if (order.status !== "DELIVERED") {
    return { eligible: false, message: "Item has not been delivered yet" };
  }

  // (Removed 1-day wait and 30-day expiry as per user request for immediate feedback)
  return { eligible: true };
};

const checkEligibility = async (req, res) => {
  try {
    const { productId, orderItemId } = req.query;
    const userId = req.user.userId;

    const result = await checkReviewEligibility(userId, productId, orderItemId);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { productId, rating, comment, images, orderItemId } = req.body;
    const userId = req.user.userId;

    if (!productId || !orderItemId || rating === undefined) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const { eligible, message } = await checkReviewEligibility(userId, productId, orderItemId);
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
      status: "approved" // Mode A: Auto-publish
    });

    await review.save();

    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    // Notify Seller
    const product = await Product.findById(productId);
    if (product && product.owner) {
      await Notification.create({
        user: product.owner,
        title: "New Product Review",
        message: `Your product "${product.name}" received a ${rating}-star review.`,
        type: "REVIEW"
      });
    }

    await updateProductStats(productId);

    // --- Gamification: Review Points ---
    const { addPoints } = require("../Services/GamificationService");
    await addPoints(userId, 20, `Review for ${product.name}`);
    // ------------------------------------

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted.",
      data: review,
    });
  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Try again." });
  }
};

const getReview = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviews = await Review.find({ product: id, status: "approved" })
      .populate("user", "username profile isVerified")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        reviewCount: product.reviewCount,
        ratingAverage: product.ratingAverage,
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
