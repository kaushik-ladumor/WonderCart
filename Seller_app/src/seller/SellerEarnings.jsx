import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  RefreshCw, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Search,
  Bell,
  HelpCircle,
  Download,
  Info,
  TrendingUp,
  ChevronRight,
  TrendingDown,
  ChevronLeft,
  Calendar,
  Zap
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";
import Loader from "../components/Loader";

const RUPEE = "\u20B9";

const chartData = [
  { name: 'OCT 01', value: 400 },
  { name: 'OCT 08', value: 600 },
  { name: 'OCT 15', value: 1000 },
  { name: 'OCT 22', value: 1200 },
  { name: 'OCT 31', value: 800 },
];

const categories = [
  { name: "Electronics", percentage: 48, color: "bg-[#2563eb]" },
  { name: "Home & Decor", percentage: 32, color: "bg-[#10b981]" },
  { name: "Fashion", percentage: 20, color: "bg-[#64748b]" },
];

const SellerEarnings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 1245800,
    availableBalance: 85400,
    pendingPayouts: 42000,
    nextPayoutDate: "Oct 28, 2023",
    transactions: [
      { id: 1, date: "Oct 21, 2023", amount: 12400.00, refId: "TXN - 99812450", status: "SUCCESS" },
      { id: 2, date: "Oct 14, 2023", amount: 31500.00, refId: "TXN - 99812421", status: "PROCESSING" },
      { id: 3, date: "Oct 07, 2023", amount: 8900.50, refId: "TXN - 99812399", status: "FAILED" },
      { id: 4, date: "Sep 30, 2023", amount: 45000.00, refId: "TXN - 99812200", status: "SUCCESS" },
    ]
  });

  useEffect(() => {
    fetchEarnings();
  }, [token]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/order/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        const orders = data.orders;
        const totalEarnings = orders.reduce((sum, o) => sum + (o.sellerPayout || 0), 0);
        const pendingPayouts = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').reduce((sum, o) => sum + (o.sellerPayout || 0), 0);
        const availableBalance = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.sellerPayout || 0), 0);
        
        setStats({
          totalEarnings,
          availableBalance,
          pendingPayouts,
          nextPayoutDate: "Oct 28, 2023", // Keep as static if not in DB
          transactions: orders.slice(0, 5).map(o => ({
            id: o._id,
            date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: o.sellerPayout || 0,
            refId: `TXN-${o.subOrderId.slice(-8).toUpperCase()}`,
            status: o.status === 'delivered' ? 'SUCCESS' : (o.status === 'cancelled' ? 'FAILED' : 'PROCESSING')
          }))
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return <span className="bg-[#f0fdf4] text-[#16a34a] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#dcfce7]">Success</span>;
      case "PROCESSING":
        return <span className="bg-[#eff6ff] text-[#2563eb] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#dbeafe]">Processing</span>;
      case "FAILED":
        return <span className="bg-[#fef2f2] text-[#dc2626] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-[#fee2e2]">Failed</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-slate-100">{status}</span>;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans text-[#1e293b] space-y-6">
      
      {/* Page Header Area */}
      <div className="flex justify-between items-end px-1">
         <div>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-1">Financial Intelligence</p>
            <h1 className="text-xl font-bold text-[#0f172a]">Earnings Dashboard</h1>
         </div>
         <button 
           onClick={fetchEarnings}
           className="p-2.5 bg-white border border-[#f1f5f9] rounded-xl text-[#2563eb] hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
         >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> SYNC
         </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
         {/* Total Earnings */}
         <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm flex flex-col justify-between group overflow-hidden relative min-h-[140px]">
            <div className="relative z-10">
               <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-3">Total Earnings</p>
               <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-lg font-light text-[#0f172a]">₹</span>
                  <p className="text-[1.55rem] font-bold text-[#0f172a] leading-none">{stats.totalEarnings.toLocaleString()}</p>
               </div>
               <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
                  <TrendingUp className="w-3 h-3" /> 12% increase
               </div>
            </div>
            <div className="absolute left-0 bottom-0 right-0 h-1 bg-[#2563eb]"></div>
         </div>

         {/* Available Balance */}
         <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
            <div>
               <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-3">Available Balance</p>
               <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-lg font-light text-[#0f172a]">₹</span>
                  <p className="text-[1.55rem] font-bold text-[#0f172a] leading-none">{stats.availableBalance.toLocaleString()}</p>
               </div>
               <div className="flex items-center gap-1.5 text-[#2563eb] text-[10px] font-bold uppercase tracking-wider">
                  <Wallet className="w-3 h-3" /> Ready
               </div>
            </div>
         </div>

         {/* Pending Payouts */}
         <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
            <div>
               <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-3">Pending Payouts</p>
               <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-lg font-light text-[#0f172a]">₹</span>
                  <p className="text-[1.55rem] font-bold text-[#0f172a] leading-none">{stats.pendingPayouts.toLocaleString()}</p>
               </div>
               <div className="flex items-center gap-1.5 text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-[#f59e0b]" /> On Hold
               </div>
            </div>
         </div>

         {/* Next Payout */}
         <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
            <div>
               <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-3">Next Settlement</p>
               <div className="mb-4">
                  <p className="text-[1.55rem] font-bold text-[#0f172a] leading-none">{stats.nextPayoutDate.split(',')[0]}</p>
               </div>
               <div className="flex items-center gap-1.5 text-[#64748b] text-[10px] font-bold uppercase tracking-wider">
                  <Calendar className="w-3 h-3 text-[#2563eb]" /> Weekly
               </div>
            </div>
         </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Revenue Over Time */}
         <div className="lg:col-span-8 bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-[14px] font-bold text-[#0f172a] mb-1">Revenue over Time</h3>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Monthly trend analysis</p>
               </div>
               <div className="flex gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                  {['7d', '30d', 'Yr'].map(t => (
                     <button key={t} className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${t === '30d' ? 'bg-white text-[#2563eb] shadow-sm' : 'text-[#94a3b8]'}`}>{t}</button>
                  ))}
               </div>
            </div>

            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} 
                        dy={10}
                     />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Breakdown Sidebar */}
         <div className="lg:col-span-4 bg-[#f8faff] border border-[#f1f5f9] rounded-[22px] p-6">
            <h3 className="text-[12px] font-bold text-[#0f172a] uppercase tracking-tight mb-8">Asset Breakdown</h3>
            
            <div className="space-y-8">
               {categories.map((cat, idx) => (
                  <div key={idx}>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">{cat.name}</span>
                        <span className="text-[11px] font-bold text-[#0f172a]">{cat.percentage}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full transition-all duration-1000`} style={{ width: `${cat.percentage}%` }}></div>
                     </div>
                  </div>
               ))}
            </div>

            <div className="mt-12 bg-white border border-blue-50 rounded-[22px] p-5 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563eb]">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-[#2563eb] uppercase tracking-widest mb-1">Live Insight</p>
                     <p className="text-[10px] text-[#64748b] font-bold leading-tight">
                        Revenue up 15% via Festive Sale.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Payout History Section */}
      <div className="bg-white border border-[#f1f5f9] rounded-[22px] shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-[#f1f5f9] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#0f172a]">Payout History</h3>
            <button className="text-[10px] font-black text-[#2563eb] uppercase tracking-widest hover:underline group">
               View All
            </button>
         </div>

         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[800px]">
               <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                     <th className="px-8 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Entry Date</th>
                     <th className="px-8 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Net Amount</th>
                     <th className="px-8 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Auth Reference</th>
                     <th className="px-8 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                     <th className="px-8 py-4 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#f1f5f9]">
                  {stats.transactions.map((tx) => (
                     <tr key={tx.id} className="hover:bg-[#f8fafc]/50 transition-colors group">
                        <td className="px-8 py-4 text-[11px] font-bold text-[#0f172a]">{tx.date}</td>
                        <td className="px-8 py-4 text-[12px] font-black text-[#0f172a]">₹{tx.amount.toLocaleString()}</td>
                        <td className="px-8 py-4 text-[10px] font-bold text-[#64748b] font-mono">{tx.refId}</td>
                        <td className="px-8 py-4">
                           {getStatusBadge(tx.status)}
                        </td>
                        <td className="px-8 py-4 text-right flex justify-end gap-2 items-center">
                            <button className="p-1.5 hover:bg-slate-100 rounded-lg"><Download className="w-4 h-4 text-blue-600" /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Payout Pagination */}
         <div className="px-8 py-4 bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-between items-center text-[#64748b]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Page 1 of 1</span>
            <div className="flex items-center gap-4">
               <button className="text-[10px] font-black uppercase tracking-widest text-[#2563eb]">Next Page</button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default SellerEarnings;
