const express = require("express");
const upload = require("../Middlewares/upload");
const {
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
  getSellerProducts,
  searchQuery,
  getCategories
} = require("../Controllers/Product.Controller");
const Authorization = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");

const productRouter = express.Router();
const requireVerification = require("../Middlewares/RequireVerification");

// ✅ PUBLIC ROUTES
productRouter.get("/get", getProduct);
productRouter.get("/query/search", searchQuery);
productRouter.get("/categories", getCategories);

// ✅ SELLER / ADMIN ROUTES
productRouter.get(
  "/seller/product",
  Authorization,
  authorizeRoles("seller", "admin"),
  getSellerProducts
);

// ❗ DYNAMIC ROUTE MUST BE LAST
productRouter.get("/:id", getSingleProduct);

// ✅ MUTATIONS
productRouter.post(
  "/create",
  Authorization,
  authorizeRoles("seller"),
  requireVerification,
  upload.any(),
  createProduct
);

productRouter.put(
  "/update/:id",
  Authorization,
  authorizeRoles("seller", "admin"),
  requireVerification,
  upload.any(),
  updateProduct
);

productRouter.delete(
  "/delete/:id",
  Authorization,
  authorizeRoles("seller", "admin"),
  requireVerification,
  deleteProduct
);

module.exports = productRouter;
