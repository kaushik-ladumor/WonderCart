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
    <div className="p-4 md:p-6 bg-white min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-6">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-black">{user}</p>
          <p className="text-xs text-gray-400 mt-2">
            Buyers: {userRoleCount} | Sellers: {sellerRoleCount}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-black">{product}</p>
          <p className="text-xs text-gray-400 mt-2">Today: {todayProducts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Today's Activity</p>
          <p className="text-2xl font-bold text-black">
            {todayUsers + todaySellers + todayProducts}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Users: {todayUsers} | Sellers: {todaySellers}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">This Month</p>
          <p className="text-2xl font-bold text-black">
            {monthUsers + monthSellers}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Users: {monthUsers} | Sellers: {monthSellers}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Today's Overview
          </h2>
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

        {/* Role Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            User Distribution
          </h2>
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

        {/* Monthly User Growth Line Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Monthly User Growth
          </h2>
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

        {/* Products Per Day Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Products Added Per Day
          </h2>
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

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-black mb-2">Today's Details</h3>
          <p className="text-sm text-gray-600">
            Users:{" "}
            <span className="font-semibold text-black">{todayUsers}</span>
          </p>
          <p className="text-sm text-gray-600">
            Sellers:{" "}
            <span className="font-semibold text-black">{todaySellers}</span>
          </p>
          <p className="text-sm text-gray-600">
            Products:{" "}
            <span className="font-semibold text-black">{todayProducts}</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-black mb-2">Monthly Details</h3>
          <p className="text-sm text-gray-600">
            New Users:{" "}
            <span className="font-semibold text-black">{monthUsers}</span>
          </p>
          <p className="text-sm text-gray-600">
            New Sellers:{" "}
            <span className="font-semibold text-black">{monthSellers}</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-medium text-black mb-2">Overall Stats</h3>
          <p className="text-sm text-gray-600">
            Total Users:{" "}
            <span className="font-semibold text-black">{user}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Products:{" "}
            <span className="font-semibold text-black">{product}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
