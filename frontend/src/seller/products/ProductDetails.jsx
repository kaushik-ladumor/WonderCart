import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Package,
  Tag,
  Edit,
  Eye,
  Calendar,
  Layers,
  Users,
  CheckCircle,
  XCircle,
  ChevronLeft,
  TrendingUp,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "../../components/Loader";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:4000/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productData = res.data.data;
        setProduct(productData);

        if (productData.variants?.length > 0) {
          setSelectedColor(productData.variants[0].color);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
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

  const getTotalStock = () => {
    if (!product?.variants?.length) return 0;
    return product.variants.reduce(
      (total, variant) =>
        total +
        (variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0),
      0,
    );
  };

  const getTotalVariants = () => product?.variants?.length || 0;

  const getTotalSizes = () => {
    if (!product?.variants?.length) return 0;
    return product.variants.reduce(
      (total, variant) => total + (variant.sizes?.length || 0),
      0,
    );
  };

  const handleEditProduct = () => {
    navigate(`/seller/products/edit/${id}`);
  };

  const formatColorName = (color) =>
    color ? color.charAt(0).toUpperCase() + color.slice(1) : "Default";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-800 mb-4">Product not found</p>
          <button
            onClick={() => navigate("/seller/products")}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const availableImages = getAvailableImages();
  const totalStock = getTotalStock();
  const totalVariants = getTotalVariants();
  const totalSizes = getTotalSizes();
  const currentVariant = getCurrentVariant();

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Details
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your product inventory
              </p>
            </div>

            <button
              onClick={handleEditProduct}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Edit className="w-4 h-4" />
              Edit Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Stock</p>
                <p className="text-xl font-bold text-gray-900">{totalStock}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Color Variants</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalVariants}
                </p>
              </div>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Sizes</p>
                <p className="text-xl font-bold text-gray-900">{totalSizes}</p>
              </div>
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Customer Reviews</p>
                <p className="text-xl font-bold text-gray-900">
                  {reviews.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Image Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="aspect-square flex items-center justify-center">
                {availableImages.length > 0 ? (
                  <img
                    src={availableImages[selectedImage]}
                    alt={`${product.name} - ${formatColorName(selectedColor)}`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-6xl mb-3">📷</div>
                    <p className="text-sm text-gray-500">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {availableImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50 border-t border-gray-100">
                {availableImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border transition ${
                      selectedImage === index
                        ? "border-gray-900 shadow-sm"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {product.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.averageRating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-xs text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created: {formatDate(product.createdAt)}</span>
              </div>
            </div>

            {/* Color Variants */}
            {product.variants?.length > 0 && (
              <div className="mt-6">
                <label className="block text-xs font-medium text-gray-900 mb-2">
                  Color Variants
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.color}
                      onClick={() => setSelectedColor(variant.color)}
                      className={`px-3 py-1.5 rounded-lg text-xs border flex items-center gap-2 ${
                        selectedColor === variant.color
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-900"
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            variant.color === "natural" ||
                            variant.color === "white"
                              ? "#f5f5f5"
                              : variant.color || "#e5e5e5",
                        }}
                      />
                      <span>{formatColorName(variant.color)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size & Stock Details */}
            {currentVariant?.sizes?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Size & Stock Details ({formatColorName(selectedColor)})
                </h3>
                <div className="space-y-2">
                  {currentVariant.sizes.map((sizeObj) => (
                    <div
                      key={sizeObj.size}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900 min-w-12">
                          {sizeObj.size}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Price:</span>
                          <span className="text-sm font-medium">
                            ₹{sizeObj.price?.toLocaleString()}
                          </span>
                          {sizeObj.discount > 0 && (
                            <span className="text-xs text-red-600">
                              ({sizeObj.discount}% off)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1.5 text-sm ${
                            sizeObj.stock > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {sizeObj.stock > 0 ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span className="font-medium">
                            {sizeObj.stock} units
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Customer Reviews ({reviews.length})
            </h3>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-medium">
                {product.averageRating?.toFixed(1) || "0.0"} out of 5
              </span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                No customer reviews yet. Check back later for feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-100 pb-4 last:pb-0 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {review.user?.username || "Anonymous Customer"}
                        </span>
                        {review.user?.isVerified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                </div>
              ))}
              {reviews.length > 5 && (
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  View all {reviews.length} reviews →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
