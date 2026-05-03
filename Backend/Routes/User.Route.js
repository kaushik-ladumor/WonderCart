const express = require('express');

const userRouter = express.Router();

const userController = require('../Controllers/User.Controller');
const walletController = require('../Controllers/Wallet.Controller');

const Authenticate = require('../Middlewares/Auth');

const upload = require('../Middlewares/upload');

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/refresh-token", userController.refreshToken);
userRouter.post("/logout", Authenticate, userController.logout);
userRouter.post("/verify", userController.verify);
userRouter.post("/resend-code", userController.resendCode);
userRouter.post("/forget-password", userController.forgatPassword);
userRouter.post("/reset-password", userController.resetPassword);
userRouter.put("/update-password", Authenticate, userController.updatePassword);
userRouter.get("/profile", Authenticate, userController.profile);
userRouter.put("/profile", Authenticate, upload.single('profile'), userController.updateProfile);
userRouter.delete("/delete-account", Authenticate, userController.deleteAccount);
userRouter.post("/contact", userController.contact);

userRouter.post('/google-auth', userController.googleAuth);


/* ================================
   Address Routes
================================ */

userRouter.post("/address", Authenticate, userController.addAddress);
userRouter.get("/address", Authenticate, userController.getAddresses);
userRouter.put("/address/:addressId", Authenticate, userController.updateAddress);
userRouter.put("/address/:addressId/default", Authenticate, userController.setDefaultAddress);
userRouter.delete("/address/:addressId", Authenticate, userController.deleteAddress);


/* ================================
   Coupon Routes (NEW)
================================ */

// Get eligible coupons for logged-in user
userRouter.get(
    "/coupons",
    Authenticate,
    userController.getAvailableCoupons
);

userRouter.post(
    "/apply-coupon",
    Authenticate,
    userController.applyCoupon
);

/* ================================
   Wallet Routes
================================ */
userRouter.get("/wallet/status", Authenticate, walletController.getWalletStatus);
userRouter.post("/wallet/topup", Authenticate, walletController.topUpWallet);
userRouter.post("/wallet/verify", Authenticate, walletController.verifyWalletTopUp);

module.exports = userRouter;
