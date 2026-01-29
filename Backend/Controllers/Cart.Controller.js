const Cart = require("../Models/Cart.Model");
const Product = require("../Models/Product.Model");

// ✅ ADD TO CART - FIXED VERSION
const addCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, color, size } = req.body;

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (!color) {
      return res.status(400).json({ message: "color is required" });
    }

    if (!size) {
      return res.status(400).json({ message: "size is required" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate that the color and size variant exists
    const variant = product.variants?.find(v => v.color === color);
    if (!variant) {
      return res.status(400).json({
        message: `Color '${color}' not available for this product`
      });
    }

    const sizeObj = variant.sizes?.find(s => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({
        message: `Size '${size}' not available in ${color}`
      });
    }

    // Check stock availability
    if (sizeObj.stock < quantity) {
      return res.status(400).json({
        message: `Only ${sizeObj.stock} items available in ${color} - ${size}`
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if this exact variant (product + color + size) already exists in cart
    const existingItem = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.color === color &&
        i.size === size
    );

    if (existingItem) {
      // Check if adding quantity would exceed stock
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > sizeObj.stock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more. Only ${sizeObj.stock - existingItem.quantity} items available`
        });
      }

      // Update quantity and ensure price is always the original price (not discounted)
      existingItem.quantity += quantity;
      existingItem.price = sizeObj.price; // Always use original price
    } else {
      // Add new item with the specific variant
      const variantImage = variant.images?.[0] || "";

      // Store ORIGINAL price (before discount) - always use sizeObj.price which is the original price
      // NEVER apply discount here - sizeObj.price is already the original price
      const originalPrice = sizeObj.price; // This is the original price, NOT discounted
      
      cart.items.push({
        product: productId,
        quantity,
        color,
        size,
        price: originalPrice, // Original price (NOT discounted - never apply discount here)
        productImg: variantImage,
        productName: product.name,
      });
    }

    await cart.save();

    // Populate product details before sending response
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: `Added to cart: ${product.name} (${color}, ${size})`,
      cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET CART
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    // Return empty cart if not found
    if (!cart) {
      cart = { user: userId, items: [] };
    } else {
      // Filter out deleted products and check stock availability
      const validItems = [];
      let cartModified = false;

      for (const item of cart.items) {
        // Check if product exists
        if (!item.product || !item.product._id) {
          cartModified = true;
          continue; // Skip deleted products
        }

        const product = item.product;
        const variant = product.variants?.find(v => v.color === item.color);
        const sizeObj = variant?.sizes?.find(s => s.size === item.size);

        // If variant or size doesn't exist, remove item
        if (!variant || !sizeObj) {
          cartModified = true;
          continue;
        }

        // Check stock availability
        const availableStock = sizeObj.stock || 0;
        const isOutOfStock = availableStock === 0;
        const isLowStock = availableStock < item.quantity;

        // Adjust quantity if exceeds stock
        if (isLowStock && !isOutOfStock) {
          item.quantity = availableStock;
          cartModified = true;
        }

        // Add stock info to item
        item.isOutOfStock = isOutOfStock;
        item.availableStock = availableStock;
        // Always use original price (sizeObj.price), not discounted price
        // Force update price to ensure it's always the original price from the product
        const originalPrice = sizeObj.price; // This is the original price before discount
        if (item.price !== originalPrice) {
          item.price = originalPrice; // Update to original price if different
          cartModified = true;
        } else {
          item.price = originalPrice; // Ensure it's always set to original price
        }

        validItems.push(item);
      }

      // Update cart if items were removed or modified
      if (cartModified) {
        cart.items = validItems;
        await cart.save();
      }

      // Populate again after modifications
      if (cart.items.length > 0) {
        await cart.populate("items.product");
      }
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE QUANTITY
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, color, size, quantity } = req.body;

    // Validate required fields
    if (!productId || !color || !size || !quantity) {
      return res.status(400).json({
        message: "productId, color, size, and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the specific item (product + color + size)
    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId.toString() &&
        i.color === color &&
        i.size === size
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    // Validate stock availability and update price
    const product = await Product.findById(productId);
    if (product) {
      const variant = product.variants?.find(v => v.color === color);
      const sizeObj = variant?.sizes?.find(s => s.size === size);

      if (!variant || !sizeObj) {
        return res.status(404).json({
          message: `Product variant (${color}, ${size}) not found`
        });
      }

      if (quantity > sizeObj.stock) {
        return res.status(400).json({
          message: `Only ${sizeObj.stock} items available in ${color} - ${size}`
        });
      }

      // Update price from size variant - always use original price (NOT discounted)
      // sizeObj.price is the original price before any discount
      const originalPrice = sizeObj.price; // Original price, NOT discounted
      item.price = originalPrice; // Always use original price (before discount)
    }

    // Update quantity
    item.quantity = quantity;

    await cart.save();

    // Populate before sending response
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart,
    });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ REMOVE ITEM FROM CART
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { color, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (!color || !size) {
      return res.status(400).json({
        message: "color and size are required to identify the item"
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const beforeLength = cart.items.length;

    // Filter out the specific item (product + color + size)
    cart.items = cart.items.filter((item) => {
      const productIdMatch =
        (item.product?._id?.toString() || item.product.toString()) === productId.toString();
      const colorMatch = item.color === color;
      const sizeMatch = item.size === size;

      // Keep item if it doesn't match all three criteria
      return !(productIdMatch && colorMatch && sizeMatch);
    });

    // Check if item was actually removed
    if (cart.items.length === beforeLength) {
      return res.status(404).json({
        message: `Item (${color}, ${size}) not found in cart`,
      });
    }

    await cart.save();

    // Populate only if items still exist
    if (cart.items.length > 0) {
      await cart.populate("items.product");
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ CLEAR ENTIRE CART
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear all items
    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET CART SUMMARY (useful for displaying cart count, total, etc.)
const getCartSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        summary: {
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
        },
      });
    }

    const itemCount = cart.items.length;
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    res.status(200).json({
      success: true,
      summary: {
        itemCount,
        totalQuantity,
        subtotal,
      },
    });
  } catch (err) {
    console.error("Get cart summary error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};