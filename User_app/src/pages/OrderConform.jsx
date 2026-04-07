import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CreditCard as PaymentIcon,
  Home,
  ChevronRight,
  Hash,
  Printer,
  SquareCheckBig,
} from "lucide-react";
import { API_URL } from "../utils/constants";

const OrderConfirmationPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "₹0";
    const num = parseFloat(price);
    if (isNaN(num)) return "₹0";

    const rounded = Math.round(num);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `₹${formatted}`;
  };

  const getDeliveryDate = () => {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 4);
    return delivery.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get product image from variant
  const getProductImage = (item) => {
    // 1. Direct item image (highest priority)
    if (item.image) return item.image;
    if (item.productImg) return item.productImg;

    // 2. Variant-specific image (if color matches)
    if (item.product && item.product.variants) {
      if (item.color) {
        const matchingVariant = item.product.variants.find(
          (v) => v.color && v.color.toLowerCase() === item.color.toLowerCase(),
        );
        if (matchingVariant?.images?.length > 0) {
          return matchingVariant.images[0];
        }
      }

      // 3. First available variant image (fallback)
      const firstWithImg = item.product.variants.find(v => v.images?.length > 0);
      if (firstWithImg) return firstWithImg.images[0];
    }

    // 4. Primary product image/gallery (last resort)
    if (item.product) {
      if (item.product.image) return item.product.image;
      if (item.product.images?.length > 0) return item.product.images[0];
    }

    return "https://cdn-icons-png.flaticon.com/512/3225/3225191.png";
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError("Please login to view order details");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/order/id/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            setError("Session expired. Please login again.");
            return;
          } else if (response.status === 404) {
            setError("Order not found");
          } else {
            throw new Error(`Failed to load order`);
          }
        } else {
          const data = await response.json();

          if (data.success && data.order) {
            const transformedOrder = {
              ...data.order,
              items:
                data.order.items?.map((item) => ({
                  ...item,
                  product: item.product
                    ? {
                      ...item.product,
                      variants: item.product.variants || [],
                      images: item.product.images || [],
                    }
                    : null,
                })) || [],
            };

            setOrder(transformedOrder);
          } else {
            setError(data.message || "Failed to load order details");
          }
        }
      } catch (err) {
        console.error("Fetch order error:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-2" />
          <p className="text-gray-600 text-[0.82rem]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-[0.9rem] font-semibold text-gray-900 mb-2">
            {error.includes("Session expired")
              ? "Session Expired"
              : "Order Not Found"}
          </h2>
          <p className="text-gray-600 text-[0.82rem] mb-5">
            {error || "We couldn't find your order details."}
          </p>
          <div className="flex flex-col gap-2">
            {error.includes("Session expired") ? (
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  document.getElementById("login_modal")?.showModal();
                }}
                className="px-4 py-2.5 bg-black text-white text-[0.82rem] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login Again
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2.5 bg-black text-white text-[0.82rem] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Continue Shopping
              </button>
            )}
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2.5 border border-gray-300 text-[0.82rem] font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        
        {/* Success Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
           <div className="space-y-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                 <CheckCircle className="w-5 h-5" />
              </div>
              <h1 className="font-display text-[1.75rem] font-extrabold text-[#141b2d] tracking-tight">Order Confirmed</h1>
              <p className="font-body text-[0.78rem] text-[#5c6880] max-w-lg leading-relaxed">
                Thank you for shopping! Your curator is preparing your selection. We'll send you an email as soon as your order is out for delivery.
              </p>
           </div>
           
           <div className="bg-[#f0f4ff]/70 border border-blue-50 rounded-2xl p-5 min-w-[180px] text-right shadow-sm">
             <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-[#5c6880] opacity-60 block mb-0.5">Total Amount</span>
             <span className="font-display text-[1.2rem] font-extrabold text-[#004ac6] tracking-tighter italic">{formatPrice(order.totalAmount)}</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Delivery Status Card */}
             <div className="bg-white border border-[#f0f4ff] rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                   <Truck className="w-4 h-4 text-[#004ac6]" />
                   <span className="font-display text-[0.82rem] font-semibold text-[#141b2d]">Delivery Status</span>
                </div>
                
                <div className="relative pt-2 pb-6">
                  <div className="absolute top-[30px] left-8 right-8 h-1 bg-[#f0f4ff] rounded-full">
                     <div className="h-full w-1/3 bg-[#004ac6] rounded-full shadow-md transition-all duration-1000"></div>
                  </div>
                  
                  <div className="flex justify-between relative z-10">
                    {[
                      { label: 'Ordered', icon: CheckCircle, date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'bg-[#004ac6] text-white shadow-md' },
                      { label: 'Processing', icon: CheckCircle, date: 'Oct 12, 02:15 PM', color: 'bg-[#004ac6] text-white shadow-md' },
                      { label: 'Shipped', icon: Truck, date: 'Oct 13, 09:00 AM', color: 'bg-white border-[#004ac6] text-[#004ac6]' },
                      { label: 'Delivered', icon: Home, date: 'Pending', color: 'bg-[#f0f4ff] text-[#e1e8fd]' }
                    ].map((step, i) => (
                       <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full border-4 border-white flex items-center justify-center ${step.color}`}>
                             <step.icon className="w-4 h-4" />
                          </div>
                          <div className="text-center">
                             <p className={`font-display text-[10px] font-semibold uppercase tracking-widest block ${step.color.includes('text-[#e1e8fd]') ? 'text-gray-300' : 'text-[#141b2d]'}`}>{step.label}</p>
                             <p className="font-body text-[8px] text-gray-400 mt-0.5">{step.date}</p>
                          </div>
                       </div>
                    ))}
                  </div>
                </div>
             </div>

             {/* Order Packages */}
             {order.subOrders?.map((sub, idx) => (
               <div key={sub._id} className="bg-white border border-[#f0f4ff] rounded-[1.5rem] p-6 shadow-sm mb-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6 border-b border-[#f9f9ff] pb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                           <Package className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Package {idx + 1}</p>
                           <p className="text-[0.76rem] font-semibold text-[#141b2d]">{sub.subOrderId}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => navigate(`/track-order?id=${sub.subOrderId}`)}
                       className="text-[9px] font-semibold text-[#004ac6] uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-lg hover:bg-[#004ac6] hover:text-white transition-all"
                     >
                        Track Package
                     </button>
                  </div>
                  
                  <div className="space-y-3">
                     {sub.items?.map((item, i) => (
                        <div key={i} className="flex gap-5 items-center group/item hover:bg-gray-50/50 p-2 -mx-2 rounded-2xl transition-all">
                           <div className="relative w-16 h-16 bg-[#f9f9ff] rounded-xl overflow-hidden flex-shrink-0 border border-[#f0f4ff] shadow-sm transform group-hover/item:scale-105 transition-transform">
                              <img 
                                 src={getProductImage(item) || "https://cdn-icons-png.flaticon.com/512/3225/3225191.png"} 
                                 alt={item.name} 
                                 className="w-full h-full object-contain p-2 mix-blend-multiply"
                              />
                              <div className="absolute top-0 right-0 bg-[#004ac6] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                                 {item.quantity}x
                              </div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h3 className="font-display text-[0.78rem] font-semibold text-[#141b2d] mb-0.5 truncate group-hover/item:text-[#004ac6] transition-colors">{item.name}</h3>
                              <div className="flex items-center gap-2">
                                 <p className="font-body text-[9px] text-[#5c6880] uppercase tracking-widest font-semibold">
                                    {item.color} · {item.size}
                                 </p>
                                 <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                 <p className="font-body text-[10px] font-semibold text-[#141b2d] italic">{formatPrice(item.price)}</p>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
             ))}
          </div>

          <div className="lg:col-span-4 space-y-5">
             
             {/* Order Info */}
             <div className="bg-[#f0f4ff]/50 rounded-[1.5rem] p-6 border border-blue-50 shadow-sm">
                <h2 className="font-display text-[0.82rem] font-semibold text-[#141b2d] mb-5 flex items-center gap-2">
                   <Hash className="w-3.5 h-3.5 text-[#004ac6]" /> Order Information
                </h2>
                <div className="space-y-3.5">
                   <div className="flex justify-between items-center group">
                      <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-[#5c6880] opacity-70">Order Number</span>
                      <span className="font-display text-[10px] font-semibold text-[#141b2d]">#WC-{order._id.slice(-8).toUpperCase()}</span>
                   </div>
                   <div className="flex justify-between items-center group">
                      <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-[#5c6880] opacity-70">Order Date</span>
                      <span className="font-display text-[10px] font-semibold text-[#141b2d]">{new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                   </div>
                   <div className="flex justify-between items-center group">
                      <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-[#5c6880] opacity-70">Payment</span>
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 bg-[#004ac6] rounded flex items-center justify-center shadow-sm"><PaymentIcon className="w-3 h-3 text-white" /></div>
                         <span className="font-display text-[10px] font-semibold text-[#141b2d] capitalize">{order.paymentMethod || "Razorpay"}</span>
                      </div>
                   </div>
                    <div className="flex justify-between items-center group">
                       <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-[#5c6880] opacity-70">Status</span>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none border tracking-widest ${
                         order.paymentStatus === 'paid' 
                           ? "bg-[#e7f6ed] text-[#006e2c] border-[#006e2c]/10" 
                           : "bg-blue-50 text-[#004ac6] border-[#004ac6]/10"
                       }`}>
                         {order.paymentStatus === 'paid' ? 'PAID' : (order.paymentStatus?.replace('_', ' ') || 'CONFIRMED')}
                       </span>
                    </div>
                    <div className="flex justify-between items-center group">
                       <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-[#5c6880] opacity-70">Track</span>
                       <span className="font-display text-[10px] font-semibold text-[#004ac6] uppercase tracking-widest italic">{order.paymentStatus === 'paid' ? 'READY TO SHIP' : 'PROCESSING'}</span>
                    </div>
                </div>
             </div>

             {/* Shipping Address */}
             <div className="bg-white border border-[#f0f4ff] rounded-[1.5rem] p-6 shadow-sm">
                <h2 className="font-display text-[0.82rem] font-semibold text-[#141b2d] mb-4 flex items-center gap-2">
                   <MapPin className="w-3.5 h-3.5 text-[#004ac6]" /> Shipping Address
                </h2>
                <div className="space-y-2.5">
                   <p className="font-display text-[0.74rem] font-semibold text-[#141b2d] mb-0.5">{order.address?.fullName || "Aditya Sharma"}</p>
                    <p className="font-body text-[10px] text-[#5c6880] leading-relaxed uppercase">
                       {order.address?.street},<br />
                       {order.address?.city}, {order.address?.state} {order.address?.zipcode || order.address?.zipCode}
                    </p>
                   <div className="pt-1.5 flex items-center gap-2 text-[#141b2d]">
                      <Phone className="w-3 h-3 opacity-40" />
                      <span className="font-body text-[10px] font-semibold">{order.address?.phone || "+91 98765 43210"}</span>
                   </div>
                </div>
             </div>

             {/* Help Card */}
             <div className="bg-[#f0f4ff]/70 rounded-[1.5rem] p-6 border-l-[4px] border-l-[#004ac6] shadow-sm">
                <h3 className="font-display text-[0.74rem] font-semibold text-[#141b2d] mb-2.5">Need Help?</h3>
                <p className="font-body text-[10px] text-[#5c6880] mb-5 leading-relaxed">Our curators are available 24/7 to assist with your delivery.</p>
                <div className="space-y-2.5">
                   <a href="mailto:support@wondercart.com" className="flex items-center gap-2.5 group">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#004ac6] shadow-sm"><Mail className="w-3 h-3" /></div>
                      <span className="font-display text-[10px] font-semibold text-[#141b2d] group-hover:text-[#004ac6] transition-colors">support@wondercart.com</span>
                   </a>
                   <a href="tel:1800-99-WONDER" className="flex items-center gap-2.5 group">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#004ac6] shadow-sm"><Phone className="w-3 h-3" /></div>
                      <span className="font-display text-[10px] font-semibold text-[#141b2d] group-hover:text-[#004ac6] transition-colors">1800-99-WONDER</span>
                   </a>
                </div>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
           <button 
             onClick={() => navigate("/shop")}
             className="min-w-[220px] h-12 bg-[#004ac6] text-white rounded-xl text-[10px] font-semibold uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 hover:bg-[#141b2d] transition-all active:scale-95"
           >
             Continue Shopping
           </button>
           <button 
             onClick={() => window.print()}
             className="min-w-[180px] h-12 bg-[#f0f4ff] text-[#004ac6] rounded-xl text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-blue-100 transition-all active:scale-95"
           >
             Print Invoice
           </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
