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
import { API_URL } from "../utils/constants";

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
      const res = await fetch(`${API_URL}/cart`, {
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
      const res = await fetch(`${API_URL}/cart`, {
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
      const res = await fetch(`${API_URL}/cart/${productId}`, {
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

  // Calculate prices using sellingPrice (rounded to whole numbers)
  const getItemPrice = (item) => {
    return Math.round(item.sellingPrice || item.price || 0);
  };

  const getItemOriginalPrice = (item) => {
    return Math.round(item.originalPrice || 0);
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
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl shadow-[#00000005] flex items-center justify-center mx-auto mb-10 border border-[#f0f4ff] relative rotate-3">
            <div className="absolute inset-2 bg-[#f0f4ff] rounded-[2rem] -rotate-6 transition-transform hover:rotate-0 duration-500"></div>
            <ShoppingBag className="w-12 h-12 text-[#004ac6] relative" />
          </div>
          <h2 className="font-display text-4xl font-extrabold text-[#141b2d] mb-4 tracking-tight">
            Your Bag is Empty
          </h2>
          <p className="font-body text-[#5c6880] text-sm mb-10 max-w-xs mx-auto leading-relaxed">
            There’s currently no curation in your bag. Explore our latest arrivals to find your next favorite artifact.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-10 py-5 bg-[#141b2d] text-white font-display font-bold rounded-2xl hover:bg-[#004ac6] transition-all shadow-xl shadow-black/10 flex items-center gap-3 mx-auto group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Explore Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-6">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-[#141b2d] tracking-tight">
            Shopping Cart ({cart.items.length} items)
          </h1>
          <p className="font-body text-[#5c6880] text-xs mt-1">
            Manage your curated selection before checkout.
          </p>
        </div>

        {/* Stock Notice Banner */}
        {stockNotice && (
          <div
            className={`mb-6 p-4 rounded-[1.5rem] flex items-center justify-between border ${stockNotice.type === "removed"
                ? "bg-red-50/50 border-red-100"
                : "bg-amber-50/50 border-amber-100"
              }`}
          >
            <div className="flex items-center gap-4">
              <Info className={`w-5 h-5 ${stockNotice.type === "removed" ? "text-red-500" : "text-amber-500"}`} />
              <p className={`font-body text-sm ${stockNotice.type === "removed" ? "text-red-600" : "text-amber-600"}`}>
                {stockNotice.message}
              </p>
            </div>
            <button onClick={() => setStockNotice(null)}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => {
              const product = item.product;
              const productName = product?.name || item.productName || "Product";
              const productImg = product?.productImg?.[0] || item.productImg;
              const productId = product?._id || item.productId || item.product;
              const updateKey = `${productId}-${item.color}-${item.size}`;
              const isUpdating = updatingItems[updateKey];

              return (
                <div
                  key={item._id || updateKey}
                  className={`bg-white rounded-2xl p-4 border border-[#f0f4ff] transition-all hover:shadow-tonal-sm ${isUpdating ? "opacity-60" : ""
                    }`}
                >
                  <div className="flex gap-4">
                    {/* Image Container */}
                    <div className="w-28 h-28 bg-[#f0f4ff] rounded-2xl flex-shrink-0 flex items-center justify-center p-3 relative group">
                      <img
                        src={productImg}
                        alt={productName}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-display text-base font-bold text-[#141b2d] leading-tight">
                            {productName}
                          </h3>
                          <div className="flex flex-wrap gap-x-3 mt-1 font-body text-[10px] text-[#5c6880] font-medium uppercase tracking-wider">
                            {item.size && <span>Size: <span className="text-[#141b2d] font-bold">{item.size}</span></span>}
                            {item.color && <span>Color: <span className="text-[#141b2d] font-bold">{formatColorName(item.color)}</span></span>}
                          </div>
                        </div>
                        <p className="font-display text-base font-bold text-[#141b2d]">
                          ₹{getItemPrice(item).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        {/* Pill Quantity Picker */}
                        <div className="flex items-center h-10 bg-[#f0f4ff] rounded-full px-1.5 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(productId, item.color, item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[#141b2d] hover:bg-white/50 transition-colors disabled:opacity-20"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-display font-bold text-xs text-[#141b2d]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, item.color, item.size, item.quantity + 1)}
                            disabled={isUpdating}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[#141b2d] hover:bg-white/50 transition-colors disabled:opacity-20"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(productId, item.color, item.size)}
                          className="flex items-center gap-1.5 text-red-600 font-display font-bold text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Order Summary Card */}
            <div className="bg-white rounded-[1.5rem] border border-[#f0f4ff] p-6 shadow-tonal-sm">
              <h2 className="font-display text-xl font-bold text-[#141b2d] mb-6">
                Order Summary
              </h2>

              <div className="space-y-5 font-body">
                <div className="flex justify-between items-center text-sm text-[#5c6880]">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-[#141b2d]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#5c6880] font-medium">Shipping</span>
                  <span className={`font-bold uppercase tracking-widest text-[10px] ${shipping === 0 ? "text-[#006e2c]" : "text-[#141b2d]"}`}>
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-[#5c6880]">
                  <span className="font-medium">Tax (18% GST)</span>
                  <span className="font-bold text-[#141b2d]">₹{Math.round(subtotal * 0.18).toLocaleString()}</span>
                </div>

                <div className="pt-6 mt-6 border-t border-[#f0f4ff] flex justify-between items-center">
                  <span className="font-display text-base font-bold text-[#141b2d]">Total Amount</span>
                  <span className="font-display text-xl font-bold text-[#141b2d]">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                className="w-full rounded-2xl bg-[#2563eb] text-white font-display font-bold text-sm py-5 mt-10 hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/10 active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 font-body text-[10px] uppercase font-bold tracking-widest">
                <Lock className="w-3.5 h-3.5 fill-gray-400 border-none" />
                100% Secure Checkout
              </div>
            </div>

            {/* Member Banner Card */}
            <div className="bg-[#e1e8fd]/40 rounded-2xl p-6 border border-[#f0f4ff] flex items-center gap-5 group hover:bg-[#e1e8fd]/60 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#004ac6] translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                <CreditCard className="w-5 h-5 text-[#004ac6]" />
              </div>
              <div>
                <h4 className="font-display text-xs font-bold text-[#141b2d] uppercase tracking-widest">Member Exclusive</h4>
                <p className="font-body text-[10px] text-[#5c6880] mt-1 leading-relaxed">
                  Earn {Math.round(total * 0.01)} curator points on this purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Cart;
