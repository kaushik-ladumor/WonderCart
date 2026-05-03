import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  LogIn,
} from "lucide-react";
import { API_URL } from "../utils/constants";
import { useSocket } from "../context/SocketProvider";
import toast from "react-hot-toast";
import OrderActionModal from "../components/OrderActionModal";

const OrderConfirmationPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const socket = useSocket();

  const [modalType, setModalType] = useState(null); // 'cancel' or 'return'
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            // Flatten items from subOrders if needed
            let allItems = data.order.items || [];
            if (allItems.length === 0 && data.order.subOrders?.length > 0) {
              allItems = data.order.subOrders.flatMap(sub => sub.items || []);
            }

            const transformedOrder = {
              ...data.order,
              items:
                allItems.map((item) => ({
                  ...item,
                  product: item.product
                    ? {
                      ...item.product,
                      variants: item.product.variants || [],
                      images: item.product.images || [],
                    }
                    : null,
                })),
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

  useEffect(() => {
    if (order && searchParams.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
        // Clear param to avoid printing again on refresh
        navigate(`/orderConfirm/${id}`, { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [order, searchParams, id, navigate]);

  useEffect(() => {
    if (!socket || !id) return;

    // Join order room for real-time updates
    socket.emit("join-order", id);

    const handleStatusUpdate = (data) => {
      console.log("Real-time order update received:", data);
      if (data.orderId === id && data.order) {
        setOrder(data.order);
        toast.success(data.message || `Order status updated to ${data.status}`, {
          icon: '📦',
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#11182d',
            border: '1px solid #e1e5f1',
          },
        });
      }
    };

    socket.on("order-status-updated", handleStatusUpdate);

    return () => {
      socket.off("order-status-updated", handleStatusUpdate);
    };
  }, [socket, id]);

  const getStatusSteps = () => {
    if (!order) return [];

    const steps = [
      { 
        label: 'Placed', 
        status: 'placed',
        icon: ShoppingBag, 
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending', 
        active: true, 
        done: true 
      },
      { 
        label: 'Confirmed', 
        status: 'confirmed',
        icon: CheckCircle, 
        date: 'Pending', 
        active: false, 
        done: false 
      },
      { 
        label: 'Processing', 
        status: 'processing',
        icon: Loader2, 
        date: 'Pending', 
        active: false, 
        done: false 
      },
      { 
        label: 'Shipped', 
        status: 'shipped',
        icon: Truck, 
        date: 'Pending', 
        active: false, 
        done: false 
      },
      { 
        label: 'Out for Delivery', 
        status: 'out_for_delivery',
        icon: MapPin, 
        date: 'Pending', 
        active: false, 
        done: false 
      },
      { 
        label: 'Delivered', 
        status: 'delivered',
        icon: Home, 
        date: 'Pending', 
        active: false, 
        done: false 
      }
    ];

    const currentStatus = order.status;
    
    // Status Weights for logic
    const statusWeights = {
      "placed": 1,
      "confirmed": 2,
      "processing": 3,
      "shipped": 4,
      "out_for_delivery": 5,
      "delivered": 6,
      "return_requested": 7,
      "returned": 8,
      "refunded": 9,
      "cancelled": -1
    };

    const currentWeight = statusWeights[currentStatus] || 0;
    
    const getTimestamp = (statusName) => {
      let latest = null;
      order.subOrders?.forEach(sub => {
        sub.statusHistory?.forEach(h => {
          if (h.to === statusName) {
            if (!latest || new Date(h.timestamp) > new Date(latest)) {
              latest = h.timestamp;
            }
          }
        });
      });
      return latest;
    };

    const formatTime = (date) => {
      if (!date) return 'Pending';
      return new Date(date).toLocaleString('en-IN', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    };

    steps.forEach((step, index) => {
      const stepWeight = statusWeights[step.status];
      if (currentWeight >= stepWeight) {
        step.active = true;
        step.done = currentWeight > stepWeight;
        const ts = getTimestamp(step.status) || (step.status === 'placed' ? order.createdAt : null);
        step.date = ts ? formatTime(ts) : (step.active && !step.done ? 'In Progress' : 'Pending');
      }
    });

    return steps;
  };

  const handleActionSubmit = async (reason) => {
    const endpoint = modalType === "return" ? "/order/return" : "/order/cancel";
    const successMsg = modalType === "return" ? "Return request submitted" : "Order cancelled";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          orderId: order._id, 
          subOrderId: order.subOrders[0].subOrderId, 
          reason 
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(successMsg);
        setIsModalOpen(false);
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(`Failed to ${modalType} order`);
    }
  };

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

  // Pure Invoice View for Printing (Amazon/Flipkart Style)
  if (order && searchParams.get("print") === "true") {
    return (
      <div className="min-h-screen bg-white p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-bold text-[#11182d] mb-2 uppercase tracking-tight">Tax Invoice</h1>
              <p className="text-gray-500 text-sm font-medium">Order ID: #{order._id.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-[#0f49d7] tracking-tight">WonderCart</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Official Document</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-16">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 pb-2 border-b border-gray-100">Billing & Shipping Details</h3>
              <p className="text-[0.95rem] font-bold text-[#11182d]">{order.address?.fullName}</p>
              <p className="text-sm text-gray-600 leading-relaxed mt-2 font-medium">
                {order.address?.street}<br />
                {order.address?.city}, {order.address?.state} - {order.address?.zipCode}<br />
                Contact: {order.address?.phone}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 pb-2 border-b border-gray-100">Payment Summary</h3>
              <p className="text-sm text-gray-600 mb-2 font-medium">Invoice Date: <span className="text-[#11182d] font-bold ml-2">{new Date(order.createdAt).toLocaleDateString()}</span></p>
              <p className="text-sm text-gray-600 mb-2 font-medium">Payment Mode: <span className="text-[#11182d] font-bold ml-2 uppercase">{order.paymentMethod}</span></p>
              <p className="text-sm text-gray-600 font-medium">Payment Status: <span className="text-emerald-600 font-bold ml-2 uppercase">Verified / Paid</span></p>
            </div>
          </div>

          <table className="w-full mb-16">
            <thead>
              <tr className="border-b-2 border-[#11182d] text-left">
                <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#11182d]">Product Description</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#11182d] text-center">Qty</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#11182d] text-right">Unit Price</th>
                <th className="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#11182d] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td className="py-6">
                    <p className="text-sm font-bold text-[#11182d]">{item.name || item.product?.name || "Ordered Product"}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                      {item.color || "N/A"} / {item.size || "Standard"}
                    </p>
                  </td>
                  <td className="py-6 text-sm text-center text-gray-600 font-medium">{item.quantity}</td>
                  <td className="py-6 text-sm text-right text-gray-600 font-medium">₹{item.price.toLocaleString()}</td>
                  <td className="py-6 text-sm font-bold text-right text-[#11182d]">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-8 border-t-2 border-[#11182d]">
            <div className="w-72 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Net Amount</span>
                <span className="font-bold text-[#11182d]">₹{Math.round(order.totalAmount + (order.couponDiscount || 0) - (order.shippingCost || 0)).toLocaleString()}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">Coupon Savings</span>
                  <span className="font-bold text-emerald-600">-₹{Math.round(order.couponDiscount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500 font-medium uppercase tracking-wider text-[10px]">Shipping Charges</span>
                 <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0f49d7]">Grand Total</span>
                <span className="text-2xl font-bold text-[#0f49d7]">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-32 p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-2 gap-8 items-center">
               <div>
                  <p className="text-[10px] font-bold text-[#11182d] uppercase tracking-[0.1em] mb-1">Return Policy</p>
                  <p className="text-[9px] text-gray-500 leading-relaxed font-medium">Standard 7-day return policy applies. Items must be in original condition with tags intact for successful returns.</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Digital Authenticity</p>
                  <p className="text-[9px] text-gray-400 italic">This is a computer-generated tax invoice. No signature is required.</p>
               </div>
            </div>
          </div>
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
    <div className="min-h-screen bg-[#f8f9fb] pb-16 font-body text-[#11182d]">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          @page { size: auto; margin: 15mm; }
          .invoice-card { border: none !important; box-shadow: none !important; }
        }
        .print-only { display: none; }
      `}} />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 no-print">

        {/* Success Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-[1.5rem] sm:text-[1.75rem] font-semibold text-[#11182d] leading-none tracking-tight">
                Order Confirmed
              </h1>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-[#10b981] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#10b981]/15 shrink-0">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
            <p className="font-body text-[0.82rem] text-[#42506d] max-w-lg leading-relaxed font-medium">
              Thank you for your trust! Your selection is now being processed for dispatch. A detailed confirmation has been dispatched to your registered email.
            </p>
          </div>

          <div className="bg-white border border-[#e1e5f1] rounded-[20px] px-6 py-4 flex flex-col items-start lg:items-end shadow-sm min-w-[200px]">
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d7892] mb-1">Total Amount</span>
            <span className="font-display text-[1.5rem] font-semibold text-[#0f49d7] tracking-tight">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-12 space-y-6">
            
            {/* Delivery Progress Visualization */}
            <div className="bg-white border border-[#e1e5f1] rounded-[24px] p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                 <Truck className="w-32 h-32 text-[#0f49d7] -rotate-12" />
              </div>

              <div className="flex items-center gap-2 mb-10 relative z-10">
                 <span className="w-1.5 h-4 bg-[#0f49d7] rounded-full" />
                 <span className="font-display text-[0.82rem] font-semibold text-[#11182d] uppercase tracking-wider">Fulfillment Status</span>
              </div>

              <div className="relative z-10 px-2 sm:px-10">
                {/* Connecting Line */}
                <div className="absolute top-[21px] left-[8%] right-[8%] h-[1.5px] bg-[#f0f2f8] rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[#0f49d7] rounded-full shadow-[0_0_8px_rgba(15,73,215,0.3)] transition-all duration-1000" 
                     style={{ 
                       width: order.status === 'delivered' ? '100%' : 
                              order.status === 'out_for_delivery' ? '80%' : 
                              order.status === 'shipped' ? '60%' : 
                              order.status === 'processing' ? '40%' : 
                              order.status === 'confirmed' ? '20%' : '5%' 
                     }}
                   />
                </div>

                <div className="flex justify-between items-start">
                  {getStatusSteps().map((step, i) => (
                    <div key={i} className="flex flex-col items-center group w-auto">
                      <div className={`relative w-11 h-11 rounded-full border-[3px] border-white flex items-center justify-center transition-all duration-500 shadow-sm z-20 ${
                        step.done ? 'bg-[#0f49d7] text-white' : 
                        step.active ? 'bg-white border-[#0f49d7] text-[#0f49d7]' : 'bg-[#f6f8fd] text-[#90a0be]'
                      }`}>
                        <step.icon className={`w-4.5 h-4.5 ${step.label === 'Processing' && step.active ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="text-center mt-3">
                        <p className={`font-display text-[10px] font-semibold uppercase tracking-wider block mb-0.5 whitespace-nowrap ${step.active || step.done ? 'text-[#11182d]' : 'text-[#90a0be]'}`}>{step.label}</p>
                        <p className="font-body text-[9px] text-[#6d7892] font-medium">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Package Cards */}
               <div className="space-y-6">
                 {order.subOrders?.map((sub, idx) => (
                   <div key={sub._id} className="bg-white border border-[#e1e5f1] rounded-[20px] overflow-hidden shadow-sm transition-all hover:border-[#0f49d7]/20">
                     <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-[#f1f4f9]">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-[#f6f8fd] rounded-xl flex items-center justify-center text-[#0f49d7] border border-[#eef2ff]">
                              <Package className="w-4.5 h-4.5" />
                           </div>
                           <div>
                              <p className="text-[9px] font-semibold text-[#6d7892] uppercase tracking-widest leading-none mb-1">Package {idx + 1}</p>
                              <p className="text-[0.76rem] font-semibold text-[#11182d]">{sub.subOrderId}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/track-order?id=${sub.subOrderId}`)}
                          className="text-[#0f49d7] hover:bg-[#0f49d7] hover:text-white border border-[#0f49d7]/10 px-4 py-1.5 rounded-lg text-[9px] font-semibold uppercase tracking-wider transition-all"
                        >
                          Track
                        </button>
                     </div>
                     <div className="p-6 space-y-4">
                       {sub.items?.map((item, i) => (
                         <div key={i} className="flex gap-4 items-center group">
                            <div className="relative w-14 h-14 bg-[#f6f8fd] rounded-xl p-1.5 flex-shrink-0 border border-[#eef2ff] group-hover:bg-white transition-colors">
                               <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                               <div className="absolute -top-1.5 -right-1.5 bg-[#11182d] text-white w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white shadow-sm">
                                  {item.quantity}
                               </div>
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[0.78rem] font-semibold text-[#11182d] truncate mb-0.5 group-hover:text-[#0f49d7] transition-colors">{item.name}</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-medium text-[#6d7892] uppercase tracking-wider">{item.color} / {item.size}</span>
                                  <span className="w-1 h-1 rounded-full bg-[#cbd5e1]" />
                                  <span className="text-[0.82rem] font-semibold text-[#0f49d7]">{formatPrice(item.price)}</span>
                               </div>
                            </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>

               {/* Right Sidebar Info */}
               <div className="space-y-6">
                  {/* Order Specifications */}
                  <div className="bg-white rounded-[20px] p-6 border border-[#e1e5f1] shadow-sm">
                     <h3 className="font-display text-[0.82rem] font-semibold text-[#11182d] mb-5 flex items-center gap-2">
                        <SquareCheckBig className="w-4 h-4 text-[#0f49d7]" /> Order Summary
                     </h3>
                     <div className="space-y-4">
                        {[
                          { label: 'Order ID', val: `#WC-${order._id.slice(-8).toUpperCase()}`, icon: Hash },
                          { label: 'Date', val: new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }), icon: Calendar },
                          { label: 'Payment', val: order.paymentMethod || "Direct Payment", icon: PaymentIcon },
                          { label: 'Payment State', val: order.paymentStatus?.toUpperCase() || 'VALIDATED', isBadge: true },
                          { label: 'Tracking', val: order.paymentStatus === 'paid' ? 'READY TO SHIP' : 'PROCESSING', isTracking: true },
                          order.couponDiscount > 0 ? { label: 'Coupon Discount', val: `-₹${order.couponDiscount}`, isSavings: true } : null
                        ].filter(Boolean).map((row, i) => (
                          <div key={i} className="flex justify-between items-center group">
                             <span className="text-[9px] font-semibold text-[#6d7892] uppercase tracking-[0.1em]">{row.label}</span>
                             {row.isBadge ? (
                                <span className="bg-[#e7f6ed] text-[#15753a] font-semibold text-[9px] px-2.5 py-0.5 rounded-md tracking-wider border border-[#d1f2e0]">
                                   {row.val}
                                </span>
                             ) : row.isTracking ? (
                                <span className="text-[9px] font-semibold text-[#0f49d7] uppercase tracking-widest italic">{row.val}</span>
                             ) : row.isSavings ? (
                                <span className="text-[0.78rem] font-bold text-emerald-600">{row.val}</span>
                             ) : (
                                <span className="text-[0.78rem] font-semibold text-[#11182d]">{row.val}</span>
                             )}
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Shipment Navigation */}
                  <div className="bg-white border border-[#e1e5f1] rounded-[20px] p-6 shadow-sm">
                     <h3 className="font-display text-[0.82rem] font-semibold text-[#11182d] mb-5 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0f49d7]" /> Shipping Details
                     </h3>
                     <div className="space-y-3">
                        <p className="text-[0.82rem] font-semibold text-[#11182d]">{order.address?.fullName}</p>
                        <p className="text-[0.74rem] font-medium text-[#42506d] leading-relaxed uppercase tracking-tight">
                           {order.address?.street},<br />
                           {order.address?.city}, {order.address?.state} - {order.address?.zipCode}
                        </p>
                        <div className="pt-3 border-t border-[#f1f4f9] flex items-center gap-2 text-[#42506d]">
                           <Phone className="w-3.5 h-3.5 text-[#90a0be]" />
                           <p className="text-[0.76rem] font-semibold text-[#11182d]">{order.address?.phone}</p>
                        </div>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row gap-3">
                     <button 
                       onClick={() => navigate("/shop")}
                       className="flex-1 h-11 bg-[#0f49d7] text-white rounded-xl text-[10px] font-semibold uppercase tracking-[0.14em] transition-all hover:bg-[#11182d] shadow-md shadow-[#0f49d7]/10 active:scale-95"
                     >
                       Shop Again
                     </button>
                     
                     {['placed', 'confirmed', 'processing'].includes(order.status) && (
                        <button 
                          onClick={() => {
                            setModalType("cancel");
                            setIsModalOpen(true);
                          }}
                          className="flex-1 h-11 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-semibold uppercase tracking-[0.14em] transition-all hover:bg-red-50 active:scale-95"
                        >
                          Cancel Order
                        </button>
                     )}

                     {order.status === 'delivered' && (
                        <button 
                          onClick={() => {
                            setModalType("return");
                            setIsModalOpen(true);
                          }}
                          className="flex-1 h-11 bg-white text-[#0f49d7] border border-[#0f49d7]/10 rounded-xl text-[10px] font-semibold uppercase tracking-[0.14em] transition-all hover:bg-[#f6f8fd] active:scale-95"
                        >
                          Return Order
                        </button>
                     )}

                      {['shipped', 'out_for_delivery'].includes(order.status) && (
                        <div className="flex-1 h-11 flex items-center justify-center bg-white border border-[#e1e5f1] rounded-xl px-4 text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.14em] text-center">
                           Order Shipped
                        </div>
                      )}
                      
                      {['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(order.status) && (
                        <div className="flex-1 h-11 flex items-center justify-center bg-white border border-[#e1e5f1] rounded-xl px-4 text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.14em] text-center">
                          Return available after delivery
                        </div>
                      )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <OrderActionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleActionSubmit}
        type={modalType}
        orderId={order._id}
      />
    </div>
  );
};

export default OrderConfirmationPage;
