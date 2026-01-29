const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getSellerOrderById,
  getSellerOrders,
} = require("../Controllers/Order.Controller");
const authenticate = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");

// -------------------- CUSTOMER ROUTES --------------------
router.post("/create", authenticate, createOrder);
router.get("/", authenticate, getOrders);
router.get("/id/:orderId", authenticate, getOrderById);
router.patch("/id/:orderId/cancel", authenticate, cancelOrder);

// -------------------- SELLER ROUTES --------------------
router.get(
  "/seller/orders",
  authenticate,
  authorizeRoles("seller"),
  getSellerOrders
);

router.get(
  "/seller/id/:orderId",
  authenticate,
  authorizeRoles("seller"),
  getSellerOrderById // Use this function
);

router.put(
  "/seller/id/:orderId/status",
  authenticate,
  authorizeRoles("seller"),
  updateOrderStatus
);

// -------------------- ADMIN ROUTES --------------------
// router.get("/admin/all", authenticate, authorizeRoles("admin"), getAllOrders);

module.exports = router;
