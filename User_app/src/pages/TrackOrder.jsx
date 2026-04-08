import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketProvider";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Hash,
  Check,
  FileDown,
  CheckCircle2,
  Box,
  TruckIcon,
  ShoppingBag,
  CreditCard,
  Target,
  ArrowRight
} from "lucide-react";
import { API_URL } from "../utils/constants";
import Loader from "../components/Loader";

const TrackOrder = () => {
  const socket = useSocket();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusSteps = [
    { key: "PLACED", label: "Ordered", icon: ShoppingBag },
    { key: "CONFIRMED", label: "Confirmed", icon: Clock },
    { key: "SHIPPED", label: "Shipped", icon: TruckIcon },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  ];

  const fetchOrder = async () => {
    if (!orderId || orderId.length < 5) {
      toast.error("Please enter a valid Order ID");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/order/track/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data.order);
      toast.success("Tracking data synchronized");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !order) return undefined;

    const handleUpdate = (data) => {
        // If the current order visualization includes this subOrderId, refresh
        const isCurrentSubOrder = order.subOrders?.some(s => s.subOrderId === data.subOrderId);
        if (isCurrentSubOrder || order.orderId === data.subOrderId.split('-')[0] + '-' + data.subOrderId.split('-')[1]) {
            console.log("📍 Real-time track update received:", data);
            toast.success(data.message || "Order status updated!");
            fetchOrder();
        }
    };

    socket.on("order-status-update", handleUpdate);
    socket.on("delivery-update", handleUpdate);

    return () => {
      socket.off("order-status-update", handleUpdate);
      socket.off("delivery-update", handleUpdate);
    };
  }, [socket, order]);

  const getStatusProgress = (status) => {
    const map = {
      PLACED: "10%",
      CONFIRMED: "35%",
      PROCESSING: "50%",
      READY_TO_SHIP: "65%",
      SHIPPED: "80%",
      DELIVERED: "100%",
    };
    return map[status] || "0%";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Processing...";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-6 text-[#11182d] font-body">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 bg-[#0f49d7] rounded-xl flex items-center justify-center text-white shadow-sm">
                  <Target className="w-4 h-4" />
               </div>
               <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-[#0f49d7]">Order Intelligence</span>
            </div>
            <h1 className="text-[1.6rem] md:text-[2rem] font-semibold text-[#11182d] leading-tight tracking-tight">
              Track Your Package
            </h1>
            <p className="text-[0.8rem] text-[#42506d] leading-relaxed">
              Real-time synchronization with global fulfillment coordinates.
            </p>
          </div>
          
          <div className="flex w-full md:w-auto gap-2 bg-white border border-[#eef2ff] p-1.5 rounded-2xl shadow-sm">
            <input
              type="text"
              placeholder="ENTER ORDER ID..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              className="px-4 py-2 bg-transparent outline-none text-[0.7rem] font-semibold w-full md:w-64 placeholder:text-[#b0b8cb] uppercase tracking-widest"
            />
            <button
              onClick={fetchOrder}
              disabled={loading}
              className="bg-[#0f49d7] text-white px-6 h-10 rounded-xl text-[0.65rem] font-semibold uppercase tracking-widest disabled:opacity-50 shadow-md border-none outline-none"
            >
              {loading ? "SEARCHING..." : "TRACK"}
            </button>
          </div>
        </div>

        {order ? (
          <div className="space-y-6">
            {/* Packages Grid */}
            <div className="grid grid-cols-1 gap-5">
              {order.subOrders?.map((pkg, idx) => (
                <div key={pkg._id} className="bg-white rounded-[24px] border border-[#eef2ff] shadow-sm overflow-hidden">
                  <div className="bg-[#f8f9fc] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#eef2ff]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#eef2ff]">
                        <Package className="w-5 h-5 text-[#0f49d7]" />
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-semibold text-[#5d6a84] uppercase tracking-widest">Package {idx + 1}</p>
                        <p className="text-[0.82rem] font-semibold text-[#11182d]">{pkg.subOrderId} <span className="mx-1 opacity-20">|</span> <span className="text-[#0f49d7] font-semibold uppercase text-[0.7rem] tracking-widest ml-1">{pkg.seller?.shopName}</span></p>
                      </div>
                    </div>
                    <div className="md:text-right">
                      <p className="text-[0.6rem] font-semibold text-[#5d6a84] uppercase tracking-widest">Estimated Delivery</p>
                      <p className="text-[0.82rem] font-semibold text-[#11182d]">{formatDate(pkg.estimatedDeliveryDate)}</p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Items Chips */}
                    <div className="flex flex-wrap gap-2.5 mb-8">
                      {pkg.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-[#f8f9fc] pr-4 rounded-[14px] border border-[#eef2ff]">
                           <div className="w-9 h-9 bg-white flex items-center justify-center rounded-[10px] border border-[#eef2ff] font-semibold text-[0.65rem] text-[#0f49d7]">
                             {item.quantity}x
                           </div>
                           <p className="text-[0.7rem] font-semibold text-[#42506d] uppercase tracking-wide">{item.name}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress Visualizer */}
                    <div className="relative pt-2 pb-10 overflow-x-auto scrollbar-hide">
                      <div className="min-w-[500px]">
                        <div className="absolute top-6 left-10 right-10 h-1 bg-[#f0f4ff] rounded-full">
                          <div 
                            className="h-full bg-[#0f49d7] rounded-full transition-all duration-1000"
                            style={{ width: getStatusProgress(pkg.status) }}
                          />
                        </div>

                        <div className="flex justify-between relative z-10 px-2">
                          {statusSteps.map((step) => {
                            const statusOrder = ["PLACED", "CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"];
                            const currentIndex = statusOrder.indexOf(pkg.status);
                            const stepIndex = statusOrder.indexOf(step.key);
                            const isCompleted = stepIndex <= currentIndex;

                            return (
                              <div key={step.key} className="flex flex-col items-center w-24">
                                <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm ${isCompleted ? 'bg-[#0f49d7] text-white' : 'bg-[#f0f4ff] text-[#b0b8cb]'}`}>
                                  <step.icon className="w-5 h-5" />
                                </div>
                                <div className="mt-4 text-center">
                                  <p className={`text-[0.62rem] font-semibold uppercase tracking-widest ${isCompleted ? 'text-[#11182d]' : 'text-[#b0b8cb]'}`}>{step.label}</p>
                                  {isCompleted && step.key === pkg.status && (
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#0f49d7] text-white text-[0.5rem] font-semibold uppercase tracking-widest rounded-full">ACTIVE</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {pkg.trackingId && (
                       <div className="mt-8 pt-6 border-t border-[#eef2ff] flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 bg-[#f8f9fc] px-4 py-2 rounded-[14px] border border-[#eef2ff]">
                             <Hash className="w-3.5 h-3.5 text-[#0f49d7]" />
                             <p className="text-[0.62rem] font-semibold text-[#5d6a84] uppercase tracking-widest leading-none">Awb Number: <span className="text-[#11182d] ml-1">{pkg.trackingId}</span></p>
                          </div>
                          <button className="text-[0.62rem] font-semibold uppercase tracking-widest text-[#0f49d7] hover:text-[#11182d] px-4 py-2 rounded-lg transition-all flex items-center gap-2 border-none outline-none">
                            Track via Carrier <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Address & Transaction Detail */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 mt-8">
               <div className="bg-white p-7 rounded-[24px] border border-[#eef2ff] shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-[#f8f9fc] border border-[#eef2ff] flex items-center justify-center">
                      <MapPin className="w-4.5 h-4.5 text-[#0f49d7]" />
                    </div>
                    <div>
                      <h3 className="text-[0.6rem] font-semibold text-[#0f49d7] uppercase tracking-widest">Delivery Support</h3>
                      <p className="text-[1.1rem] font-semibold text-[#11182d]">Fulfillment Destination</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#f8f9fc] p-5 rounded-[20px] border border-[#eef2ff]">
                    <p className="text-[0.82rem] font-semibold text-[#11182d] mb-1">{order.address?.fullName}</p>
                    <p className="text-[0.74rem] text-[#42506d] leading-relaxed uppercase tracking-widest font-medium opacity-80">
                      {order.address?.street}, {order.address?.city}<br />
                      {order.address?.state} - {order.address?.zipCode}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t border-[#eef2ff] pt-4">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                         <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#5d6a84]">Verified Location</span>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-[#11182d] p-8 rounded-[24px] text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f49d7]/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  
                  <h3 className="text-[0.62rem] font-semibold text-[#38bdf8] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <CreditCard className="w-4 h-4" /> Transaction summary
                  </h3>
                  
                  <div className="space-y-5">
                     <div className="flex justify-between items-center">
                        <span className="text-[0.62rem] uppercase font-semibold tracking-widest text-white/40">Settlement Total</span>
                        <span className="text-[1.2rem] font-semibold">₹{order.totalAmount?.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[0.62rem] uppercase font-semibold tracking-widest text-white/40">Status</span>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-[0.6rem] font-semibold uppercase tracking-widest rounded-lg">
                          {order.paymentStatus}
                        </span>
                     </div>
                     <div className="pt-5 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[0.62rem] uppercase font-semibold tracking-widest text-white/40">Execution</span>
                        <span className="text-[0.74rem] font-semibold uppercase tracking-widest">{order.paymentMethod}</span>
                     </div>
                  </div>

                  <div className="mt-10 flex items-center gap-2 text-white/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-[0.55rem] font-semibold uppercase tracking-widest">Bank-Level Security Verified</span>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            {loading ? (
              <Loader />
            ) : (
              <div className="text-center space-y-6">
                <div className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-sm border border-[#eef2ff]">
                   <Box className="w-12 h-12 text-[#eef2ff]" />
                </div>
                <div>
                   <h3 className="text-[1.2rem] font-semibold text-[#11182d] tracking-tight">Locate Your Goods</h3>
                   <p className="text-[0.8rem] text-[#5c6880] max-w-sm mx-auto mt-2 leading-relaxed">
                     Precision fulfillment tracking. Enter your unique Order ID at the top to visualize movement analytics.
                   </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
