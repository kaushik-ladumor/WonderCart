const express = require("express");
const router = express.Router();
const couponController = require("../Controllers/Coupon.Controller");
const authMiddleware = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");

// Public/User routes
router.post("/validate", authMiddleware, couponController.validateCoupon);
router.get("/available", authMiddleware, couponController.getAvailableCoupons);

// Admin routes
router.post("/", authMiddleware, authorizeRoles("admin"), couponController.createCoupon);
router.get("/", authMiddleware, authorizeRoles("admin"), couponController.getAllCoupons);
router.get("/report", authMiddleware, authorizeRoles("admin"), couponController.getCouponReport);
router.get("/:id", authMiddleware, authorizeRoles("admin"), couponController.getCouponById);
router.patch("/:id", authMiddleware, authorizeRoles("admin"), couponController.updateCoupon);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), couponController.deleteCoupon);

module.exports = router;
