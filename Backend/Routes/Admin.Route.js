const express = require("express");
const adminRouter = express.Router();

// Controllers
const adminController = require("../Controllers/Admin.Controller");

// Middlewares
const authorizationRole = require("../Middlewares/authorizeRoles");
const Authorization = require("../Middlewares/Auth");
const requireVerification = require("../Middlewares/RequireVerification");



// Get all users
adminRouter.get(
    "/users",
    Authorization,
    authorizationRole('admin'),
    adminController.getUser
);

// Get all products
adminRouter.get(
    "/products",
    Authorization,
    authorizationRole('admin'),
    adminController.getProduct
);

// Get all orders
adminRouter.get(
    "/orders",
    Authorization,
    authorizationRole('admin'),
    adminController.getOrder
);

// Approve product
adminRouter.put(
    "/products/:productId/approve",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    adminController.productApproval
);

// Reject product
adminRouter.delete(
    "/products/:productId/reject",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    adminController.rejectProduct
);

// Delete user
adminRouter.delete(
    "/users/delete",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    adminController.deleteUser
);


/* ===========================
   Coupon Management Routes
=========================== */

// Create coupon (Admin only)
adminRouter.post(
    "/coupons/create",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    adminController.createCoupon
);

// Get all coupons
adminRouter.get(
    "/coupons/list",
    Authorization,
    authorizationRole('admin'),
    adminController.getCoupon
);

// Get single coupon
adminRouter.get(
    "/coupons/:couponId",
    Authorization,
    authorizationRole('admin'),
    adminController.getSingleCoupon
);

// Update coupon
adminRouter.put(
    "/coupons/update/:couponId",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    adminController.updateCoupon
);

// Delete coupon
adminRouter.delete(
    "/coupons/delete/:couponId",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    adminController.deleteCoupon
);

module.exports = adminRouter;
