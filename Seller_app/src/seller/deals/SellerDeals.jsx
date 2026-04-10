import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Percent,
  Plus,
  Search,
  Calendar,
  Zap,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  TrendingUp,
  XCircle,
  Filter
} from "lucide-react";
import { API_URL } from "../../utils/constants";
import { useAuth } from "../../context/AuthProvider";
import Loader from "../../components/Loader";

const RUPEE = "₹";

const SellerDeals = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDeals();
  }, [token]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/deals/seller/my-deals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDeals(response.data.data);
      }
    } catch (err) {
      console.error("Fetch deals error:", err);
      toast.error("Failed to load your deals");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "live":
        return "bg-[#e9f8ef] text-[#18794e] border-[#b7ebc6]";
      case "pending":
        return "bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]";
      case "approved":
        return "bg-[#ebf2ff] text-[#2156d8] border-[#dbe6ff]";
      case "expired":
        return "bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]";
      case "rejected":
        return "bg-[#fef2f2] text-[#ef4444] border-[#fee2e2]";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          deal.dealType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || deal.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) return <Loader />;

  const stats = [
    { label: "Active Deals", value: deals.filter(d => d.status === 'live').length, icon: TrendingUp, color: "text-[#18794e]", bg: "bg-[#e9f8ef]" },
    { label: "Pending Review", value: deals.filter(d => d.status === 'pending').length, icon: Clock, color: "text-[#ea580c]", bg: "bg-[#fff7ed]" },
    { label: "Total Campaigns", value: deals.length, icon: Tag, color: "text-[#2156d8]", bg: "bg-[#ebf2ff]" },
  ];

  return (
    <div className="mx-auto max-w-[1180px] space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-[28px] font-bold text-[#141b2d] tracking-tight">Campaign Management</h1>
          <p className="text-[#6d7894] mt-1 text-sm font-medium">
            Monitor and track all your promotional deals and flash sales.
          </p>
        </div>
        <Link
          to="/seller/deals/create"
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#1a1a1a] px-5 py-3 text-[13px] font-bold text-white hover:bg-black transition-all shadow-lg shadow-black/5"
        >
          <Plus className="h-4 w-4" />
          Create New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-[28px] border border-[#eef1f8] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#7c87a2]">{stat.label}</p>
                <p className="text-2xl font-black text-[#141b2d]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="rounded-[32px] border border-[#eef1f8] bg-white p-1.5 shadow-sm flex flex-col lg:flex-row gap-3 overflow-hidden">
        <div className="flex-1 flex items-center gap-1.5 p-1">
          {['all', 'live', 'pending', 'expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-[22px] text-[13px] font-bold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-[#1a1a1a] text-white shadow-md' 
                  : 'text-[#6d7894] hover:bg-[#f8faff] hover:text-[#141b2d]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative p-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full lg:w-72 bg-[#f8faff] border border-[#eef1f8] rounded-[22px] pl-10 pr-4 text-[13px] font-medium outline-none focus:border-[#2156d8] transition-all"
          />
        </div>
      </div>

      {/* Deals List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDeals.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-[#dce2f0] bg-[#f8faff] py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#7c87a2] mb-4 shadow-sm">
              <Percent className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#141b2d]">No campaigns found</h3>
            <p className="text-sm text-[#7c87a2] mt-1">Start by creating a new deal to boost your sales.</p>
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <div key={deal._id} className="group relative bg-white border border-[#eef1f8] rounded-[32px] p-5 hover:border-[#cbd5e1] hover:shadow-xl hover:shadow-gray-400/5 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* Visual Type */}
                <div className="flex-shrink-0 w-16 h-16 rounded-[24px] bg-[#f8faff] border border-[#eef1f8] flex items-center justify-center relative">
                   <Zap className={`w-7 h-7 ${deal.status === 'live' ? 'text-[#2156d8] animate-pulse' : 'text-[#7c87a2]'}`} />
                   <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-lg">
                      {deal.discountValue}%
                   </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(deal.status)}`}>
                      {deal.status}
                    </span>
                    <span className="text-[10px] font-medium text-[#7c87a2] uppercase tracking-widest">{deal.dealType} DEAL</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#141b2d] truncate group-hover:text-[#2156d8] transition-colors">
                    {deal.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6d7894] font-medium">
                       <Calendar className="w-3.5 h-3.5 text-[#2156d8]" />
                       {new Date(deal.startDateTime).toLocaleDateString()} - {new Date(deal.endDateTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#6d7894] font-medium">
                       <Package className="w-3.5 h-3.5 text-[#2156d8]" />
                       {deal.productIds?.length || 0} product(s) linked
                    </div>
                  </div>
                </div>

                {/* Actions & Metrics */}
                <div className="flex items-center gap-4 lg:pl-6 lg:border-l border-[#f0f2f8]">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#7c87a2] mb-0.5">CLAIMED</p>
                    <p className="text-xl font-black text-[#141b2d]">{deal.claimedCount || 0}</p>
                  </div>
                  <div className="h-10 w-px bg-[#f0f2f8] mx-2 hidden lg:block" />
                  <Link 
                    to={`/seller/deals/${deal._id}`}
                    className="p-3 rounded-2xl bg-[#f8faff] text-[#141b2d] hover:bg-[#2156d8] hover:text-white transition-all shadow-sm"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

              </div>
              
              {/* Simple Bottom Banner for Rejection */}
              {deal.status === 'rejected' && deal.rejectionReason && (
                <div className="mt-4 pt-4 border-t border-red-50/50 flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[11px] font-bold">REJECTION REASON: {deal.rejectionReason}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerDeals;
