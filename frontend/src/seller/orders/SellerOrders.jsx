import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  Search,
  Download,
  Truck,
  CheckCircle,
  Clock,
  Package,
  XCircle,
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
      document.getElementById("login_modal")?.showModal();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:4000/order/seller/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
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
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(ordersData);
        if (ordersData.length === 0) toast.error("No orders found");
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
      order._id.toLowerCase().includes(searchLower);

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
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        icon: Clock,
        label: "Pending",
      },
      processing: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: Package,
        label: "Processing",
      },
      shipped: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: Truck,
        label: "Shipped",
      },
      delivered: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return (
      configs[status] || {
        bg: "bg-gray-50",
        text: "text-gray-700",
        icon: Clock,
        label: "Unknown",
      }
    );
  };

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return "N/A";
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
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Orders exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const stats = [
    {
      label: "Total",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-blue-600",
    },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Processing",
      value: orders.filter((o) => o.status === "processing").length,
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Revenue",
      value: `₹${orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Orders</h1>
          <p className="text-sm text-gray-600">Manage customer orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-600">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "All"
                      ? "All Status"
                      : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
              >
                {dateOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchOrders}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 text-sm">
              Orders will appear here when customers purchase your products
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const Icon = statusInfo.icon;
              const totalItems =
                order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.buyer?.email || "Customer"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(order.createdAt)}
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            Order #{order._id}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${statusInfo.bg} ${statusInfo.text} flex items-center gap-1`}
                      >
                        <Icon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2 mb-3">
                      {order.items?.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">
                              {item.name || "Product"}
                            </span>
                            <span className="text-gray-500 ml-2">
                              ×{item.quantity || 1}
                            </span>
                          </div>
                          <span>
                            ₹{(item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {totalItems} items
                        </span>
                        <span className="font-bold">
                          ₹{order.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/seller/orders/${order._id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded hover:bg-gray-800"
                      >
                        View
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing{" "}
                <span className="font-semibold">{filteredOrders.length}</span>{" "}
                of <span className="font-semibold">{orders.length}</span> orders
              </span>
              <span className="font-bold">
                Total: ₹
                {filteredOrders
                  .reduce((s, o) => s + (o.totalAmount || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
