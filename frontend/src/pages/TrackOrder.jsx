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
    { key: "pending", label: "Ordered", icon: Hash },
    { key: "processing", label: "Processing", icon: Clock },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
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

  useEffect(() => {
    if (!socket || !orderId || !order) return;

    const handleOrderUpdate = (data) => {
      if (data.orderId === orderId) {
        fetchOrder();
        toast.success("Order status updated!");
      }
    };

    socket.emit("join-order", orderId);
    socket.on("order-updated", handleOrderUpdate);

    return () => {
      socket.off("order-updated", handleOrderUpdate);
    };
  }, [socket, orderId, order]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending": return "Order Placed";
      case "processing": return "Processing";
      case "shipped": return "On the way";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return "Unknown Status";
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-6">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
          <div className="space-y-2 max-w-xl">
            <h1 className="font-display text-2xl md:text-4xl font-bold text-[#141b2d] tracking-tight">
              Track Order
            </h1>
            <p className="font-body text-[10px] text-[#5c6880] leading-relaxed max-w-sm">
              Enter your order ID to see the current status of your package.
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-3 items-center bg-white p-2 rounded-[1.2rem] border border-[#f0f4ff] shadow-tonal-sm">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. #9104AB2E)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchOrder()}
              className="flex-1 md:w-80 h-12 bg-transparent px-5 text-sm font-semibold text-[#141b2d] outline-none placeholder:text-[#e1e8fd]"
            />
            <button
              onClick={fetchOrder}
              disabled={loading || !orderId.trim()}
              className="h-12 bg-[#004ac6] text-white px-8 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#141b2d] transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? "Tracking..." : "Track Now"}
            </button>
          </div>
        </div>

        {order ? (
          <div className="space-y-10">

            {/* Current Status Card */}
            <div className="bg-white rounded-[1.5rem] border border-[#f0f4ff] p-6 md:p-10 shadow-sm relative overflow-hidden group">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-6">
                <div>
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-[#004ac6] mb-2">Current Status</p>
                  <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#141b2d] tracking-tight">{getStatusDisplay(order.status)}</h2>
                </div>
                {order.status === 'delivered' && (
                  <div className="bg-[#e7f6ed] text-[#006e2c] flex items-center gap-2.5 px-4 py-1.5 rounded-full font-body text-[10px] font-bold uppercase tracking-widest border border-[#006e2c]/10">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Successfully Completed
                  </div>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="relative pt-4 pb-4 px-2">
                <div className="absolute top-10 left-10 right-10 h-1 bg-[#f0f4ff] rounded-full">
                  <div
                    className="h-full bg-[#004ac6] rounded-full relative"
                    style={{
                      width: `${order.status === 'pending' ? '5%' :
                        order.status === 'processing' ? '33%' :
                          order.status === 'shipped' ? '66%' :
                            order.status === 'delivered' ? '100%' : '0%'
                        }`
                    }}
                  >
                    <div className="absolute top-1/2 -right-1 w-2.5 h-2.5 border-2 border-white bg-[#004ac6] rounded-full -translate-y-1/2"></div>
                  </div>
                </div>

                <div className="flex justify-between relative z-10">
                  {statusSteps.map((step) => {
                    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                    const currentIndex = statusOrder.indexOf(order.status);
                    const isCompleted = statusOrder.indexOf(step.key) <= currentIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center gap-4">
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.4rem] md:rounded-[1.6rem] flex items-center justify-center border-4 border-white ${isCompleted ? 'bg-[#004ac6] text-white shadow-md' : 'bg-[#f0f4ff] text-[#e1e8fd]'}`}>
                          <Icon className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        <div className="text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${isCompleted ? 'text-[#141b2d]' : 'text-gray-300'}`}>
                            {step.label}
                          </span>
                          <span className="text-[9px] font-medium text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Section: Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Order Info Card */}
              <div className="bg-white border border-[#f0f4ff] rounded-[1.5rem] p-8 shadow-sm h-full">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-8">
                  <AlertCircle className="w-4 h-4 text-[#004ac6]" />
                </div>
                <h3 className="font-display text-base font-bold text-[#141b2d] mb-6">Order Info</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-[#5c6880] uppercase tracking-[0.2em] mb-1.5">Order Number</p>
                    <p className="text-[13px] font-extrabold text-[#141b2d] uppercase">#{order._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#5c6880] uppercase tracking-[0.2em] mb-1.5">Date</p>
                    <p className="text-[13px] font-extrabold text-[#141b2d]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#5c6880] uppercase tracking-[0.2em] mb-1.5">Carrier</p>
                    <p className="text-[13px] font-extrabold text-[#141b2d]">SwiftLogistics Priority</p>
                  </div>
                  <button className="pt-2 flex items-center gap-2 text-[#004ac6] font-bold text-[9px] uppercase tracking-widest hover:underline">
                     Contact Support
                  </button>
                </div>
              </div>

              {/* Shipping Card */}
              <div className="bg-white border border-[#f0f4ff] rounded-[1.5rem] p-8 shadow-sm h-full">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-8">
                  <MapPin className="w-4 h-4 text-[#004ac6]" />
                </div>
                <h3 className="font-display text-base font-bold text-[#141b2d] mb-6">Shipping</h3>
                <div className="space-y-4 mb-8">
                  <p className="text-[13px] font-extrabold text-[#141b2d] uppercase">{order.address?.fullName || "Valued Customer"}</p>
                  <p className="text-[11px] font-semibold text-[#5c6880] leading-relaxed uppercase">
                    {order.address?.street},<br />
                    {order.address?.city}, {order.address?.zipCode}
                  </p>
                </div>
                <div className="h-40 bg-[#d9e5e7] rounded-[2rem] overflow-hidden relative border border-[#f0f4ff]/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center relative">
                        <div className="w-2.5 h-2.5 bg-[#004ac6] rounded-full"></div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Summary Card (Light Blue/Gray) */}
              <div className="bg-[#f0f4ff]/70 rounded-[1.5rem] p-6 border border-blue-100 flex flex-col justify-between shadow-sm h-full">
                <div>
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                    <Hash className="w-3.5 h-3.5 text-[#004ac6]" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#141b2d] mb-6">Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[#141b2d]">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Subtotal</span>
                      <span className="text-xs font-bold opacity-80">₹{Math.round(order.totalAmount * 0.9).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#141b2d]">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Shipping</span>
                      <span className="text-xs font-black text-[#006e2c]">FREE</span>
                    </div>
                    <div className="flex justify-between items-center text-[#141b2d]">
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Tax</span>
                      <span className="text-xs font-bold opacity-80">₹{Math.round(order.totalAmount * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-200/50">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#141b2d] opacity-40">Total</span>
                    <span className="font-display text-xl font-extrabold text-[#004ac6] tracking-tighter italic">₹{Math.round(order.totalAmount).toLocaleString()}</span>
                  </div>
                  <button className="w-full h-11 bg-white text-[#141b2d] border border-blue-100 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-[#004ac6] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <FileDown className="w-3.5 h-3.5" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-[#e1e8fd] rounded-[3rem] bg-white/50">
            {loading ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-[#004ac6] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-[#5c6880]">Locating Package...</p>
              </div>
            ) : (
              <div className="space-y-8 text-center max-w-sm px-6">
                <div className="w-24 h-24 bg-[#f0f4ff] rounded-[2.5rem] flex items-center justify-center mx-auto mb-2 text-[#e1e8fd] relative rotate-6">
                   <Package className="w-10 h-10" />
                   <div className="absolute inset-0 bg-blue-600/5 rounded-[2.5rem] -rotate-12"></div>
                </div>
                <div>
                   <h3 className="font-display text-2xl font-bold text-[#141b2d] mb-4">Awaiting Curation</h3>
                   <p className="font-body text-xs text-[#5c6880] leading-relaxed">Enter your order ID above to reveal the journey of your curated artifact.</p>
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

