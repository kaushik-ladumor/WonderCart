import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

function SellerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get("http://localhost:4000/seller/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(result.data);
    } catch (err) {
      console.log("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const socket = io("http://localhost:4000", {
      auth: { token: localStorage.getItem("token") },
    });

    socket.on("dashboardUpdate", fetchDashboard);

    return () => {
      socket.off("dashboardUpdate");
      socket.disconnect();
    };
  }, []);

  if (loading) return <Loader />;

  const totalEarnings = [
    dashboard?.orderStatus?.pending?.totalEarnings || 0,
    dashboard?.orderStatus?.processing?.totalEarnings || 0,
    dashboard?.orderStatus?.shipped?.totalEarnings || 0,
    dashboard?.orderStatus?.delivered?.totalEarnings || 0,
    dashboard?.orderStatus?.cancelled?.totalEarnings || 0,
  ].reduce((a, b) => a + b, 0);

  const totalOrders = dashboard?.orderCount || 0;
  const deliveredOrders = dashboard?.orderStatus?.delivered?.orderCount || 0;
  const pendingOrders = dashboard?.orderStatus?.pending?.orderCount || 0;
  const processingOrders = dashboard?.orderStatus?.processing?.orderCount || 0;
  const successRate =
    totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Store overview</p>
            </div>
            <button
              onClick={fetchDashboard}
              disabled={refreshing}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div
            onClick={() => navigate("/seller/products")}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <div className="text-xs text-gray-500">Products</div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {dashboard?.productCount || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active in catalog</div>
          </div>

          <div
            onClick={() => navigate("/seller/orders")}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-4 h-4 text-green-600" />
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
            <div className="text-xs text-gray-500 mt-1">Total orders</div>
          </div>

          <div
            onClick={() => navigate("/seller/earnings")}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              ₹{totalEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total earnings</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {successRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Order completion</div>
          </div>
        </div>

        {/* Order Pipeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
            <button
              onClick={() => navigate("/seller/orders")}
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              {
                icon: Clock,
                label: "Pending",
                status: "pending",
                color: "bg-yellow-50 border-yellow-200",
              },
              {
                icon: Package,
                label: "Processing",
                status: "processing",
                color: "bg-blue-50 border-blue-200",
              },
              {
                icon: Truck,
                label: "Shipped",
                status: "shipped",
                color: "bg-indigo-50 border-indigo-200",
              },
              {
                icon: CheckCircle,
                label: "Delivered",
                status: "delivered",
                color: "bg-green-50 border-green-200",
              },
              {
                icon: XCircle,
                label: "Cancelled",
                status: "cancelled",
                color: "bg-red-50 border-red-200",
              },
            ].map((item) => {
              const Icon = item.icon;
              const count =
                dashboard?.orderStatus?.[item.status]?.orderCount || 0;
              const earnings =
                dashboard?.orderStatus?.[item.status]?.totalEarnings || 0;

              return (
                <div
                  key={item.status}
                  onClick={() =>
                    navigate(`/seller/orders?status=${item.status}`)
                  }
                  className={`${item.color} border rounded-lg p-3 hover:shadow-sm transition cursor-pointer`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-gray-600">
                    ₹{earnings.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Analytics */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">
                Order Analytics
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-900">Pending & Processing</p>
                  <p className="text-xs text-gray-500">Orders in progress</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {pendingOrders + processingOrders}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹
                    {(dashboard?.orderStatus?.pending?.totalEarnings || 0) +
                      (dashboard?.orderStatus?.processing?.totalEarnings || 0)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-900">Delivered</p>
                  <p className="text-xs text-gray-500">Completed orders</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{deliveredOrders}</p>
                  <p className="text-xs text-gray-500">
                    ₹
                    {dashboard?.orderStatus?.delivered?.totalEarnings?.toLocaleString() ||
                      0}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-900">Cancelled</p>
                  <p className="text-xs text-gray-500">Not completed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {dashboard?.orderStatus?.cancelled?.orderCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹
                    {dashboard?.orderStatus?.cancelled?.totalEarnings?.toLocaleString() ||
                      0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/seller/products/add")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Add New Product</p>
                    <p className="text-xs text-gray-500">Create listing</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => navigate("/seller/orders")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">View Orders</p>
                    <p className="text-xs text-gray-500">Manage orders</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => navigate("/seller/profile")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium">View Profile</p>
                    <p className="text-xs text-gray-500">Account settings</p>
                  </div>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Live updates active</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{dashboard?.productCount || 0} products</span>
              <span>•</span>
              <span>{pendingOrders + processingOrders} active orders</span>
              <span>•</span>
              <span>
                Updated:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
