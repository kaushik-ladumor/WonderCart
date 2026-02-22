const Product = require("../Models/Product.Model");
const cloudinary = require("../Utils/Cloudinary");
const Review = require("../Models/Review.Model");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

// Helper function to calculate discount percentage
const calculateDiscount = (originalPrice, sellingPrice) => {
  if (!originalPrice || originalPrice === 0) return 0;
  if (sellingPrice > originalPrice) {
    throw new Error("Selling price cannot be greater than original price");
  }
  const discount = ((originalPrice - sellingPrice) / originalPrice) * 100;
  return Math.round(discount);
};

const getProduct = async (req, res) => {
  try {
    const { page, limit: qLimit, category } = req.query;
    const p = parseInt(page) || 1;
    const l = parseInt(qLimit) || 8;
    const skip = (p - 1) * l;

    const filter = { status: "approved" };
    if (category && category !== "all") {
      filter.category = { $regex: new RegExp(`^${category.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`, "i") };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: " Internal server error",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const rawCategories = await Product.distinct("category", { status: "approved" });
    const categoryMap = new Map();

    rawCategories.forEach(cat => {
      if (cat) {
        const trimmed = cat.trim();
        const lower = trimmed.toLowerCase();
        if (!categoryMap.has(lower)) {
          categoryMap.set(lower, trimmed);
        }
      }
    });

    res.status(200).json({
      success: true,
      categories: Array.from(categoryMap.values()).sort()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate("owner", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is approved or user is authorized (owner/admin)
    if (product.status !== "approved") {
      const authHeader = req.headers.authorization;
      let authorized = false;

      if (authHeader) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (
            decoded.role === "admin" ||
            String(product.owner._id) === String(decoded.userId)
          ) {
            authorized = true;
          }
        } catch (err) {
          // Token invalid, keep authorized = false
        }
      }

      if (!authorized) {
        return res.status(403).json({
          success: false,
          message: "This product is pending approval and is not publicly available.",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const getPublicId = (url) => {
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  const startIndex = parts[uploadIndex + 1]?.startsWith("v") ? uploadIndex + 2 : uploadIndex + 1;
  const publicIdWithExt = parts.slice(startIndex).join("/");
  return publicIdWithExt.split(".")[0];
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.log("=>", product.owner);
    console.log(req.user.userId);
    if (String(product.owner) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    const deletedReviews = await Review.deleteMany({ product: id });
    console.log(
      `Deleted ${deletedReviews.deletedCount} reviews for product ${id}`
    );

    if (product.productImg && product.productImg.length > 0) {
      for (const imgUrl of product.productImg) {
        const publicId = getPublicId(imgUrl);
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Remove product from all carts before deleting
    const Cart = require("../Models/Cart.Model");
    const carts = await Cart.find({ "items.product": id });

    for (const cart of carts) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== id.toString()
      );
      await cart.save();
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product and images deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, category, variants } = req.body;

    if (!name || !description || !category || !variants) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const parsedVariants = JSON.parse(variants);
    const variantMap = {};

    req.files.forEach((file) => {
      if (!variantMap[file.fieldname]) {
        variantMap[file.fieldname] = [];
      }
      // Ensure we use https for all Cloudinary URLs to prevent mixed content issues on mobile
      variantMap[file.fieldname].push(file.path.replace("http://", "https://"));
    });

    for (const v of parsedVariants) {
      if (!variantMap[v.color]) {
        return res.status(400).json({
          success: false,
          message: `Images missing for ${v.color}`,
        });
      }

      v.images = variantMap[v.color];

      if (!Array.isArray(v.sizes) || v.sizes.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Sizes missing for ${v.color}`,
        });
      }

      for (const s of v.sizes) {
        // Validate required fields
        if (
          !s.size ||
          s.originalPrice == null ||
          s.sellingPrice == null ||
          s.stock == null
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid size data for ${v.color}`,
          });
        }

        // Validate pricing
        if (s.sellingPrice > s.originalPrice) {
          return res.status(400).json({
            success: false,
            message: `Selling price cannot be greater than original price for ${v.color}`,
          });
        }

        // Calculate and set discount
        s.discount = calculateDiscount(s.originalPrice, s.sellingPrice);
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      variants: parsedVariants,
      owner: req.user.userId,
      status: "pending",
    });

    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller access only",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments({ owner: req.user.userId });
    const products = await Product.find({
      owner: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, variants } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (String(product.owner) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;

    if (variants) {
      const parsedVariants = JSON.parse(variants);

      parsedVariants.forEach((v) => {
        const newImages = req.files?.filter(
          (f) => f.fieldname === v.color
        );

        if (newImages && newImages.length > 0) {
          // Ensure we use https for all Cloudinary URLs
          v.images = newImages.map((f) => f.path.replace("http://", "https://"));
        } else if (v.existingImages && v.existingImages.length > 0) {
          v.images = v.existingImages;
        } else {
          throw new Error(`Images required for ${v.color}`);
        }

        delete v.existingImages;

        if (!Array.isArray(v.sizes) || v.sizes.length === 0) {
          throw new Error(`Sizes missing for ${v.color}`);
        }

        v.sizes.forEach((s) => {
          if (
            !s.size ||
            s.originalPrice == null ||
            s.sellingPrice == null ||
            s.stock == null
          ) {
            throw new Error(`Invalid size data for ${v.color}`);
          }

          // Validate pricing
          if (s.sellingPrice > s.originalPrice) {
            throw new Error(`Selling price cannot be greater than original price for ${v.color}`);
          }

          // Calculate and set discount
          s.discount = calculateDiscount(s.originalPrice, s.sellingPrice);
        });
      });

      product.variants = parsedVariants;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const searchQuery = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const data = await Product.aggregate([
      {
        $search: {
          index: "product_search",
          compound: {
            should: [
              {
                autocomplete: {
                  query: query,
                  path: "name",
                },
              },
              {
                autocomplete: {
                  query: query,
                  path: "category",
                },
              },
            ],
          },
        },
      },
      { $match: { status: "approved" } },
      { $skip: skip },
      { $limit: limit },
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  searchQuery,
  getCategories
};
