const Cart = require("../Models/Cart.Model");
const Product = require("../Models/Product.Model");

// Helper: Emit cart update to user via socket
const emitCartUpdate = (userId, cart, message = "cart-updated") => {
  if (global.io) {
    global.io.to(`cart-${userId}`).emit("cart-update", {
      type: message,
      cart,
      itemCount: cart?.items?.length || 0,
    });
  }
};

// ✅ ADD TO CART
const addCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1, color, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    if (!color) {
      return res.status(400).json({ message: "color is required" });
    }
    if (!size) {
      return res.status(400).json({ message: "size is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants?.find((v) => v.color === color);
    if (!variant) {
      return res.status(400).json({
        message: `Color '${color}' not available for this product`,
      });
    }

    const sizeObj = variant.sizes?.find((s) => s.size === size);
    if (!sizeObj) {
      return res.status(400).json({
        message: `Size '${size}' not available in ${color}`,
      });
    }

    // Stock check
    if (sizeObj.stock < quantity) {
      return res.status(400).json({
        message:
          sizeObj.stock === 0
            ? `${product.name} (${color}, ${size}) is out of stock`
            : `Only ${sizeObj.stock} items available in ${color} - ${size}`,
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.color === color &&
        i.size === size
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > sizeObj.stock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more. Only ${sizeObj.stock - existingItem.quantity} items available`,
        });
      }

      existingItem.quantity += quantity;
      existingItem.price = sizeObj.sellingPrice;
      existingItem.originalPrice = sizeObj.originalPrice;
      existingItem.sellingPrice = sizeObj.sellingPrice;
      existingItem.discount = sizeObj.discount || 0;
    } else {
      const variantImage = variant.images?.[0] || "";

      cart.items.push({
        product: productId,
        quantity,
        color,
        size,
        price: sizeObj.sellingPrice,
        originalPrice: sizeObj.originalPrice,
        sellingPrice: sizeObj.sellingPrice,
        discount: sizeObj.discount || 0,
        productImg: variantImage,
        productName: product.name,
      });
    }

    await cart.save();
    await cart.populate("items.product");

    // Emit real-time update
    emitCartUpdate(userId, cart, "item-added");

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

// ✅ GET CART (with stock validation — keeps OOS items marked, only removes deleted)
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = { user: userId, items: [] };
      return res.status(200).json({ success: true, cart });
    }

    const validItems = [];
    let cartModified = false;
    const removedItems = [];
    const adjustedItems = [];
    const outOfStockItems = [];

    for (const item of cart.items) {
      // Skip deleted products
      if (!item.product || !item.product._id) {
        cartModified = true;
        removedItems.push(item.productName || "Unknown product");
        continue;
      }

      const product = item.product;
      const variant = product.variants?.find((v) => v.color === item.color);
      const sizeObj = variant?.sizes?.find((s) => s.size === item.size);

      // Remove if variant/size no longer exists
      if (!variant || !sizeObj) {
        cartModified = true;
        removedItems.push(`${product.name} (${item.color}, ${item.size})`);
        continue;
      }

      const availableStock = sizeObj.stock || 0;

      // Mark out-of-stock items but KEEP them in cart (shown as disabled)
      if (availableStock === 0) {
        item.isOutOfStock = true;
        item.availableStock = 0;
        outOfStockItems.push(`${product.name} (${item.color}, ${item.size})`);
      } else {
        item.isOutOfStock = false;
        item.availableStock = availableStock;

        // Adjust quantity if exceeds stock
        if (availableStock < item.quantity) {
          item.quantity = availableStock;
          cartModified = true;
          adjustedItems.push({
            name: `${product.name} (${item.color}, ${item.size})`,
            newQty: availableStock,
          });
        }
      }

      // Always sync prices from product
      item.price = sizeObj.sellingPrice;
      item.originalPrice = sizeObj.originalPrice;
      item.sellingPrice = sizeObj.sellingPrice;
      item.discount = sizeObj.discount || 0;

      validItems.push(item);
    }

    // Save if modified
    if (cartModified) {
      cart.items = validItems;
      await cart.save();

      // Emit socket event for real-time update
      emitCartUpdate(userId, cart, "stock-sync");
    }

    // Populate again after modifications
    if (cart.items.length > 0) {
      await cart.populate("items.product");
    }

    res.status(200).json({
      success: true,
      cart,
      stockChanges: {
        removed: removedItems,
        adjusted: adjustedItems,
      },
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

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

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

    // Validate stock
    const product = await Product.findById(productId);
    if (product) {
      const variant = product.variants?.find((v) => v.color === color);
      const sizeObj = variant?.sizes?.find((s) => s.size === size);

      if (!variant || !sizeObj) {
        return res.status(404).json({
          message: `Product variant (${color}, ${size}) not found`,
        });
      }

      if (sizeObj.stock === 0) {
        // Auto-remove out-of-stock item
        cart.items = cart.items.filter(
          (i) =>
            !(
              i.product.toString() === productId.toString() &&
              i.color === color &&
              i.size === size
            )
        );
        await cart.save();
        await cart.populate("items.product");

        emitCartUpdate(userId, cart, "item-removed-oos");

        return res.status(400).json({
          message: `${product.name} (${color}, ${size}) is now out of stock and has been removed from your cart`,
          cart,
        });
      }

      if (quantity > sizeObj.stock) {
        return res.status(400).json({
          message: `Only ${sizeObj.stock} items available in ${color} - ${size}`,
        });
      }

      // Sync prices
      item.price = sizeObj.sellingPrice;
      item.originalPrice = sizeObj.originalPrice;
      item.sellingPrice = sizeObj.sellingPrice;
      item.discount = sizeObj.discount || 0;
    }

    item.quantity = quantity;

    await cart.save();
    await cart.populate("items.product");

    emitCartUpdate(userId, cart, "quantity-updated");

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
        message: "color and size are required to identify the item",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const beforeLength = cart.items.length;

    cart.items = cart.items.filter((item) => {
      const productIdMatch =
        (item.product?._id?.toString() || item.product.toString()) ===
        productId.toString();
      const colorMatch = item.color === color;
      const sizeMatch = item.size === size;
      return !(productIdMatch && colorMatch && sizeMatch);
    });

    if (cart.items.length === beforeLength) {
      return res.status(404).json({
        message: `Item (${color}, ${size}) not found in cart`,
      });
    }

    await cart.save();

    if (cart.items.length > 0) {
      await cart.populate("items.product");
    }

    emitCartUpdate(userId, cart, "item-removed");

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

    cart.items = [];
    await cart.save();

    emitCartUpdate(userId, cart, "cart-cleared");

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

// ✅ GET CART SUMMARY
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
    const totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
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