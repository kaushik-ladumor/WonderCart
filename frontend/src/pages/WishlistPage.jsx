import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { Heart, Star, Palette, Package, Loader2 } from "lucide-react";

function Wishlist() {
  const navigate = useNavigate();
  const { setCartCount, refreshCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [addingAllToCart, setAddingAllToCart] = useState(false);

  // Fetch wishlist from backend
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to view wishlist");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.wishlist) {
        const items = response.data.wishlist.items || [];
        const products = items.map((item) => item.product).filter(Boolean);
        setWishlistItems(products);
        // Set wishlist IDs for ProductCard
        setWishlist(products.map((p) => p._id));
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
      // Always remove from wishlist since we're on the wishlist page
      await axios.delete(
        `http://localhost:4000/wishlist/remove/${product._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
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
          price: availableSize.price,
          discount: availableSize.discount || 0,
          stock: availableSize.stock,
        };
      }
    }
    return null;
  };

  // Add all items to cart
  const addAllToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    const availableItems = wishlistItems.filter(
      (item) => getTotalStock(item) > 0,
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
            "http://localhost:4000/cart/add",
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
            },
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
          `Added ${addedCount} item${addedCount !== 1 ? "s" : ""} to cart!`,
        );
      }
    } catch (err) {
      console.error("Add all to cart error:", err);
      toast.error("Failed to add items to cart");
    } finally {
      setAddingAllToCart(false);
    }
  };

  // Calculate stats
  const inStockCount = wishlistItems.filter(
    (item) => getTotalStock(item) > 0,
  ).length;

  const avgRating =
    wishlistItems.length > 0
      ? (
          wishlistItems.reduce(
            (sum, item) => sum + (item.averageRating || 0),
            0,
          ) / wishlistItems.length
        ).toFixed(1)
      : 0;

  const totalColors = wishlistItems.reduce(
    (sum, item) => sum + getColorsCount(item),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 text-sm mt-1">
                {wishlistItems.length} saved item
                {wishlistItems.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Stats */}
          {wishlistItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {wishlistItems.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">In Stock</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {inStockCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Colors</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {totalColors}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Rating</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {avgRating}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 text-sm mb-5 max-w-sm mx-auto">
              Save items you love by clicking the heart icon on any product.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid using ProductCard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  wishlist={wishlist}
                  addingToWishlist={addingToWishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {/* Bottom Summary */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {wishlistItems.length} item
                    {wishlistItems.length !== 1 ? "s" : ""} saved
                  </p>
                  <p className="text-xs text-gray-600">
                    {inStockCount} item{inStockCount !== 1 ? "s" : ""} in stock
                    • {totalColors} color options
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={addAllToCart}
                    disabled={inStockCount === 0 || addingAllToCart}
                    className={`px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 ${
                      inStockCount > 0 && !addingAllToCart
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {addingAllToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      `Add All to Cart (${inStockCount})`
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
