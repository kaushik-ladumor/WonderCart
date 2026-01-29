// src/seller/dashboard/SellerOrders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Search,
  Download,
  Truck,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  Loader2,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  Calendar,
  ChevronRight,
} from "lucide-react";

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState("All");

  const statusOptions = [
    "All",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const dateOptions = [
    "All",
    "Today",
    "Yesterday",
    "Last 7 days",
    "This month",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:4000/order/seller/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success) {
        let ordersData = response.data.orders || [];

        ordersData = ordersData
          .filter((order) => order && (order._id || order.orderId))
          .map((order) => ({
            ...order,
            _id: order._id || order.orderId,
            items: order.items || [],
            status: order.status || "pending",
            totalAmount: parseFloat(order.totalAmount || 0),
            createdAt: order.createdAt || new Date().toISOString(),
            buyer: order.buyer || { email: "Unknown Customer" },
          }));

        ordersData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setOrders(ordersData);

        if (ordersData.length === 0) {
          toast.info("No orders found for your products");
        } else {
          toast.success(`Loaded ${ordersData.length} orders`);
        }
      } else {
        toast.error(response.data?.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!order?._id) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (order.buyer?.email || "").toLowerCase().includes(searchLower) ||
      order._id.toLowerCase().includes(searchLower) ||
      (order.totalAmount || "").toString().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus;

    if (!matchesSearch || !matchesStatus) return false;

    if (dateRange !== "All" && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const today = new Date();

      switch (dateRange) {
        case "Today":
          return orderDate.toDateString() === today.toDateString();
        case "Yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDate.toDateString() === yesterday.toDateString();
        case "Last 7 days":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        case "This month":
          return (
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          );
        default:
          return true;
      }
    }
    return true;
  });

  const getStatusInfo = (status) => {
    const configs = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: Package,
        label: "Processing",
      },
      shipped: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: Truck,
        label: "Shipped",
      },
      delivered: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return (
      configs[status] || {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: Clock,
        label: "Unknown",
      }
    );
  };

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return "Date not available";
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

  const handleViewOrder = (orderId) => {
    if (!orderId) return toast.error("Invalid order");
    navigate(`/seller/orders/${orderId}`);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing",
  ).length;

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Processing",
      value: processingOrders,
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  const handleExport = () => {
    if (orders.length === 0) return toast.error("No orders to export");

    try {
      const csv = [
        ["Order ID", "Date", "Customer", "Amount", "Status", "Payment"],
        ...orders.map((o) => [
          o._id,
          new Date(o.createdAt).toLocaleDateString(),
          o.buyer?.email || "N/A",
          o.totalAmount || 0,
          o.status || "N/A",
          o.paymentStatus || "N/A",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seller-orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Orders exported successfully");
    } catch {
      toast.error("Export failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Orders
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "All"
                      ? "All Statuses"
                      : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {dateOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedStatus !== "All" || dateRange !== "All"
                ? "No orders match your filters"
                : "No orders yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== "All" || dateRange !== "All"
                ? "Try adjusting your search"
                : "Orders will appear when customers buy your products"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const Icon = statusInfo.icon;
              const totalItems =
                order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-sm"
                >
                  <div className="p-4">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold">
                          {order.buyer?.email?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.buyer?.email || "Customer"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg ${statusInfo.bg} ${statusInfo.text} flex items-center gap-2`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-100 py-4 space-y-3">
                      {order.items?.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name || "Product"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.color && `${item.color} • `}Qty:{" "}
                              {item.quantity || 1}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{(item.price || 0) * (item.quantity || 1)}
                          </p>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{totalItems} items</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold">{filteredOrders.length}</span>{" "}
                of <span className="font-semibold">{orders.length}</span> orders
              </p>
              <p className="text-lg font-bold text-gray-900">
                Total: ₹
                {filteredOrders
                  .reduce((s, o) => s + (o.totalAmount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
