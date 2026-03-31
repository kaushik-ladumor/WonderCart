import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";
import Loader from "../components/Loader";

// Charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  Users,
  Package,
  Activity,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  HelpCircle,
} from "lucide-react";

function AdminDashboard() {
  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(0);
  const [product, setProduct] = useState(0);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [userRoleCount, setUserRoleCount] = useState(0);
  const [sellerRoleCount, setSellerRoleCount] = useState(0);
  const [todayUsers, setTodayUsers] = useState(0);
  const [todaySellers, setTodaySellers] = useState(0);
  const [todayProducts, setTodayProducts] = useState(0);
  const [monthUsers, setMonthUsers] = useState(0);
  const [monthSellers, setMonthSellers] = useState(0);
  const { token } = useAuth();

  // ================= FETCH USERS =================
  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersData = response.data.data.users;
      setUsers(usersData);
      setUser(response.data.data.userCount);
      setUserRoleCount(usersData.filter((u) => u.role === "user").length);
      setSellerRoleCount(usersData.filter((u) => u.role === "seller").length);

      const today = new Date().toDateString();
      const todayList = usersData.filter(
        (u) => new Date(u.createdAt).toDateString() === today,
      );
      setTodayUsers(todayList.filter((u) => u.role === "user").length);
      setTodaySellers(todayList.filter((u) => u.role === "seller").length);

      const now = new Date();
      const monthList = usersData.filter((u) => {
        const d = new Date(u.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
      setMonthUsers(monthList.filter((u) => u.role === "user").length);
      setMonthSellers(monthList.filter((u) => u.role === "seller").length);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= FETCH PRODUCTS =================
  const fetchProductCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const productsData = response.data.data.products;
      setProducts(productsData);
      setProduct(response.data.data.productCount);

      const today = new Date().toDateString();
      const todayProductsList = productsData.filter(
        (p) => new Date(p.createdAt).toDateString() === today,
      );
      setTodayProducts(todayProductsList.length);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= LOAD DASHBOARD =================
  const fetchDashboardData = async () => {
    setLoading(true);
    await fetchUserCount();
    await fetchProductCount();
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // ================= CHART DATA =================
  const todayChartData = [
    {
      name: "Today",
      users: todayUsers,
      sellers: todaySellers,
      products: todayProducts,
    },
  ];

  const monthlyUserData = () => {
    const months = Array(12).fill(0);
    users.forEach((u) => {
      const month = new Date(u.createdAt).getMonth();
      months[month]++;
    });
    return months.map((count, index) => ({
      month: new Date(0, index).toLocaleString("default", { month: "short" }),
      users: count,
    }));
  };

  const productsPerDay = () => {
    const days = {};
    products.forEach((p) => {
      const day = new Date(p.createdAt).toLocaleDateString();
      days[day] = (days[day] || 0) + 1;
    });
    return Object.keys(days).map((day) => ({
      day: day.slice(0, 5),
      products: days[day],
    }));
  };

  const rolePieData = [
    { name: "Users", value: userRoleCount },
    { name: "Sellers", value: sellerRoleCount },
  ];

  const COLORS = ["#000000", "#666666"];

  // ================= LOADER =================
  if (loading) return <Loader />;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Header - FAQ style */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <Activity className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            Monitor your platform's performance and growth
          </p>
        </div>

        {/* Stats Cards - FAQ style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{user}</p>
              </div>
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Buyers:{" "}
                <span className="font-medium text-gray-900">
                  {userRoleCount}
                </span>{" "}
                | Sellers:{" "}
                <span className="font-medium text-gray-900">
                  {sellerRoleCount}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{product}</p>
              </div>
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Today:{" "}
                <span className="font-medium text-gray-900">
                  {todayProducts}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Today's Activity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayUsers + todaySellers + todayProducts}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Users:{" "}
                <span className="font-medium text-gray-900">{todayUsers}</span>{" "}
                | Sellers:{" "}
                <span className="font-medium text-gray-900">
                  {todaySellers}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthUsers + monthSellers}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Users:{" "}
                <span className="font-medium text-gray-900">{monthUsers}</span>{" "}
                | Sellers:{" "}
                <span className="font-medium text-gray-900">
                  {monthSellers}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Today Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Today's Overview
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={todayChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="users" fill="#000000" />
                    <Bar dataKey="sellers" fill="#4b5563" />
                    <Bar dataKey="products" fill="#9ca3af" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Role Distribution Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  User Distribution
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rolePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {rolePieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly User Growth Line Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Monthly User Growth
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyUserData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#000000"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Products Per Day Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Products Added Per Day
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productsPerDay()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="day"
                      stroke="#6b7280"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="products" fill="#4b5563" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats - FAQ style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Today's Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Users</span>
                <span className="font-medium text-gray-900">{todayUsers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Sellers</span>
                <span className="font-medium text-gray-900">
                  {todaySellers}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Products</span>
                <span className="font-medium text-gray-900">
                  {todayProducts}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Monthly Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">New Users</span>
                <span className="font-medium text-gray-900">{monthUsers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">New Sellers</span>
                <span className="font-medium text-gray-900">
                  {monthSellers}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Overall Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total Users</span>
                <span className="font-medium text-gray-900">{user}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Total Products</span>
                <span className="font-medium text-gray-900">{product}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
