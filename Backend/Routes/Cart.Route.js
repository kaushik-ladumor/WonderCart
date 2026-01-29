const express = require("express");
const CartRouter = express.Router();

const {
  addCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../Controllers/Cart.Controller");

const authenticate = require("../Middlewares/Auth");

// 🔐 All routes use authenticate

// Add item to cart
CartRouter.post("/add", authenticate, addCart);

// Get logged-in user's cart
CartRouter.get("/", authenticate, getCart);

// Update cart item quantity
CartRouter.put("/", authenticate, updateCartItem);

// Clear entire cart
CartRouter.delete("/clear", authenticate, clearCart);

// Remove item from cart
CartRouter.delete("/:productId", authenticate, removeCartItem);


module.exports = CartRouter;
