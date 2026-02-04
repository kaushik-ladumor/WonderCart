import React, { useEffect, useState } from "react";
import axios from "axios";
import socket from "../socket";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  CreditCard,
  MapPin,
  Calendar,
  ArrowRight,
  AlertCircle,
  User,
  Hash,
  Loader,
} from "lucide-react";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Pending",
      color: "text-gray-700",
      bgColor: "bg-gray-100",
    },
    processing: {
      icon: Package,
      label: "Processing",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    shipped: {
      icon: Truck,
      label: "Shipped",
      color: "text-purple-700",
      bgColor: "bg-purple-100",
    },
    delivered: {
      icon: CheckCircle,
      label: "Delivered",
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
    cancelled: {
      icon: AlertCircle,
      label: "Cancelled",
      color: "text-red-700",
      bgColor: "bg-red-100",
    },
  };

  const statusSteps = [
    { key: "pending", label: "Ordered" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const fetchOrder = async () => {
    if (!orderId || orderId.length !== 24) {
      toast.error("Please enter a valid Order ID");
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:4000/order/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOrder(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order not found");
    }
  };

  useEffect(() => {
    if (!orderId) return;

    fetchOrder(orderId);

    socket.emit("join-order", orderId);

    const handleOrderUpdate = (data) => {
      if (data.orderId === orderId) {
        fetchOrder(orderId);
        toast.success("Order status updated!");
      }
    };

    socket.on("order-updated", handleOrderUpdate);

    return () => {
      socket.off("order-updated", handleOrderUpdate);
    };
  }, [orderId]);

  const handleTrackClick = () => {
    fetchOrder(orderId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const calculateProgress = () => {
    if (!order) return 0;
    const currentIndex = statusSteps.findIndex(
      (step) => step.key === order.status,
    );
    return currentIndex >= 0
      ? ((currentIndex + 1) / statusSteps.length) * 100
      : 0;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Track Your Order
          </h1>
          <p className="text-gray-700 text-base md:text-lg">
            Enter your Order ID to track real-time updates
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white border border-gray-300 rounded-xl p-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center">
                  <Search className="ml-3 w-5 h-5 text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTrackClick()}
                    className="w-full px-3 py-3 bg-transparent border-none focus:outline-none text-black placeholder-gray-500 text-base"
                  />
                </div>
                <button
                  onClick={handleTrackClick}
                  disabled={loading || !orderId.trim()}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-base font-medium whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Track Order
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </div>
            {order && (
              <div className="mt-3 text-sm text-gray-600 text-center">
                Real-time tracking active • Updates automatically
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 text-base">Searching for order...</p>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-12">
            {/* Progress Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-2">
                    Order Progress
                  </h2>
                  <p className="text-gray-700 text-base">
                    Current status and timeline
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    Live Tracking
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative mb-10">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>

                <div className="relative flex justify-between mt-4">
                  {statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.findIndex(
                      (s) => s.key === order.status,
                    );
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = getStatusInfo(step.key).icon;

                    return (
                      <div key={step.key} className="relative text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${
                            isCompleted
                              ? "bg-black"
                              : "bg-gray-100 border-2 border-gray-300"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isCompleted ? "text-white" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            isCurrent ? "text-black" : "text-gray-600"
                          }`}
                        >
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="text-xs text-gray-500 mt-1">
                            Current Step
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Status */}
              <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl">
                <div
                  className={`p-3 rounded-lg ${getStatusInfo(order.status).bgColor}`}
                >
                  {React.createElement(getStatusInfo(order.status).icon, {
                    className: `w-6 h-6 ${getStatusInfo(order.status).color}`,
                  })}
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-black mb-1">
                    {getStatusInfo(order.status).label}
                  </div>
                  <div className="text-gray-700 text-sm">
                    Last updated: {formatDate(order.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Information */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Order Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Order ID</div>
                    <div className="font-bold text-black text-lg">
                      {order._id?.slice(-12)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Order Date</div>
                    <div className="font-medium text-black">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Payment Method
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-black">
                        {order.paymentMethod || "Cash on Delivery"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {order.address && (
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Customer</div>
                      <div className="font-bold text-black">
                        {order.address.fullName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Address</div>
                      <div className="space-y-1">
                        <div className="font-medium text-black">
                          {order.address.street}
                        </div>
                        <div className="text-gray-700">
                          {order.address.city}, {order.address.state}{" "}
                          {order.address.zipCode}
                        </div>
                      </div>
                    </div>
                    {order.address.phone && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Phone</div>
                        <div className="font-medium text-black">
                          {order.address.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Order Summary
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-3">Items</div>
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start"
                        >
                          <div className="flex-1 pr-4">
                            <div className="font-medium text-black">
                              {item.name}
                            </div>
                            <div className="text-gray-600 text-sm">
                              Qty: {item.quantity} • ₹{item.price?.toFixed(2)}
                            </div>
                          </div>
                          <div className="font-bold text-black text-lg">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-center text-gray-600 text-sm pt-2">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-medium text-black">
                        Total Amount
                      </div>
                      <div className="text-2xl font-bold text-black">
                        ₹{order.totalAmount?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Status */}
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-bold text-black">
                      Live Order Tracking
                    </div>
                    <div className="text-gray-700 text-sm">
                      This page updates automatically when order status changes
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Updates every 30 seconds
                </div>
              </div>
            </div>
          </div>
        )}

        {!order && !loading && orderId && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-black mb-3">
              Order Not Found
            </h3>
            <p className="text-gray-700 text-lg mb-6">
              No order found with ID:{" "}
              <span className="font-bold">{orderId}</span>
            </p>
            <div className="text-gray-600">
              Check your order ID and try again
            </div>
          </div>
        )}

        {!order && !loading && !orderId && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Hash className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-gray-700 text-lg">
              Enter your Order ID to start tracking
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
