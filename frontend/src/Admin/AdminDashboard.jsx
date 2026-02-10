import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  ArrowUpRight,
  MoreVertical,
} from "lucide-react";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  // Recent orders data
  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      amount: "$299.99",
      status: "completed",
      time: "10:42 AM",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      amount: "$149.99",
      status: "pending",
      time: "09:15 AM",
    },
    {
      id: "ORD-003",
      customer: "Robert Johnson",
      amount: "$89.99",
      status: "completed",
      time: "Yesterday",
    },
    {
      id: "ORD-004",
      customer: "Emily Davis",
      amount: "$459.99",
      status: "processing",
      time: "Yesterday",
    },
    {
      id: "ORD-005",
      customer: "Michael Brown",
      amount: "$199.99",
      status: "completed",
      time: "Dec 12",
    },
  ];

  // Sales chart data
  const salesData = [
    { month: "Jan", sales: 65 },
    { month: "Feb", sales: 78 },
    { month: "Mar", sales: 90 },
    { month: "Apr", sales: 81 },
    { month: "May", sales: 56 },
    { month: "Jun", sales: 55 },
    { month: "Jul", sales: 40 },
    { month: "Aug", sales: 72 },
    { month: "Sep", sales: 85 },
    { month: "Oct", sales: 60 },
    { month: "Nov", sales: 75 },
    { month: "Dec", sales: 90 },
  ];

  // Stats cards
  const statCards = [
    {
      title: "Total Users",
      value: "1,248",
      icon: <Users className="text-blue-600" size={24} />,
      change: "+12.5%",
      color: "bg-blue-50 border-blue-100",
    },
    {
      title: "Total Products",
      value: "356",
      icon: <Package className="text-green-600" size={24} />,
      change: "+8.2%",
      color: "bg-green-50 border-green-100",
    },
    {
      title: "Total Orders",
      value: "894",
      icon: <ShoppingCart className="text-purple-600" size={24} />,
      change: "+24.7%",
      color: "bg-purple-50 border-purple-100",
    },
    {
      title: "Total Revenue",
      value: "$12,458",
      icon: <DollarSign className="text-orange-600" size={24} />,
      change: "+18.3%",
      color: "bg-orange-50 border-orange-100",
    },
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        users: 1248,
        products: 356,
        orders: 894,
        revenue: 12458,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#000000]">
          Dashboard Overview
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
          <p className="text-[#B6B09F]">
            Welcome back! Here's what's happening today.
          </p>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Calendar size={18} className="text-[#B6B09F]" />
            <span className="text-sm text-[#000000] font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                <TrendingUp size={16} />
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#000000] mb-2">
              {stat.value}
            </h3>
            <p className="text-[#B6B09F] text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts & Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#000000]">
                Sales Overview
              </h2>
              <p className="text-sm text-[#B6B09F]">Monthly performance</p>
            </div>
            <button className="flex items-center space-x-1 text-[#000000] hover:text-[#B6B09F] transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Simple Chart */}
          <div className="h-64 flex items-end justify-between pt-8">
            {salesData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1 mx-1"
              >
                <div className="relative w-8 md:w-10">
                  <div
                    className="w-full bg-gradient-to-t from-[#EAE4D5] to-[#B6B09F] rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${item.sales}%`, minHeight: "20px" }}
                  />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-[#B6B09F] font-medium">
                    ${item.sales * 10}
                  </div>
                </div>
                <span className="text-xs text-[#B6B09F] mt-2">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#000000]">
                Recent Orders
              </h2>
              <p className="text-sm text-[#B6B09F]">Latest transactions</p>
            </div>
            <button className="flex items-center space-x-1 text-[#000000] hover:text-[#B6B09F] transition-colors text-sm font-medium">
              View All <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-[#F2F2F2] rounded-lg hover:bg-[#EAE4D5] transition-colors"
              >
                <div>
                  <p className="font-medium text-[#000000]">{order.customer}</p>
                  <p className="text-sm text-[#B6B09F]">
                    {order.id} • {order.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#000000]">{order.amount}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Activity size={24} className="text-[#000000]" />
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Live
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#000000]">98.7%</h3>
          <p className="text-[#B6B09F] text-sm">System Uptime</p>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Users size={24} className="text-[#000000]" />
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              +24
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#000000]">42</h3>
          <p className="text-[#B6B09F] text-sm">New Users Today</p>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart size={24} className="text-[#000000]" />
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              Hot
            </span>
          </div>
          <h3 className="text-2xl font-bold text-[#000000]">18</h3>
          <p className="text-[#B6B09F] text-sm">Pending Orders</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
