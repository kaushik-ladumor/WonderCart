const express = require("express");
const sellerRouter = express.Router();
const authenticated = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");
const upload = require("../Middlewares/upload");

const {
  sellerDashboard,
  getSellerProfile,
  sendSellerOtp,
  verifySellerOtp,
  saveBusinessDetails,
  saveBankDetails,
  submitForReview,
  requestNewCategory,
  getSellerCategories,
} = require("../Controllers/Seller.Controller");

// ─── Dashboard ───
sellerRouter.get("/dashboard", authenticated, sellerDashboard);

// ─── Profile ───
sellerRouter.get("/profile", authenticated, getSellerProfile);

// ─── Email Verification ───
sellerRouter.post("/send-otp", authenticated, sendSellerOtp);
sellerRouter.post("/verify-otp", authenticated, verifySellerOtp);

// ─── Step 2: Business Details (with document uploads) ───
sellerRouter.post(
  "/business-details",
  authenticated,
  upload.fields([
    { name: "panCardDocument", maxCount: 1 },
    { name: "identityDocument", maxCount: 1 },
  ]),
  saveBusinessDetails
);

// ─── Step 3: Bank Details ───
sellerRouter.post("/bank-details", authenticated, saveBankDetails);

// ─── Submit for Review ───
sellerRouter.post("/submit-review", authenticated, submitForReview);

// ─── Category Management ───
sellerRouter.get("/categories", authenticated, getSellerCategories);
sellerRouter.post("/request-category", authenticated, requestNewCategory);

module.exports = sellerRouter;
