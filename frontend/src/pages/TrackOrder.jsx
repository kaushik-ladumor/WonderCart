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
    <div className="min-h-screen bg-[#f6f7fb] py-10 text-[#141b2d] font-body">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-[1.55rem] font-semibold tracking-tight sm:text-[1.8rem] text-[#141b2d]">
              Track Your Package
            </h1>
            <p className="mt-1 text-[0.82rem] text-[#42506d]">
              Real-time synchronization with global fulfillment coordinates.
            </p>
          </div>
          
          <div className="flex w-full md:w-auto gap-2 bg-white/60 backdrop-blur-md p-2 rounded-2xl shadow-tonal-sm border border-[#eef2ff]">
            <input
              type="text"
              placeholder="ENTER ORDER ID..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              className="px-4 py-2 bg-transparent outline-none text-xs font-bold w-full md:w-64 placeholder:text-[#90a0be] uppercase tracking-widest"
            />
            <button
              onClick={fetchOrder}
              disabled={loading}
              className="bg-[#004ac6] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/10"
            >
              {loading ? "SEARCHING..." : "TRACK"}
            </button>
          </div>
        </div>

        {order ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Packages Grid */}
            <div className="grid grid-cols-1 gap-6">
              {order.subOrders?.map((pkg, idx) => (
                <div key={pkg._id} className="bg-white rounded-[24px] border border-[#e1e5f1] shadow-tonal-sm overflow-hidden">
                  <div className="bg-[#f8f9ff]/50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#eef2ff]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-tonal-sm border border-[#f0f4ff]">
                        <Package className="w-5 h-5 text-[#004ac6]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#5d6a84] uppercase tracking-[0.15em]">Package {idx + 1}</p>
                        <p className="text-[0.88rem] font-bold text-[#141b2d]">{pkg.subOrderId} <span className="mx-1 opacity-20">|</span> <span className="text-[#004ac6] font-semibold">{pkg.seller?.shopName}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#5d6a84] uppercase tracking-[0.15em]">Estimated Delivery</p>
                      <p className="text-[0.88rem] font-bold text-[#141b2d]">{formatDate(pkg.estimatedDeliveryDate)}</p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Items Chips */}
                    <div className="flex flex-wrap gap-3 mb-10">
                      {pkg.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-[#f0f4ff] pr-4 rounded-xl border border-[#e1e8fd]">
                           <div className="w-10 h-10 bg-white flex items-center justify-center rounded-lg border border-[#eef2ff] font-bold text-[0.7rem] text-[#004ac6]">
                             {item.quantity}x
                           </div>
                           <p className="text-[0.74rem] font-bold text-[#42506d] uppercase tracking-wide">{item.name}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress Visualizer */}
                    <div className="relative pt-2 pb-12 overflow-x-auto scrollbar-hide">
                      <div className="min-w-[500px]">
                        {/* Background Track */}
                        <div className="absolute top-7 left-10 right-10 h-1.5 bg-[#f0f4ff] rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,74,198,0.2)]"
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
                              <div key={step.key} className="flex flex-col items-center group w-24">
                                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center border-4 border-white transition-all duration-500 shadow-tonal-md ${isCompleted ? 'bg-[#004ac6] text-white scale-110' : 'bg-[#f0f4ff] text-[#90a0be]'}`}>
                                  <step.icon className="w-6 h-6" />
                                </div>
                                <div className="mt-5 text-center">
                                  <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${isCompleted ? 'text-[#141b2d]' : 'text-[#90a0be]'}`}>{step.label}</p>
                                  {isCompleted && step.key === pkg.status && (
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#004ac6] text-white text-[8px] font-black uppercase tracking-widest rounded-full animate-pulse">ACTIVE</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {pkg.trackingId && (
                       <div className="mt-8 pt-6 border-t border-[#f0f4ff] flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3 bg-[#f8f9ff] px-4 py-2 rounded-xl border border-[#eef2ff]">
                             <Hash className="w-3.5 h-3.5 text-[#004ac6]" />
                             <p className="text-[10px] font-bold text-[#5d6a84] uppercase tracking-widest leading-none">Awb Number: <span className="text-[#141b2d] ml-1">{pkg.trackingId}</span></p>
                          </div>
                          <button className="text-[10px] font-black uppercase tracking-widest text-[#004ac6] hover:underline px-4 py-2 rounded-lg hover:bg-[#f0f4ff] transition-all">Track via Carrier</button>
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Address & Transaction Detail */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 mt-12">
               <div className="bg-white p-6 rounded-[24px] border border-[#e1e5f1] shadow-tonal-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-[#f0f4ff] flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#004ac6]" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-[#004ac6] uppercase tracking-[0.15em]">Delivery Logistics</h3>
                      <p className="text-[1.1rem] font-semibold text-[#141b2d]">Shipping Destination</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#f8f9ff] p-5 rounded-2xl border border-[#eef2ff]">
                    <p className="text-[0.88rem] font-bold text-[#141b2d] mb-1">{order.address?.fullName}</p>
                    <p className="text-[0.82rem] text-[#42506d] leading-relaxed uppercase tracking-tight opacity-80">
                      {order.address?.street}, {order.address?.city}<br />
                      {order.address?.state} - {order.address?.zipCode}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t border-[#eef2ff] pt-4">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#004ac6]" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#5d6a84]">Verified Location</span>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-[#141b2d] p-8 rounded-[24px] text-white shadow-xl shadow-black/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150" />
                  
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                    <CreditCard className="w-4 h-4" /> Transaction summary
                  </h3>
                  
                  <div className="space-y-5">
                     <div className="flex justify-between items-center decoration-white/10 decoration-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-white/50">Settlement Total</span>
                        <span className="text-[1.1rem] font-bold">₹{order.totalAmount?.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-white/50">Payment Status</span>
                        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-400/20">
                          {order.paymentStatus}
                        </span>
                     </div>
                     <div className="pt-5 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-white/50">Execution Method</span>
                        <span className="text-[0.88rem] font-bold uppercase tracking-wider">{order.paymentMethod}</span>
                     </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3 text-white/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em]">Secure Blockchain Verified ID</span>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center transition-all duration-500">
            {loading ? (
              <div className="flex flex-col items-center gap-6">
                 <div className="w-14 h-14 border-4 border-[#004ac6] border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-black text-[#90a0be] uppercase tracking-[0.2em] animate-pulse">Synchronizing coordinates...</p>
              </div>
            ) : (
              <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-tonal-md border border-[#f0f4ff] relative group">
                   <Box className="w-14 h-14 text-[#e1e8fd] group-hover:text-[#004ac6] transition-all duration-500" />
                   <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] scale-0 group-hover:scale-110 transition-all duration-1000 blur-sm" />
                </div>
                <div>
                   <h3 className="text-3xl font-bold text-[#141b2d] tracking-tight">Locate Your Goods</h3>
                   <p className="text-[0.88rem] text-[#5c6880] max-w-sm mx-auto mt-3 leading-relaxed">
                     Precision fulfillment tracking. Enter your unique Order ID at the top to visualize movement analytics and delivery status.
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
