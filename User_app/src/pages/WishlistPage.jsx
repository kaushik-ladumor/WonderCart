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
        } catch (err) {}
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
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                    <Heart className="w-4 h-4" />
                 </div>
                 <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-[#0f49d7]">Your Private Collection</span>
              </div>
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
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-[#eef2ff]">
              <Heart className="w-12 h-12 text-[#eef2ff]" />
            </div>
            <h3 className="text-[1.2rem] font-semibold text-[#11182d] tracking-tight">Your wishlist is empty</h3>
            <p className="text-[0.8rem] text-[#5c6880] max-w-sm mt-2 mb-8 leading-relaxed">
               Save items you love by clicking the heart icon on any product across our store.
            </p>
            <button
              onClick={() => navigate("/")}
              className="h-11 px-8 bg-[#0f49d7] text-white text-[0.65rem] font-semibold uppercase tracking-widest rounded-xl shadow-md border-none outline-none"
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...inStockItems, ...outOfStockItems].map((product) => (
              <div key={product._id} className={isOutOfStock(product) ? "opacity-60" : ""}>
                <ProductCard
                  product={product}
                  wishlist={wishlist}
                  addingToWishlist={addingToWishlist}
                  toggleWishlist={toggleWishlist}
                />
                {isOutOfStock(product) && (
                  <div className="mt-2 text-center">
                     <span className="text-[0.55rem] font-semibold uppercase tracking-widest text-[#e11d48] bg-[#fff1f2] px-3 py-1 rounded-full border border-[#ffe4e6]">Unavailable</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
