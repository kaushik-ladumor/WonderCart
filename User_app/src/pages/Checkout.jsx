import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BadgePercent,
  Building2,
  Check,
  Circle,
  CreditCard,
  Landmark,
  MapPin,
  Phone,
  Plus,
  Shield,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import { API_URL } from "../utils/constants";
import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";
import WalletModal from "../auth/WalletModal";

const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 50;

const formatPrice = (price) =>
  `Rs ${Math.round(Number(price || 0)).toLocaleString("en-IN")}`;

const paymentRows = [
  {
    key: "razorpay",
    title: "Razorpay (Cards, UPI, Wallets)",
    subtitle: "Pay securely with any Indian bank",
    icon: CreditCard,
  },
  {
    key: "netbanking",
    title: "Net Banking",
    subtitle: "Select from a list of major banks",
    icon: Landmark,
  },
  {
    key: "cod",
    title: "Cash on Delivery",
    subtitle: "Pay when you receive your order",
    icon: Truck,
  },
];

const getItemImage = (item) =>
  item?.productImg ||
  item?.image ||
  item?.product?.image ||
  item?.product?.images?.[0] ||
  item?.product?.variants?.find((variant) => variant?.images?.[0])?.images?.[0] ||
  "";

const Checkout = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDirectOrder, setIsDirectOrder] = useState(false);
  const [paymentOption, setPaymentOption] = useState("cod");
  const [orderItems, setOrderItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [applyingReward, setApplyingReward] = useState(false);
  const [appliedRewardCoupon, setAppliedRewardCoupon] = useState(null);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const selectedAddress = useMemo(
    () => addresses.find((item) => item._id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  const actualPaymentMethod = paymentOption === "cod" ? "COD" : "Razorpay";

  const fetchWallet = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletBalance(res.data.user.walletBalance || 0);
      setRewardPoints(res.data.user.rewardPoints || 0);
    } catch (error) {
      console.error("Failed to fetch wallet balance", error);
    }
  };

  const loadOrderItems = async (token) => {
    try {
      const directOrder = sessionStorage.getItem("directOrder");
      if (directOrder) {
        setOrderItems(JSON.parse(directOrder));
        setIsDirectOrder(true);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = response.data?.cart?.items || response.data?.items || [];
      if (!items.length) {
        navigate("/");
        return;
      }

      setOrderItems(
        items.map((item) => ({
          productId: item.product?._id || item.productId || item.product,
          productName: item.productName || item.product?.name || "Product",
          productImg: getItemImage(item),
          color: item.color || item.product?.variants?.[0]?.color || "",
          size: item.size || "",
          price: Math.round(item.sellingPrice || item.price || 0),
          originalPrice: Math.round(item.originalPrice || item.price || 0),
          quantity: item.quantity || 1,
        })),
      );
      setIsDirectOrder(false);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load order items");
      setLoading(false);
    }
  };

  const loadAddresses = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/user/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data.addresses || [];
      setAddresses(list);
      const defaultAddress = list.find((item) => item.isDefault) || list[0];
      if (defaultAddress) setSelectedAddressId(defaultAddress._id);
    } catch (error) {
      toast.error("Failed to load addresses");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handlePaymentSuccess = (data) => {
      console.log("💳 Payment Success:", data);
      toast.success(data.message || "Payment successful!");
      sessionStorage.removeItem("directOrder");
      if (refreshCart) refreshCart();
      if (data.orderId) {
        navigate(`/orderConfirm/${data.orderId}`);
      } else {
        navigate("/my-orders");
      }
    };

    const handlePaymentFail = (data) => {
      console.log("❌ Payment Failed:", data);
      setSubmitting(false);
      toast.error(data.message || "Payment failed. Please try again.");
    };

    socket.on("payment-success", handlePaymentSuccess);
    socket.on("payment-fail", handlePaymentFail);

    return () => {
      socket.off("payment-success", handlePaymentSuccess);
      socket.off("payment-fail", handlePaymentFail);
    };
  }, [socket, navigate, refreshCart]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    loadOrderItems(token);
    loadAddresses(token);
    fetchWallet();
    
    // Fetch available coupons
    axios.get(`${API_URL}/user/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setAvailableCoupons(res.data.coupons || []);
    }).catch(err => console.error("Failed to fetch coupons", err));
  }, [navigate]);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const gst = Math.round(subtotal * 0.18);
  const codFee = paymentOption === "cod" ? 50 : 0;

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    const discountBase = subtotal + gst;
    if (appliedCoupon.dealType === "percentage") {
      couponDiscountAmount = Math.round(
        (discountBase * appliedCoupon.discount) / 100,
      );
      if (appliedCoupon.maxDiscount) {
        couponDiscountAmount = Math.min(
          couponDiscountAmount,
          appliedCoupon.maxDiscount,
        );
      }
    } else if (appliedCoupon.dealType === "fixed") {
      couponDiscountAmount = Math.min(appliedCoupon.discount, discountBase);
    } else if (appliedCoupon.dealType === "free_shipping") {
      couponDiscountAmount = shipping;
    }
  }

  const rewardDiscountAmount = appliedRewardCoupon === '25' ? 25 : (appliedRewardCoupon === '50' ? 50 : 0);
  const orderTotal = Math.round(
    subtotal + shipping + gst + codFee - couponDiscountAmount - rewardDiscountAmount,
  );
  const walletDeduction = useWallet ? Math.min(walletBalance, orderTotal) : 0;
  const netPayable = Math.max(orderTotal - walletDeduction, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const response = await axios.post(
        `${API_URL}/user/apply-coupon`,
        { couponCode: couponCode.trim() },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponCode(response.data.coupon.code || couponCode.trim());
        toast.success("Coupon applied");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const finalizeOrder = async (orderId) => {
    sessionStorage.removeItem("directOrder");
    sessionStorage.removeItem("directOrderTotal");
    if (!isDirectOrder && refreshCart) await refreshCart();
    navigate(`/orderConfirm/${orderId}`);
  };

  const verifyPayment = async (response, orderData) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/order/verify-payment`,
        { ...response, orderData },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      if (data.success) await finalizeOrder(data.order._id);
    } catch (error) {
      toast.error("Verification failed");
      setSubmitting(false);
    }
  };

  const openRazorpay = (razorpayOrder, orderData) => {
    const options = {
      key: RAZORPAY_KEY,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "WonderCart",
      order_id: razorpayOrder.id,
      handler: (response) => verifyPayment(response, orderData),
      theme: { color: "#0f49d7" },
      modal: { ondismiss: () => setSubmitting(false) },
    };
    new window.Razorpay(options).open();
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Select an address");
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: orderItems.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.productName,
          color: item.color,
          size: item.size,
        })),
        addressId: selectedAddressId,
        paymentMethod: actualPaymentMethod,
        walletUsed: walletDeduction,
        couponCode: appliedCoupon?.code,
        rewardCouponType: appliedRewardCoupon,
        totalAmount: orderTotal,
      };

      const { data } = await axios.post(`${API_URL}/order/create`, orderData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!data.success) {
        toast.error(data.message || "Order failed");
        setSubmitting(false);
        return;
      }

      if (data.razorpayOrder) {
        openRazorpay(data.razorpayOrder, orderData);
        return;
      }

      toast.success("Order placed");
      await finalizeOrder(data.order._id);
    } catch (error) {
      console.error("DEBUG - Full Axiios error object:", error);
      console.error("DEBUG - Response status:", error.response?.status);
      console.error("DEBUG - Response headers:", error.response?.headers);
      console.error("DEBUG - Response data:", error.response?.data);

      let errorMsg = "Something went wrong. Please check your internet connection.";
      if (error.response) {
        // The server responded with a status code that falls out of the range of 2xx
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMsg = "No response from server. Please ensure the backend is running on port 4000.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6d7892]">
            WonderCart
          </p>
          <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <section>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.78rem] font-semibold text-white">
                  1
                </span>
                <h2 className="text-[1.1rem] font-semibold">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address._id;
                  return (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`rounded-[18px] border bg-white p-3.5 text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#0f49d7] ring-1 ring-[#0f49d7]"
                          : "border-[#d7dcea] hover:border-[#b3bdd2]"
                      }`}
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-3">
                        <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#394867]">
                          {address.addressType || "Home"}
                        </span>
                        {isSelected ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f49d7] text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <Circle className="h-4.5 w-4.5 text-[#b3bdd2]" />
                        )}
                      </div>

                      <p className="text-[0.9rem] font-semibold text-[#11182d]">
                        {address.fullName}
                      </p>
                      <p className="mt-2 text-[0.78rem] leading-5 text-[#33415e]">
                        {address.street}
                        <br />
                        {address.city}, {address.state} - {address.zipCode}
                      </p>
                      <p className="mt-2 text-[0.78rem] font-medium text-[#11182d]">
                        {address.phone}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                              document.getElementById("edit_address_modal")?.showModal();
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#004ac6] hover:underline"
                          >
                            Edit
                          </span>
                          {!address.isDefault && (
                            <span
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm("Set as default address?")) {
                                  try {
                                    const token = getToken();
                                    await axios.put(`${API_URL}/user/address/${address._id}/default`, {}, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    loadAddresses(token);
                                    toast.success("Default address updated");
                                  } catch (err) {
                                    toast.error("Failed to update default");
                                  }
                                }
                              }}
                              className="text-[10px] font-bold uppercase tracking-widest text-[#5c6880] hover:text-[#004ac6] transition-colors"
                            >
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this address?")) {
                              try {
                                const token = getToken();
                                await axios.delete(`${API_URL}/user/address/${address._id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                loadAddresses(token);
                                toast.success("Address deleted");
                              } catch (err) {
                                toast.error("Failed to delete address");
                              }
                            }
                          }}
                          className="text-[#6d7892] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("add_address_modal")?.showModal()
                  }
                  className="flex min-h-[180px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#c6cede] bg-[#f8f9fd] p-3.5 text-center text-[#6d7892]"
                >
                  <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white">
                    <Plus className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-[0.9rem] font-semibold text-[#5b6478]">
                    Add New Address
                  </p>
                </button>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe7ff] text-[0.78rem] font-semibold text-[#0f49d7]">
                  2
                </span>
                <h2 className="text-[1.1rem] font-semibold">Payment Method</h2>
              </div>

              <div className="space-y-2.5">
                {paymentRows.map((row) => {
                  const Icon = row.icon;
                  const isSelected = paymentOption === row.key;

                  return (
                    <button
                      key={row.key}
                      type="button"
                      onClick={() => setPaymentOption(row.key)}
                      className={`flex w-full items-center justify-between rounded-[16px] border bg-white px-4 py-3.5 text-left ${
                        isSelected
                          ? "border-[#0f49d7] ring-1 ring-[#0f49d7]"
                          : "border-[#d7dcea]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-[#0f49d7] bg-[#0f49d7] text-white"
                              : "border-[#98a4bd] bg-white text-white"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <p className="text-[0.9rem] font-semibold text-[#11182d]">
                            {row.title}
                          </p>
                          <p className="text-[0.76rem] text-[#6d7892]">
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                      <Icon className="h-4.5 w-4.5 text-[#7b8498]" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 rounded-[16px] border border-[#d7dcea] bg-white p-3.5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef2ff] text-[#0f49d7]">
                      <Wallet className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-[0.88rem] font-semibold text-[#11182d]">
                        Use wallet balance
                      </p>
                      <p className="mt-1 text-[0.76rem] text-[#6d7892]">
                        Available {formatPrice(walletBalance)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {walletBalance <= 0 && (
                      <button
                        type="button"
                        onClick={() => setShowWalletModal(true)}
                        className="rounded-xl border border-[#d7dcea] px-3 py-1.5 text-[0.76rem] font-medium text-[#11182d]"
                      >
                        Add Money
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        walletBalance > 0 && setUseWallet((prev) => !prev)
                      }
                      className={`rounded-xl px-3 py-1.5 text-[0.76rem] font-medium ${
                        useWallet
                          ? "bg-[#0f49d7] text-white"
                          : "border border-[#d7dcea] bg-white text-[#11182d]"
                      }`}
                    >
                      {useWallet ? "Applied" : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-3 xl:sticky xl:top-24">
            <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
              <h3 className="text-[1.05rem] font-semibold text-[#11182d]">
                Order Summary
              </h3>

              <div className="mt-3.5 space-y-3">
                {orderItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex gap-2.5">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] bg-[#f1f4fb]">
                      {item.productImg ? (
                        <img
                          src={item.productImg}
                          alt={item.productName}
                          className="h-full w-full object-contain p-2 mix-blend-multiply"
                        />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-[#8b96ad]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.82rem] font-semibold text-[#11182d]">
                        {item.productName}
                      </p>
                      <p className="mt-0.5 text-[0.74rem] text-[#6d7892]">
                        Qty: {item.quantity}
                        {item.size ? ` • ${item.size}` : ""}
                        {item.color ? ` • ${item.color}` : ""}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] font-semibold text-[#11182d]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[16px] bg-[#eef2ff] p-3">
                {!appliedCoupon ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="h-10 flex-1 rounded-[10px] border border-[#d7dcea] bg-white px-3 text-[0.76rem] uppercase tracking-[0.12em] text-[#11182d] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#7c88a2]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="rounded-[10px] bg-[#0f49d7] px-3.5 text-[0.76rem] font-medium text-white disabled:opacity-50"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>

                    <div className="mt-4 border-t border-[#d7dcea] pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[0.76rem] font-semibold text-[#11182d]">Wonder Points</p>
                            <span className="text-[0.7rem] font-bold text-[#0f49d7]">{rewardPoints} Pts</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                type="button"
                                onClick={() => {
                                    if (rewardPoints >= 250) {
                                        setAppliedRewardCoupon(appliedRewardCoupon === '25' ? null : '25');
                                    } else {
                                        toast.error("You need at least 250 points");
                                    }
                                }}
                                className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${
                                    appliedRewardCoupon === '25' 
                                    ? 'bg-[#eef2ff] border-[#0f49d7] ring-1 ring-[#0f49d7]' 
                                    : 'bg-white border-[#d7dcea] hover:border-[#0f49d7]'
                                }`}
                            >
                                <span className={`text-[0.8rem] font-bold ${appliedRewardCoupon === '25' ? 'text-[#0f49d7]' : 'text-[#11182d]'}`}>₹25 Off</span>
                                <span className="text-[0.6rem] text-[#6d7892]">250 Points</span>
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    if (rewardPoints >= 500) {
                                        setAppliedRewardCoupon(appliedRewardCoupon === '50' ? null : '50');
                                    } else {
                                        toast.error("You need at least 500 points");
                                    }
                                }}
                                className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${
                                    appliedRewardCoupon === '50' 
                                    ? 'bg-[#eef2ff] border-[#0f49d7] ring-1 ring-[#0f49d7]' 
                                    : 'bg-white border-[#d7dcea] hover:border-[#0f49d7]'
                                }`}
                            >
                                <span className={`text-[0.8rem] font-bold ${appliedRewardCoupon === '50' ? 'text-[#0f49d7]' : 'text-[#11182d]'}`}>₹50 Off</span>
                                <span className="text-[0.6rem] text-[#6d7892]">500 Points</span>
                            </button>
                        </div>
                        {appliedRewardCoupon && (
                            <p className="mt-2 text-[0.65rem] text-[#0f7a32] flex items-center gap-1">
                                <Check className="w-3 h-3" /> Reward points will be deducted on order placement
                            </p>
                        )}
                    </div>
                    {availableCoupons.length > 0 && (
                      <div className="mt-4 border-t border-[#d7dcea] pt-3">
                        <p className="mb-2 text-[0.76rem] font-semibold text-[#11182d]">Available Coupons</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                          {availableCoupons.map(c => (
                            <div key={c._id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#e1e5f1] hover:border-[#0f49d7] cursor-pointer transition-colors"
                                 onClick={() => {
                                    setCouponCode(c.code);
                                    // Let the user click Apply themselves, or we can apply it automatically
                                 }}>
                              <div>
                                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[#0f49d7] bg-[#eef2ff] px-1.5 py-0.5 rounded">{c.code}</span>
                                <p className="text-[0.7rem] mt-1 text-[#42506d]">{c.description || `${c.discount}${c.dealType === 'percentage' ? '%' : ' Rs'} off`}</p>
                              </div>
                              <button type="button" 
                                      className="text-[0.7rem] font-semibold text-[#0f49d7]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCouponCode(c.code);
                                        // Wait a tick for state to update, passing the specific code is easier but handleApplyCoupon uses state
                                      }}>
                                Use
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-[#0f7a32]">
                      <BadgePercent className="h-3.5 w-3.5" />
                      <span className="text-[0.74rem] font-semibold uppercase tracking-[0.12em]">
                        Code "{appliedCoupon.code}" applied
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                      className="mt-2 text-[0.76rem] font-medium text-[#0f49d7]"
                    >
                      Remove coupon
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2.5 border-t border-[#e7ebf4] pt-4 text-[0.76rem]">
                <div className="flex items-center justify-between">
                  <span className="text-[#42506d]">Subtotal</span>
                  <span className="font-medium text-[#11182d]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#42506d]">Shipping</span>
                  <span className={shipping === 0 ? "font-medium text-[#0f7a32]" : "font-medium text-[#11182d]"}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                {couponDiscountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#42506d]">Discount</span>
                    <span className="font-medium text-[#d12828]">
                      -{formatPrice(couponDiscountAmount)}
                    </span>
                  </div>
                )}
                {walletDeduction > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#42506d]">Wallet</span>
                    <span className="font-medium text-[#0f49d7]">
                      -{formatPrice(walletDeduction)}
                    </span>
                  </div>
                )}
                {codFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#42506d]">COD fee</span>
                    <span className="font-medium text-[#11182d]">
                      {formatPrice(codFee)}
                    </span>
                  </div>
                )}
                {rewardDiscountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#42506d]">Reward Discount</span>
                    <span className="font-medium text-[#0369a1]">
                      -{formatPrice(rewardDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#42506d]">GST (18%)</span>
                  <span className="font-medium text-[#11182d]">
                    {formatPrice(gst)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-[#e7ebf4] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.9rem] font-semibold text-[#11182d]">
                    Order Total
                  </span>
                  <span className="text-[1.2rem] font-semibold text-[#0f49d7]">
                    {formatPrice(netPayable)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting}
                  className="mt-4 h-11 w-full rounded-[14px] bg-[#0f49d7] text-[0.78rem] font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>

                <div className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-[#5d6a84]">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secure checkout powered by WonderCart</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-[14px] bg-[#f4f6fb] p-2.5 text-center">
                  <div className="text-[#5d6a84]">
                    <Shield className="mx-auto h-3.5 w-3.5" />
                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em]">
                      SSL
                    </p>
                  </div>
                  <div className="text-[#5d6a84]">
                    <Truck className="mx-auto h-3.5 w-3.5" />
                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em]">
                      Express
                    </p>
                  </div>
                  <div className="text-[#5d6a84]">
                    <Shield className="mx-auto h-3.5 w-3.5" />
                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em]">
                      Safe
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedAddress && (
              <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#6d7892]">
                  Delivering To
                </p>
                <p className="mt-2 text-[0.88rem] font-semibold text-[#11182d]">
                  {selectedAddress.fullName}
                </p>
                <div className="mt-2 space-y-1.5 text-[0.76rem] text-[#42506d]">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5" />
                    <span>
                      {selectedAddress.street}, {selectedAddress.city},{" "}
                      {selectedAddress.state} - {selectedAddress.zipCode}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{selectedAddress.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{selectedAddress.addressType || "Home"}</span>
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <AddAddressModal onAddressAdded={() => loadAddresses(getToken())} />
      <EditAddressModal
        address={editingAddress}
        onAddressUpdated={() => {
          loadAddresses(getToken());
          setEditingAddress(null);
        }}
      />
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onRefresh={fetchWallet}
      />
    </div>
  );
};

export default Checkout;
