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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { handleTokenExpiration, isTokenExpired } from "../utils/auth";
import { useCart } from "../context/CartContext";
import Loader from '../components/Loader';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState({});
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const { setCartCount } = useCart();

  const token = localStorage.getItem("token");

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

    const outOfStockItems = cart.items.filter((item) => item.isOutOfStock);
    if (outOfStockItems.length > 0) {
      toast.error("Please remove out of stock items before checkout");
      return;
    }

    sessionStorage.removeItem("directOrder");
    sessionStorage.removeItem("directOrderTotal");
    navigate("/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate discounted price for each item
  const calculateDiscountedPrice = (item) => {
    // Check if backend provides discount information
    const originalPrice = item.price || item.product?.price || 0;
    const discountPercentage = item.discount || 0;

    if (discountPercentage > 0) {
      return Math.round(originalPrice * (1 - discountPercentage / 100));
    }

    return originalPrice;
  };

  // Calculate totals
  const subtotal =
    cart?.items?.reduce((sum, item) => {
      const discountedPrice = calculateDiscountedPrice(item);
      return sum + discountedPrice * item.quantity;
    }, 0) || 0;

  const shipping = subtotal > 0 ? (subtotal >= 999 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={fetchCart}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50"
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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Add some items to get started!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-black text-white font-medium rounded hover:bg-gray-800 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 text-sm mt-1">
            {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
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

              // Calculate prices
              const originalPrice = item.price || product?.price || 0;
              const discountPercentage = item.discount || 0;
              const discountedPrice = calculateDiscountedPrice(item);
              const showDiscount =
                discountPercentage > 0 && discountedPrice < originalPrice;

              return (
                <div
                  key={
                    item._id || `${productId}-${productColor}-${productSize}`
                  }
                  className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${isUpdating ? "opacity-60" : ""} ${isOutOfStock ? "border-red-300 bg-red-50" : "border-gray-200"}`}
                >
                  <div className="flex gap-4">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {productName}
                          </h3>
                          {isOutOfStock && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                              <AlertCircle className="w-3 h-3" /> Out of Stock
                            </div>
                          )}
                          {!isOutOfStock &&
                            availableStock > 0 &&
                            availableStock < item.quantity && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 font-medium">
                                <AlertCircle className="w-3 h-3" /> Only{" "}
                                {availableStock} available (quantity adjusted)
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
                        <button
                          onClick={() =>
                            removeItem(productId, productColor, productSize)
                          }
                          disabled={isUpdating}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                productId,
                                productColor,
                                productSize,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:border-black disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                productId,
                                productColor,
                                productSize,
                                item.quantity + 1,
                              )
                            }
                            disabled={
                              isUpdating ||
                              isOutOfStock ||
                              (availableStock > 0 &&
                                item.quantity >= availableStock)
                            }
                            className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:border-black disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          {showDiscount && (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString()}
                              </p>
                              <p className="text-xs text-green-600 font-medium mb-1">
                                {discountPercentage}% OFF
                              </p>
                            </>
                          )}
                          <p className="text-sm text-gray-500">
                            ₹{discountedPrice.toLocaleString()} ×{" "}
                            {item.quantity}
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            ₹
                            {(discountedPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-6">
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
                {subtotal > 0 && subtotal < 999 && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    Add ₹{(999 - subtotal).toLocaleString()} more for free
                    shipping!
                  </div>
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

              <button
                onClick={proceedToCheckout}
                className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Proceed to Checkout{" "}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    Secure 256-bit SSL encryption
                  </span>
                </div>

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
                        On orders over ₹999
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
