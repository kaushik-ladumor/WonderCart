import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  ShoppingCart,
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
      console.log("❤️ Real-time wishlist update:", data.type);
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

        // Show notification for removed items
        if (
          response.data.removedItems &&
          response.data.removedItems.length > 0
        ) {
          toast.error(
            `${response.data.removedItems.length} unavailable items were removed from your wishlist`
          );
        }
      } else {
        toast.error("Failed to load wishlist");
        setWishlistItems([]);
        setWishlist([]);
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      toast.error("Failed to load wishlist");
      setWishlistItems([]);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist (remove from wishlist)
  const toggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to manage wishlist");
      return;
    }

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

  // Helper: Get total stock across all variants
  const getTotalStock = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;

    return product.variants.reduce((total, variant) => {
      const variantStock =
        variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0;
      return total + variantStock;
    }, 0);
  };

  // Helper: is product out of stock
  const isOutOfStock = (product) => getTotalStock(product) === 0;

  // Helper: Get available colors count
  const getColorsCount = (product) => {
    return product.variants?.length || 0;
  };

  // Helper: Get first available variant for adding to cart
  const getFirstAvailableVariant = (product) => {
    if (!product.variants || product.variants.length === 0) return null;

    for (const variant of product.variants) {
      const availableSize = variant.sizes?.find((s) => s.stock > 0);
      if (availableSize) {
        return {
          color: variant.color,
          size: availableSize.size,
          originalPrice: availableSize.originalPrice,
          sellingPrice: availableSize.sellingPrice,
          discount: availableSize.discount || 0,
          stock: availableSize.stock,
        };
      }
    }
    return null;
  };

  // Add single item to cart
  const addSingleToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      document.getElementById("login_modal")?.showModal();
      return;
    }

    if (isOutOfStock(product)) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    const variant = getFirstAvailableVariant(product);
    if (!variant) {
      toast.error("No sizes available in stock");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        {
          productId: product._id,
          quantity: 1,
          color: variant.color,
          size: variant.size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (refreshCart) {
        await refreshCart();
      } else {
        setCartCount((prev) => prev + 1);
      }
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to add item to cart";
      toast.error(message);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  // Add all in-stock items to cart
  const addAllToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add items to cart");
      document.getElementById("login_modal")?.showModal();
      return;
    }

    const availableItems = wishlistItems.filter(
      (item) => getTotalStock(item) > 0
    );

    if (availableItems.length === 0) {
      toast.error("No items in stock to add to cart");
      return;
    }

    setAddingAllToCart(true);

    try {
      let addedCount = 0;

      for (const item of availableItems) {
        const variant = getFirstAvailableVariant(item);
        if (!variant) continue;

        try {
          await axios.post(
            `${API_URL}/cart/add`,
            {
              productId: item._id,
              quantity: 1,
              color: variant.color,
              size: variant.size,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          addedCount++;
        } catch (err) {
          console.error(`Failed to add item ${item._id}:`, err);
        }
      }

      if (addedCount > 0) {
        if (refreshCart) {
          await refreshCart();
        } else {
          setCartCount((prev) => prev + addedCount);
        }
        toast.success(
          `Added ${addedCount} item${addedCount !== 1 ? "s" : ""} to cart!`
        );
      }
    } catch (err) {
      console.error("Add all to cart error:", err);
      toast.error("Failed to add items to cart");
    } finally {
      setAddingAllToCart(false);
    }
  };

  // Calculate stats (only in-stock items)
  const inStockItems = wishlistItems.filter((item) => !isOutOfStock(item));
  const outOfStockItems = wishlistItems.filter((item) => isOutOfStock(item));
  const inStockCount = inStockItems.length;

  const avgRating =
    wishlistItems.length > 0
      ? (
        wishlistItems.reduce(
          (sum, item) => sum + (item.averageRating || 0),
          0
        ) / wishlistItems.length
      ).toFixed(1)
      : 0;

  const totalColors = wishlistItems.reduce(
    (sum, item) => sum + getColorsCount(item),
    0
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
          </div>

          {/* Stats */}
          {wishlistItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {wishlistItems.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">In Stock</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {inStockCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Colors</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {totalColors}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Rating</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {avgRating}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Out of Stock Notice */}
          {outOfStockItems.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700">
                {outOfStockItems.length} item
                {outOfStockItems.length > 1 ? "s" : ""} in your wishlist{" "}
                {outOfStockItems.length > 1 ? "are" : "is"} currently out of
                stock
              </p>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
              Save items you love by clicking the heart icon on any product.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid using ProductCard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* In-stock items first, then out-of-stock */}
              {[...inStockItems, ...outOfStockItems].map((product) => (
                <div
                  key={product._id}
                  className={`relative ${isOutOfStock(product) ? "opacity-60" : ""}`}
                >
                  <ProductCard
                    product={product}
                    wishlist={wishlist}
                    addingToWishlist={addingToWishlist}
                    toggleWishlist={toggleWishlist}
                  />
                  {/* Out of Stock overlay badge */}
                  {isOutOfStock(product) && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                      OUT OF STOCK
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Summary */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {wishlistItems.length} item
                    {wishlistItems.length !== 1 ? "s" : ""} saved
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {inStockCount} item{inStockCount !== 1 ? "s" : ""} in stock
                    • {totalColors} color options
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={addAllToCart}
                    disabled={inStockCount === 0 || addingAllToCart}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${inStockCount > 0 && !addingAllToCart
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {addingAllToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        {`Add All to Cart (${inStockCount})`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
