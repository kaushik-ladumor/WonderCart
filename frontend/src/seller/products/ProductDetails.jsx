import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Share2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/product/${id}`);
        const productData = res.data.data;
        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          const firstVariant = productData.variants[0];
          setSelectedColor(firstVariant.color);
          if (firstVariant.sizes && firstVariant.sizes.length > 0) {
            setSelectedSize(firstVariant.sizes[0].size);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/review/${id}`);
        setReviews(res.data.data?.reviews || res.data.reviews || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [id]);

  const getCurrentVariant = () => {
    return (
      product?.variants?.find((v) => v.color === selectedColor) ||
      product?.variants?.[0]
    );
  };

  const getAvailableImages = () => getCurrentVariant()?.images || [];

  const getAvailableSizes = () => getCurrentVariant()?.sizes || [];

  const getCurrentStock = () => {
    const variant = getCurrentVariant();
    const sizeObj = variant?.sizes?.find((s) => s.size === selectedSize);
    return sizeObj?.stock || 0;
  };

  const getTotalStockForColor = () => {
    return (
      getCurrentVariant()?.sizes?.reduce(
        (total, size) => total + (size.stock || 0),
        0
      ) || 0
    );
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedImage(0);
    const newVariant = product.variants.find((v) => v.color === color);
    if (newVariant?.sizes?.length > 0) {
      setSelectedSize(newVariant.sizes[0].size);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const calculateDiscountPercentage = () => {
    if (!product?.originalPrice || !product?.price) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  };

  const formatColorName = (color) =>
    color ? color.charAt(0).toUpperCase() + color.slice(1) : "Default";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-gray-900"
        >
          <Loader2 className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-8 rounded-3xl shadow-2xl"
        >
          <p className="text-xl text-gray-800 mb-6">Product not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const discountPercentage = calculateDiscountPercentage();
  const availableImages = getAvailableImages();
  const availableSizes = getAvailableSizes();
  const currentStock = getCurrentStock();
  const totalStock = getTotalStockForColor();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Section - Card Style */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="relative p-8 sm:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={availableImages[selectedImage]}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="aspect-square flex items-center justify-center"
                >
                  {availableImages.length > 0 ? (
                    <img
                      src={availableImages[selectedImage]}
                      alt={`${product.name} - ${formatColorName(
                        selectedColor
                      )}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <span className="text-8xl">🛒</span>
                      <p className="mt-4 text-lg">No image available</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>

            {/* Thumbnails */}
            {availableImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-t border-gray-100">
                {availableImages.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-black shadow-md"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info Section - Card Style */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100"
          >
            {/* SKU & Stock */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-gray-600">
                SKU: {product._id?.slice(0, 8)}
              </span>
              <span
                className={`flex items-center gap-2 font-medium ${
                  totalStock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    totalStock > 0 ? "bg-green-600" : "bg-red-600"
                  }`}
                />
                {totalStock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating || 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium text-gray-900">
                {product.averageRating?.toFixed(1) || "0.0"}
              </span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-2xl text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-600 font-bold rounded-full text-sm">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description || "No description available."}
            </p>

            {/* Color Selection */}
            {product.variants?.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Color:{" "}
                  <span className="font-medium text-gray-600">
                    {formatColorName(selectedColor)}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <motion.button
                      key={variant.color}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleColorSelect(variant.color)}
                      className={`px-5 py-2.5 rounded-xl font-medium text-sm border-2 transition-all ${
                        selectedColor === variant.color
                          ? "border-black bg-black text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:border-black"
                      }`}
                    >
                      {formatColorName(variant.color)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Size:{" "}
                  <span className="font-medium text-gray-600">
                    {selectedSize || "Select size"}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((sizeObj) => {
                    const isSelected = sizeObj.size === selectedSize;
                    const isOutOfStock = sizeObj.stock <= 0;
                    return (
                      <motion.button
                        key={sizeObj.size}
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          !isOutOfStock && handleSizeSelect(sizeObj.size)
                        }
                        disabled={isOutOfStock}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm border-2 transition-all ${
                          isOutOfStock
                            ? "border-gray-200 text-gray-400 line-through cursor-not-allowed"
                            : isSelected
                            ? "border-black bg-black text-white shadow-md"
                            : "border-gray-200 text-gray-700 hover:border-black"
                        }`}
                      >
                        {sizeObj.size}
                      </motion.button>
                    );
                  })}
                </div>
                {selectedSize && (
                  <p className="mt-3 text-sm text-gray-500">
                    {currentStock > 0
                      ? `${currentStock} available`
                      : "Out of stock"}
                  </p>
                )}
              </div>
            )}

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                {
                  icon: Truck,
                  label: "Fast Delivery",
                  desc: "2-3 business days",
                },
                {
                  icon: Shield,
                  label: "Secure Payment",
                  desc: "Multiple options",
                },
                {
                  icon: RotateCcw,
                  label: "Easy Returns",
                  desc: "30-day policy",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl"
                >
                  <item.icon className="w-6 h-6 text-gray-700" />
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews Section - Card Style */}
        <motion.section
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-lg">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-b border-gray-100 pb-6 last:pb-0 last:border-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-900">
                          {review.user?.username}
                        </span>
                        {review.user?.isVerified && (
                          <span className="px-2.5 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
