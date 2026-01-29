const Review = require("../Models/Review.Model");
const Product = require("../Models/Product.Model");
const mongoose = require("mongoose");

// Update product statistics
const updateProductStats = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numReviews = reviews.length;
  const averageRating =
    numReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / numReviews
      : 0;

  await Product.findByIdAndUpdate(productId, {
    numReviews,
    averageRating: Math.round(averageRating * 10) / 10,
  });
};

// Add Review
const addReview = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment: comment || "",
    });

    await review.save();

    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });

    updateProductStats(productId).catch(console.error);
  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getReview = async (req, res) => {
  try {
    const { userId } = req.params;

    const product = await Product.findById(userId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = await Review.find({ product: id })
      .populate("user", "username email isVerified") // Add all possible name fields
      .sort({ createdAt: -1 });

    console.log("Sample review user:", reviews[0]?.user); // Check what's returned

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        totalReviews: product.numReviews,
        averageRating: product.averageRating,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }
    const userId = req.user.userId; 
    const { reviewId } = req.params;



    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (String(review.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const productId = review.product;

    await Product.findByIdAndUpdate(productId, {
      $pull: { reviews: reviewId },
    });

    await review.deleteOne();

    await updateProductStats(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { addReview, getReview, deleteReview };
