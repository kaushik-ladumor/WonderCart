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
  ChevronRight,
  Tag,
  Gift,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Sparkles
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
      const response = await axios.get(`${API_URL}/admin/coupons/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data.data.coupon || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure? This campaign will be permanently deactivated.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/coupons/delete/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      toast.success("Campaign Deactivated");
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code?.toLowerCase().includes(search.toLowerCase()) || 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Marketing Governance</h1>
          <p className="mt-1 text-sm text-[#66728d]">
            Manage platform-wide promotion campaigns, discount codes, and seasonal offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 bg-white border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-medium outline-none transition-all focus:border-[#2563eb] shadow-sm"
              />
           </div>
           <Link
             to="/admin/coupon/add"
             className="h-[42px] px-6 bg-[#2563eb] text-white rounded-2xl font-bold text-[13px] hover:bg-[#1d4ed8] transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
           >
             <Plus className="w-4 h-4" /> New Campaign
           </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Active Campaigns', value: coupons.filter(c => c.status === 'active').length, sub: 'Currently live', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Redemption Power', value: `${coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}`, sub: 'Total uses', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Platform Reach', value: coupons.length, sub: 'Created deals', icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((met, i) => (
          <div key={i} className="rounded-[22px] border border-[#e7ebf5] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl ${met.bg} flex items-center justify-center ${met.color}`}>
                <met.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{met.label}</p>
                <h4 className="text-2xl font-bold text-[#1a2238] leading-none">{met.value}</h4>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{met.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="rounded-[24px] border border-[#e7ebf5] bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#f1f4f9] bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-[#141b2d]">Promotion Ledger</h2>
                    <p className="text-[10px] text-[#6d7892] font-bold uppercase tracking-widest">Active & Scheduled Incentives</p>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Campaign Details</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deal Value</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Governance</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f9]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium italic">
                    No matching campaigns found in ledger.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 uppercase font-black text-xs">
                           {c.code.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a2238] font-mono">{c.code}</p>
                          <p className="text-[11px] text-[#6d7892] font-bold uppercase tracking-tighter">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        c.dealType === 'percentage' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {c.dealType === 'percentage' ? <Percent className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {c.dealType === 'percentage' ? `${c.discount}% OFF` : `₹${c.discount} FLAT`}
                      </span>
                      <p className="mt-1 text-[10px] text-gray-400 font-bold uppercase">Min Spend: ₹{c.minOrderValue || 0}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                         <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-gray-400" />
                           <span className="text-[11px] font-bold text-[#1a2238]">Expiry: {c.expirationDate ? new Date(c.expirationDate).toLocaleDateString('en-GB') : 'Perpetual'}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           {c.status === 'active' ? (
                             <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-emerald-100">Live</span>
                           ) : (
                             <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-rose-100">Inactive</span>
                           )}
                           {c.isFirstOrderOnly && <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase">First Order</span>}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/coupon/edit/${c._id}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-[#0f172a] hover:bg-gray-50 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => deleteCoupon(c._id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
