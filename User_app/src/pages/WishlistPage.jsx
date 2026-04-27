import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import ProductCard from "../components/ProductCard";
import {
  Heart,
  Star,
  Palette,
  Package,
  Loader2,
  AlertCircle,
  Tag,
  X,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

function Wishlist() {
  const navigate = useNavigate();
  const { setCartCount, refreshCart } = useCart();
  const socket = useSocket();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [addingAllToCart, setAddingAllToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  // Fetch wishlist from backend
  useEffect(() => {
    fetchWishlist();
  }, []);

  // ✅ Real-time socket updates for wishlist
  useEffect(() => {
    if (!socket) return;

    const handleWishlistUpdate = (data) => {
      fetchWishlist();
    };

    socket.on("wishlist-update", handleWishlistUpdate);

    return () => {
      socket.off("wishlist-update", handleWishlistUpdate);
    };
  }, [socket]);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to view wishlist");
      document.getElementById("login_modal")?.showModal();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.wishlist) {
        const items = response.data.wishlist.items || [];
        const products = items.map((item) => item.product).filter(Boolean);
        setWishlistItems(products);
        setWishlist(products.map((p) => p._id));

        if (response.data.removedItems && response.data.removedItems.length > 0) {
          toast.error(`${response.data.removedItems.length} unavailable items were removed`);
        }
      } else {
        setWishlistItems([]);
        setWishlist([]);
      }
    } catch (err) {
      toast.error("Failed to load wishlist");
      setWishlistItems([]);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) return;

    setAddingToWishlist((p) => ({ ...p, [product._id]: true }));

    try {
      await axios.delete(
        `${API_URL}/wishlist/remove/${product._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist((p) => p.filter((id) => id !== product._id));
      setWishlistItems((p) => p.filter((item) => item._id !== product._id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist((p) => ({ ...p, [product._id]: false }));
    }
  };

  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((total, variant) => {
      const variantStock = variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
      return total + variantStock;
    }, 0);
  };

  const isOutOfStock = (product) => getTotalStock(product) === 0;

  const getColorsCount = (product) => product.variants?.length || 0;

  const getFirstAvailableVariant = (product) => {
    if (!product.variants || product.variants.length === 0) return null;
    for (const variant of product.variants) {
      const availableSize = variant.sizes?.find((s) => s.stock > 0);
      if (availableSize) {
        return {
          color: variant.color,
          size: availableSize.size,
        };
      }
    }
    return null;
  };

  const addAllToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const availableItems = wishlistItems.filter((item) => getTotalStock(item) > 0);
    if (availableItems.length === 0) {
      toast.error("No items in stock to add");
      return;
    }

    setAddingAllToCart(true);
    try {
      let addedCount = 0;
      for (const item of availableItems) {
        const variant = getFirstAvailableVariant(item);
        if (!variant) continue;
        try {
          await axios.post(`${API_URL}/cart/add`, {
            productId: item._id,
            quantity: 1,
            color: variant.color,
            size: variant.size,
          }, { headers: { Authorization: `Bearer ${token}` } });
          addedCount++;
        } catch (err) { }
      }

      if (addedCount > 0) {
        if (refreshCart) await refreshCart();
        else setCartCount((prev) => prev + addedCount);
        toast.success(`Added ${addedCount} items to cart!`);
      }
    } catch (err) {
      toast.error("Failed to add items to cart");
    } finally {
      setAddingAllToCart(false);
    }
  };

  const inStockItems = wishlistItems.filter((item) => !isOutOfStock(item));
  const outOfStockItems = wishlistItems.filter((item) => isOutOfStock(item));
  const inStockCount = inStockItems.length;

  const avgRating = wishlistItems.length > 0
    ? (wishlistItems.reduce((sum, item) => sum + (item.averageRating || 0), 0) / wishlistItems.length).toFixed(1)
    : 0;

  const totalColors = wishlistItems.reduce((sum, item) => sum + getColorsCount(item), 0);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-6 text-[#11182d]">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[1.6rem] md:text-[2rem] font-semibold text-[#11182d] leading-tight tracking-tight">
              Curated Wishlist
            </h1>
            <p className="text-[0.8rem] text-[#42506d] leading-relaxed">
              Save and manage your most-wanted premium lifestyle essentials.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/")}
              className="h-10 px-6 border border-[#eef2ff] bg-white text-[#42506d] text-[0.65rem] font-semibold uppercase tracking-widest rounded-xl hover:text-[#0f49d7] shadow-sm flex items-center gap-2"
            >
              Continue Shopping
            </button>
            <button
              onClick={addAllToCart}
              disabled={inStockCount === 0 || addingAllToCart}
              className="h-10 px-6 bg-[#0f49d7] text-white text-[0.65rem] font-semibold uppercase tracking-widest rounded-xl disabled:opacity-50 shadow-md flex items-center gap-2"
            >
              {addingAllToCart ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              Add All to Cart ({inStockCount})
            </button>
          </div>
        </div>

        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Package, label: "Total Items", value: wishlistItems.length, color: "text-[#0f49d7]" },
              { icon: TrendingUp, label: "In Stock", value: inStockCount, color: "text-[#10b981]" },
              { icon: Palette, label: "Colorways", value: totalColors, color: "text-[#8b5cf6]" },
              { icon: Star, label: "Avg Rating", value: avgRating, color: "text-[#f59e0b]" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-[20px] border border-[#eef2ff] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 bg-[#f8f9fc] border border-[#eef2ff] rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-semibold text-[#5d6a84] uppercase tracking-widest mb-0.5">{stat.label}</p>
                    <p className="text-[0.9rem] font-semibold text-[#11182d]">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {outOfStockItems.length > 0 && (
          <div className="mb-6 p-4 bg-[#fff1f2] border border-[#ffe4e6] rounded-[20px] flex items-center gap-3">
            <AlertCircle className="w-4.5 h-4.5 text-[#e11d48]" />
            <p className="text-[0.72rem] font-semibold text-[#e11d48] uppercase tracking-widest">
              {outOfStockItems.length} items currently unavailable
            </p>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#f8f9fc]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] border border-[#e1e5f1] bg-white">
              <Heart className="h-8 w-8 text-[#90a0be]" />
            </div>
            <h2 className="mt-4 text-[1.45rem] font-semibold tracking-tight text-[#11182d]">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[0.86rem] leading-6 text-center text-[#42506d]">
              Save items you love by clicking the heart icon on any product across our store.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="mt-4 rounded-[14px] bg-[#0f49d7] px-4 py-2 text-[0.8rem] font-medium text-white"
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...inStockItems, ...outOfStockItems].map((product) => {
              const productName = product?.name || "Product";
              const productImg =
                product?.productImg?.[0] ||
                product?.image ||
                product?.images?.[0] ||
                product?.variants?.find((v) => v.images?.[0])?.images?.[0] ||
                "";
              const isAvailable = !isOutOfStock(product);
              const isAdding = addingToCart[product._id];

              return (
                <div
                  key={product._id}
                  className={`rounded-[18px] border border-[#e1e5f1] bg-white p-3.5 transition-all ${!isAvailable ? "opacity-60" : "hover:border-[#cbd5e1]"
                    }`}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[130px_minmax(0,1fr)]">
                    <Link
                      to={`/product-detail/${product._id}`}
                      className="flex h-28 items-center justify-center overflow-hidden rounded-[14px] bg-[#f1f4fb] hover:opacity-90 transition-opacity"
                    >
                      {productImg ? (
                        <img
                          src={productImg}
                          alt={productName}
                          className="h-full w-full object-contain p-2 mix-blend-multiply"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-[#8fa0be]" />
                      )}
                    </Link>

                    <div className="flex min-h-full flex-col justify-between">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Link
                            to={`/product-detail/${product._id}`}
                            className="text-[0.88rem] font-semibold text-[#11182d] hover:text-[#0f49d7] transition-colors"
                          >
                            {productName}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[0.7rem] font-medium text-[#11182d]">{product.averageRating || "4.5"}</span>
                            </div>
                            <span className="text-[0.7rem] text-[#94a3b8]">•</span>
                            <span className={`text-[0.7rem] font-semibold uppercase tracking-wider ${isAvailable ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                              {isAvailable ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[0.95rem] font-bold text-[#11182d]">
                            Rs {product.sellingPrice?.toLocaleString("en-IN")}
                          </p>
                          {product.originalPrice > product.sellingPrice && (
                            <p className="mt-0.5 text-[0.76rem] text-[#94a3b8] line-through font-medium">
                              Rs {product.originalPrice?.toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-[#f1f5f9]">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              if (!token) return;
                              const variant = getFirstAvailableVariant(product);
                              if (!variant) {
                                toast.error("Variant unavailable");
                                return;
                              }
                              setAddingToCart((p) => ({ ...p, [product._id]: true }));
                              try {
                                const response = await axios.post(
                                  `${API_URL}/cart/add`,
                                  {
                                    productId: product._id,
                                    quantity: 1,
                                    color: variant.color,
                                    size: variant.size,
                                  },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                if (response.data.success) {
                                  toast.success("Added to cart");
                                  if (refreshCart) refreshCart();
                                  else setCartCount((c) => c + 1);
                                }
                              } catch (err) {
                                toast.error("Failed to add to cart");
                              } finally {
                                setAddingToCart((p) => ({ ...p, [product._id]: false }));
                              }
                            }}
                            disabled={!isAvailable || isAdding}
                            className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-widest text-[#0f49d7] hover:opacity-80 disabled:opacity-30 transition-all"
                          >
                            {isAdding ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            )}
                            Add to Cart
                          </button>

                          <div className="h-4 w-[1px] bg-[#e2e8f0]"></div>

                          <button
                            onClick={(e) => toggleWishlist(e, product)}
                            className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-widest text-[#ef4444] hover:opacity-80 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>

                        <Link
                          to={`/product-detail/${product._id}`}
                          className="flex items-center gap-1 text-[0.72rem] font-bold uppercase tracking-widest text-[#64748b] hover:text-[#11182d] transition-all"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
