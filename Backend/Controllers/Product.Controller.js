const Product = require("../Models/Product.Model");
const cloudinary = require("../Utils/Cloudinary");
const Review = require("../Models/Review.Model");
const mongoose = require('mongoose')

const getProduct = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: " Internal server error",
      error: error.message,
    });
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
  const file = parts.pop();
  const folder = parts.slice(parts.indexOf("upload") + 1);
  const fileName = file.split(".")[0];
  return folder.join("/") + "/" + fileName;
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
      variantMap[file.fieldname].push(file.path);
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
        if (
          !s.size ||
          s.price == null ||
          s.stock == null ||
          s.discount == null
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid size data for ${v.color}`,
          });
        }
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      variants: parsedVariants,
      owner: req.user.userId,
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

    const products = await Product.find({
      owner: req.user.userId,
    });

    res.status(200).json({
      success: true,
      products,
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
          v.images = newImages.map((f) => f.path);
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
            s.price == null ||
            s.stock == null ||
            s.discount == null
          ) {
            throw new Error(`Invalid size data for ${v.color}`);
          }
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

const searchQuery = async(req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter is required" });
    }
    const data = await Product.aggregate([
      {
        $search: {
          index: "product_search",
          compound: {
            should: [
              {
                autocomplete: {
                  query: query,
                  path: "name"
                }
              },
              {
                autocomplete: {
                  query: query,
                  path: "category"
                }
              }
            ]
          }
        }
      },
      { $limit: 10 }
    ]);
    res.status(200).json({ success: true, data });  
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

module.exports = {
  createProduct,
  getProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  searchQuery
};
