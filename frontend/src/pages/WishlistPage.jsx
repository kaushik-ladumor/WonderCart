import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  ShoppingBag,
  Star,
  Tag,
  Eye,
  Loader2,
  ChevronLeft,
  Package,
  Palette,
  Layers,
} from "lucide-react";

function Wishlist() {
  const navigate = useNavigate();
  const { setCartCount, refreshCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

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
      } else {
        toast.error("Failed to load wishlist");
        setWishlistItems([]);
      }
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      toast.error("Failed to load wishlist");
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get lowest price from all variants
  const getLowestPrice = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;

    let lowest = Infinity;
    product.variants.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        const finalPrice =
          size.discount > 0
            ? Math.round(size.price * (1 - size.discount / 100))
            : size.price;
        if (finalPrice < lowest) {
          lowest = finalPrice;
        }
      });
    });

    return lowest === Infinity ? 0 : lowest;
  };

  // Helper: Get original price for a specific size
  const getOriginalPriceForSize = (product, color, size) => {
    if (!product.variants) return 0;

    const variant = product.variants.find((v) => v.color === color);
    if (!variant) return 0;

    const sizeObj = variant.sizes?.find((s) => s.size === size);
    return sizeObj?.price || 0;
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

  // Helper: Get first available variant
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

  // Helper: Get product image (first variant's first image)
  const getProductImage = (product) => {
    if (
      product.variants &&
      product.variants.length > 0 &&
      product.variants[0].images?.length > 0
    ) {
      return product.variants[0].images[0];
    }
    return "/placeholder.jpg";
  };

  // Helper: Get available colors count
  const getColorsCount = (product) => {
    return product.variants?.length || 0;
  };

  // Helper: Get discount for first available variant
  const getDiscount = (product) => {
    const variant = getFirstAvailableVariant(product);
    return variant?.discount || 0;
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setRemovingItem(productId);

    try {
      const response = await axios.delete(
        `http://localhost:4000/wishlist/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item._id !== productId)
        );
        toast.success("Removed from wishlist");
      } else {
        toast.error(response.data.message || "Failed to remove from wishlist");
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingItem(null);
    }
  };

  // Add to cart from wishlist
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    const totalStock = getTotalStock(product);
    if (totalStock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    // Get first available variant
    const availableVariant = getFirstAvailableVariant(product);
    if (!availableVariant) {
      toast.error("No available variants");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));

    try {
      const response = await axios.post(
        "http://localhost:4000/cart/add",
        {
          productId: product._id,
          quantity: 1,
          color: availableVariant.color,
          size: availableVariant.size,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (refreshCart) {
          await refreshCart();
        } else {
          setCartCount((prev) => prev + 1);
        }
        toast.success("Added to cart!");
      } else {
        toast.error(response.data.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  // Add all items to cart
  const addAllToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    const availableItems = wishlistItems.filter(
      (item) => getTotalStock(item) > 0
    );

    if (availableItems.length === 0) {
      toast.error("No items in stock to add to cart");
      return;
    }

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
        toast.success(`Added ${addedCount} items to cart!`);
      }
    } catch (err) {
      console.error("Add all to cart error:", err);
      toast.error("Failed to add items to cart");
    }
  };

  // Calculate stats
  const totalValue = wishlistItems.reduce(
    (sum, item) => sum + getLowestPrice(item),
    0
  );

  const inStockCount = wishlistItems.filter(
    (item) => getTotalStock(item) > 0
  ).length;

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        {wishlistItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Items</p>
                  <p className="font-semibold text-gray-900">
                    {wishlistItems.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">In Stock</p>
                  <p className="font-semibold text-gray-900">{inStockCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Colors</p>
                  <p className="font-semibold text-gray-900">{totalColors}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                  <p className="font-semibold text-gray-900">{avgRating}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              Save items you love by clicking the heart icon on any product.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistItems.map((item, index) => {
                const totalStock = getTotalStock(item);
                const productImage = getProductImage(item);
                const colorsCount = getColorsCount(item);
                const lowestPrice = getLowestPrice(item);
                const discount = getDiscount(item);
                const variant = getFirstAvailableVariant(item);
                const originalPrice = variant ? variant.price : 0;

                return (
                  <div
                    key={item._id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all"
                  >
                    {/* Image Section */}
                    <div
                      className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/product-detail/${item._id}`)}
                    >
                      <img
                        src={productImage}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(item._id);
                        }}
                        disabled={removingItem === item._id}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition"
                      >
                        {removingItem === item._id ? (
                          <Loader2 className="w-3.5 h-3.5 text-gray-600 animate-spin" />
                        ) : (
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                        )}
                      </button>

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-black text-white text-xs font-medium rounded">
                            {discount}% OFF
                          </span>
                        </div>
                      )}

                      {/* Stock Overlay */}
                      {totalStock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            SOLD OUT
                          </span>
                        </div>
                      )}

                      {/* Colors Badge */}
                      {colorsCount > 0 && (
                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-1 bg-white/90 text-xs rounded flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            {colorsCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="p-3">
                      {/* Category */}
                      <p className="text-xs text-gray-500 mb-1">
                        {item.category || "Product"}
                      </p>

                      {/* Title */}
                      <h3
                        className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-black cursor-pointer"
                        onClick={() => navigate(`/product-detail/${item._id}`)}
                      >
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.round(item.averageRating || 0)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({item.numReviews || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base font-bold text-gray-900">
                          ₹{lowestPrice.toLocaleString()}
                        </span>
                        {variant && variant.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product-detail/${item._id}`);
                          }}
                          className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          disabled={totalStock === 0 || addingToCart[item._id]}
                          className={`flex-1 py-2 text-xs font-medium rounded transition ${
                            totalStock > 0
                              ? "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {addingToCart[item._id] ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                          ) : (
                            "Add to Cart"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Total value:{" "}
                    <span className="font-bold">
                      ₹{totalValue.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    {inStockCount} item{inStockCount !== 1 ? "s" : ""} in stock
                    • {totalColors} color options
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={addAllToCart}
                    disabled={inStockCount === 0}
                    className={`px-4 py-2 text-sm font-medium rounded transition ${
                      inStockCount > 0
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Add All ({inStockCount} items)
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
