import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from "recharts";
import { useAuth } from "../../context/AuthProvider";
import { useSocket } from "../../context/SocketProvider";
import { API_URL } from "../../utils/constants";

function SellerDashboard() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const socket = useSocket();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());


  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get(`${API_URL}/seller/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log("✅ Seller dashboard listening to socket events");

    const refreshDashboard = () => {
      fetchDashboard();
    };

    socket.on("seller-dashboard-update", refreshDashboard);
    socket.on("order-updated", refreshDashboard);
    socket.on("new-order", refreshDashboard);
    socket.on("orderStatusUpdate", refreshDashboard);

    socket.on("notification", (notification) => {
      if (
        notification?.type === "order-update" ||
        notification?.type === "new-order"
      ) {
        refreshDashboard();
      }
    });

    return () => {
      socket.off("seller-dashboard-update", refreshDashboard);
      socket.off("order-updated", refreshDashboard);
      socket.off("new-order", refreshDashboard);
      socket.off("orderStatusUpdate", refreshDashboard);
      socket.off("notification");
    };
  }, [socket]);


  if (loading) return <Loader />;

  const totalOrders = dashboard?.orderCount || 0;
  const productCount = dashboard?.productCount || 0;
  const totalEarnings = dashboard?.totalEarnings || 0;
  const orderStatus = dashboard?.orderStatus || {};
  const avgOrderValue = dashboard?.avgOrderValue || 0;
  const successRate = dashboard?.successRate || 0;

  const statsCards = [
    {
      label: "Products",
      value: productCount,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active in catalog",
      onClick: () => navigate("/seller/products"),
    },
    {
      label: "Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Total orders",
      onClick: () => navigate("/seller/orders"),
    },
    {
      label: "Revenue",
      value: `₹${Math.round(totalEarnings).toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Total earnings",
      onClick: () => navigate("/seller/earnings"),
    },
    {
      label: "Pending Approval",
      value: dashboard?.pendingProductCount || 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      description: "Awaiting review",
      onClick: () => navigate("/seller/products"),
    },
  ];

  const orderPipeline = [
    {
      icon: Clock,
      label: "Pending",
      status: "pending",
      count: orderStatus.pending?.orderCount || 0,
      earnings: orderStatus.pending?.totalEarnings || 0,
      color:
        "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
    },
    {
      icon: Package,
      label: "Processing",
      status: "processing",
      count: orderStatus.processing?.orderCount || 0,
      earnings: orderStatus.processing?.totalEarnings || 0,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    },
    {
      icon: Truck,
      label: "Shipped",
      status: "shipped",
      count: orderStatus.shipped?.orderCount || 0,
      earnings: orderStatus.shipped?.totalEarnings || 0,
      color:
        "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    },
    {
      icon: CheckCircle,
      label: "Delivered",
      status: "delivered",
      count: orderStatus.delivered?.orderCount || 0,
      earnings: orderStatus.delivered?.totalEarnings || 0,
      color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    },
    {
      icon: XCircle,
      label: "Cancelled",
      status: "cancelled",
      count: orderStatus.cancelled?.orderCount || 0,
      earnings: orderStatus.cancelled?.totalEarnings || 0,
      color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    },
  ];

  const chartData = orderPipeline.map((stat) => ({
    name: stat.label,
    orders: stat.count,
    revenue: stat.earnings,
  }));

  const pieData = orderPipeline.map((stat, index) => ({
    name: stat.label,
    value: stat.count,
    color: stat.color.includes("yellow")
      ? "#f59e0b"
      : stat.color.includes("blue")
        ? "#3b82f6"
        : stat.color.includes("purple")
          ? "#8b5cf6"
          : stat.color.includes("green")
            ? "#10b981"
            : "#ef4444",
  }));

  const quickStats = [
    {
      label: "Average Order Value",
      value: `₹${Math.round(parseFloat(avgOrderValue)).toLocaleString()}`,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Customer Satisfaction",
      value: "92%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Monthly Growth",
      value: successRate > 50 ? `+${successRate}%` : `${successRate}%`,
      icon: TrendingUp,
      color: successRate > 50 ? "text-green-600" : "text-red-600",
      bgColor: successRate > 50 ? "bg-green-50" : "bg-red-50",
    },
  ];

  const activeOrders =
    (orderStatus.pending?.orderCount || 0) +
    (orderStatus.processing?.orderCount || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Live Status */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Store overview & analytics</p>
          </div>
          <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
            Live updates enabled
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={stat.onClick}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Orders & Revenue Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">
                  Orders & Revenue
                </h3>
              </div>
              <div className="text-sm text-gray-500">Live updates</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "orders") return [value, "Orders"];
                      if (name === "revenue")
                        return [`₹${value.toLocaleString()}`, "Revenue"];
                      return value;
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ stroke: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Distribution Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">
                  Order Distribution
                </h3>
              </div>
              <div className="text-sm text-gray-500">By status</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} orders`]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Pipeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Order Pipeline</h2>
            <button
              onClick={() => navigate("/seller/orders")}
              className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {orderPipeline.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.status}
                  onClick={() =>
                    navigate(`/seller/orders?status=${item.status}`)
                  }
                  className={`${item.color} border rounded-lg p-4 hover:shadow-sm transition cursor-pointer`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="text-lg font-bold mb-1">{item.count}</div>
                  <div className="text-xs">
                    ₹{Math.round(item.earnings).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                <span className="font-semibold">{activeOrders}</span> active
                orders
              </span>
              <span className="text-gray-600">
                <span className="font-semibold">{productCount}</span> products
              </span>
              <span className="text-gray-600">
                Updated:{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            <div className="text-gray-900 font-bold">
              Total Revenue: ₹{Math.round(totalEarnings).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
