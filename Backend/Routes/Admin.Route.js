const express = require("express");
const adminRouter = express.Router();

const adminController = require("../Controllers/Admin.Controller");
const authorizationRole = require("../Middlewares/authorizeRoles");
const Authorization = require("../Middlewares/Auth");
const requireVerification = require("../Middlewares/RequireVerification");

adminRouter.get("/users", Authorization, authorizationRole('admin'), adminController.getUser);
adminRouter.get("/products", Authorization, authorizationRole('admin'), adminController.getProduct);
adminRouter.get("/orders", Authorization, authorizationRole('admin'), adminController.getOrder);

adminRouter.put("/products/:productId/approve", Authorization, authorizationRole('admin'), requireVerification, adminController.productApproval);
adminRouter.delete("/products/:productId/reject", Authorization, authorizationRole('admin'), requireVerification, adminController.rejectProduct);

module.exports = adminRouter;
