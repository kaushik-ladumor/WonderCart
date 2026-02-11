import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Review from "./Review";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Share2,
  Check,
} from "lucide-react";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

const ProductDetail = () => {
  const { setCartCount, refreshCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});

  // Decode user ID from JWT
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload.userId || payload._id);
        fetchWishlist(token);
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, [token]);

  const fetchWishlist = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const ids = res.data.wishlist?.items?.map((i) => i.product) || [];
        setWishlist(ids);
      }
    } catch { }
  };

  const toggleWishlist = async (e, productToToggle) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setAddingToWishlist((p) => ({ ...p, [productToToggle._id]: true }));

    try {
      if (wishlist.includes(productToToggle._id)) {
        await axios.delete(
          `${API_URL}/wishlist/remove/${productToToggle._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishlist((p) => p.filter((id) => id !== productToToggle._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          `${API_URL}/wishlist/add`,
          { productId: productToToggle._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishlist((p) => [...p, productToToggle._id]);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist((p) => ({ ...p, [productToToggle._id]: false }));
    }
  };

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/product/${id}`);
        const data = res.data.data;
        setProduct(data);

        if (data.variants?.length > 0) {
          const first = data.variants[0];
          setSelectedColor(first.color);
          if (first.sizes?.length > 0) {
            setSelectedSize(first.sizes[0].size);
          }
        }

        // Fetch recommended products
        fetchRecommended(data.category, data._id);
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, refreshKey]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/review/${id}`);
        const reviewsData = res.data.data?.reviews || res.data.reviews || [];
        setReviews(reviewsData);
      } catch (err) {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id, refreshKey]);

  const fetchRecommended = async (category, productId) => {
    try {
      const res = await axios.get(
        `${API_URL}/product/get?category=${encodeURIComponent(category)}&limit=5`,
      );
      if (res.data.success) {
        const products = res.data.data.filter((p) => p._id !== productId);
        setRecommendedProducts(products.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to load recommendations");
    }
  };

  // Format price with commas for display (no decimals)
  const formatPriceDisplay = (price) => {
    const rounded = Math.round(price);
    return rounded.toLocaleString();
  };

  // Helper functions
  const currentVariant =
    product?.variants?.find((v) => v.color === selectedColor) ||
    product?.variants?.[0];
  const images = currentVariant?.images || [];
  const sizes = currentVariant?.sizes || [];
  const currentSizeObj = sizes.find((s) => s.size === selectedSize);

  const stock = currentSizeObj?.stock || 0;

  const price = currentSizeObj?.sellingPrice || 0;
  const originalPrice = currentSizeObj?.originalPrice || 0;
  const discount = currentSizeObj?.discount || 0;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImage(0);
    const variant = product.variants.find((v) => v.color === color);
    if (variant?.sizes?.length > 0) {
      setSelectedSize(variant.sizes[0].size);
    }
  };

  const refreshReviews = async () => {
    try {
      const [revRes, prodRes] = await Promise.all([
        axios.get(`${API_URL}/review/${id}`),
        axios.get(`${API_URL}/product/${id}`),
      ]);
      setReviews(revRes.data.data?.reviews || revRes.data.reviews || []);
      setProduct(prodRes.data.data);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error("Failed to refresh");
    }
  };

  // Add to cart function
  const addToCart = async () => {
    if (!token) {
      toast.error("Please login to add items to cart");
      document.getElementById("login_modal")?.showModal();
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (stock <= 0) {
      toast.error("This item is out of stock");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/cart/add`,
        {
          productId: product._id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        if (typeof refreshCart === "function") {
          await refreshCart();
        } else {
          setCartCount((c) => c + quantity);
        }
        toast.success("Added to cart!");
      } else {
        throw new Error(response.data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        document.getElementById("login_modal")?.showModal();
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to add to cart. Please try again.");
      }
    }
  };

  const buyNow = () => {
    if (!token) {
      document.getElementById("login_modal")?.showModal();
      return;
    }
    if (!selectedSize || stock <= 0)
      return toast.error("Please select a valid size");

    const orderItem = {
      productId: product._id,
      productName: product.name,
      productImg: images[0],
      color: selectedColor,
      size: selectedSize,
      price: currentSizeObj?.sellingPrice || 0,
      originalPrice: currentSizeObj?.originalPrice || 0,
      discount: currentSizeObj?.discount || 0,
      quantity,
    };
    sessionStorage.setItem("directOrder", JSON.stringify([orderItem]));
    navigate("/checkout");
  };

  const canDelete = (review) => {
    return (
      review.user?._id === currentUserId || review.userId === currentUserId
    );
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600 mb-4">Product not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              <img
                src={images[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-[400px] object-contain"
              />

              {/* Share Button */}
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white">
                <Share2 className="w-4 h-4 text-gray-700" />
              </button>

              {/* Stock Badge */}
              {stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-black/70 px-3 py-1 rounded">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`rounded overflow-hidden border-2 ${selectedImage === i
                      ? "border-black"
                      : "border-transparent hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(product.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900 text-sm ml-1">
                    {product.averageRating?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <span className="text-gray-600 text-sm">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{formatPriceDisplay(price)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-gray-500 line-through text-sm">
                      ₹{formatPriceDisplay(originalPrice)}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-1">
                {stock === 0 ? (
                  <span className="text-red-600 font-medium text-sm">
                    Out of Stock
                  </span>
                ) : stock < 5 ? (
                  <span className="text-orange-600 font-medium text-sm">
                    Only {stock} left
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                    <Check className="w-3.5 h-3.5" />
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium text-gray-900 mb-1.5 text-sm">
                Description
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.description ||
                  "Premium product with exceptional quality and craftsmanship."}
              </p>
            </div>

            {/* Color Selection */}
            {product.variants?.length > 1 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1.5 text-sm">
                  Color:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedColor}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => handleColorChange(v.color)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${v.color === selectedColor
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1.5 text-sm">
                  Size:{" "}
                  <span className="font-normal text-gray-600">
                    {selectedSize}
                  </span>
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {sizes.map((s) => {
                    const outOfStock = s.stock <= 0;
                    return (
                      <button
                        key={s.size}
                        onClick={() => !outOfStock && setSelectedSize(s.size)}
                        disabled={outOfStock}
                        className={`py-1.5 rounded text-xs font-medium transition ${s.size === selectedSize && !outOfStock
                          ? "bg-black text-white"
                          : outOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-3 pt-2">
              {/* Quantity */}
              <div>
                <h3 className="font-medium text-gray-900 mb-1.5 text-sm">
                  Quantity
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-100 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-2.5 py-1 text-gray-600 hover:text-black disabled:text-gray-400"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-medium text-black text-sm min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      disabled={quantity >= stock}
                      className="px-2.5 py-1 text-gray-600 hover:text-black disabled:text-gray-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-gray-500 text-xs">
                    Max: {stock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={addToCart}
                  disabled={!selectedSize || stock === 0}
                  className="flex-1 bg-black text-white py-2.5 rounded font-medium hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={buyNow}
                  disabled={!selectedSize || stock === 0}
                  className="flex-1 bg-gray-900 text-white py-2.5 rounded font-medium hover:bg-black transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t">
              {[
                {
                  icon: Truck,
                  title: "Free Shipping",
                  desc: "Orders above ₹999",
                },
                { icon: Shield, title: "Secure", desc: "Payment" },
                { icon: RotateCcw, title: "Returns", desc: "15 Days" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center p-2 bg-gray-50 rounded border border-gray-100"
                >
                  <item.icon className="w-4 h-4 mx-auto mb-1 text-gray-700" />
                  <div className="font-medium text-gray-900 text-xs">
                    {item.title}
                  </div>
                  <div className="text-gray-500 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Customer Reviews
              </h2>
              <p className="text-gray-600 text-sm">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>

            {token ? (
              <button
                onClick={() =>
                  document.getElementById("my_modal_8")?.showModal()
                }
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition text-sm"
              >
                Write a Review
              </button>
            ) : (
              <button
                onClick={() =>
                  document.getElementById("login_modal")?.showModal()
                }
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded font-medium hover:bg-gray-200 transition text-sm"
              >
                Login to Review
              </button>
            )}
          </div>

          {token && <Review id={id} onSuccess={refreshReviews} />}

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded">
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="font-medium text-xs text-black">
                            {(review.user?.username?.[0] || "U").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <div className="font-medium text-sm text-black">
                              {review.user?.username || "User"}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-400 text-xs">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mt-1.5">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>

                    {canDelete(review) && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this review?")) {
                            axios
                              .delete(
                                `${API_URL}/review/${review._id}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              )
                              .then(() => refreshReviews());
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-xs ml-2 flex-shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                You Might Also Like
              </h2>
              <button
                onClick={() => navigate("/products")}
                className="text-sm font-medium text-gray-600 hover:text-black hover:underline"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendedProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  wishlist={wishlist}
                  addingToWishlist={addingToWishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
