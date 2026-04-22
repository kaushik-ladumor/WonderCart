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
  const RUPEE = '\u20B9';

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 pb-8 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Platform Dashboard</h1>
            <span
              className="h-2.5 w-2.5 rounded-full bg-[#15803d] animate-pulse"
              title="Platform Live"
            />
          </div>
          <p className="mt-1 text-sm text-[#66728d]">
            Monitor platform-wide revenue, sales trends, and vendor ecosystem growth.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-[18px] border border-[#dfe4f4] bg-white p-1">
          {['all', '30d'].map((v) => (
            <button
              key={v}
              className={`rounded-[14px] px-4 py-2 text-sm font-medium transition ${v === 'all'
                  ? 'bg-[#edf2ff] text-[#0f49d7]'
                  : 'text-[#68758f] hover:text-[#141b2d]'
                }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Platform GMV', value: `₹${stats.totalSales?.toLocaleString()}`, subLabel: 'Total Gross Value', color: 'text-[#141b2d]', iconWrap: 'bg-[#dfe7ff] text-[#0f49d7]', Icon: TrendingUp },
          { label: 'Platform Earnings', value: `₹${stats.totalCommission?.toLocaleString()}`, subLabel: 'Net Commission', color: 'text-[#15803d]', iconWrap: 'bg-[#dff6e4] text-[#15803d]', Icon: DollarSign },
          { label: 'Total Orders', value: stats.totalOrders?.toString(), subLabel: 'Fulfilled orders', color: 'text-[#141b2d]', iconWrap: 'bg-[#dfe4f0] text-[#56627d]', Icon: ShoppingBag },
          { label: 'Active Sellers', value: stats.totalSellers?.toString(), subLabel: 'Onboarded merchants', color: 'text-[#0f49d7]', iconWrap: 'bg-[#e8eeff] text-[#0f49d7]', Icon: Users },
        ].map((card, i) => (
          <div key={i} className="rounded-[22px] border border-[#e7ebf5] bg-white p-5 shadow-[0_10px_24px_rgba(18,36,84,0.05)] transition-all hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6d7892] mb-1">{card.label}</p>
                <h3 className={`text-[1.6rem] font-bold ${card.color}`}>{card.value}</h3>
              </div>
              <div className={`h-11 w-11 rounded-[16px] flex items-center justify-center ${card.iconWrap}`}>
                <card.Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f1f4f9] flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{card.subLabel}</span>
              {i === 1 && <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Secure Settlement</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="h-full rounded-[24px] border border-[#e7ebf5] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#141b2d]">Daily Platform Sales</h2>
                <p className="text-xs text-[#66728d] mt-1">Platform gross merchandise value trend over time.</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f4f9" vertical={false} />
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} hide />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0f49d7"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#0f49d7", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#0f49d7" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="h-full rounded-[24px] border border-[#e7ebf5] bg-white p-6 shadow-sm">
            <div className="mb-2">
              <h2 className="text-[18px] font-bold text-[#141b2d]">Order Distribution</h2>
              <p className="text-xs text-[#66728d] mt-1">Breakdown by current order status.</p>
            </div>
            <div className="h-[320px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rolePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
                    label={false}
                  >
                    {rolePieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Split Engine Visualization */}
      <div className="rounded-[24px] border border-[#e7ebf5] bg-white p-6 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#141b2d]">Live Money Flow Engine</h2>
            <p className="text-xs text-[#66728d] mt-1">Automated Razorpay Split for independent vendor settlements.</p>
          </div>
          <div className="h-10 w-fit px-4 bg-gray-900 rounded-xl flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active Engine</span>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
            <div className="flex flex-col items-center z-10">
              <div className="w-16 h-16 bg-[#f8f9fc] border-2 border-dashed border-[#d1d5e0] rounded-[22px] flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-[#94a3b8]" />
              </div>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Customer Payment</p>
              <p className="text-[1.2rem] font-bold text-[#141b2d]">₹{stats.totalSales?.toLocaleString()}</p>
            </div>

            <div className="hidden md:block flex-1 h-[2px] bg-[#eef2ff] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0f49d7] animate-ping"></div>
            </div>

            <div className="flex flex-col items-center z-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-[#0f49d7] blur-xl opacity-20 transition group-hover:opacity-40"></div>
                <div className="w-24 h-24 bg-[#0f172a] rounded-[32px] flex items-center justify-center mb-3 relative shadow-2xl">
                  <Activity className="w-10 h-10 text-white animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-[#141b2d] uppercase tracking-[0.2em]">WonderCart Split</p>
              <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mt-1">₹{stats.totalCommission?.toLocaleString()}</p>
            </div>

            <div className="hidden md:block flex-1 h-[2px] bg-[#eef2ff] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0f49d7] animate-ping delay-100"></div>
            </div>

            <div className="flex flex-col items-center z-10">
              <div className="flex -space-x-4 mb-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-14 h-14 bg-white border border-[#e4e8f5] rounded-[22px] flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform">
                    <DollarSign className="w-6 h-6 text-[#0f49d7]" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Vendor Share</p>
              <p className="text-[1.2rem] font-bold text-[#141b2d]">₹{(stats.totalSales - stats.totalCommission)?.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Settled to Vendors', value: stats.totalReleased?.toLocaleString(), color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
              { label: 'Funds On Hold (Held)', value: stats.totalHeld?.toLocaleString(), color: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' },
            ].map((item, i) => (
              <div key={i} className={`rounded-[20px] p-5 border-2 ${item.color} transition-transform hover:scale-[1.02]`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.dot} animate-pulse`}></div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{item.label}</span>
                </div>
                <p className="text-2xl font-bold">₹{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth & Platform Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers || 0, sub: `${todayUsers} today`, Icon: Users, color: 'text-indigo-600' },
          { label: 'Platform Reserve', value: `₹${(stats.totalCommission * 0.8).toLocaleString()}`, sub: 'Net surplus', Icon: Activity, color: 'text-emerald-600' },
          { label: 'Pending Refunds', value: stats.pendingRefunds || 0, sub: 'Needs attention', Icon: TrendingDown, color: 'text-red-500' },
          { label: 'Live Products', value: stats.totalProducts || 0, sub: `${todayProducts} new today`, Icon: Package, color: 'text-blue-600' }
        ].map((met, i) => (
          <div key={i} className="rounded-[22px] border border-[#e7ebf5] bg-white p-5 shadow-sm hover:border-[#dfe4f4] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center ${met.color}`}>
                <met.Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{met.label}</p>
            </div>
            <h4 className="text-[1.5rem] font-bold text-[#1a2238]">{met.value}</h4>
            <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{met.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
