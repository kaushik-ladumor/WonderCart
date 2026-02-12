const express = require('express');

const userRouter = express.Router();

const userController = require('../Controllers/User.Controller');
const Authenticate = require('../Middlewares/Auth');

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.post("/refresh-token", userController.refreshToken);
userRouter.post("/logout", Authenticate, userController.logout);
userRouter.post("/verify", userController.verify);
userRouter.post("/resendCode", userController.resendCode);
userRouter.post("/forget-password", userController.forgatPassword);
userRouter.post("/reset-password", userController.resetPassword);
userRouter.put("/update-password", Authenticate, userController.updatePassword);
userRouter.get("/profile", Authenticate, userController.profile);
userRouter.delete("/delete-account", Authenticate, userController.deleteAccount);
userRouter.post("/contact", userController.contact);

userRouter.post('/google-auth', userController.googleAuth);

// Address Routes
userRouter.post("/address", Authenticate, userController.addAddress);
userRouter.get("/address", Authenticate, userController.getAddresses);
userRouter.put("/address/:addressId", Authenticate, userController.updateAddress);
userRouter.put("/address/:addressId/default", Authenticate, userController.setDefaultAddress);
userRouter.delete("/address/:addressId", Authenticate, userController.deleteAddress);

module.exports = userRouter;