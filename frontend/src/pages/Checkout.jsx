import React, { useState, useEffect } from "react";
import { sendEmail } from "../utils/emailService";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  MapPin,
  Truck,
  Shield,
  CreditCard,
  Wallet,
  ArrowRight,
  Check,
  Tag,
  X,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { API_URL } from "../utils/constants";

import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";
import WalletModal from "../auth/WalletModal";

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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const FREE_SHIPPING_THRESHOLD = 999;
  const SHIPPING_COST = 50;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0";
    return Math.round(parseFloat(price)).toString();
  };

  const formatPriceDisplay = (price) => {
    return formatPrice(price).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getToken = () => localStorage.getItem("token") || localStorage.getItem("authToken");

  const fetchWallet = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletBalance(res.data.user.walletBalance || 0);
    } catch (err) {
      console.error("Failed to fetch wallet balance");
    }
  };

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
      const items = response.data?.cart?.items || response.data?.items || [];
      
      if (items.length > 0) {
        setOrderItems(items.map(item => ({
          productId: item.product?._id || item.productId || item.product,
          productName: item.productName || item.product?.name || "Product",
          productImg: item.productImg || item.product?.variants?.[0]?.images?.[0] || "",
          color: item.color || "",
          size: item.size || "",
          price: Math.round(item.sellingPrice || item.price || 0),
          originalPrice: Math.round(item.originalPrice || item.price || 0),
          quantity: item.quantity || 1,
          category: item.product?.category || item.category
        })));
      } else {
        navigate("/");
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
      const list = res.data.addresses || [];
      setAddresses(list);
      const defaultAddr = list.find(a => a.isDefault) || list[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    } catch {
      toast.error("Failed to load addresses");
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    loadOrderItems(token);
    loadAddresses(token);
    fetchWallet();
  }, [navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    try {
      const response = await axios.post(`${API_URL}/user/apply-coupon`, 
        { couponCode }, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        toast.success("Coupon applied!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const codFee = selectedPayment === "COD" ? 50 : 0;

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    let base = subtotal + gst;
    if (appliedCoupon.dealType === "percentage") {
      couponDiscountAmount = Math.round((base * appliedCoupon.discount) / 100);
      if (appliedCoupon.maxDiscount) couponDiscountAmount = Math.min(couponDiscountAmount, appliedCoupon.maxDiscount);
    } else if (appliedCoupon.dealType === "fixed") {
      couponDiscountAmount = Math.min(appliedCoupon.discount, base);
    } else if (appliedCoupon.dealType === "free_shipping") {
      couponDiscountAmount = shipping;
    }
  }

  const orderTotal = Math.round(subtotal + gst + shipping + codFee - couponDiscountAmount);
  const walletDeduction = useWallet ? Math.min(walletBalance, orderTotal) : 0;
  const netPayable = orderTotal - walletDeduction;

  const placeOrder = async () => {
    if (!selectedAddressId) return toast.error("Select an address");
    setSubmitting(true);
    try {
      const orderData = {
        items: orderItems.map(i => ({ product: i.productId, quantity: i.quantity, price: i.price, name: i.productName, color: i.color, size: i.size })),
        addressId: selectedAddressId,
        paymentMethod: selectedPayment,
        walletUsed: walletDeduction,
        couponCode: appliedCoupon?.code,
        totalAmount: orderTotal
      };
      const { data } = await axios.post(`${API_URL}/order/create`, orderData, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (data.success) {
        if (data.razorpayOrder) {
          openRazorpay(data.razorpayOrder, orderData);
        } else {
          toast.success("Order placed!");
          navigate(`/orderConfirm/${data.order._id}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
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
      handler: (res) => verifyPayment(res, orderData),
      theme: { color: "#141b2d" },
      modal: { ondismiss: () => setSubmitting(false) }
    };
    new window.Razorpay(options).open();
  };

  const verifyPayment = async (res, orderData) => {
    try {
      const { data } = await axios.post(`${API_URL}/order/verify-payment`, { ...res, orderData }, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (data.success) {
        if (refreshCart) await refreshCart();
        navigate(`/orderConfirm/${data.order._id}`);
      }
    } catch {
      toast.error("Verification failed");
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f9f9ff] py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold text-[#141b2d] mb-10 tracking-tight">Secured Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-8">
            {/* Address */}
            <section className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl font-bold text-[#141b2d]">Shipping Details</h2>
                <button onClick={() => document.getElementById("add_address_modal").showModal()} className="text-xs font-bold text-[#004ac6] uppercase tracking-widest">+ New Address</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr._id} onClick={() => setSelectedAddressId(addr._id)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedAddressId === addr._id ? "border-[#004ac6] bg-blue-50/20" : "border-[#f0f4ff] hover:border-[#e1e8fd]"}`}>
                    <div className="flex justify-between mb-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#004ac6] bg-blue-50 px-2 py-1 rounded-md">{addr.addressType || 'Home'}</span>
                       {selectedAddressId === addr._id && <Check className="w-4 h-4 text-[#004ac6]" />}
                    </div>
                    <p className="font-bold text-sm text-[#141b2d]">{addr.fullName}</p>
                    <p className="text-[11px] text-[#5c6880] mt-1 line-clamp-2">{addr.street}, {addr.city}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-sm">
              <h2 className="font-display text-xl font-bold text-[#141b2d] mb-8">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setSelectedPayment("Razorpay")} className={`p-6 rounded-2xl border-2 text-left transition-all relative ${selectedPayment === "Razorpay" ? "border-[#004ac6] bg-blue-50/20" : "border-[#f0f4ff]"}`}>
                   <CreditCard className={`w-6 h-6 mb-3 ${selectedPayment === "Razorpay" ? "text-[#004ac6]" : "text-gray-400"}`} />
                   <p className="font-bold text-sm text-[#141b2d]">Online Payment</p>
                   <p className="text-[10px] text-[#5c6880] uppercase mt-0.5">UPI, Cards, Wallet</p>
                </button>
                <button onClick={() => setSelectedPayment("COD")} className={`p-6 rounded-2xl border-2 text-left transition-all relative ${selectedPayment === "COD" ? "border-[#004ac6] bg-blue-50/20" : "border-[#f0f4ff]"}`}>
                   <Truck className={`w-6 h-6 mb-3 ${selectedPayment === "COD" ? "text-[#004ac6]" : "text-gray-400"}`} />
                   <p className="font-bold text-sm text-[#141b2d]">Cash on Delivery</p>
                   <p className="text-[10px] text-[#5c6880] uppercase mt-0.5">₹50 Fee · Pay at Door</p>
                </button>
              </div>

            {/* Wallet Integration */}
            <div className="mt-8 pt-8 border-t border-[#f0f4ff]">
               <div 
                 onClick={() => walletBalance > 0 && setUseWallet(!useWallet)} 
                 className={`group relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-tonal-md ${
                   useWallet 
                    ? "border-[#004ac6] bg-[#004ac6]/[0.02]" 
                    : "border-[#f0f4ff] bg-white hover:border-[#e1e8fd]"
                 }`}
               >
                  {/* Decorative Gradient Backdrop */}
                  <div className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full blur-[80px] transition-opacity duration-1000 ${useWallet ? "bg-[#004ac6]/10 opacity-100" : "opacity-0"}`} />
                  
                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${
                          useWallet 
                            ? "bg-[#004ac6] text-white shadow-lg shadow-blue-500/20" 
                            : "bg-[#f9f9ff] text-[#5c6880] border border-[#f0f4ff]"
                        }`}>
                           <Wallet className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="font-display text-base font-bold text-[#141b2d]">Use Wallet Balance</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="font-body text-[11px] text-[#5c6880] uppercase tracking-widest font-semibold">Available</span>
                              <span className={`font-display text-sm font-bold ${walletBalance > 0 ? "text-[#004ac6]" : "text-red-500"}`}>
                                ₹{formatPriceDisplay(walletBalance)}
                              </span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        {walletBalance === 0 && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); setShowWalletModal(true); }} 
                             className="px-5 py-2.5 bg-[#141b2d] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#004ac6] transform hover:-translate-y-1 transition-all shadow-lg active:scale-95"
                           >
                              Recharge Now
                           </button>
                        )}
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                          useWallet 
                            ? "bg-[#004ac6] border-[#004ac6] shadow-inner" 
                            : "border-[#e1e8fd] bg-white"
                        }`}>
                           {useWallet && <Check className="w-4 h-4 text-white stroke-[3.5px]" />}
                        </div>
                     </div>
                  </div>

                  {useWallet && walletBalance < orderTotal && (
                     <div className="mt-5 pt-5 border-t border-[#004ac6]/10 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#004ac6]">
                          <Shield className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#004ac6]">Partial wallet payment enabled · Pay remaining via {selectedPayment}</p>
                     </div>
                  )}
               </div>
            </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="sticky top-24 space-y-6">
             <div className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-sm">
                <h3 className="font-display text-lg font-bold text-[#141b2d] mb-6">Order Summary</h3>
                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                   {orderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                         <div className="w-14 h-14 bg-[#f9f9ff] rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-[#f0f4ff]">
                            <img src={item.productImg} alt="" className="w-full h-full object-contain" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#141b2d] truncate">{item.productName}</p>
                            <p className="text-[10px] text-[#5c6880] mt-1 italic">Qty: {item.quantity} · {item.size}</p>
                            <p className="text-[11px] font-bold text-[#141b2d] mt-1">₹{formatPriceDisplay(item.price * item.quantity)}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-[#f0f4ff]">
                   {!appliedCoupon ? (
                      <div className="p-2 bg-[#f9f9ff] rounded-xl flex gap-2 border border-[#f0f4ff]">
                         <input type="text" placeholder="Promo Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 bg-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none" />
                         <button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode} className="bg-[#141b2d] text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">{applyingCoupon ? '...' : 'Apply'}</button>
                      </div>
                   ) : (
                      <div className="flex items-center justify-between bg-blue-50/50 px-4 py-3 rounded-xl border border-blue-100">
                         <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-[#004ac6]" />
                            <span className="text-[10px] font-black text-[#004ac6] uppercase tracking-widest">{appliedCoupon.code}</span>
                         </div>
                         <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-[#5c6880] hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                   )}
                </div>

                <div className="space-y-4 mt-8 pt-8 border-t border-[#f0f4ff]">
                   <div className="flex justify-between text-[11px] text-[#5c6880] font-medium uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-[#141b2d]">₹{formatPriceDisplay(subtotal)}</span>
                   </div>
                   <div className="flex justify-between text-[11px] text-[#5c6880] font-medium uppercase tracking-widest">
                      <span>Tax (18%)</span>
                      <span className="text-[#141b2d]">₹{formatPriceDisplay(gst)}</span>
                   </div>
                   <div className="flex justify-between text-[11px] text-[#5c6880] font-medium uppercase tracking-widest">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-600 font-bold" : "text-[#141b2d]"}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                   </div>
                   {codFee > 0 && (
                      <div className="flex justify-between text-[11px] text-[#5c6880] font-medium uppercase tracking-widest">
                        <span>COD Fee</span>
                        <span className="text-[#141b2d]">₹{codFee}</span>
                      </div>
                   )}
                   {couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-[11px] text-green-600 font-bold uppercase tracking-widest">
                        <span>Discount</span>
                        <span>-₹{formatPriceDisplay(couponDiscountAmount)}</span>
                      </div>
                   )}
                   <div className="pt-5 border-t border-[#f0f4ff]">
                      <div className="flex justify-between items-end mb-4">
                         <div>
                            <p className="text-[10px] font-black text-[#5c6880] uppercase tracking-[0.25em] mb-1">Final Total</p>
                            <div className="flex items-baseline gap-1">
                               <span className="text-[10px] font-bold text-[#141b2d]">₹</span>
                               <span className="text-3xl font-black text-[#141b2d] tracking-tighter italic">{formatPriceDisplay(netPayable)}</span>
                            </div>
                         </div>
                         {walletDeduction > 0 && (
                            <div className="text-right">
                               <p className="text-[9px] text-[#004ac6] font-extrabold uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-[#004ac6]/10">
                                 - ₹{formatPriceDisplay(walletDeduction)} Saved
                               </p>
                            </div>
                         )}
                      </div>

                      <button 
                        onClick={placeOrder} 
                        disabled={submitting} 
                        className="group w-full relative overflow-hidden bg-[#141b2d] text-white py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.35em] transition-all duration-500 hover:bg-[#004ac6] hover:shadow-tonal-lg active:scale-[0.98] disabled:opacity-50 mt-4 h-[72px]"
                      >
                         <div className="relative z-10 flex items-center justify-center gap-4">
                            {submitting ? (
                              <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                               <>
                                 <span>{netPayable === 0 ? "Pay via Wallet" : "Complete Purchase"}</span>
                                 <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                               </>
                            )}
                         </div>
                         {/* Shimmer effect */}
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </button>

                      <div className="mt-8 flex items-center justify-center gap-6 opacity-30 group">
                         <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 group-hover:text-[#004ac6] transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure</span>
                         </div>
                         <div className="h-1 w-1 bg-[#5c6880] rounded-full" />
                         <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 group-hover:text-[#004ac6] transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Insured</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>

      <AddAddressModal onAddressAdded={() => loadAddresses(getToken())} />
      <EditAddressModal isOpen={!!editingAddress} onClose={() => setEditingAddress(null)} address={editingAddress} onRefresh={() => loadAddresses(getToken())} />
      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} onRefresh={fetchWallet} />
    </div>
  );
};

export default Checkout;
