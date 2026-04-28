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
    <div className="mx-auto max-w-7xl space-y-5 pb-8 font-poppins bg-[#f6f7fb] min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[1.5rem] font-semibold tracking-tight text-[#11182d]">Platform Dashboard</h1>
            <span
              className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"
              title="Platform Live"
            />
          </div>
          <p className="mt-0.5 text-[0.82rem] text-[#6d7892]">
            Monitor platform-wide revenue, sales trends, and vendor ecosystem growth.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-[18px] border border-[#d7dcea] bg-white p-1">
          {['all', '30d'].map((v) => (
            <button
              key={v}
              className={`rounded-[14px] px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] transition-all ${v === 'all'
                  ? 'bg-[#eef2ff] text-[#0f49d7] shadow-sm'
                  : 'text-[#6d7892] hover:text-[#11182d]'
                }`}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Platform GMV', value: `₹${stats.totalSales?.toLocaleString()}`, subLabel: 'Total Gross Value', color: 'text-[#11182d]', iconWrap: 'bg-[#eef2ff] text-[#0f49d7]', Icon: TrendingUp },
          { label: 'Platform Earnings', value: `₹${stats.totalCommission?.toLocaleString()}`, subLabel: 'Net Commission', color: 'text-[#11182d]', iconWrap: 'bg-emerald-50 text-emerald-600', Icon: DollarSign },
          { label: 'Total Orders', value: stats.totalOrders?.toString(), subLabel: 'Fulfilled orders', color: 'text-[#11182d]', iconWrap: 'bg-[#f8f9fd] text-[#5c6880]', Icon: ShoppingBag },
          { label: 'Active Sellers', value: stats.totalSellers?.toString(), subLabel: 'Onboarded merchants', color: 'text-[#11182d]', iconWrap: 'bg-[#eef2ff] text-[#0f49d7]', Icon: Users },
        ].map((card, i) => (
          <div key={i} className="rounded-[18px] border border-[#d7dcea] bg-white p-[1.125rem] shadow-sm hover:border-[#0f49d7] transition-all group">
            <div className="flex items-start justify-between gap-2.5">
              <p className="max-w-[150px] text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892]">
                {card.label}
              </p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${card.iconWrap} transition-transform group-hover:scale-110`}>
                <card.Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            
            <div className="mt-3 flex items-end gap-2">
              <h2 className="text-[1.35rem] font-bold leading-none text-[#11182d] tracking-tight">{card.value}</h2>
            </div>

            <div className="mt-2.5 text-[0.65rem] font-semibold text-[#6d7892] uppercase tracking-wider flex items-center justify-between">
              <span>{card.subLabel}</span>
              {i === 1 && <span className="font-bold text-[#18794e] bg-[#e9f8ef] px-1.5 py-0.5 rounded-md lowercase tracking-normal">secure setup</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="h-full rounded-[18px] border border-[#d7dcea] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[1.1rem] font-bold text-[#11182d]">Daily Platform Sales</h2>
                <p className="text-[0.88rem] text-[#6d7892] mt-1">Platform gross merchandise value trend over time.</p>
              </div>
              <div className="h-10 w-10 bg-[#f6f7fb] rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#0f49d7]" />
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f6f7fb" vertical={false} />
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} hide />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "14px", border: "1px solid #e1e5f1", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: '12px' }}
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
          <div className="h-full rounded-[18px] border border-[#d7dcea] bg-white p-6 shadow-sm">
            <div className="mb-2">
              <h2 className="text-[1.1rem] font-bold text-[#11182d]">Order Distribution</h2>
              <p className="text-[0.88rem] text-[#6d7892] mt-1">Breakdown by current order status.</p>
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
                    contentStyle={{ borderRadius: '14px', border: '1px solid #e1e5f1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-[0.7rem] font-semibold text-[#6d7892] uppercase tracking-wider">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Split Engine Visualization */}
      <div className="rounded-[18px] border border-[#d7dcea] bg-white p-6 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-[1.1rem] font-bold text-[#11182d]">Live Money Flow Engine</h2>
            <p className="text-[0.88rem] text-[#6d7892] mt-1">Automated Razorpay Split for independent vendor settlements.</p>
          </div>
          <div className="h-10 w-fit px-4 bg-[#11182d] rounded-[14px] flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-[#18794e]" />
            <span className="text-[0.7rem] font-bold text-white uppercase tracking-widest">Active Engine</span>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
            <div className="flex flex-col items-center z-10">
              <div className="w-16 h-16 bg-[#f6f7fb] border-2 border-dashed border-[#d7dcea] rounded-[18px] flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-[#6d7892]" />
              </div>
              <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Customer Payment</p>
              <p className="text-[1.2rem] font-bold text-[#11182d]">₹{stats.totalSales?.toLocaleString()}</p>
            </div>

            <div className="hidden md:block flex-1 h-[2px] bg-[#f6f7fb] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0f49d7]"></div>
            </div>

            <div className="flex flex-col items-center z-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-[#0f49d7] blur-xl opacity-20 transition group-hover:opacity-40"></div>
                <div className="w-24 h-24 bg-[#11182d] rounded-[24px] flex items-center justify-center mb-3 relative shadow-xl">
                  <Activity className="w-10 h-10 text-white" />
                </div>
              </div>
              <p className="text-[0.7rem] font-bold text-[#11182d] uppercase tracking-widest">WonderCart Split</p>
              <p className="text-[0.88rem] font-bold text-[#18794e] bg-[#e9f8ef] px-3 py-1 rounded-[8px] mt-1">₹{stats.totalCommission?.toLocaleString()}</p>
            </div>

            <div className="hidden md:block flex-1 h-[2px] bg-[#f6f7fb] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0f49d7]"></div>
            </div>

            <div className="flex flex-col items-center z-10">
              <div className="flex -space-x-4 mb-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-14 h-14 bg-white border border-[#d7dcea] rounded-[18px] flex items-center justify-center shadow-sm transform hover:-translate-y-1 transition-transform">
                    <DollarSign className="w-6 h-6 text-[#0f49d7]" />
                  </div>
                ))}
              </div>
              <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">Vendor Share</p>
              <p className="text-[1.2rem] font-bold text-[#11182d]">₹{(stats.totalSales - stats.totalCommission)?.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Settled to Vendors', value: stats.totalReleased?.toLocaleString(), color: 'bg-[#e9f8ef] text-[#18794e] border-[#b7ebc6]', dot: 'bg-[#18794e]' },
              { label: 'Funds On Hold (Held)', value: stats.totalHeld?.toLocaleString(), color: 'bg-[#f6f7fb] text-[#11182d] border-[#d7dcea]', dot: 'bg-[#0f49d7]' },
            ].map((item, i) => (
              <div key={i} className={`rounded-[18px] p-5 border-2 ${item.color} transition-transform hover:scale-[1.02]`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`}></div>
                  <span className="text-[0.7rem] font-bold uppercase tracking-widest opacity-90">{item.label}</span>
                </div>
                <p className="text-[1.5rem] font-bold">₹{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth & Platform Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers || 0, sub: `${todayUsers} today`, Icon: Users, color: 'text-[#0f49d7]' },
          { label: 'Platform Reserve', value: `₹${(stats.totalCommission * 0.8).toLocaleString()}`, sub: 'Net surplus', Icon: Activity, color: 'text-[#18794e]' },
          { label: 'Pending Refunds', value: stats.pendingRefunds || 0, sub: 'Needs attention', Icon: TrendingDown, color: 'text-rose-600' },
          { label: 'Live Products', value: stats.totalProducts || 0, sub: `${todayProducts} new today`, Icon: Package, color: 'text-[#0f49d7]' }
        ].map((met, i) => (
          <div key={i} className="rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-8 w-8 rounded-[10px] bg-[#f6f7fb] flex items-center justify-center ${met.color}`}>
                <met.Icon className="h-4 w-4" />
              </div>
              <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">{met.label}</p>
            </div>
            <h4 className="text-[1.5rem] font-bold text-[#11182d]">{met.value}</h4>
            <p className="mt-1 text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">{met.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
