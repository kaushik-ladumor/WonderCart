// src/seller/orders/OrderDetails.jsx - Simplified with better image handling
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "shipped",
      label: "Shipped",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
  ];

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:4000/order/seller/id/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success && data.order) {
        setOrder(data.order);
        setNewStatus(data.order.status);
      } else {
        toast.error(data.message || "Failed to load order");
        navigate("/seller/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(error.response?.data?.message || "Failed to load order");
      navigate("/seller/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast.error("Please select a different status");
      return;
    }

    const confirmMessages = {
      cancelled:
        "Are you sure you want to cancel this order? This cannot be undone.",
      delivered: "Mark as delivered? Confirm customer received the order.",
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
        `http://localhost:4000/order/seller/id/${id}/status`,
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
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const calculateSubtotal = () =>
    order?.items?.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    ) || 0;

  const getTotalItems = () =>
    order?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  const calculateTax = () => Math.round(calculateSubtotal() * 0.18);
  const calculateShipping = () => 50;
  const calculateTotal = () =>
    calculateSubtotal() + calculateTax() + calculateShipping();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Order not found
          </h2>
          <p className="text-gray-600 mb-6">
            This order doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => navigate("/seller/orders")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const shipping = calculateShipping();
  const total = calculateTotal();
  const allowedStatuses = getAllowedStatuses();

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/seller/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <span className="text-lg">←</span>
            Back to Orders
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Order Details
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">
                  Order #{order._id.slice(-8)}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {order.paymentMethod || "COD"}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}
                >
                  {order.paymentStatus || "pending"}
                </span>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-lg ${statusInfo.color} font-medium`}
            >
              {statusInfo.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Update Order Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={
                      ["delivered", "cancelled"].includes(order.status) ||
                      updating
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                  >
                    {allowedStatuses.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}{" "}
                        {opt.value === order.status ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={
                    updating ||
                    newStatus === order.status ||
                    ["delivered", "cancelled"].includes(order.status)
                  }
                  className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                <span className="text-gray-600">{getTotalItems()} items</span>
              </div>
              <div className="space-y-4">
                {order.items.map((item, idx) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1);
                  // Use the image from backend or fallback to first variant image
                  const image =
                    item.image || item.product?.variants?.[0]?.images?.[0];

                  return (
                    <div
                      key={idx}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=000&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400 text-2xl">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {item.name || "Product"}
                        </h3>
                        <div className="flex flex-wrap gap-2 my-3">
                          {item.color && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                              Size: {item.size}
                            </span>
                          )}
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                            Qty: {item.quantity || 1}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Price: ₹{item.price?.toFixed(2) || "0.00"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Product ID:{" "}
                              {item.product?._id?.slice(-8) || "N/A"}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">👤</span>
                Customer Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-medium text-lg">
                    {order.user?.name || order.address?.fullName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{order.user?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-medium">
                    {order.address?.phone || order.user?.phone || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">📍</span>
                Shipping Address
              </h2>
              <div className="space-y-3">
                <p className="font-medium">{order.address?.fullName || "—"}</p>
                <p className="text-gray-700">{order.address?.street || "—"}</p>
                <p className="text-gray-700">
                  {order.address?.city || "—"}, {order.address?.state || "—"}{" "}
                  {order.address?.zipcode || "—"}
                </p>
                {order.address?.phone && (
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-lg">📱</span> {order.address.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Timeline
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${statusInfo.color}`}
                  >
                    <span className="text-lg">
                      {order.status === "pending" && "⏳"}
                      {order.status === "processing" && "🔄"}
                      {order.status === "shipped" && "🚚"}
                      {order.status === "delivered" && "✅"}
                      {order.status === "cancelled" && "❌"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {statusInfo.label}
                    </p>
                    <p className="text-sm text-gray-600">Order placed</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                Contact Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
