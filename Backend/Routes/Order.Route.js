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
  trackOrder,
} = require("../Controllers/OrderMaster.Controller");
const {
  getOrderById,
  cancelOrder,
} = require("../Controllers/Order.Controller");
const authenticate = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");
const Notification = require("../Models/Notification.Model");

// -------------------- CUSTOMER ROUTES --------------------
router.post("/create", authenticate, requireVerification, placeOrder);
router.get("/", authenticate, getMyOrders);
router.get("/id/:orderId", authenticate, getMasterOrderById);
router.patch("/id/:orderId/cancel", authenticate, cancelOrder);
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
