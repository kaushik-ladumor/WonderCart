const express = require("express");
const adminRouter = express.Router();

// Controllers
const adminController = require("../Controllers/Admin.Controller");

// Middlewares
const authorizationRole = require("../Middlewares/authorizeRoles");
const Authorization = require("../Middlewares/Auth");
const requireVerification = require("../Middlewares/RequireVerification");



// Get earnings summary (platform commission + seller payables)
adminRouter.get(
    "/earnings-summary",
    Authorization,
    authorizationRole('admin'),
    adminController.getEarningsSummary
);

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

/* ===========================
   Seller Application Routes
=========================== */

const sellerController = require("../Controllers/Seller.Controller");

// Get seller applications
adminRouter.get(
    "/seller-applications",
    Authorization,
    authorizationRole('admin'),
    sellerController.getSellerApplications
);

// Get single application
adminRouter.get(
    "/seller-applications/:profileId",
    Authorization,
    authorizationRole('admin'),
    sellerController.getSingleApplication
);

// Approve seller
adminRouter.put(
    "/seller-applications/:profileId/approve",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    sellerController.approveSeller
);

// Reject seller
adminRouter.put(
    "/seller-applications/:profileId/reject",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    sellerController.rejectSeller
);

// Request more info
adminRouter.put(
    "/seller-applications/:profileId/request-info",
    Authorization,
    authorizationRole('admin'),
    sellerController.requestSellerInfo
);

// Approve category request
adminRouter.put(
    "/seller-applications/:profileId/category/:requestId/approve",
    Authorization,
    authorizationRole('admin'),
    sellerController.approveCategoryRequest
);

// Reject category request
adminRouter.put(
    "/seller-applications/:profileId/category/:requestId/reject",
    Authorization,
    authorizationRole('admin'),
    sellerController.rejectCategoryRequest
);

module.exports = adminRouter;
