import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Lock,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Info,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { handleTokenExpiration, isTokenExpired } from "../utils/auth";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import Loader from "../components/Loader";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState({});
  const [stockNotice, setStockNotice] = useState(null);
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const { setCartCount, refreshCart } = useCart();
  const socket = useSocket();

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) {
      setError("Please login first");
      setLoading(false);
      document.getElementById("login_modal")?.showModal();
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        throw new Error(errorData.message || "Failed to fetch cart");
      }

      const data = await res.json();
      const cartData = data.cart ? data.cart : data;
      setCart(cartData);
      setCartCount(cartData?.items?.length || 0);

      // Show stock change notifications
      if (data.stockChanges) {
        const { removed, adjusted } = data.stockChanges;
        if (removed?.length > 0) {
          setStockNotice({
            type: "removed",
            items: removed,
            message: `${removed.length} item${removed.length > 1 ? "s" : ""} removed (out of stock)`,
          });
        } else if (adjusted?.length > 0) {
          setStockNotice({
            type: "adjusted",
            items: adjusted.map(
              (a) => `${a.name}: qty adjusted to ${a.newQty}`
            ),
            message: `${adjusted.length} item${adjusted.length > 1 ? "s" : ""} had quantity adjusted`,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
      setError(err.message || "Failed to load cart");
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, color, size, newQuantity) => {
    if (newQuantity < 1) return;

    const updateKey = `${productId}-${color}-${size}`;
    setUpdatingItems((prev) => ({ ...prev, [updateKey]: true }));

    try {
      const res = await fetch("http://localhost:4000/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, color, size, quantity: newQuantity }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        throw new Error(errorData.message || "Failed to update quantity");
      }

      await fetchCart();
      toast.success("Quantity updated");
    } catch (err) {
      console.error(err);
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
      toast.error(err.message || "Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => {
        const newState = { ...prev };
        delete newState[updateKey];
        return newState;
      });
    }
  };

  const removeItem = async (productId, color, size) => {
    if (!productId || !color || !size) {
      toast.error("Cannot remove item: Missing information");
      return;
    }

    const updateKey = `${productId}-${color}-${size}`;
    setUpdatingItems((prev) => ({ ...prev, [updateKey]: true }));

    try {
      const res = await fetch(`http://localhost:4000/cart/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ color, size }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          isTokenExpired({ response: { status: res.status, data: errorData } })
        ) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        throw new Error(errorData.message || "Failed to remove item");
      }

      await fetchCart();
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
      toast.error(err.message || "Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newState = { ...prev };
        delete newState[updateKey];
        return newState;
      });
    }
  };

  const formatColorName = (color) => {
    if (!color) return "";
    return color.charAt(0).toUpperCase() + color.slice(1);
  };

  const proceedToCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    sessionStorage.removeItem("directOrder");
    sessionStorage.removeItem("directOrderTotal");
    navigate("/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleCartUpdate = (data) => {
      console.log("🛒 Real-time cart update in Cart page:", data.type);
      fetchCart();
    };

    socket.on("cart-update", handleCartUpdate);

    return () => {
      socket.off("cart-update", handleCartUpdate);
    };
  }, [socket]);

  // Calculate prices using sellingPrice
  const getItemPrice = (item) => {
    return item.sellingPrice || item.price || 0;
  };

  const getItemOriginalPrice = (item) => {
    return item.originalPrice || 0;
  };

  // Calculate totals (only in-stock items)
  const validItems = cart?.items?.filter((item) => !item.isOutOfStock) || [];

  const subtotal = validItems.reduce((sum, item) => {
    return sum + getItemPrice(item) * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  const totalSavings = validItems.reduce((sum, item) => {
    const original = getItemOriginalPrice(item);
    const selling = getItemPrice(item);
    if (original > selling) {
      return sum + (original - selling) * item.quantity;
    }
    return sum;
  }, 0);

  if (loading) {
    return <Loader />;
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={fetchCart}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Add some items to get started!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        {/* Stock Notice Banner */}
        {stockNotice && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center justify-between ${stockNotice.type === "removed"
              ? "bg-red-50 border border-red-200"
              : "bg-amber-50 border border-amber-200"
              }`}
          >
            <div className="flex items-center gap-2">
              <Info
                className={`w-4 h-4 flex-shrink-0 ${stockNotice.type === "removed"
                  ? "text-red-500"
                  : "text-amber-500"
                  }`}
              />
              <p
                className={`text-sm font-medium ${stockNotice.type === "removed"
                  ? "text-red-700"
                  : "text-amber-700"
                  }`}
              >
                {stockNotice.message}
              </p>
            </div>
            <button
              onClick={() => setStockNotice(null)}
              className="p-1 hover:bg-white/50 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 text-sm mt-1">
            {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => {
              const product = item.product;
              const productName =
                product?.name || item.productName || "Product";
              const productImg = product?.productImg?.[0] || item.productImg;
              const productColor = item.color;
              const productSize = item.size;
              const productId = product?._id || item.productId || item.product;
              const updateKey = `${productId}-${productColor}-${productSize}`;
              const isUpdating = updatingItems[updateKey];
              const isOutOfStock = item.isOutOfStock || false;
              const availableStock = item.availableStock || 0;

              const sellingPrice = getItemPrice(item);
              const originalPrice = getItemOriginalPrice(item);
              const discountPercentage = item.discount || 0;
              const showDiscount =
                discountPercentage > 0 && sellingPrice < originalPrice;

              return (
                <div
                  key={
                    item._id || `${productId}-${productColor}-${productSize}`
                  }
                  className={`bg-white rounded-xl border shadow-sm transition-all ${isUpdating ? "opacity-50 pointer-events-none" : ""
                    } ${isOutOfStock
                      ? "border-red-200 bg-red-50/30"
                      : "border-gray-200 hover:shadow-md"
                    }`}
                >
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div
                        className={`w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 ${isOutOfStock ? "opacity-40" : ""
                          }`}
                      >
                        {productImg ? (
                          <img
                            src={productImg}
                            alt={productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3
                              className={`font-semibold text-sm leading-snug line-clamp-2 ${isOutOfStock
                                ? "text-gray-400"
                                : "text-gray-900"
                                }`}
                            >
                              {productName}
                            </h3>

                            {/* Out of Stock Badge */}
                            {isOutOfStock && (
                              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                <AlertCircle className="w-3 h-3" /> Out of
                                Stock
                              </div>
                            )}

                            {/* Low Stock Warning */}
                            {!isOutOfStock &&
                              availableStock > 0 &&
                              availableStock < item.quantity && (
                                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                                  <AlertCircle className="w-3 h-3" /> Only{" "}
                                  {availableStock} available
                                </div>
                              )}

                            {/* Variant Info */}
                            <div className="flex gap-2 mt-2">
                              {productColor && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                                  {formatColorName(productColor)}
                                </span>
                              )}
                              {productSize && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                                  Size: {productSize}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() =>
                              removeItem(productId, productColor, productSize)
                            }
                            disabled={isUpdating}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Remove item"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                            )}
                          </button>
                        </div>

                        {/* Price & Quantity Row */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          {!isOutOfStock && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    productId,
                                    productColor,
                                    productSize,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1 || isUpdating}
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                              >
                                <Minus className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                              <span className="text-sm font-semibold text-gray-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    productId,
                                    productColor,
                                    productSize,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  isUpdating ||
                                  isOutOfStock ||
                                  (availableStock > 0 &&
                                    item.quantity >= availableStock)
                                }
                                className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                              >
                                <Plus className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                            </div>
                          )}
                          {isOutOfStock && <div />}

                          {/* Price Display */}
                          <div className="text-right">
                            {showDiscount && !isOutOfStock && (
                              <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{originalPrice.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                  {discountPercentage}% OFF
                                </span>
                              </div>
                            )}
                            {!isOutOfStock && (
                              <>
                                <p className="text-xs text-gray-500">
                                  ₹{sellingPrice.toLocaleString()} ×{" "}
                                  {item.quantity}
                                </p>
                                <p className="text-base font-bold text-gray-900">
                                  ₹
                                  {(
                                    sellingPrice * item.quantity
                                  ).toLocaleString()}
                                </p>
                              </>
                            )}
                            {isOutOfStock && (
                              <p className="text-sm font-medium text-red-500">
                                Unavailable
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({validItems.length} item
                    {validItems.length !== 1 ? "s" : ""})
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Total Savings</span>
                    <span className="font-semibold text-green-600">
                      -₹{totalSavings.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-gray-900"}`}
                  >
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                {shipping > 0 && subtotal > 0 && (
                  <div className="bg-blue-50 text-blue-700 text-xs p-2 rounded-lg font-medium">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free
                    shipping
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                disabled={validItems.length === 0}
                className={`w-full mt-5 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${validItems.length > 0
                  ? "bg-black text-white hover:bg-gray-800 active:bg-gray-900"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <CreditCard className="w-4 h-4" /> Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Free shipping over ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
