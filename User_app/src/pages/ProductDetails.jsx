import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Review from "./Review";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
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
  ChevronRight,
} from "lucide-react";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

const ProductDetail = () => {
  const { setCartCount, refreshCart } = useCart();
  const socket = useSocket();
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState(null);

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

  useEffect(() => {
    if (!socket || !id) return;

    const handleStockUpdate = (data) => {
      if (data.productId === id) {
        console.log("📈 Real-time stock update:", data);
        setProduct((prev) => {
          if (!prev) return prev;
          const updatedVariants = prev.variants.map((v) => {
            const dataVariant = data.variants.find((dv) => dv.color === v.color);
            if (dataVariant) {
              const updatedSizes = v.sizes.map((s) => {
                const dataSize = dataVariant.sizes.find((ds) => ds.size === s.size);
                return dataSize ? { ...s, stock: dataSize.stock } : s;
              });
              return { ...v, sizes: updatedSizes };
            }
            return v;
          });
          return { ...prev, variants: updatedVariants };
        });
      }
    };

    const handlePriceChange = (data) => {
      if (data.productId === id) {
        console.log("💰 Real-time price change:", data);
        toast.success("Product price has been updated!");
        setProduct((prev) => {
          if (!prev) return prev;
          const updatedVariants = prev.variants.map((v) => {
            const dataVariant = data.variants.find((dv) => dv.color === v.color);
            if (dataVariant) {
              const updatedSizes = v.sizes.map((s) => {
                const dataSize = dataVariant.sizes.find((ds) => ds.size === s.size);
                return dataSize ? { ...s, sellingPrice: dataSize.sellingPrice, originalPrice: dataSize.originalPrice } : s;
              });
              return { ...v, sizes: updatedSizes };
            }
            return v;
          });
          return { ...prev, variants: updatedVariants };
        });
      }
    };

    socket.on("stock-update", handleStockUpdate);
    socket.on("price-change", handlePriceChange);

    return () => {
      socket.off("stock-update", handleStockUpdate);
      socket.off("price-change", handlePriceChange);
    };
  }, [socket, id]);

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
      await axios.post(
        `${API_URL}/review/helpful/${reviewId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      refreshReviews();
    } catch (err) {
      toast.error("Error updating helpful count");
    }
  };

  const handleReport = async (reviewId) => {
    try {
      await axios.post(
        `${API_URL}/review/report/${reviewId}`,
        { reason: "Policy Violation" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
          axios.get(`${API_URL}/api/deals?productId=${id}&status=live`),
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
        
        // Sync stats to product state to ensure UI is up to date
        if (res.data.data?.reviewCount !== undefined) {
          setProduct(prev => ({
            ...prev,
            reviewCount: res.data.data.reviewCount,
            ratingAverage: res.data.data.ratingAverage
          }));
        }
      } catch (err) {
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id, refreshKey]);

  // Check review eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (!token || !id) return;
      try {
        // We need an orderItemId to review, but on product page we check if user BOUGHT it ever.
        // For simplicity, we'll look for any delivered sub-order item for this product that isn't reviewed.
        const res = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const orders = res.data.orders || [];
        for (const order of orders) {
          for (const subOrder of (order.subOrders || [])) {
            if (subOrder.status === 'delivered') {
               const item = subOrder.items.find(i => String(i.productId._id || i.productId) === String(id));
               if (item) {
                 // Check if already reviewed
                 const revCheck = await axios.get(`${API_URL}/review/check-eligibility?productId=${id}&orderItemId=${item._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                 });
                 if (revCheck.data.eligible) {
                    setIsEligible(true);
                    setEligibleOrderId(item._id);
                    return;
                 }
               }
            }
          }
        }
      } catch (err) {
        console.error("Eligibility check failed", err);
      }
    };
    checkEligibility();
  }, [id, token, refreshKey]);

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
  const displayPrice = isDealActive
    ? activeDeal.dealPrice
    : currentSizeObj?.sellingPrice || 0;
  const displayOriginalPrice = isDealActive
    ? activeDeal.originalPrice
    : currentSizeObj?.originalPrice || 0;
  const displayDiscount = isDealActive
    ? activeDeal.discountPercent
    : currentSizeObj?.discount || 0;

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
          <h1 className="text-[0.9rem] font-semibold text-gray-900 mb-2">404</h1>
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
    <div className="max-w-[1400px] mx-auto px-4 py-4 font-body text-on-surface bg-background">
      {/* Breadcrumb Removed */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-10">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Vertical Thumbnails */}
          <div className="flex md:flex-col gap-3 w-full md:w-24 shrink-0 overflow-x-auto md:overflow-visible scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 md:w-full aspect-square bg-[#f8fafc] rounded-xl overflow-hidden border-2 shrink-0 ${activeImage === i ? "border-primary" : "border-[#d7dcea]"
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain p-2" />
              </button>
            ))}
          </div>

          {/* Main Image Container */}
          <div className="flex-1 bg-[#b2d8d8]/20 rounded-[18px] aspect-square flex items-center justify-center relative overflow-hidden group">
            <img
              src={images[activeImage] || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply p-4"
            />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col lg:pl-8">
          <div className="mb-8">

            <h1 className="text-[1.5rem] sm:text-[1.75rem] font-semibold leading-[1.2] mb-4 text-[#11182d] tracking-tight">
              {product.name}
            </h1>
            <button
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4.5 h-4.5 ${i < Math.round(product.ratingAverage || 0) ? "text-orange-400 fill-orange-400" : "text-gray-200 fill-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-[0.78rem] text-[#6d7892] font-semibold uppercase tracking-wider group-hover:text-[#0f49d7] transition-colors">
                ({product.reviewCount || 0} REVIEWS)
              </span>
            </button>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap items-baseline gap-4 mb-5">
              <span className="text-[1.5rem] font-semibold text-[#11182d] tracking-tight">
                <span className="text-[1.1rem] font-medium mr-1">₹</span>
                {formatPriceDisplay(displayPrice)}
              </span>
              {displayOriginalPrice > displayPrice && (
                <>
                  <span className="text-[1.1rem] line-through text-[#6d7892] font-medium">
                    ₹{formatPriceDisplay(displayOriginalPrice)}
                  </span>
                  <span className="text-tertiary font-semibold text-[0.74rem] bg-tertiary-container px-2.5 py-1 rounded-lg">
                    {displayDiscount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[0.82rem] text-[#33415e] leading-relaxed max-w-[520px]">
              {product.description}
            </p>
          </div>

          {/* Shop/Seller Info Section */}
          {product.seller && (
            <div className="mb-10 p-5 bg-[#f8fafc] rounded-2xl border border-[#edf2f7] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border border-[#e2e8f0] p-1.5 overflow-hidden shadow-sm flex items-center justify-center">
                  {product.seller.shopLogo ? (
                    <img
                      src={product.seller.shopLogo}
                      alt={product.seller.shopName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-2xl" 
                    style={{ display: product.seller.shopLogo ? 'none' : 'block' }}
                  >
                    🏪
                  </span>
                </div>
                <div>
                  <h4 className="text-[0.88rem] font-bold text-[#11182d]">{product.seller.shopName || "WonderCart Seller"}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-400/10 rounded-md">
                      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                      <span className="text-[11px] font-bold text-orange-400">{(product.seller.average_rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#6d7892] uppercase tracking-wider">
                      ({product.seller.total_reviews || 0} SHOP REVIEWS)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/shop?seller=${product.owner}`)}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[0.7rem] font-bold text-[#0f49d7] uppercase tracking-widest shadow-sm"
              >
                Visit Store
              </button>
            </div>
          )}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-8 p-1">
              <p className="text-[10px] font-medium text-[#6d7892] mb-3 uppercase tracking-[0.16em] px-1">
                COLOR SELECTION
              </p>
              <div className="flex flex-wrap gap-4">
                {product.variants.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => handleColorChange(v.color)}
                    style={{ backgroundColor: v.color.toLowerCase() }}
                    className={`w-9 h-9 rounded-full border-2 ${v.color === selectedColor
                      ? "border-primary"
                      : "border-[#d7dcea]"
                      }`}
                    title={v.color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-10">
              <p className="text-[10px] font-medium text-[#6d7892] mb-3 uppercase tracking-[0.16em]">
                SIZE OPTION
              </p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => s.stock > 0 && handleSizeChange(s.size)}
                    disabled={s.stock <= 0}
                    className={`px-8 py-3 rounded-xl text-[0.82rem] font-semibold border-2 ${s.size === selectedSize
                      ? "bg-primary border-primary text-white"
                      : s.stock <= 0
                        ? "bg-surface-low border-transparent text-on-surface-variant opacity-50 cursor-not-allowed"
                        : "bg-background border-[#d7dcea] text-[#11182d]"
                      }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {stock > 0 && (
            <div className="mb-8">
              <p className="text-[10px] font-medium text-[#6d7892] mb-3 uppercase tracking-[0.16em] px-1">
                SELECT QUANTITY
              </p>
              <div className="flex items-center border border-[#d7dcea] rounded-[14px] w-fit overflow-hidden bg-white shadow-sm mt-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#42506d] hover:bg-[#f8f9fc] hover:text-[#0f49d7] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-[0.85rem] font-semibold text-[#11182d]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#42506d] hover:bg-[#f8f9fc] hover:text-[#0f49d7] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-8 flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary">
            </div>
            <span className="text-[10px] font-semibold text-tertiary uppercase tracking-[0.16em]">
              {stock > 0 ? `${stock} UNITS IN STOCK` : "OUT OF STOCK"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-4 mb-4">
            <button
              onClick={addToCart}
              disabled={!selectedSize || stock <= 0}
              className="flex-1 bg-[#1e293b] text-white font-semibold rounded-2xl py-5 flex items-center justify-center gap-3 disabled:opacity-50 tracking-wider text-[0.82rem]"
            >
              <ShoppingCart className="w-5 h-5" />
              ADD TO CART
            </button>
            <button
              onClick={buyNow}
              disabled={!selectedSize || stock <= 0}
              className="flex-1 bg-primary text-white font-semibold rounded-2xl py-5 disabled:opacity-50 tracking-wider text-[0.82rem]"
            >
              BUY NOW
            </button>
          </div>


        </div>
      </div>

      <div id="reviews-section" className="py-16 border-t border-[#d7dcea] mt-10">
        <div className="w-full">
          <div className="">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-[1.25rem] font-semibold text-[#11182d] tracking-tight">Customer Feedbacks ({reviews.length})</h3>
              {isEligible && (
                <button 
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-6 py-2.5 bg-[#0f49d7] text-white rounded-xl text-[0.74rem] font-bold uppercase tracking-widest shadow-md hover:bg-[#0d3ebb] transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>
            
            {/* Rating Summary & Breakdown */}
            <div className="max-w-4xl mx-auto mb-16 bg-[#f8fafc] rounded-[32px] p-8 sm:p-12 border border-[#f1f5f9] flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="text-center shrink-0">
                <div className="flex items-baseline justify-center gap-1.5 mb-2">
                  <span className="text-6xl font-bold text-[#11182d] tracking-tighter">{(product.ratingAverage || 0).toFixed(1)}</span>
                  <span className="text-[1.1rem] font-bold text-[#6d7892] opacity-40">/ 5.0</span>
                </div>
                <div className="flex gap-1.5 justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(product.ratingAverage || 0) ? "text-[#ff9c07] fill-[#ff9c07]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`}
                    />
                  ))}
                </div>
                <p className="text-[0.78rem] font-bold text-[#6d7892] uppercase tracking-widest mb-6">Based on {product.reviewCount || 0} reviews</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ecfdf5] rounded-full border border-[#d1fae5]">
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[9px] font-bold text-[#10b981] uppercase tracking-wider">Verified Authentic</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const percent = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-5 group">
                      <span className="text-[0.82rem] font-bold text-[#11182d] w-3">{star}</span>
                      <div className="flex-1 h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0f49d7]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[0.82rem] font-bold text-[#6d7892] w-8 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[24px] border border-dashed border-[#d7dcea]">
                <div className="w-12 h-12 bg-[#f8faff] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-[#94a3b8]" />
                </div>
                <h4 className="text-[1rem] font-semibold text-[#11182d]">No reviews yet</h4>
                <p className="text-[0.82rem] text-[#6d7892] mt-1">Be the first to share your thoughts about this product.</p>
              </div>
            ) : (
              <>
                {/* Filters & Sorting */}
                <div className="flex flex-wrap justify-between items-center gap-6 mb-12 pb-6 border-b border-[#d7dcea]">
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setStarFilter(null)}
                      className={`px-6 py-2.5 rounded-xl text-[0.74rem] font-semibold border-2 ${!starFilter ? "bg-[#11182d] border-[#11182d] text-white" : "bg-white border-[#d7dcea] text-[#6d7892]"}`}
                    >
                      All Reviews
                    </button>
                    {[5, 4, 3, 2, 1].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStarFilter(s)}
                        className={`px-5 py-2.5 rounded-xl text-[0.74rem] font-semibold flex items-center gap-2 border-2 ${starFilter === s ? "bg-[#0f49d7] border-[#0f49d7] text-white" : "bg-white border-[#d7dcea] text-[#6d7892]"}`}
                      >
                        {s} <Star className={`w-3.5 h-3.5 ${starFilter === s ? "fill-white" : ""}`} />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-semibold text-[#6d7892] uppercase tracking-widest">SORT BY:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-[0.78rem] font-semibold text-[#11182d] focus:outline-none cursor-pointer border-b-2 border-[#0f49d7] pb-1"
                    >
                      <option value="latest">Latest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {reviews
                    .filter((r) => !starFilter || r.rating === starFilter)
                    .sort((a, b) => {
                      if (sortBy === "highest") return b.rating - a.rating;
                      if (sortBy === "lowest") return a.rating - b.rating;
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    })
                    .map((rev) => (
                      <div
                        key={rev._id}
                        className="group bg-[#f8fafc] border border-[#d7dcea] rounded-3xl p-6 flex flex-col h-full"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#d7dcea] flex items-center justify-center text-[0.8rem] font-semibold text-[#0f49d7] shrink-0">
                              {rev.user?.username?.[0]?.toUpperCase() || rev.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-[0.82rem] font-bold text-[#11182d] line-clamp-1">
                                {rev.user?.username || rev.user?.name || "Anonymous"}
                              </p>
                              <p className="text-[9px] font-semibold text-[#6d7892] uppercase">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < rev.rating ? "text-orange-400 fill-orange-400" : "text-gray-200 fill-gray-200"}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="text-[0.82rem] text-[#6d7892] leading-relaxed mb-4 line-clamp-4">
                            {rev.comment}
                          </p>

                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-2 mb-2">
                              {rev.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="w-16 h-16 rounded-xl overflow-hidden border border-[#d7dcea] cursor-zoom-in shrink-0"
                                  onClick={() => setSelectedReviewImage(img)}
                                >
                                  <img src={img} alt="Review" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {recommendedProducts.length > 0 && (
        <section className="mt-10 sm:mt-16 pt-16 border-t border-[#d7dcea]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
            <div className="flex-1 pr-4">
              <h2 className="text-[1.5rem] font-semibold text-[#11182d] tracking-tight font-display leading-tight">
                Recommended Products
              </h2>
              <p className="text-[0.82rem] text-[#6d7892] mt-1.5 leading-relaxed">
                Curated items from our collection you might love
              </p>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="text-[0.78rem] font-semibold text-[#0f49d7] uppercase tracking-widest whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/95"
          onClick={() => setSelectedReviewImage(null)}
        >
          <button className="absolute top-10 right-10 text-white p-2">
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedReviewImage}
            alt="Fullscreen"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      <Review
        id={id}
        productName={product.name}
        productImage={images[0]}
        orderItemId={eligibleOrderId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          setIsReviewModalOpen(false);
          setIsEligible(false);
          refreshReviews();
        }}
      />
    </div>
  );
};

export default ProductDetail;
