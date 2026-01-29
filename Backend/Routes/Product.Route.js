const express = require("express");
const upload = require("../Middlewares/upload");
const {
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
  getSellerProducts,
  searchQuery
} = require("../Controllers/Product.Controller");
const Authorization = require("../Middlewares/Auth");
const authorizeRoles = require("../Middlewares/authorizeRoles");

const productRouter = express.Router();

// ✅ PUBLIC ROUTES
productRouter.get("/get", getProduct);
productRouter.get("/query/search", searchQuery);

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
  upload.any(),
  createProduct
);

productRouter.put(
  "/update/:id",
  Authorization,
  authorizeRoles("seller"),
  upload.any(),
  updateProduct
);

productRouter.delete(
  "/delete/:id",
  Authorization,
  authorizeRoles("seller", "admin"),
  deleteProduct
);

module.exports = productRouter;
