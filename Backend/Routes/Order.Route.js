const express = require("express");
const router = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  verifyPayment,
  getSellerOrderById,
  getSellerOrders,
  trackOrder,
  getMyOrders
} = require("../Controllers/Order.Controller");
const authenticate = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");
const Notification = require("../Models/Notification.Model");

// -------------------- CUSTOMER ROUTES --------------------
router.post("/create", authenticate, requireVerification, createOrder);
router.get("/", authenticate, getOrders);
router.get("/id/:orderId", authenticate, getOrderById);
router.patch("/id/:orderId/cancel", authenticate, cancelOrder);
router.get("/track/:orderId", authenticate, trackOrder);
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
  getSellerOrderById // Use this function
);

router.put(
  "/seller/id/:orderId/status",
  authenticate,
  authorizeRoles("seller"),
  requireVerification,
  updateOrderStatus
);


router.get("/notifications", authenticate, async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.userId,
  }).sort({ createdAt: -1 });

  res.json({ success: true, notifications });
});


router.put("/notifications/:id/read", authenticate, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
  });

  res.json({ success: true });
});
router.delete("/notifications/clear", authenticate, async (req, res) => {
  await Notification.deleteMany({ user: req.user.userId });
  res.json({ success: true });
});



// -------------------- ADMIN ROUTES --------------------
// router.get("/admin/all", authenticate, authorizeRoles("admin"), getAllOrders);

router.post('/verify-payment', authenticate, verifyPayment);

module.exports = router;
