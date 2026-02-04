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
  MoreVertical,
  BarChart3,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  Circle,
} from "lucide-react";

function SellerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:4000/seller/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((result) => {
        setDashboard(result.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();

    const socket = io("http://localhost:4000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socket.on("dashboardUpdate", () => {
      fetchDashboard();
    });

    return () => {
      socket.off("dashboardUpdate");
      socket.disconnect();
    };
  }, []);

  // REMOVED THE SERVER-SIDE SOCKET CODE FROM HERE
  // It should only be in your server.js/io.js file

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  const totalEarnings =
    (dashboard?.orderStatus?.pending?.totalEarnings || 0) +
    (dashboard?.orderStatus?.processing?.totalEarnings || 0) +
    (dashboard?.orderStatus?.shipped?.totalEarnings || 0) +
    (dashboard?.orderStatus?.delivered?.totalEarnings || 0) +
    (dashboard?.orderStatus?.cancelled?.totalEarnings || 0);

  const totalOrders = dashboard?.orderCount || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Circle className="w-1.5 h-1.5 fill-black text-black" />
                <span className="text-xs text-gray-500 tracking-wider">
                  DASHBOARD
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-medium text-black">
                Store Analytics
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-all">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={fetchDashboard}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden xs:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        {/* Top Stats */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button className="text-left hover:bg-gray-50 p-4 rounded-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                  <span className="text-xs text-gray-500 tracking-wider font-medium group-hover:text-black transition-colors">
                    PRODUCTS
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl sm:text-3xl font-medium text-black mb-1">
                {dashboard?.productCount || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Active in catalog
              </div>
            </button>

            <button className="text-left hover:bg-gray-50 p-4 rounded-lg transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                  <span className="text-xs text-gray-500 tracking-wider font-medium group-hover:text-black transition-colors">
                    ORDERS
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl sm:text-3xl font-medium text-black mb-1">
                {totalOrders}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Total received
              </div>
            </button>

            <button className="text-left hover:bg-gray-50 p-4 rounded-lg transition-all cursor-pointer group sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                  <span className="text-xs text-gray-500 tracking-wider font-medium group-hover:text-black transition-colors">
                    REVENUE
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-2xl sm:text-3xl font-medium text-black mb-1">
                ₹{totalEarnings.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Total earnings
              </div>
            </button>
          </div>
        </div>

        {/* Order Status */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <div>
              <h2 className="text-sm font-medium text-black">ORDER PIPELINE</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time status overview
              </p>
            </div>
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors group self-start sm:self-auto">
              <span>View all orders</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-2">
            {[
              {
                icon: Clock,
                label: "Pending",
                desc: "Awaiting action",
                status: "pending",
              },
              {
                icon: Package,
                label: "Processing",
                desc: "Being prepared",
                status: "processing",
              },
              {
                icon: Truck,
                label: "Shipped",
                desc: "In transit",
                status: "shipped",
              },
              {
                icon: CheckCircle,
                label: "Delivered",
                desc: "Completed",
                status: "delivered",
              },
              {
                icon: XCircle,
                label: "Cancelled",
                desc: "Not completed",
                status: "cancelled",
              },
            ].map((item) => {
              const Icon = item.icon;
              const count =
                dashboard?.orderStatus?.[item.status]?.orderCount || 0;
              const earnings =
                dashboard?.orderStatus?.[item.status]?.totalEarnings || 0;

              return (
                <button
                  key={item.status}
                  className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-all cursor-pointer group border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-black transition-colors" />
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-medium text-black">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-medium text-black">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{earnings.toLocaleString()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <div className="mb-3 sm:mb-4">
            <h2 className="text-sm font-medium text-black">
              PERFORMANCE INSIGHTS
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Key business metrics</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Order Analytics */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                  ORDER ANALYTICS
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-sm font-medium text-black">
                      Total Orders
                    </div>
                    <div className="text-xs text-gray-500">Lifetime count</div>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-black">
                    {totalOrders}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-sm font-medium text-black">
                      Active Pipeline
                    </div>
                    <div className="text-xs text-gray-500">
                      Pending & Processing
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-black">
                    {(dashboard?.orderStatus?.pending?.orderCount || 0) +
                      (dashboard?.orderStatus?.processing?.orderCount || 0)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-sm font-medium text-black">
                      Success Rate
                    </div>
                    <div className="text-xs text-gray-500">Delivery ratio</div>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-black">
                    {totalOrders > 0
                      ? `${Math.round(((dashboard?.orderStatus?.delivered?.orderCount || 0) / totalOrders) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                  REVENUE BREAKDOWN
                </h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-sm font-medium text-black">
                      Total Revenue
                    </div>
                    <div className="text-xs text-gray-500">All time</div>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-black">
                    ₹{totalEarnings.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-sm font-medium text-black">
                      Confirmed
                    </div>
                    <div className="text-xs text-gray-500">
                      Delivered orders
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-black">
                    ₹
                    {dashboard?.orderStatus?.delivered?.totalEarnings?.toLocaleString() ||
                      0}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-sm font-medium text-black">
                      In Progress
                    </div>
                    <div className="text-xs text-gray-500">
                      Pending & Shipped
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-medium text-black">
                    ₹
                    {(
                      (dashboard?.orderStatus?.pending?.totalEarnings || 0) +
                      (dashboard?.orderStatus?.shipped?.totalEarnings || 0)
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
              <span>Last updated {new Date().toLocaleDateString("en-IN")}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-black font-medium">
                Status: Operational
              </span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span>{dashboard?.productCount || 0} Products</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span>
                {(dashboard?.orderStatus?.pending?.orderCount || 0) +
                  (dashboard?.orderStatus?.processing?.orderCount || 0)}{" "}
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
