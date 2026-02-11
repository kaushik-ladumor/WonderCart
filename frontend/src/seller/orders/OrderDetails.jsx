import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketProvider";
import Loader from "../../components/Loader";
import { API_URL } from "../../utils/constants";

const OrderDetails = () => {
  const { id } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-50 text-red-700 border-red-200",
    },
  ];


  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_URL}/order/seller/id/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        setOrder(data.order);
        setNewStatus(data.order.status);
      }
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    const handleOrderUpdate = (data) => {
      if (data.orderId === id) {
        fetchOrder();
      }
    };

    socket.emit("join-order", id);
    socket.on("order-updated", handleOrderUpdate);

    return () => {
      socket.off("order-updated", handleOrderUpdate);
    };
  }, [socket, id]);


  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast.error("Please select a different status");
      return;
    }

    const confirmMessages = {
      cancelled: "Cancel this order? This cannot be undone.",
      delivered: "Mark as delivered? Confirm customer received order.",
    };

    if (
      confirmMessages[newStatus] &&
      !window.confirm(confirmMessages[newStatus])
    ) {
      return;
    }

    try {
      setUpdating(true);
      const { data } = await axios.put(
        `${API_URL}/order/seller/id/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (data.success) {
        toast.success("Order status updated");
        fetchOrder();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getAllowedStatuses = () => {
    if (!order) return statusOptions;
    const allowed = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };
    const current = order.status;
    return statusOptions.filter(
      (opt) => allowed[current]?.includes(opt.value) || opt.value === current,
    );
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-6 rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Order not found
          </h2>
          <button
            onClick={() => navigate("/seller/orders")}
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const subtotal =
    order.items?.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) ||
    0;
  const tax = Math.round(subtotal * 0.18);
  const shipping = 50;
  const total = subtotal + tax + shipping;
  const totalItems =
    order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
  const allowedStatuses = getAllowedStatuses();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  Order #{order._id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${statusInfo.color} border`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Status Update */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Update Status
              </h2>
              <div className="space-y-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={
                    ["delivered", "cancelled"].includes(order.status) ||
                    updating
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                >
                  {allowedStatuses.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}{" "}
                      {opt.value === order.status ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={
                    updating ||
                    newStatus === order.status ||
                    ["delivered", "cancelled"].includes(order.status)
                  }
                  className="w-full px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Items ({totalItems})
              </h2>
              <div className="space-y-3">
                {order.items?.map((item, idx) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  const image =
                    item.image || item.product?.variants?.[0]?.images?.[0];

                  return (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 bg-gray-50 rounded"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.name || "Product"}
                        </h3>
                        <div className="flex flex-wrap gap-1 my-2">
                          {item.color && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                              Size: {item.size}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            Qty: {item.quantity || 1}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            ₹{item.price || 0}
                          </span>
                          <span className="font-bold">₹{itemTotal}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Customer Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Customer</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="font-medium">
                    {order.user?.name || order.address?.fullName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-medium">{order.user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-medium">
                    {order.address?.phone || order.user?.phone || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Shipping</h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.address?.fullName || "—"}</p>
                <p className="text-gray-700">{order.address?.street || "—"}</p>
                <p className="text-gray-700">
                  {order.address?.city || "—"}, {order.address?.state || "—"}
                </p>
                <p className="text-gray-700">{order.address?.zipcode || "—"}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>₹{shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Timeline</h2>
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${statusInfo.color}`}
                >
                  <span>
                    {order.status === "pending" && "⏳"}
                    {order.status === "processing" && "🔄"}
                    {order.status === "shipped" && "🚚"}
                    {order.status === "delivered" && "✅"}
                    {order.status === "cancelled" && "❌"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{statusInfo.label}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
