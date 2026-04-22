const express = require("express");
const CartRouter = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");

const {
  addCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../Controllers/Cart.Controller");

const {
  shareCart,
  openSharedCart,
  addSharedItemsToOwnCart
} = require("../Controllers/SharedCart.Controller");

const authenticate = require("../Middlewares/Auth");
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  return authenticate(req, res, next);
};

// 🔐 All routes use authenticate

// Add item to cart
CartRouter.post("/add", authenticate, requireVerification, addCart);

// Get logged-in user's cart
CartRouter.get("/", authenticate, getCart);

// Update cart item quantity
CartRouter.put("/", authenticate, updateCartItem);

// Clear entire cart
CartRouter.delete("/clear", authenticate, clearCart);

// Remove item from cart
CartRouter.delete("/:productId", authenticate, removeCartItem);

// --- Social Shopping (Share Cart) ---
// Generate share link
CartRouter.post("/share", authenticate, shareCart);

// Open shared cart (Optional login)
CartRouter.get("/share/:shareId", optionalAuth, openSharedCart);

// Add items from shared cart to own (Must be logged in)
CartRouter.post("/share/:shareId/add", authenticate, addSharedItemsToOwnCart);


module.exports = CartRouter;
