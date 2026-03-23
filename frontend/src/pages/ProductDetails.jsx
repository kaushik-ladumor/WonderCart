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
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
      <div className="relative z-10 font-body">

        {/* Breadcrumb */}
        <nav className="text-xs text-[#5c6880] flex items-center gap-1.5 mb-4">
          <button onClick={() => navigate("/")} className="hover:text-[#004ac6]">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/shop")} className="hover:text-[#004ac6] font-medium">{product.category || "Shop"}</button>
          <span>/</span>
          <span className="text-[#141b2d] font-semibold truncate max-w-[150px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="bg-[#f0f4ff] rounded-2xl aspect-[4/3] flex items-center justify-center p-8 relative overflow-hidden group">
              <img
                src={images[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
              />

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="bg-[#004ac6] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full absolute top-4 left-4">
                  -{discount}% OFF
                </div>
              )}

              {/* Share Button */}
              <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-[#5c6880] hover:text-[#004ac6] transition-all shadow-sm">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 bg-[#f0f4ff] rounded-xl flex items-center justify-center p-2 cursor-pointer transition-all shrink-0 ${selectedImage === i ? "ring-2 ring-[#004ac6] bg-white" : "hover:bg-white/50"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.averageRating || 4.5) ? "text-[#004ac6] fill-[#004ac6]" : "text-[#e1e8fd]"}`} />
                ))}
              </div>
              <span className="text-[10px] text-[#5c6880] font-medium uppercase tracking-widest">({reviews.length} Stories)</span>
            </div>

            <h1 className="font-display text-3xl font-bold text-[#141b2d] leading-tight mb-2">
              {product.name}
            </h1>

            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-widest text-[#5c6880] font-semibold mb-1">Settlement</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-[#141b2d]">
                  <span className="font-normal text-[#5c6880] text-xl mr-1">₹</span>{formatPriceDisplay(price)}
                </span>
                {discount > 0 && (
                  <span className="text-sm line-through text-[#5c6880]">
                    ₹{formatPriceDisplay(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-widest text-[#5c6880] font-semibold mb-1">Curator's Note</p>
              <p className="text-sm text-[#5c6880] leading-relaxed line-clamp-4">
                {product.description || "An exquisite artifact meticulously crafted for the modern individual."}
              </p>
            </div>

            {/* Selection Sections - MT-4 per spec */}
            {product.variants?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-[#5c6880] font-semibold mb-2">Palette Preference</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => handleColorChange(v.color)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${v.color === selectedColor
                        ? "bg-[#141b2d] text-white border-[#141b2d] shadow-sm"
                        : "bg-white border-[#f0f4ff] text-[#141b2d] hover:border-[#004ac6]"
                        }`}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-[#5c6880] font-semibold mb-2">Dimension Selection</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => s.stock > 0 && handleSizeChange(s.size)}
                      disabled={s.stock <= 0}
                      className={`w-10 h-10 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center ${s.size === selectedSize
                        ? "bg-[#004ac6] text-white border-[#004ac6]"
                        : s.stock <= 0
                          ? "bg-[#f9f9ff] text-[#e1e8fd] border-[#f0f4ff] cursor-not-allowed"
                          : "bg-white border-[#f0f4ff] text-[#141b2d] hover:border-[#004ac6]"
                        }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#5c6880] font-semibold mb-2">Volume</p>
                <div className="flex items-center gap-4 bg-[#f0f4ff] rounded-xl px-4 py-2 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="text-[#141b2d] disabled:opacity-20"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-[#141b2d]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    className="text-[#141b2d] disabled:opacity-20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${stock < 5 ? 'text-red-500' : 'text-[#006e2c]'}`}>
                  {stock < 5 ? `${stock} Units Left` : `In Stock`}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={addToCart}
                disabled={!selectedSize || stock <= 0}
                className="flex-1 bg-[#141b2d] text-white font-bold rounded-xl py-3.5 text-sm hover:bg-[#004ac6] transition-all disabled:opacity-50 shadow-md shadow-black/5"
              >
                Add to Collection
              </button>
              <button
                onClick={buyNow}
                disabled={!selectedSize || stock <= 0}
                className="flex-1 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold rounded-xl py-3.5 text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-lg shadow-blue-900/10"
              >
                Instant Acquisition
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section - Restored as per spec with refined style */}
        <section className="mt-20 pt-16 border-t border-[#f0f4ff]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] text-[#004ac6] font-bold uppercase tracking-[0.2em] mb-2 block">Voices of the Community</span>
              <h2 className="font-display text-3xl font-bold text-[#141b2d] tracking-tight">
                Customer Stories
              </h2>
            </div>
            <button
              onClick={() => {
                if (token) {
                  document.getElementById("my_modal_8")?.showModal();
                } else {
                  document.getElementById("login_modal")?.showModal();
                }
              }}
              className="px-8 py-3 bg-[#f0f4ff] text-[#004ac6] font-display font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#004ac6] hover:text-white transition-all shadow-sm active:scale-95"
            >
              Share Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-[#f0f4ff] shadow-tonal-sm">
                <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#e1e8fd]">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#141b2d]">A Clean Slate</h3>
                <p className="text-sm text-[#5c6880] mt-1">Be the first to share your experience with this artifact.</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="bg-white rounded-3xl p-8 border border-[#f0f4ff] shadow-tonal-sm hover:shadow-tonal-md transition-shadow relative group">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-[#004ac6] fill-[#004ac6]' : 'text-[#e1e8fd]'}`} />
                    ))}
                  </div>
                  <p className="font-body text-sm text-[#141b2d] leading-relaxed mb-6 italic">"{review.comment}"</p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0f4ff] border border-[#e1e8fd] flex items-center justify-center font-display font-bold text-xs text-[#004ac6]">
                      {review.user?.username?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#141b2d]">{review.user?.username || 'Curator'}</p>
                      <p className="text-[10px] text-[#5c6880] uppercase tracking-widest font-semibold">
                        {new Date(review.createdAt).toLocaleDateString()} · VERIFIED PURCHASE
                      </p>
                    </div>
                  </div>

                  {canDelete(review) && (
                    <button
                      onClick={async () => {
                        if (confirm("Permanently archive this perspective?")) {
                          try {
                            await axios.delete(`${API_URL}/review/${review._id}`, { headers: { Authorization: `Bearer ${token}` } });
                            refreshReviews();
                            toast.success("Review archived");
                          } catch (err) {
                            toast.error("Process failed");
                          }
                        }
                      }}
                      className="absolute top-8 right-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Modal for reviews */}
        <Review id={id} onSuccess={refreshReviews} />

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#f0f4ff]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <span className="text-[10px] text-[#2563eb] font-bold uppercase tracking-[0.2em] mb-2 block">Complements</span>
                <h2 className="font-display text-3xl font-bold text-[#141b2d] tracking-tight">Harmonizing Artifacts</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
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
        <div className="mt-20 flex flex-col items-center justify-center py-16 bg-[#141b2d] rounded-[3rem] text-white">
          <h3 className="font-display text-2xl font-bold mb-3 tracking-tight">Need Assistance?</h3>
          <p className="text-sm text-white/60 mb-8 max-w-sm text-center font-body">Our curators are available to assist with any inquiries regarding our editorial collection.</p>
          <button className="px-10 py-3.5 bg-white text-[#141b2d] font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95">Consult Curator</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
