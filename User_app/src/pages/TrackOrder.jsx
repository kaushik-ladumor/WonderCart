import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
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
  ArrowRight,
  ShieldCheck,
  Plane,
  Warehouse
} from "lucide-react";
import { API_URL } from "../utils/constants";
import Loader from "../components/Loader";

const TrackOrder = () => {
  const socket = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusSteps = [
    { key: "pending", label: "Registered", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: ShieldCheck },
    { key: "processing", label: "Processing", icon: Warehouse },
    { key: "shipped", label: "In Transit", icon: Plane },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const fetchOrder = useCallback(async (explicitId) => {
    const targetId = explicitId || orderId;
    if (!targetId || targetId.length < 5) {
      if (!explicitId) toast.error("Please enter a valid Order ID");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/order/track/${targetId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data.order);
      if (explicitId) setOrderId(explicitId.toUpperCase());
      
      setSearchParams({ id: targetId.toUpperCase() }, { replace: true });
      toast.success("Logistics database synchronized");
    } catch (err) {
      toast.error(err.response?.data?.message || "Identifier not recognized");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, setSearchParams]);

  useEffect(() => {
    const queryId = searchParams.get("id");
    if (queryId) {
      fetchOrder(queryId);
    }
  }, []); 

  useEffect(() => {
    if (!socket || !order) return undefined;

    const handleUpdate = (data) => {
        const isCurrentSubOrder = order.subOrders?.some(s => s.subOrderId === data.subOrderId);
        if (isCurrentSubOrder || order.orderId === data.subOrderId.split('-').slice(0, 2).join('-')) {
            toast.success(data.message || "Parcel status updated!");
            fetchOrder();
        }
    };

    socket.on("order-status-update", handleUpdate);
    socket.on("delivery-update", handleUpdate);

    return () => {
      socket.off("order-status-update", handleUpdate);
      socket.off("delivery-update", handleUpdate);
    };
  }, [socket, order, fetchOrder]);

  const getStatusProgress = (status) => {
    const map = {
      pending: "10%",
      confirmed: "30%",
      processing: "50%",
      packed: "65%",
      shipped: "82%",
      delivered: "100%",
    };
    return map[status] || "0%";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Processing...";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] pt-5 pb-12 text-[#11182d] font-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
              Track Your Package
            </h1>
            <p className="text-[0.78rem] text-[#33415e] max-w-xl">
              High-precision fulfillment tracking and real-time synchronization.
            </p>
          </div>
          
          <div className="w-full max-w-lg flex items-center gap-2 bg-white border border-[#d7dcea] p-1.5 rounded-[18px] shadow-sm ml-auto">
            <div className="flex-1 pl-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#b0b8cb]" />
              <input
                type="text"
                placeholder="ORDER IDENTIFIER"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrder()}
                className="bg-transparent outline-none text-[0.75rem] font-bold w-full placeholder:text-[#b0b8cb] uppercase tracking-widest"
              />
            </div>
            <button
              onClick={() => fetchOrder()}
              disabled={loading}
              className="bg-[#11182d] text-white px-8 h-10 rounded-[14px] text-[0.7rem] font-bold uppercase tracking-[0.12em] disabled:opacity-50 transition-all hover:bg-[#0f49d7] active:scale-95 whitespace-nowrap"
            >
              {loading ? "SEARCHING" : "TRACK"}
            </button>
          </div>
        </div>

        {loading && !order && (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
             <Loader />
             <p className="text-[10px] font-bold text-[#0f49d7] uppercase tracking-[0.2em] animate-pulse">Syncing Database...</p>
          </div>
        )}

        {order ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
               <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.78rem] font-semibold text-white">
                  <Package className="w-4 h-4" />
               </span>
               <h2 className="text-[1.1rem] font-semibold">Active Consignments</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
               <div className="space-y-4">
                  <div className="space-y-3">
                   {order.subOrders?.map((pkg, idx) => (
                      <div key={pkg.subOrderId} className="bg-white rounded-[22px] border border-[#d7dcea] shadow-sm overflow-hidden group">
                         <div className="bg-[#fbfcff] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#f0f4ff]">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-[#d7dcea] shadow-sm">
                                  <Box className="w-5 h-5 text-[#0f49d7]" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                     <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#394867] bg-[#eef2ff] px-2 py-0.5 rounded-full">Package {idx + 1}</span>
                                     <span className="text-[10px] font-bold text-[#0f49d7] uppercase tracking-widest">{pkg.seller?.shopName || "Vendor"}</span>
                                  </div>
                                  <p className="text-[0.9rem] font-semibold text-[#11182d] font-mono">{pkg.subOrderId}</p>
                               </div>
                            </div>
                            <div className="md:text-right bg-white/50 px-4 py-2 rounded-xl border border-[#f0f4ff]">
                               <p className="text-[10px] font-semibold text-[#6d7892] uppercase tracking-[0.12em] mb-0.5">Estimated Arrival</p>
                               <p className="text-[0.78rem] font-bold text-[#11182d]">{formatDate(pkg.estimatedDeliveryDate)}</p>
                            </div>
                         </div>

                         <div className="p-6">
                            {/* Horizontal Progress */}
                            <div className="relative mb-12 overflow-x-auto pb-6 scrollbar-hide">
                               <div className="min-w-[800px] px-10">
                                  <div className="absolute top-[30px] left-[50px] right-[50px] h-[3px] bg-[#f0f4ff] rounded-full">
                                     <div 
                                        className="h-full bg-[#0f49d7] rounded-full transition-all duration-1000 origin-left"
                                        style={{ width: getStatusProgress(pkg.status) }}
                                     />
                                  </div>

                                  <div className="flex justify-between items-start relative z-10">
                                     {statusSteps.map((step) => {
                                        const statusMap = ["pending", "confirmed", "processing", "packed", "shipped", "delivered"];
                                        const currentIdx = statusMap.indexOf(pkg.status);
                                        const stepIdx = statusMap.indexOf(step.key);
                                        const isDone = stepIdx <= currentIdx;
                                        const isActive = stepIdx === currentIdx;

                                        return (
                                           <div key={step.key} className="flex flex-col items-center w-24">
                                              <div className={`
                                                 w-[52px] h-[52px] rounded-[18px] flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm
                                                 ${isDone ? 'bg-[#0f49d7] text-white' : 'bg-[#ced4e6] text-white/50'}
                                                 ${isActive ? 'scale-110 ring-4 ring-[#0f49d7]/10' : ''}
                                              `}>
                                                 <step.icon className={`w-5 h-5`} />
                                              </div>
                                              <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-center ${isDone ? 'text-[#11182d]' : 'text-[#b3bdd2]'}`}>
                                                 {step.label}
                                              </p>
                                           </div>
                                        );
                                     })}
                                  </div>
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                               <div className="space-y-3">
                                  <p className="text-[10px] font-semibold text-[#6d7892] uppercase tracking-[0.12em]">Items Checklist</p>
                                  <div className="flex flex-wrap gap-2">
                                     {pkg.items.map((item, i) => {
                                        const productImg = item.image || item.product?.variants?.[0]?.images?.[0] || item.product?.image || "";
                                        return (
                                          <div key={i} className="flex items-center gap-2.5 bg-[#f8f9fd] pl-1 pr-3 py-1 rounded-[14px] border border-[#d7dcea] hover:border-[#0f49d7]/20 transition-colors">
                                             <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#d7dcea] bg-white bg-center bg-cover shrink-0"
                                                style={{ backgroundImage: `url(${productImg})` }}
                                             />
                                             <div className="flex items-center gap-1.5">
                                                <span className="text-[0.7rem] font-bold text-[#0f49d7]">{item.quantity}x</span>
                                                <span className="text-[0.7rem] font-semibold text-[#11182d] truncate max-w-[120px]">{item.name}</span>
                                             </div>
                                          </div>
                                        );
                                     })}
                                  </div>
                               </div>

                               {pkg.trackingId && (
                                  <div className="bg-[#fbfcff] p-4 rounded-xl border border-[#d7dcea] flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <Hash className="w-4 h-4 text-[#0f49d7]" />
                                        <div>
                                           <p className="text-[10px] font-semibold text-[#6d7892] uppercase">Tracking Number</p>
                                           <p className="text-[0.78rem] font-bold text-[#11182d] font-mono">{pkg.trackingId}</p>
                                        </div>
                                     </div>
                                     <a href={pkg.trackingUrl || "#"} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-[#d7dcea] text-[#0f49d7] hover:bg-[#0f49d7] hover:text-white transition-all shadow-sm">
                                        <ArrowRight className="w-4 h-4" />
                                     </a>
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                 </div>
               </div>

               {/* Destination Area */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                     <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfe7ff] text-[0.78rem] font-semibold text-[#0f49d7]">
                        <MapPin className="w-4 h-4" />
                     </span>
                     <h2 className="text-[1.1rem] font-semibold">Shipping Address</h2>
                  </div>
                  
                  <div className="rounded-[18px] border border-[#d7dcea] bg-white p-5">
                     <div className="flex items-start gap-4 mb-3">
                        <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#394867]">Verified Recipient</span>
                     </div>
                     <p className="text-[0.9rem] font-semibold text-[#11182d]">{order.address?.fullName}</p>
                     <p className="mt-2 text-[0.78rem] leading-5 text-[#33415e]">
                        {order.address?.street}<br />
                        {order.address?.city}, {order.address?.state} - {order.address?.zipCode || order.address?.zipcode}
                     </p>
                     <p className="mt-2 text-[0.78rem] font-medium text-[#11182d] flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" /> Encryption Secure Handover
                     </p>
                  </div>
               </div>
            </div>

            {/* Sidebar Summary */}
            <aside className="space-y-4 h-fit">
               <div className="rounded-[22px] border border-[#e1e5f1] bg-[#11182d] p-6 text-white shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0f49d7]/10 rounded-full -mr-16 -mt-16 blur-xl" />
                  
                  <h3 className="text-[1.05rem] font-semibold text-white mb-6 flex items-center gap-2">
                     <CreditCard className="w-5 h-5 text-[#38bdf8]" /> Transaction
                  </h3>

                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-1">Total Payable</p>
                        <p className="text-[1.5rem] font-bold">₹{order.totalAmount?.toLocaleString()}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-1">Status</p>
                           <span className="px-2 py-1 bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-lg text-[#38bdf8]">
                              {order.paymentStatus}
                           </span>
                        </div>
                        <div>
                           <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-1">Method</p>
                           <p className="text-[0.78rem] font-bold">{order.paymentMethod}</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-white/20">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Digital Auth Verified</span>
                  </div>
               </div>
               
               <div className="rounded-[22px] border border-[#d7dcea] bg-white p-5 text-center">
                  <p className="text-[10px] font-semibold text-[#6d7892] uppercase tracking-[0.12em] mb-2">Need logistical support?</p>
                  <button className="text-[0.78rem] font-bold text-[#0f49d7] hover:underline uppercase tracking-widest">
                     Contact Intelligence
                  </button>
               </div>
            </aside>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center">
            {!loading && (
              <div className="text-center space-y-8">
                <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-sm border border-[#d7dcea]">
                   <Box className="w-12 h-12 text-[#ced4e6]" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-[1.1rem] font-semibold text-[#11182d]">Fulfillment Intelligence</h3>
                   <p className="text-[0.78rem] text-[#5c6880] max-w-[280px] mx-auto leading-relaxed">
                     Input your unique Order identifier to visualize real-time movement and predictive arrival.
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
