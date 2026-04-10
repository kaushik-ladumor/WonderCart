const express = require("express");
const router = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");

const {
  placeOrder,
  verifyPayment,
  getMyOrders,
  getMasterOrderById,
  getSellerOrders,
  getSellerSubOrderById,
  updateSubOrderStatus,
  cancelSubOrder,
  trackOrder,
  getAllOrders,
  getAdminDashboardStats,
  razorpayWebhook,
} = require("../Controllers/OrderMaster.Controller");

const {
  cancelOrder,
} = require("../Controllers/Order.Controller");

const authenticate = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");
const Notification = require("../Models/Notification.Model");

// -------------------- CUSTOMER ROUTES --------------------
router.post("/create", authenticate, requireVerification, placeOrder);
router.get("/", authenticate, getMyOrders);
router.get("/id/:orderId", authenticate, getMasterOrderById);
router.patch("/sub-id/:subOrderId/cancel", authenticate, cancelSubOrder);
router.get("/track/:id", authenticate, trackOrder);
router.get("/my-orders", authenticate, getMyOrders);

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
  getSellerSubOrderById
);

router.put(
  "/seller/id/:subOrderId/status",
  authenticate,
  authorizeRoles("seller"),
  requireVerification,
  updateSubOrderStatus
);

// -------------------- ADMIN ROUTES --------------------
router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("admin"),
  getAllOrders
);

router.get(
  "/admin/dashboard-stats",
  authenticate,
  authorizeRoles("admin"),
  getAdminDashboardStats
);

// -------------------- PAYMENT ROUTES --------------------
router.post('/verify-payment', authenticate, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

module.exports = router;
