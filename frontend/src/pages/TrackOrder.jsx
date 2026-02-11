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
  DollarSign,
  CreditCard,
  MapPin,
  Calendar,
  AlertCircle,
  Hash,
} from "lucide-react";
import { API_URL } from "../utils/constants";

const TrackOrder = () => {
  const socket = useSocket();
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

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_URL}/order/track/${orderId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setOrder(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !orderId) return;

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
  }, [socket, orderId]);


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

  const getStatusInfo = (status) =>
    statusConfig[status] || statusConfig.pending;

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Order</h1>
          <p className="text-gray-600">
            Enter your Order ID to track real-time updates
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && fetchOrder()}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-black"
                />
              </div>
              <button
                onClick={fetchOrder}
                disabled={loading || !orderId.trim()}
                className="px-4 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">Searching for order...</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Progress
              </h2>

              <div className="mb-6">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>

                <div className="flex justify-between mt-3">
                  {statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.findIndex(
                      (s) => s.key === order.status,
                    );
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = getStatusInfo(step.key).icon;

                    return (
                      <div key={step.key} className="text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${isCompleted ? "bg-black" : "bg-gray-100"}`}
                        >
                          <Icon
                            className={`w-4 h-4 ${isCompleted ? "text-white" : "text-gray-500"}`}
                          />
                        </div>
                        <div
                          className={`text-xs font-medium ${isCurrent ? "text-black" : "text-gray-600"}`}
                        >
                          {step.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                <div
                  className={`p-2 rounded ${getStatusInfo(order.status).bgColor}`}
                >
                  {React.createElement(getStatusInfo(order.status).icon, {
                    className: `w-4 h-4 ${getStatusInfo(order.status).color}`,
                  })}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">
                    {getStatusInfo(order.status).label}
                  </div>
                  <div className="text-xs text-gray-600">
                    Updated: {formatDate(order.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Order Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Order ID</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {order._id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Order Date</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Payment</div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900 text-sm">
                        {order.paymentMethod || "COD"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              {order.address && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Customer</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {order.address.fullName}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Address</div>
                      <div className="text-xs text-gray-900">
                        {order.address.street}, {order.address.city},{" "}
                        {order.address.state} {order.address.zipCode}
                      </div>
                    </div>
                    {order.address.phone && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Phone</div>
                        <div className="font-medium text-gray-900 text-sm">
                          {order.address.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Summary
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.quantity} × ₹{item.price}
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-xs text-gray-600 text-center">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live tracking enabled • Updates automatically</span>
              </div>
            </div>
          </div>
        )}

        {!order && !loading && orderId && (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Order Not Found
            </h3>
            <p className="text-gray-600 text-sm">
              No order found with ID: {orderId}
            </p>
          </div>
        )}

        {!order && !loading && !orderId && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <Hash className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">
              Enter Order ID to start tracking
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
