import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";
import axios from "axios";
import {
  Trash2,
  Plus,
  Pencil,
  Ticket,
  Calendar,
  Users,
  Percent,
  CreditCard,
  Tag,
  Gift,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Truck,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function AdminCoupon() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/coupon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch marketing ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure? This campaign will be permanently retired.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/coupon/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      toast.success("Campaign retired successfully");
    } catch (error) {
      toast.error("Failed to retire campaign");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code?.toLowerCase().includes(search.toLowerCase()) || 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-[1400px] pb-20 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-10">
      
      {/* Premium Header */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-12">
        <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                <Sparkles className="w-3 h-3" />
                Growth Engine
            </div>
          <h1 className="text-4xl font-black text-[#141b2d] tracking-tight">Marketing Governance</h1>
          <p className="text-sm text-[#64748b] font-medium max-w-xl">
            Analyze, deploy, and manage platform-wide incentives. All discounts are platform-funded and do not impact seller earnings.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find a campaign..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 bg-white border border-[#e2e8f0] rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-[#1e293b] outline-none transition-all focus:border-blue-500 shadow-sm focus:shadow-blue-100 focus:shadow-lg placeholder:text-gray-300"
              />
           </div>
           <Link
             to="/admin/coupon/add"
             className="h-[52px] px-8 bg-[#1e293b] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0f172a] transition-all flex items-center gap-3 shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98]"
           >
             <Plus className="w-4 h-4" /> New Initiative
           </Link>
        </div>
      </div>

      {/* Analytics Insight */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {[
          { label: 'Live Deployments', value: coupons.filter(c => c.status === 'active').length, sub: 'Active offers', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Redemption Velocity', value: coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0), sub: 'Total conversions', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Strategic Reach', value: coupons.length, sub: 'Total campaigns', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Growth Budget', value: `₹${coupons.reduce((acc, c) => acc + (c.totalDiscountGiven || 0), 0)}`, sub: 'Total discount issued', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ].map((met, i) => (
          <div key={i} className={`rounded-[32px] border ${met.border} bg-white p-6 shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-center gap-5">
              <div className={`h-14 w-14 rounded-2xl ${met.bg} flex items-center justify-center ${met.color} group-hover:scale-110 transition-transform`}>
                <met.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{met.label}</p>
                <h4 className="text-2xl font-black text-[#1a2238] leading-none">{met.value}</h4>
                <p className="text-[10px] text-gray-400 mt-2 uppercase font-black">{met.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[40px] border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-[#f1f5f9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-600/5 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[#141b2d]">Promotion Ledger</h2>
                    <p className="text-[10px] text-[#64748b] font-black uppercase tracking-[0.2em] mt-0.5">Historical & active incentives</p>
                </div>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2">
                Export Data <ArrowRight className="w-3 h-3" />
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="pl-10 pr-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Campaign Asset</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logic & Value</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-10">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                        <Ticket className="w-16 h-16" />
                        <p className="text-xl font-bold italic">No campaigns detected in the ledger.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="pl-10 pr-6 py-8">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-indigo-600/5 text-indigo-600 rounded-[20px] flex flex-col items-center justify-center border border-indigo-100/50 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           <span className="text-[10px] font-black uppercase opacity-60">ID</span>
                           <span className="text-sm font-black">{c.code.substring(0, 2)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-black text-[#1a2238] font-mono tracking-tighter">{c.code}</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-black uppercase">{c.couponType}</span>
                          </div>
                          <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-tight mt-0.5">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="space-y-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider ${
                            c.couponType === 'percentage' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                            {c.couponType === 'percentage' ? <Percent className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {c.couponType === 'percentage' ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} FLAT`}
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                <ShoppingCart className="w-3 h-3" /> Min: ₹{c.minOrderValue || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                                <Users className="w-3 h-3" /> Limit: {c.usageLimitPerUser}x
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="space-y-3">
                         <div className="flex items-center gap-2.5">
                           <Calendar className="w-3.5 h-3.5 text-gray-300" />
                           <span className="text-[11px] font-black text-[#1a2238] uppercase tracking-tighter">
                            Exp: {c.neverExpires ? 'Perpetual' : new Date(c.endDate).toLocaleDateString('en-GB')}
                           </span>
                         </div>
                         <div className="flex items-center gap-3">
                            {c.status === 'active' ? (
                              <span className="flex items-center gap-1.5 text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-100">
                                <div className="h-1 w-1 bg-emerald-600 rounded-full animate-pulse" /> Live
                              </span>
                            ) : (
                              <span className="text-[9px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-rose-100">Inactive</span>
                            )}
                            {c.targetType === 'new_users' && (
                                <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> Acquisition
                                </span>
                            )}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 text-right pr-10">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin/coupon/edit/${c._id}`}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#1e293b] hover:border-blue-200 hover:shadow-lg transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteCoupon(c._id)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white border border-[#e2e8f0] text-[#64748b] hover:text-red-500 hover:border-red-100 hover:shadow-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCoupon;
