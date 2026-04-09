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
  DollarSign,
  TrendingDown,
  Percent,
  ShoppingBag
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
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCommission: 0,
    totalOrders: 0,
    salesTrend: [],
    statusDistribution: {}
  });
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

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/order/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
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
    await Promise.all([
      fetchUserCount(),
      fetchProductCount(),
      fetchStats()
    ]);
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

  const rolePieData = Object.keys(stats.statusDistribution || {}).map(status => ({
    name: status.replaceAll("_", " ").toUpperCase(),
    value: stats.statusDistribution[status]
  }));

  const COLORS = ["#000000", "#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Sales (GMV)</p>
                <p className="text-xl font-bold text-gray-900">₹{stats.totalSales?.toLocaleString()}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center ">
               <p className="text-[10px] text-gray-500 uppercase font-bold">Platform Earnings</p>
               <span className="text-xs font-bold text-emerald-600">₹{stats.totalCommission?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center ">
               <p className="text-[10px] text-gray-500 uppercase font-bold">Fulfilled orders</p>
               <span className="text-xs font-bold text-blue-600">{stats.statusDistribution?.delivered || 0}</span>
            </div>
          </div>

        {/* Money Flow Diagram - Strategy 1 Visualization */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">
                Live Money Flow (Razorpay Split Engine)
              </h2>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Strategy 1: Independent Payouts</span>
          </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
              {/* Step 1: Customer */}
              <div className="flex flex-col items-center z-10">
                <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Customer Pay</p>
                <p className="text-sm font-bold text-gray-900">₹{stats.totalSales?.toLocaleString()}</p>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:block flex-1 h-0.5 bg-gray-200 relative">
                <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
              </div>

              {/* Step 2: Platform Admin (Splitter) */}
              <div className="flex flex-col items-center z-10">
                <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-2 shadow-xl shrink-0">
                  <Activity className="w-10 h-10 text-white animate-pulse" />
                </div>
                <p className="text-[10px] font-bold text-black uppercase">WonderCart Split</p>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-emerald-600">Admin: ₹{stats.totalCommission?.toLocaleString()}</span>
                </div>
              </div>

              {/* Arrow 2-3 Split */}
              <div className="hidden md:block flex-1 h-0.5 bg-gray-200 relative">
                 <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
              </div>

              {/* Step 3: Vendors (Sub-Orders) */}
              <div className="flex flex-col items-center z-10">
                <div className="flex -space-x-4 mb-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                       <DollarSign className="w-6 h-6 text-blue-600" />
                     </div>
                   ))}
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Vendor Payouts</p>
                <p className="text-sm font-bold text-gray-900">₹{(stats.totalSales - stats.totalCommission)?.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Released</span>
                </div>
                <p className="text-lg font-bold text-emerald-900">₹{(stats.totalSales * 0.4).toLocaleString()}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">On Hold</span>
                </div>
                <p className="text-lg font-bold text-amber-900">₹{(stats.totalSales * 0.5).toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Settling T+1</span>
                </div>
                <p className="text-lg font-bold text-blue-900">₹{(stats.totalSales * 0.1).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Sales Trend Line Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Daily Platform Sales (GMV)
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="_id" stroke="#6b7280" hide />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                       contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#000000"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#000000", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#000000" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Order Status Distribution Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Global Order Distribution
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
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
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
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Section */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Activity className="w-16 h-16" />
               </div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Sellers</p>
               <h3 className="text-2xl font-bold">{stats.totalSellers || 0}</h3>
               <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md">Settlement Account</span>
               </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm group hover:border-gray-300 transition-colors">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Platform Reserve</p>
               <h3 className="text-2xl font-bold text-gray-900">₹{(stats.totalCommission * 0.8).toLocaleString()}</h3>
               <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600">Stable balance</span>
               </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm group hover:border-gray-300 transition-colors">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Refunds</p>
               <h3 className="text-2xl font-bold text-gray-900">3</h3>
               <div className="mt-4 flex items-center gap-2">
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] font-bold text-red-600">Action Required</span>
               </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm group hover:border-gray-300 transition-colors">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">SLA Health</p>
               <h3 className="text-2xl font-bold text-gray-900">98.4%</h3>
               <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600 rounded-full w-[98.4%]"></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
