import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { handleTokenExpiration, isTokenExpired } from "../utils/auth";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState({});
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const { setCartCount } = useCart();

  const token = localStorage.getItem("token");

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!token) {
      setError("Please login first");
      setLoading(false);
      localStorage.setItem("redirectAfterLogin", "/cart");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 401 || isTokenExpired({ response: { status: res.status, data: errorData } })) {
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
      setLoading(false);
    } catch (err) {
      console.error(err);
      
      // Check for token expiration in catch block
      if (isTokenExpired(err)) {
        toast.error("Session expired. Please login again.");
        handleTokenExpiration(navigate, setAuthUser);
        return;
      }
      
      setError(err.message || "Failed to load cart");
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (
    itemId,
    productId,
    color,
    size,
    newQuantity
  ) => {
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
        body: JSON.stringify({
          productId,
          color,
          size,
          quantity: newQuantity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Check for token expiration
        if (res.status === 401 || isTokenExpired({ response: { status: res.status, data: errorData } })) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        
        throw new Error(errorData.message || "Failed to update quantity");
      }

      const data = await res.json();
      const updatedCart = data.cart || data;
      setCart(updatedCart);
      setCartCount(updatedCart?.items?.length || 0);
      toast.success("Quantity updated");
    } catch (err) {
      console.error(err);
      
      // Check for token expiration
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

  // Remove item - FIXED VERSION
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
        body: JSON.stringify({
          color,
          size,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        // Check for token expiration
        if (res.status === 401 || isTokenExpired({ response: { status: res.status, data: errorData } })) {
          toast.error("Session expired. Please login again.");
          handleTokenExpiration(navigate, setAuthUser);
          return;
        }
        
        throw new Error(errorData.message || "Failed to remove item");
      }

      const data = await res.json();
      setCart(data.cart);
      setCartCount(data.cart?.items?.length || 0);
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      
      // Check for token expiration
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

  // Format color name
  const formatColorName = (color) => {
    if (!color) return "";
    return color.charAt(0).toUpperCase() + color.slice(1);
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check for out of stock items
    const outOfStockItems = cart.items.filter(item => item.isOutOfStock);
    if (outOfStockItems.length > 0) {
      toast.error("Please remove out of stock items before checkout");
      return;
    }

    // Clear any existing direct order from session storage
    sessionStorage.removeItem("directOrder");
    sessionStorage.removeItem("directOrderTotal");

    // Navigate to checkout
    navigate("/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate totals - use item.price which is the ORIGINAL price (not discounted)
  // Always use original price for cart calculations, never apply discount
  const subtotal =
    cart?.items?.reduce(
      (sum, item) =>
        sum + (item.price || item.product?.price || 0) * item.quantity,
      0
    ) || 0;
  const shipping = subtotal > 0 ? (subtotal >= 500 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-gray-200 border-t-black rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-sm font-medium">
            Loading your cart...
          </p>
        </div>
      </motion.div>
    );
  }

  if (error && !cart) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white flex items-center justify-center px-4"
      >
        <div className="text-center max-w-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
          <div className="flex gap-3 justify-center mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchCart}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800"
            >
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50"
            >
              Go Home
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white flex items-center justify-center px-4"
      >
        <div className="text-center max-w-sm">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Add some items to get started!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-black text-white font-medium rounded hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 text-sm mt-1">
            {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.map((item, index) => {
                const product = item.product;
                const productName =
                  product?.name || item.productName || "Product";
                // Use item.price which is the ORIGINAL price (not discounted)
                // Always show original price in cart, never apply discount
                const productPrice = item.price || product?.price || 0;
                const productImg = product?.productImg?.[0] || item.productImg;
                const productColor = item.color;
                const productSize = item.size;
                const productId =
                  product?._id || item.productId || item.product;
                const updateKey = `${productId}-${productColor}-${productSize}`;
                const isUpdating = updatingItems[updateKey];
                const isOutOfStock = item.isOutOfStock || false;
                const availableStock = item.availableStock || 0;

                return (
                  <motion.div
                    key={
                      item._id || `${productId}-${productColor}-${productSize}`
                    }
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                      isUpdating ? "opacity-60" : ""
                    } ${
                      isOutOfStock 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
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
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {productName}
                            </h3>
                            {isOutOfStock && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Out of Stock
                              </div>
                            )}
                            {!isOutOfStock && availableStock > 0 && availableStock < item.quantity && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Only {availableStock} available (quantity adjusted)
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {productColor && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  {formatColorName(productColor)}
                                </span>
                              )}
                              {productSize && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                  Size: {productSize}
                                </span>
                              )}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (!productId || !productColor || !productSize) {
                                toast.error("Cannot remove item");
                                return;
                              }
                              removeItem(productId, productColor, productSize);
                            }}
                            disabled={isUpdating}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            )}
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  productId,
                                  productColor,
                                  productSize,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1 || isUpdating}
                              className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:border-black disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  productId,
                                  productColor,
                                  productSize,
                                  item.quantity + 1
                                )
                              }
                              disabled={isUpdating || isOutOfStock || (availableStock > 0 && item.quantity >= availableStock)}
                              className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:border-black disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              ₹{productPrice.toLocaleString()} × {item.quantity}
                            </p>
                            <p className="text-base font-semibold text-gray-900">
                              ₹{(productPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>

                {subtotal > 0 && subtotal < 500 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs text-amber-700 bg-amber-50 p-2 rounded"
                  >
                    Add ₹{(500 - subtotal).toLocaleString()} more for free
                    shipping!
                  </motion.div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={proceedToCheckout}
                className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Payment Security */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    Secure 256-bit SSL encryption
                  </span>
                </div>

                {/* Accepted Payments */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {["Visa", "Master", "UPI", "Rupay"].map((method) => (
                    <div
                      key={method}
                      className="h-8 bg-gray-50 rounded flex items-center justify-center text-xs font-medium text-gray-700"
                    >
                      {method}
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        Free Shipping
                      </p>
                      <p className="text-xs text-gray-500">
                        On orders over ₹500
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        Easy Returns
                      </p>
                      <p className="text-xs text-gray-500">
                        30-day return policy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
