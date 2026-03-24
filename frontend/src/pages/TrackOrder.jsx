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
} from "lucide-react";
import { API_URL } from "../utils/constants";

const TrackOrder = () => {
  const socket = useSocket();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusSteps = [
    { key: "PLACED", label: "Ordered", icon: Hash },
    { key: "CONFIRMED", label: "Confirmed", icon: Clock },
    { key: "SHIPPED", label: "Shipped", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Track Your Journey</h1>
            <p className="text-sm text-gray-500 mt-1">Order Transaction: <span className="font-bold text-gray-900">{order?.orderId || "---"}</span></p>
          </div>
          <div className="flex w-full md:w-auto gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <input
              type="text"
              placeholder="Order ID (ORD-1001)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="px-4 py-2 bg-transparent outline-none text-sm font-semibold w-full md:w-60"
            />
            <button
              onClick={fetchOrder}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              Track
            </button>
          </div>
        </div>

        {order ? (
          <div className="space-y-8">
            {/* Packages Grid */}
            <div className="grid grid-cols-1 gap-6">
              {order.subOrders?.map((pkg, idx) => (
                <div key={pkg._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Package {idx + 1}</p>
                        <p className="text-sm font-bold text-gray-900">{pkg.subOrderId} · <span className="text-blue-600">from {pkg.seller?.shopName}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Delivery</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(pkg.estimatedDeliveryDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Items in this package */}
                    <div className="flex flex-wrap gap-4 mb-10">
                      {pkg.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 pr-4 rounded-xl border border-gray-100">
                           <div className="w-12 h-12 bg-white flex items-center justify-center rounded-lg border border-gray-100 font-bold text-xs text-gray-400">
                             {item.quantity}x
                           </div>
                           <p className="text-xs font-bold text-gray-700">{item.name}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progression */}
                    <div className="relative pt-2 pb-8">
                      {/* Tracking Line */}
                      <div className="absolute top-7 left-8 right-8 h-1 bg-gray-100 rounded-full">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                          style={{ width: getStatusProgress(pkg.status) }}
                        />
                      </div>

                      <div className="flex justify-between relative z-10">
                        {statusSteps.map((step) => {
                          const statusOrder = ["PLACED", "CONFIRMED", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"];
                          const currentIndex = statusOrder.indexOf(pkg.status);
                          const stepIndex = statusOrder.indexOf(step.key);
                          const isCompleted = stepIndex <= currentIndex;

                          return (
                            <div key={step.key} className="flex flex-col items-center group">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm ${isCompleted ? 'bg-blue-600 text-white scale-110' : 'bg-white text-gray-200'}`}>
                                <step.icon className="w-6 h-6" />
                              </div>
                              <div className="mt-4 text-center">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p>
                                {isCompleted && step.key === pkg.status && (
                                  <p className="text-[9px] font-bold text-blue-500 mt-1">Current</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {pkg.trackingId && (
                       <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Hash className="w-4 h-4 text-gray-400" />
                             <p className="text-xs text-gray-500">Awb Number: <span className="font-bold text-gray-900">{pkg.trackingId}</span></p>
                          </div>
                          <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">Track on Carrier</button>
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Address & Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" /> Shipping Destination
                  </h3>
                  <p className="text-sm font-bold text-gray-800">{order.address?.fullName}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mt-2 uppercase tracking-tight">
                    {order.address?.street}, {order.address?.city}<br />
                    {order.address?.state} - {order.address?.zipCode}
                  </p>
               </div>

               <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-xl shadow-blue-900/10">
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-blue-400">
                    <Hash className="w-4 h-4" /> Transaction summary
                  </h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center opacity-60">
                        <span className="text-xs uppercase font-bold tracking-widest">Total Amount</span>
                        <span className="text-sm font-bold">₹{order.totalAmount?.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-bold tracking-widest text-blue-400">Status</span>
                        <span className="text-sm font-bold uppercase">{order.paymentStatus}</span>
                     </div>
                     <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs uppercase font-bold tracking-widest opacity-60">Method</span>
                        <span className="text-sm font-bold">{order.paymentMethod}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing with satellite...</p>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 relative rotate-6">
                   <Package className="w-10 h-10 text-gray-200" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-gray-900">Locate Your Package</h3>
                   <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Enter your Order ID to track the real-time movement of your curated products.</p>
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

