const WishList = require("../Models/Wishlist.Model");
const Product = require("../Models/Product.Model");
const mongoose = require("mongoose");

// Helper: Emit wishlist update via socket
const emitWishlistUpdate = (userId, wishlist, message = "wishlist-updated") => {
  if (global.io) {
    global.io.to(`wishlist-${userId}`).emit("wishlist-update", {
      type: message,
      wishlist,
      itemCount: wishlist?.items?.length || 0,
    });
  }
};

// Helper: Check if a product has any stock
const hasAnyStock = (product) => {
  if (!product?.variants) return false;
  return product.variants.some((variant) =>
    variant.sizes?.some((size) => (size.stock || 0) > 0)
  );
};

const getItem = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    let wishlist = await WishList.findOne({ user: userId }).populate({
      path: "items.product",
      select:
        "name originalPrice sellingPrice discount category variants averageRating numReviews description",
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

    // Filter out deleted products and add stock info
    const validItems = [];
    let modified = false;
    const removedItems = [];

    for (const item of wishlist.items) {
      if (!item.product || !item.product._id) {
        modified = true;
        removedItems.push("Deleted product");
        continue;
      }

      // Add stock status to each item
      item.isOutOfStock = !hasAnyStock(item.product);
      validItems.push(item);
    }

    if (modified) {
      wishlist.items = validItems;
      await wishlist.save();

      await wishlist.populate({
        path: "items.product",
        select:
          "name originalPrice sellingPrice discount category variants averageRating numReviews description",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      wishlist,
      removedItems,
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
      select:
        "name originalPrice sellingPrice discount category variants averageRating numReviews description",
    });

    emitWishlistUpdate(userId, wishlist, "item-added");

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
      select:
        "name originalPrice sellingPrice discount category variants averageRating numReviews description",
    });

    emitWishlistUpdate(userId, wishlist, "item-removed");

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