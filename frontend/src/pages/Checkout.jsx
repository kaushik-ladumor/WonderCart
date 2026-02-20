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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No items to checkout
          </h2>
          <p className="text-gray-600 text-sm mb-5">Add some items first!</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Header - FAQ style */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <HelpCircle className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-600 text-sm">
            Complete your purchase in just a few steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Shipping Address - FAQ style */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <h2 className="text-base font-bold text-gray-900">
                      Shipping Address
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Where should we deliver your order?
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Select Address
                    </h4>
                    <button
                      onClick={openAddAddressModal}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs font-medium text-black"
                    >
                      <Plus className="w-3 h-3" /> Add New
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                      <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm mb-3">
                        No saved addresses found
                      </p>
                      <button
                        onClick={openAddAddressModal}
                        className="px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`p-3 rounded-lg transition-all cursor-pointer ${selectedAddressId === addr._id
                              ? "border-2 border-black bg-gray-50"
                              : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          onClick={() => handleAddressSelect(addr._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedAddressId === addr._id
                                  ? "border-black bg-black"
                                  : "border-gray-400"
                                }`}
                            >
                              {selectedAddressId === addr._id && (
                                <Check className="w-2.5 h-2.5 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {addr.fullName}
                                    </p>
                                    {addr.addressType && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                        {addr.addressType === "home" ? (
                                          <Home className="w-3 h-3" />
                                        ) : (
                                          <Briefcase className="w-3 h-3" />
                                        )}
                                        {addr.addressType}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {addr.phone}
                                  </p>
                                </div>
                                {addr.isDefault && (
                                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-3">
                                {addr.street}, {addr.city}, {addr.state} -{" "}
                                {addr.zipCode}
                              </p>

                              <div
                                className="flex gap-1.5 mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleEditAddress(addr)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors text-black"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </button>

                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleSetDefault(addr._id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50 transition-colors"
                                  >
                                    <Star className="w-3 h-3" />
                                    Set Default
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  disabled={deletingAddressId === addr._id}
                                  className="flex items-center gap-1 px-2 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingAddressId === addr._id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method - FAQ style */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <h2 className="text-base font-bold text-gray-900">
                      Payment Method
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Choose how you'd like to pay
                  </p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPayment("Razorpay")}
                      className={`p-3 rounded-lg border transition-all text-left ${selectedPayment === "Razorpay"
                          ? "border-2 border-black bg-gray-50"
                          : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedPayment === "Razorpay"
                              ? "border-black bg-black"
                              : "border-gray-400"
                            }`}
                        >
                          {selectedPayment === "Razorpay" && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            Razorpay
                          </p>
                          <p className="text-gray-600 text-xs">
                            Cards, UPI, Wallets
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedPayment("COD")}
                      className={`p-3 rounded-lg border transition-all text-left ${selectedPayment === "COD"
                          ? "border-2 border-black bg-gray-50"
                          : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedPayment === "COD"
                              ? "border-black bg-black"
                              : "border-gray-400"
                            }`}
                        >
                          {selectedPayment === "COD" && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                          <Truck className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            Cash on Delivery
                          </p>
                          <p className="text-gray-600 text-xs">
                            Pay when you receive
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - FAQ style */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-4">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <h2 className="text-base font-bold text-gray-900">
                    Order Summary
                  </h2>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 max-h-60 overflow-y-auto pr-1">
                  {orderItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2">
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.productImg ? (
                            <img
                              src={item.productImg}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://via.placeholder.com/150x150?text=${encodeURIComponent(
                                  item.productName.substring(0, 10),
                                )}`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-xs line-clamp-2 mb-1">
                            {item.productName}
                          </p>
                          <div className="flex gap-1 mb-1">
                            {item.color && (
                              <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                {item.size}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-xs">
                                ₹
                                {formatPriceDisplay(item.price * item.quantity)}
                              </p>
                              {item.discount > 0 && (
                                <div className="flex items-center gap-0.5">
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹
                                    {formatPriceDisplay(
                                      item.originalPrice * item.quantity,
                                    )}
                                  </span>
                                  <span className="text-xs text-green-600 bg-green-50 px-1 py-0.5 rounded">
                                    {item.discount}% OFF
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ₹{formatPriceDisplay(subtotal)}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Product Discount</span>
                      <span className="font-medium text-green-600">
                        -₹{formatPriceDisplay(totalSavings)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium text-gray-900">
                      ₹{formatPriceDisplay(gst)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-black">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${formatPriceDisplay(shipping)}`
                      )}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Promo ({appliedCoupon.code})
                      </span>
                      <span className="font-medium text-green-600">
                        -₹{formatPriceDisplay(Math.round(couponDiscountAmount))}
                      </span>
                    </div>
                  )}

                  {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <div className="text-xs text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                      Add ₹
                      {formatPriceDisplay(FREE_SHIPPING_THRESHOLD - subtotal)}{" "}
                      more for free shipping!
                    </div>
                  )}
                </div>

                {/* Coupon Section - FAQ style */}
                <div className="mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">
                      Have a promo code?
                    </span>
                  </div>

                  {!appliedCoupon ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code"
                          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-black transition-colors uppercase"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode}
                          className="bg-black text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {applyingCoupon ? "..." : "Apply"}
                        </button>
                      </div>

                      {availableCoupons.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setShowCouponList(!showCouponList)}
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          >
                            <Ticket className="w-3 h-3" />
                            {showCouponList ? "Hide" : "View"} available coupons
                            ({availableCoupons.length})
                          </button>

                          {showCouponList && (
                            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                              {availableCoupons.map((c) => (
                                <div
                                  key={c._id}
                                  onClick={() => {
                                    setCouponCode(c.code);
                                    setShowCouponList(false);
                                    toast.success(`Selected ${c.code}`);
                                  }}
                                  className="cursor-pointer bg-white border border-gray-200 hover:border-black rounded-lg p-2 transition-colors"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-bold text-gray-900">
                                      {c.code}
                                    </p>
                                    {c.dealType === "percentage" && (
                                      <span className="text-[8px] bg-green-50 text-green-700 px-1 py-0.5 rounded font-medium">
                                        EXTRA
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-600 line-clamp-1">
                                    {c.name}
                                  </p>
                                  {c.expirationDate && (
                                    <div className="flex items-center gap-1 mt-1 text-[8px] text-amber-600">
                                      <Calendar className="w-2 h-2" />
                                      Expires{" "}
                                      {new Date(
                                        c.expirationDate,
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-800">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[9px] text-green-600">Applied</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-green-700" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Total
                      </p>
                      <p className="text-gray-600 text-xs">
                        Including all charges
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{formatPriceDisplay(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  {!selectedAddressId && addresses.length > 0 && (
                    <div className="text-xs text-red-600 bg-red-50 p-1.5 rounded border border-red-200 mb-2">
                      Please select a shipping address
                    </div>
                  )}
                </div>

                <button
                  onClick={placeOrder}
                  disabled={submitting || !selectedAddressId}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Place Order
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {sessionStorage.getItem("directOrder") === null && (
                  <button
                    onClick={() => navigate("/cart")}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm mb-3"
                  >
                    ← Return to Cart
                  </button>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-900">
                      Secure checkout
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
