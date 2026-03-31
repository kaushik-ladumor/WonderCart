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
  ThumbsUp,
  Flag,
  X,
  Zap,
  ChevronRight
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

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [activeTab, setActiveTab] = useState("description");

  const [starFilter, setStarFilter] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedReviewImage, setSelectedReviewImage] = useState(null);
  const [activeDeal, setActiveDeal] = useState(null);

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


  const handleHelpful = async (reviewId) => {
    try {
      await axios.post(`${API_URL}/review/helpful/${reviewId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshReviews();
    } catch (err) {
      toast.error("Error updating helpful count");
    }
  };

  const handleReport = async (reviewId) => {
    try {
      await axios.post(`${API_URL}/review/report/${reviewId}`, { reason: "Policy Violation" }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Review reported for moderation");
    } catch (err) {
      toast.error("Error reporting review");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, dealRes] = await Promise.all([
          axios.get(`${API_URL}/product/${id}`),
          axios.get(`${API_URL}/api/deals?productId=${id}&status=live`)
        ]);
        const data = prodRes.data.data;
        setProduct(data);

        const liveDeals = dealRes.data.data || [];
        if (liveDeals.length > 0) {
          setActiveDeal(liveDeals[0]);
        }

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

  const formatPriceDisplay = (price) => {
    const rounded = Math.round(price);
    return rounded.toLocaleString();
  };

  const currentVariant =
    product?.variants?.find((v) => v.color === selectedColor) ||
    product?.variants?.[0];
  const images = currentVariant?.images || [];
  const sizes = currentVariant?.sizes || [];
  const currentSizeObj = sizes.find((s) => s.size === selectedSize);

  const stock = currentSizeObj?.stock || 0;

  // Logic to determine display price (favoring active deal)
  const isDealActive = !!activeDeal;
  const displayPrice = isDealActive ? activeDeal.dealPrice : (currentSizeObj?.sellingPrice || 0);
  const displayOriginalPrice = isDealActive ? activeDeal.originalPrice : (currentSizeObj?.originalPrice || 0);
  const displayDiscount = isDealActive ? activeDeal.discountPercent : (currentSizeObj?.discount || 0);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setActiveImage(0);
    const variant = product.variants.find((v) => v.color === color);
    let newSize = "";
    let newStock = 0;

    if (variant?.sizes?.length > 0) {
      newSize = variant.sizes[0].size;
      newStock = variant.sizes[0].stock || 0;
      setSelectedSize(newSize);
    }
    setQuantity(newStock > 0 ? 1 : 0);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const variant = product.variants.find((v) => v.color === selectedColor);
    const sizeObj = variant?.sizes?.find((s) => s.size === size);
    const newStock = sizeObj?.stock || 0;
    setQuantity(newStock > 0 ? 1 : 0);
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
            className="px-5 py-2.5 bg-black text-white rounded font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-2 font-body text-[#141b2d]">

      {/* Breadcrumb */}
      <nav className="text-[11px] text-[#868fa0] flex items-center gap-2 mb-6 uppercase tracking-wider">
        <button onClick={() => navigate("/")} className="hover:text-[#141b2d]">Home</button>
        <span className="text-[#d1d5db]">›</span>
        <button onClick={() => navigate("/shop")} className="hover:text-[#141b2d]">Shop</button>
        <span className="text-[#d1d5db]">›</span>
        <span className="hover:text-[#141b2d]">{product.category || "General"}</span>
        <span className="text-[#d1d5db]">›</span>
        <span className="text-[#141b2d] font-semibold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-start">

        {/* Left Column: Image Gallery */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Vertical Thumbnails */}
          <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-full aspect-square bg-[#f3f4f6] rounded-lg overflow-hidden border-2 ${activeImage === i ? "border-[#141b2d]" : "border-transparent"
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image Container */}
          <div className="flex-1 bg-[#f9fafb] rounded-[24px] aspect-[4/4] flex items-center justify-center relative overflow-hidden">
            <img
              src={images[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-contain p-10"
            />
            {displayDiscount > 0 && (
              <div className="absolute top-6 left-6 bg-[#004ac6] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                {displayDiscount}% OFF
              </div>
            )}
            <button className="absolute top-6 right-6 p-2.5 bg-white rounded-full shadow-sm text-[#5c6880] hover:text-[#141b2d]">
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Mobile Thumbnails */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 aspect-square bg-[#f3f4f6] rounded-lg border-2 shrink-0 ${activeImage === i ? "border-[#141b2d]" : "border-transparent"
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col lg:pr-4">
          <div className="mb-3">
            <span className="inline-block bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide mb-3">
              New Arrival
            </span>
            <h1 className="text-2xl sm:text-[2.2rem] font-semibold leading-[1.2] lg:leading-[1.1] mb-2 text-[#141b2d] tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.average_rating || 0) ? "text-orange-400 fill-orange-400" : "text-[#e5e7eb] fill-[#e5e7eb]"}`} />
                ))}
              </div>
              <span className="text-[12px] text-[#6b7280] font-medium leading-none mt-0.5">
                {product.average_rating || 0} ({product.total_reviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#141b2d]">
                <span className="text-xl font-medium mr-1">₹</span>{formatPriceDisplay(displayPrice)}
              </span>
              {displayOriginalPrice > displayPrice && (
                <span className="text-lg line-through text-[#9ca3af] font-medium">
                  ₹{formatPriceDisplay(displayOriginalPrice)}
                </span>
              )}
              {isDealActive && (
                <div className="bg-[#fef2f2] text-[#e63946] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest flex items-center gap-1 border border-[#fee2e2]">
                   <Zap className="w-3 h-3 fill-current" />
                   Deal Active
                </div>
              )}
            </div>
            <p className="text-sm text-[#4b5563] leading-relaxed max-w-[500px]">
              {product.description || "Designed for the modern home, this piece blends Scandinavian simplicity with ergonomic support."}
            </p>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-[#141b2d] mb-3">Finish</p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => handleColorChange(v.color)}
                    style={{ backgroundColor: v.color.toLowerCase() }}
                    className={`w-7 h-7 rounded-full border-2 p-0.5 transition-shadow ${v.color === selectedColor ? "border-[#141b2d] ring-1 ring-[#141b2d]" : "border-transparent shadow-sm"
                      }`}
                    title={v.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-[#141b2d] mb-3">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => s.stock > 0 && handleSizeChange(s.size)}
                    disabled={s.stock <= 0}
                    className={`px-5 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide flex items-center justify-center transition-colors ${s.size === selectedSize
                      ? "bg-[#2563eb] text-white"
                      : s.stock <= 0
                        ? "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                        : "bg-[#f3f4f6] text-[#141b2d] hover:bg-[#e5e7eb]"
                      }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center bg-[#f9fafb] border border-[#f1f5f9] rounded-2xl px-3 py-1.5 h-12 shadow-inner">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#141b2d] hover:bg-white rounded-xl transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-[#141b2d]">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => Math.min(stock, prev + 1))}
                className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#141b2d] hover:bg-white rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                {stock > 0 ? `${stock} units in stock` : "Out of Stock"}
              </span>
            </div>
          </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={addToCart}
                disabled={!selectedSize || stock <= 0}
                className="w-full bg-[#1f2937] text-white font-bold rounded-xl py-4 text-[13px] uppercase tracking-wider disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                onClick={buyNow}
                disabled={!selectedSize || stock <= 0}
                className="w-full bg-[#2563eb] text-white font-bold rounded-xl py-4 text-[13px] uppercase tracking-wider disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            {/* Seller Info */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group cursor-pointer hover:border-[#2563eb]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-200 p-1 flex items-center justify-center">
                    <img 
                      src={product.seller?.shopLogo || "https://cdn-icons-png.flaticon.com/512/3225/3225191.png"} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#141b2d]">{product.seller?.shopName || "Aura Seller"}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(product.seller?.average_rating || 0) ? "text-emerald-500 fill-emerald-500" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        Seller Rating: {product.seller?.average_rating || 0} ({product.seller?.total_reviews || 0})
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2563eb] transition-all" />
              </div>
            </div>
          </div>
        </div>

      {/* Tabs Section */}
      <div className="mt-16 sm:mt-20 border-b border-[#e5e7eb]">
        <div className="flex gap-6 sm:gap-10 overflow-x-auto scrollbar-hide">
          {["description", "specifications", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[11px] font-bold uppercase tracking-widest relative whitespace-nowrap ${activeTab === tab ? "text-[#2563eb]" : "text-[#9ca3af]"
                }`}
            >
              {tab === "reviews" ? `Customer Reviews` : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563eb]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="py-12 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
        <div>
          {activeTab === "description" && (
            <div className="space-y-8 animate-in fade-in">
              <div className="max-w-2xl">
                <h3 className="text-xl font-bold mb-4">The {product.name} Experience</h3>
                <p className="text-[#4b5563] text-sm leading-relaxed mb-6">
                  {product.description || "The Aura Minimalist Armchair isn't just a piece of furniture; it's a statement of intentional living. Every curve is mathematically designed to support the lumbar spine, while the wide seating area allows for versatile lounging positions."}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-bold">Sustainably Sourced</h4>
                      <p className="text-[12px] text-[#6b7280]">FSC-certified solid oak frame with natural wax finish.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-[13px] font-bold">Premium Linen</h4>
                      <p className="text-[12px] text-[#6b7280]">High rub count linen upholstery that is stain resistant and breathable.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "specifications" && (
            <div className="max-w-xl animate-in fade-in">
              <h3 className="text-xl font-bold mb-6">Product Specifications</h3>
              <div className="space-y-4">
                {[
                  { label: "Material", value: "Solid Oak, Linen" },
                  { label: "Weight Capacity", value: "150 kg" },
                  { label: "Dimensions", value: "85 x 75 x 75 cm" },
                  { label: "Assembly", value: "Partial Assembly Required" },
                  { label: "Warranty", value: "2 Year Limited" }
                ].map((spec) => (
                  <div key={spec.label} className="flex justify-between py-3 border-b border-[#f3f4f6]">
                    <span className="text-[13px] font-medium text-[#6b7280]">{spec.label}</span>
                    <span className="text-[13px] font-bold text-[#141b2d]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="animate-in fade-in duration-500">
              {/* Rating Summary & Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16 items-start">
                <div className="bg-[#f8fafc] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-[#f1f5f9] text-center shadow-sm">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94a3b8] mb-4">Product Experience</h4>
                  <div className="flex flex-col items-center">
                    <span className="text-6xl font-extrabold text-[#141b2d] tracking-tighter mb-2">{product.average_rating || 0}</span>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(product.average_rating || 0) ? "text-[#2563eb] fill-[#2563eb]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#64748b]">Based on {product.total_reviews || 0} reviews</span>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4 py-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const percent = product.total_reviews > 0 ? (count / product.total_reviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4 group cursor-pointer" onClick={() => setStarFilter(starFilter === star ? null : star)}>
                        <span className="text-[11px] font-bold text-[#64748b] w-12 flex items-center gap-1.5 group-hover:text-[#2563eb] transition-colors">
                          {star} <Star className="w-2.5 h-2.5 fill-current" />
                        </span>
                        <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#141b2d] group-hover:bg-[#2563eb] transition-all duration-700 ease-out rounded-full" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#94a3b8] w-8 text-right group-hover:text-[#141b2d]">{Math.round(percent)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap justify-between items-center gap-6 mb-10 pb-6 border-b border-[#f1f5f9]">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStarFilter(null)}
                    className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${!starFilter ? "bg-[#141b2d] text-white shadow-lg shadow-black/10" : "bg-white text-[#64748b] border border-[#f1f5f9] hover:border-[#141b2d]"}`}
                  >
                    All Reviews
                  </button>
                  {[5, 4, 3, 2, 1].map(s => (
                    <button 
                      key={s}
                      onClick={() => setStarFilter(s)}
                      className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${starFilter === s ? "bg-[#2563eb] text-white shadow-lg shadow-blue-200" : "bg-white text-[#64748b] border border-[#f1f5f9] hover:border-[#2563eb]"}`}
                    >
                      {s} <Star className={`w-3 h-3 ${starFilter === s ? "fill-white" : ""}`} />
                    </button>
                  ))}
                </div>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-[#141b2d] focus:outline-none cursor-pointer border-b-2 border-[#141b2d] pb-1"
                >
                  <option value="latest">Latest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>

              {/* Reviews List */}
              <div className="grid grid-cols-1 gap-8">
                {reviews
                  .filter(r => !starFilter || r.rating === starFilter)
                  .sort((a, b) => {
                    if (sortBy === "highest") return b.rating - a.rating;
                    if (sortBy === "lowest") return a.rating - b.rating;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                  })
                  .map((rev) => (
                  <div key={rev._id} className="p-8 bg-white border border-[#f1f5f9] rounded-[2rem] hover:shadow-xl hover:shadow-blue-900/[0.02] transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center text-sm font-bold text-[#141b2d] group-hover:bg-[#141b2d] group-hover:text-white transition-all">
                          {rev.user?.username?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#141b2d]">{rev.user?.username || "Verified Person"}</p>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-500 bg-emerald-50 rounded-full p-0.5" />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Verified Purchase</span>
                            <span className="text-[#e2e8f0] mx-1">•</span>
                            <span className="text-[10px] font-bold text-[#94a3b8] uppercase">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "text-[#2563eb] fill-[#2563eb]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`} />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#141b2d] font-bold mb-2">
                      {rev.rating === 5 ? "Exceptional quality" : rev.rating >= 4 ? "Very satisfied" : rev.rating >= 3 ? "Meets expectations" : "Could be better"}
                    </p>
                    <p className="text-[13px] text-[#64748b] leading-8 mb-6">{rev.comment}</p>

                    {/* Review Photos */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-3 mb-8">
                        {rev.images.map((img, idx) => (
                          <div key={idx} className="w-20 h-20 rounded-2xl overflow-hidden border border-[#f1f5f9] cursor-zoom-in hover:brightness-95 transition-all shadow-sm" onClick={() => setSelectedReviewImage(img)}>
                            <img src={img} alt="Review" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-6 pt-6 border-t border-[#f8fafc]">
                      <button 
                        onClick={() => handleHelpful(rev._id)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#64748b] hover:text-[#2563eb] transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Helpful ({rev.helpful_count || 0})
                      </button>
                      <button 
                        onClick={() => handleReport(rev._id)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#64748b] hover:text-red-500 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report
                      </button>
                    </div>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center text-[#e2e8f0] mx-auto mb-6">
                      <Star className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-[#64748b]">No reviews yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Lightbox Modal */}
          {selectedReviewImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 animate-in fade-in" onClick={() => setSelectedReviewImage(null)}>
              <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform">
                <X className="w-8 h-8" />
              </button>
              <img src={selectedReviewImage} alt="Fullscreen Review" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" />
            </div>
          )}
        </div>

        {/* Technical Details Sidebar (if description tab is active) */}
        {activeTab === "description" && (
          <div className="bg-[#f8fafc] rounded-2xl p-8 h-fit self-start border border-[#f1f5f9]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-6">Technical Details</h4>
            <div className="space-y-5">
              {[
                { label: "Material", value: "Solid Oak, Linen" },
                { label: "Weight Capacity", value: "150 kg" },
                { label: "Dimensions", value: "85 x 75 x 75 cm" },
                { label: "Assembly", value: "Partial Assembly Required" }
              ].map((item) => (
                <div key={item.label} className="grid grid-cols-[1fr_1.5fr] items-center">
                  <span className="text-[12px] text-[#64748b] font-medium">{item.label}</span>
                  <span className="text-[12px] text-[#141b2d] font-bold text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Section */}
      {recommendedProducts.length > 0 && (
        <section className="mt-16 sm:mt-20">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#141b2d] tracking-tight">Complement Your Space</h2>
              <p className="text-[13px] sm:text-sm text-[#6b7280] mt-1">Items that pair perfectly with the {product.name}</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:border-[#141b2d] hover:text-[#141b2d]">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
              <button className="w-10 h-10 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:border-[#141b2d] hover:text-[#141b2d]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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



      {/* Lightbox Modal */}
      {selectedReviewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 transition-all" onClick={() => setSelectedReviewImage(null)}>
          <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform">
            <X className="w-8 h-8" />
          </button>
          <img src={selectedReviewImage} alt="Fullscreen Review" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-500" />
        </div>
      )}
      
      <Review 
        id={id} 
        productName={product.name} 
        productImage={product.images?.[0]}
        orderItemId={null} // Not needed here as it's for display
        onSuccess={refreshReviews} 
      />
    </div>
  );
};

export default ProductDetail;
