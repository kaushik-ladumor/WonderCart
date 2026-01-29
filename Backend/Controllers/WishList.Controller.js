const WishList = require("../Models/WishList.Model");
const Product = require("../Models/Product.Model");
const mongoose = require("mongoose");

const getItem = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const wishlist = await WishList.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price originalPrice discount category variants averageRating numReviews description",
    });

    if (!wishlist) {
      const newWishlist = await WishList.create({
        user: userId,
        items: [],
      });
      return res.status(200).json({
        success: true,
        message: "Wishlist retrieved successfully",
        wishlist: newWishlist,
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const addItem = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await WishList.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await WishList.create({
        user: userId,
        items: [{ product: productId }],
      });
    } else {
      const existingItem = wishlist.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    await wishlist.populate({
      path: "items.product",
      select: "name price originalPrice discount category variants averageRating numReviews description",
    });

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const removeItem = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const wishlist = await WishList.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate({
      path: "items.product",
      select: "name price originalPrice discount category variants averageRating numReviews description",
    });

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { getItem, addItem, removeItem };