import React, { useState, useEffect } from "react";
import { sendEmail } from "../utils/emailService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  User,
  MapPin,
  Truck,
  Lock,
  Shield,
  Package,
  CreditCard,
  Wallet,
  ArrowRight,
  Check,
  Plus,
  Pencil,
  Trash2,
  Star,
  CheckCircle,
  Home,
  Briefcase,
  Tag,
  Ticket,
  X,
  Calendar,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { API_URL } from "../utils/constants";

import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";

const Checkout = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponList, setShowCouponList] = useState(false);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // Round price to nearest integer (no decimals)
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0";
    const rounded = Math.round(parseFloat(price));
    return rounded.toString();
  };

  // Format price with commas (Indian numbering system)
  const formatPriceDisplay = (price) => {
    const formatted = formatPrice(price);
    return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get FREE shipping threshold (₹999)
  const FREE_SHIPPING_THRESHOLD = 999;
  // Shipping cost if below threshold
  const SHIPPING_COST = 50;

  const getToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast.error("Please login first");
      document.getElementById("login_modal")?.showModal();
      return;
    }

    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${API_URL}/user/coupons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableCoupons(res.data.coupons || []);
      } catch (err) {
        console.error("Failed to fetch coupons");
      }
    };

    loadOrderItems(token);
    loadAddresses(token);
    fetchCoupons();
  }, [navigate]);

  const loadOrderItems = async (token) => {
    try {
      const directOrder = sessionStorage.getItem("directOrder");

      if (directOrder) {
        setOrderItems(JSON.parse(directOrder));
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = response.data?.cart || response.data;

      if (cartData?.items && cartData.items.length > 0) {
        const items = cartData.items.map((item) => {
          const sellingPrice = item.sellingPrice || item.price || 0;
          const originalPrice = item.originalPrice || sellingPrice;
          const discount = item.discount || 0;

          return {
            productId: item.product?._id || item.productId || item.product,
            productName: item.productName || item.product?.name || "Product",
            productImg:
              item.productImg || item.product?.variants?.[0]?.images?.[0] || "",
            color: item.color || "",
            size: item.size || "",
            price: Math.round(sellingPrice),
            originalPrice: Math.round(originalPrice),
            discount: discount,
            quantity: item.quantity || 1,
          };
        });
        setOrderItems(items);
      } else {
        toast.error("Your cart is empty");
        navigate("/");
        return;
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load order items");
      setLoading(false);
    }
  };

  const loadAddresses = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/user/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const addressesList = res.data.addresses || [];
      setAddresses(addressesList);

      const defaultAddress = addressesList.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (addressesList.length > 0) {
        setSelectedAddressId(addressesList[0]._id);
      }
    } catch {
      toast.error("Failed to load addresses");
    }
  };

  const refreshAddresses = async () => {
    const token = getToken();
    await loadAddresses(token);
  };

  const handleSetDefault = async (addressId) => {
    const token = getToken();

    try {
      const response = await axios.put(
        `${API_URL}/user/address/${addressId}/default`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Default address updated");
        refreshAddresses();
      }
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    const token = getToken();

    try {
      setDeletingAddressId(addressId);
      const response = await axios.delete(
        `${API_URL}/user/address/${addressId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Address deleted successfully");

        if (selectedAddressId === addressId) {
          const remainingAddresses = addresses.filter(
            (a) => a._id !== addressId,
          );
          if (remainingAddresses.length > 0) {
            const newDefault = remainingAddresses.find((a) => a.isDefault);
            setSelectedAddressId(newDefault?._id || remainingAddresses[0]._id);
          } else {
            setSelectedAddressId(null);
          }
        }

        refreshAddresses();
      }
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setTimeout(() => {
      const modal = document.getElementById("edit_address_modal");
      if (modal) {
        modal.showModal();
      }
    }, 50);
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const openAddAddressModal = () => {
    const modal = document.getElementById("add_address_modal");
    if (modal) {
      modal.showModal();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    const token = getToken();
    setApplyingCoupon(true);

    try {
      const response = await axios.post(
        `${API_URL}/user/apply-coupon`,
        { couponCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        toast.success("Coupon applied successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const validateOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return false;
    }

    if (orderItems.length === 0) {
      toast.error("No items to order");
      return false;
    }

    for (const item of orderItems) {
      if (!item.productId) {
        toast.error("Some items are invalid. Please refresh the page.");
        return false;
      }
      if (item.quantity < 1) {
        toast.error("Some items have invalid quantity");
        return false;
      }
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateOrder()) {
      return;
    }

    setSubmitting(true);
    const token = getToken();

    try {
      const selectedAddress = addresses.find(
        (addr) => addr._id === selectedAddressId,
      );

      if (!selectedAddress) {
        toast.error("Selected address not found");
        setSubmitting(false);
        return;
      }

      const isSingleProduct = orderItems.length === 1;

      let orderData;

      if (isSingleProduct) {
        const item = orderItems[0];
        orderData = {
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
          originalPrice: item.originalPrice,
          discount: item.discount,
          totalAmount: total,
          address: selectedAddress,
          addressId: selectedAddressId,
          paymentMethod: selectedPayment,
          couponCode: appliedCoupon?.code,
        };
      } else {
        orderData = {
          items: orderItems.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice,
            discount: item.discount,
            name: item.productName,
            color: item.color,
            size: item.size,
          })),
          totalAmount: total,
          address: selectedAddress,
          addressId: selectedAddressId,
          paymentMethod: selectedPayment,
          couponCode: appliedCoupon?.code,
        };
      }

      const response = await axios.post(`${API_URL}/order/create`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        if (selectedPayment === "Razorpay") {
          openRazorpay(response.data.razorpayOrder, orderData);
        } else {
          sessionStorage.removeItem("directOrder");
          sessionStorage.removeItem("directOrderTotal");
          if (refreshCart) await refreshCart();

          // Send Order Confirmation Email via EmailJS
          const storedUser = JSON.parse(localStorage.getItem("Users"));
          if (response.data.order) {
            sendEmail({
              to_email: storedUser?.email || response.data.order.address?.email,
              type: "orderConfirmation",
              data: {
                user: storedUser,
                order: response.data.order,
              },
            }).catch((err) => console.error("EmailJS Error:", err));
          }

          toast.success("Order placed successfully!");
          navigate(`/orderConfirm/${response.data.order._id}`);
        }
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (err) {
      let errorMessage = "Failed to place order";

      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          toast.error("Session expired. Please login again.");
          document.getElementById("login_modal")?.showModal();
          return;
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid order data";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage);
      setSubmitting(false);
    } finally {
      if (selectedPayment !== "Razorpay") setSubmitting(false);
    }
  };

  const openRazorpay = (razorpayOrder, orderData) => {
    if (!window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      setSubmitting(false);
      return;
    }

    if (!RAZORPAY_KEY) {
      toast.error("Payment gateway configuration error");
      setSubmitting(false);
      return;
    }

    if (!razorpayOrder || !razorpayOrder.id) {
      toast.error("Invalid payment order received");
      setSubmitting(false);
      return;
    }

    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

    const options = {
      key: RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "WonderCart",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      handler: function (response) {
        verifyPayment(response, orderData); // Pass orderData to verification
      },
      prefill: {
        name: selectedAddress?.fullName || "",
        email: localStorage.getItem("userEmail") || "",
        contact: selectedAddress?.phone || "",
      },
      theme: {
        color: "#000000",
      },
      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
          setSubmitting(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initialize payment");
      setSubmitting(false);
    }
  };

  const verifyPayment = async (paymentResponse, orderData) => {
    try {
      const token = getToken();

      const response = await axios.post(
        `${API_URL}/order/verify-payment`,
        {
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderData: orderData, // Send order details for creation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        sessionStorage.removeItem("directOrder");
        sessionStorage.removeItem("directOrderTotal");

        if (refreshCart) await refreshCart();

        // Send Order Confirmation Email via EmailJS
        const storedUser = JSON.parse(localStorage.getItem("Users"));
        if (response.data.order) {
          sendEmail({
            to_email: storedUser?.email || response.data.order.address?.email,
            type: "orderConfirmation",
            data: {
              user: storedUser,
              order: response.data.order,
            },
          }).catch((err) => console.error("EmailJS Error:", err));
        }

        toast.success("Payment successful! Order placed.");
        navigate(`/orderConfirm/${response.data.order._id}`);
      } else {
        toast.error("Payment verification failed");
        setSubmitting(false);
      }
    } catch (error) {
      toast.error("Payment verification error");
      setSubmitting(false);
    }
  };

  // Calculate rounded prices — must match backend Order.Controller.js logic exactly
  const subtotal = orderItems.reduce(
    (sum, item) => sum + Math.round(item.price || 0) * (item.quantity || 1),
    0,
  );

  const totalSavings = orderItems.reduce((sum, item) => {
    const savings = (item.originalPrice || 0) - (item.price || 0);
    return sum + (savings > 0 ? savings * (item.quantity || 1) : 0);
  }, 0);

  // GST and shipping calculated on full subtotal (before coupon), matching backend
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  // Coupon discount calculation — mirrors backend exactly
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    // Determine applicable subtotal (for category coupons, only matching items)
    let applicableSubTotal = subtotal;
    if (appliedCoupon.targetCategory) {
      const targetCat = appliedCoupon.targetCategory.toLowerCase().trim();
      const categoryItems = orderItems.filter(
        (item) => item.category?.toLowerCase().trim() === targetCat,
      );
      if (categoryItems.length > 0) {
        applicableSubTotal = categoryItems.reduce(
          (acc, item) => acc + Math.round(item.price || 0) * (item.quantity || 1),
          0,
        );
      }
    }

    // Base for discount = applicable subtotal + its tax (+ shipping for global coupons)
    let baseForDiscount = applicableSubTotal + Math.round(applicableSubTotal * 0.18);
    if (!appliedCoupon.targetCategory) {
      baseForDiscount += shipping;
    }

    if (appliedCoupon.dealType === "percentage") {
      couponDiscountAmount = Math.round(
        (baseForDiscount * appliedCoupon.discount) / 100,
      );
      if (
        appliedCoupon.maxDiscount &&
        couponDiscountAmount > appliedCoupon.maxDiscount
      ) {
        couponDiscountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.dealType === "fixed") {
      couponDiscountAmount = Math.round(
        Math.min(appliedCoupon.discount, baseForDiscount),
      );
    } else if (appliedCoupon.dealType === "free_shipping") {
      couponDiscountAmount = shipping;
    }
  }

  const total = Math.round(Math.max(0, subtotal + gst + shipping - couponDiscountAmount));

  if (loading) {
    return <Loader />;
  }

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-[#004ac6]/5 flex items-center justify-center mx-auto mb-8 border border-[#f0f4ff]">
            <ShoppingCart className="w-10 h-10 text-[#004ac6]" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-[#141b2d] mb-3 tracking-tight">
            Nothing to secure
          </h2>
          <p className="font-body text-[#5c6880] text-sm mb-8 leading-relaxed">
            Your selection is currently empty. Revisit the collection to find your artifacts.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-[#141b2d] text-white rounded-2xl font-display font-bold text-sm hover:bg-[#004ac6] transition-all shadow-xl shadow-black/10"
          >
            Return to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-body py-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Page Heading */}
        <h1 className="font-display text-2xl font-bold text-[#141b2d] mb-6">
          Checkout securely
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Left Column: Form Sections */}
          <div className="space-y-6">

            {/* Shipping Section */}
            <section className="bg-white rounded-2xl p-5 border border-[#f0f4ff]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-[#141b2d]">Shipping address</h2>
                <button
                  onClick={openAddAddressModal}
                  className="text-xs font-semibold text-[#004ac6] hover:underline"
                >
                  + Add new
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-[#f0f4ff] rounded-xl p-8 text-center">
                  <p className="text-sm text-[#5c6880] mb-4">No addresses found.</p>
                  <button
                    onClick={openAddAddressModal}
                    className="bg-[#141b2d] text-white px-6 py-2 rounded-lg text-sm font-semibold"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => handleAddressSelect(addr._id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedAddressId === addr._id
                        ? "border-[#004ac6] bg-[#f0f4ff]/50"
                        : "border-[#f0f4ff] hover:border-[#e1e8fd]"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#004ac6]">
                          {addr.addressType}
                        </span>
                        {selectedAddressId === addr._id && (
                          <Check className="w-4 h-4 text-[#004ac6]" />
                        )}
                      </div>
                      <p className="font-bold text-sm text-[#141b2d]">{addr.fullName}</p>
                      <p className="text-xs text-[#5c6880] mt-1">{addr.phone}</p>
                      <p className="text-xs text-[#5c6880] mt-2 line-clamp-2">
                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                      </p>

                      <div className="flex gap-3 mt-3 pt-3 border-t border-[#f0f4ff]">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                          className="text-[10px] font-bold text-[#141b2d] uppercase hover:text-[#004ac6]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                          className="text-[10px] font-bold text-red-500 uppercase hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Payment Section */}
            <section className="bg-white rounded-2xl p-5 border border-[#f0f4ff]">
              <h2 className="font-display text-lg font-bold text-[#141b2d] mb-4">Payment method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedPayment("Razorpay")}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${selectedPayment === "Razorpay"
                    ? "border-[#004ac6] bg-[#f0f4ff]/50"
                    : "border-[#f0f4ff] hover:border-[#e1e8fd]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-5 h-5 ${selectedPayment === "Razorpay" ? "text-[#004ac6]" : "text-[#5c6880]"}`} />
                    <div>
                      <p className="text-sm font-bold text-[#141b2d]">Online Payment</p>
                      <p className="text-[10px] text-[#5c6880] uppercase tracking-widest">Cards, UPI, Netbanking</p>
                    </div>
                  </div>
                  {selectedPayment === "Razorpay" && <Check className="absolute top-4 right-4 w-4 h-4 text-[#004ac6]" />}
                </button>

                <button
                  onClick={() => setSelectedPayment("COD")}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative ${selectedPayment === "COD"
                    ? "border-[#004ac6] bg-[#f0f4ff]/50"
                    : "border-[#f0f4ff] hover:border-[#e1e8fd]"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className={`w-5 h-5 ${selectedPayment === "COD" ? "text-[#004ac6]" : "text-[#5c6880]"}`} />
                    <div>
                      <p className="text-sm font-bold text-[#141b2d]">Cash on Delivery</p>
                      <p className="text-[10px] text-[#5c6880] uppercase tracking-widest">Pay at your doorstep</p>
                    </div>
                  </div>
                  {selectedPayment === "COD" && <Check className="absolute top-4 right-4 w-4 h-4 text-[#004ac6]" />}
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="sticky top-20">
            <div className="bg-[#f0f4ff] rounded-2xl p-5">
              <h2 className="font-display text-lg font-bold text-[#141b2d] mb-4">Order summary</h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto no-scrollbar">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img src={item.productImg} className="w-12 h-12 rounded-lg object-contain bg-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#141b2d] truncate">{item.productName}</p>
                      <p className="text-[10px] text-[#5c6880] mt-0.5">Qty: {item.quantity} · Size: {item.size}</p>
                    </div>
                    <p className="text-xs font-bold text-[#141b2d]">₹{formatPriceDisplay(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon"
                      className="flex-1 bg-white border border-[#e1e8fd] rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#004ac6]"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="bg-[#141b2d] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#004ac6] transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#004ac6]/20">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#004ac6]" />
                      <span className="text-[10px] font-bold text-[#004ac6] uppercase">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-[#5c6880] hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-[#e1e8fd] pt-4">
                <div className="flex justify-between text-[#5c6880]">
                  <span>Subtotal</span>
                  <span>₹{formatPriceDisplay(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5c6880]">
                  <span>GST (18%)</span>
                  <span>₹{formatPriceDisplay(gst)}</span>
                </div>
                <div className="flex justify-between text-[#5c6880]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Free" : `₹${formatPriceDisplay(shipping)}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#004ac6] font-medium">
                    <span>Discount</span>
                    <span>-₹{formatPriceDisplay(couponDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#141b2d] font-bold text-lg pt-2 mt-2 border-t border-[#e1e8fd]">
                  <span>Total</span>
                  <span>₹{formatPriceDisplay(total)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={submitting || !selectedAddressId}
                className="w-full mt-6 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-xl py-3.5 font-bold text-sm shadow-lg shadow-blue-900/10 hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Place order"}
              </button>

              <p className="text-[10px] text-center text-[#5c6880] mt-4 uppercase tracking-widest font-medium">
                Encrypted transaction secure
              </p>
            </div>
          </aside>
        </div>
      </div>

      <AddAddressModal onAddressAdded={refreshAddresses} />
      <EditAddressModal
        onAddressUpdated={refreshAddresses}
        address={editingAddress}
      />
    </div>
  );
};

export default Checkout;
