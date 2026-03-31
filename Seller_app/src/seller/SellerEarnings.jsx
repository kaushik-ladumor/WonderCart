import React, { useState } from "react";
import {
  DollarSign,
  CreditCard,
  Wallet,
  Download,
  Calendar,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ShoppingBag,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

const SellerEarnings = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(false);

  // Dummy data
  const earningsData = {
    totalEarnings: 125400,
    availableBalance: 96950,
    pendingBalance: 28450,
    thisMonthEarnings: 32450,
    growthPercentage: 12.3,
    totalOrders: 156,
    avgOrderValue: 802,
  };

  const recentTransactions = [
    {
      id: 1,
      orderId: "ORD78901",
      amount: 2499,
      status: "completed",
      date: "2024-07-15",
      product: "Nova X5 Smartphone",
    },
    {
      id: 2,
      orderId: "ORD78902",
      amount: 1299,
      status: "pending",
      date: "2024-07-14",
      product: "Wireless Earbuds",
    },
    {
      id: 3,
      orderId: "ORD78903",
      amount: 3599,
      status: "completed",
      date: "2024-07-13",
      product: "Smart Watch Pro",
    },
    {
      id: 4,
      orderId: "ORD78904",
      amount: 899,
      status: "refund",
      date: "2024-07-12",
      product: "Bluetooth Speaker",
    },
  ];

  const stats = [
    {
      title: "Total Earnings",
      value: `₹${earningsData.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: `+${earningsData.growthPercentage}%`,
    },
    {
      title: "Available Balance",
      value: `₹${earningsData.availableBalance.toLocaleString()}`,
      icon: Wallet,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      change: "Ready to withdraw",
    },
    {
      title: "Pending Balance",
      value: `₹${earningsData.pendingBalance.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      change: "In processing",
    },
    {
      title: "This Month",
      value: `₹${earningsData.thisMonthEarnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      change: `₹${(earningsData.thisMonthEarnings - 28900).toLocaleString()}`,
    },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleWithdraw = () => {
    if (earningsData.availableBalance < 1000) {
      alert("Minimum withdrawal amount is ₹1,000");
      return;
    }
    alert(`Withdraw ₹${earningsData.availableBalance.toLocaleString()}?`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "refund":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "refund":
        return <ArrowUpRight className="h-4 w-4 rotate-180" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
              <p className="text-gray-600">Track your sales and revenue</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleWithdraw}
                disabled={earningsData.availableBalance < 1000}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex gap-2">
              {["Week", "Month", "Quarter", "Year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    timeRange === range.toLowerCase()
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent Transactions
          </h2>

          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.product}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Order: {transaction.orderId}</span>
                      <span>•</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.status === "refund"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {transaction.status === "refund" ? "-₹" : "₹"}
                    {transaction.amount.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            View All Transactions
          </button>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earningsData.totalOrders}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">All time orders received</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{earningsData.avgOrderValue}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Average revenue per order</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerEarnings;
