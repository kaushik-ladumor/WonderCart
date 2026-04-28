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

const formatPrice = (price) =>
  `Rs ${Math.round(Number(price || 0)).toLocaleString("en-IN")}`;

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
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d] font-poppins">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
                Campaign Management
              </h1>
              <p className="mt-1 text-[0.82rem] text-[#6d7892]">
                Monitor and track all your promotional deals and flash sales.
              </p>
            </div>
            <Link
              to="/seller/deals/create"
              className="flex items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-5 py-2.5 text-[0.82rem] font-semibold text-white shadow-sm transition-all hover:bg-[#0d3ebb]"
            >
              <Plus className="h-4 w-4" />
              Create New Campaign
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, idx) => (
              <div key={idx} className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.74rem] font-semibold uppercase tracking-wider text-[#6d7892]">{stat.label}</p>
                    <p className="text-[1.25rem] font-semibold text-[#11182d]">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 rounded-[18px] border border-[#e1e5f1] bg-white p-2 lg:flex-row">
            <div className="flex flex-1 items-center gap-1.5 overflow-x-auto p-1 scrollbar-hide">
              {['all', 'live', 'pending', 'expired'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-[14px] px-4 py-2 text-[0.82rem] font-semibold capitalize transition-all ${activeTab === tab
                      ? 'bg-[#0f49d7] text-white'
                      : 'text-[#6d7892] hover:bg-[#f6f7fb] hover:text-[#11182d]'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative p-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6d7892]" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-[14px] border border-[#e1e5f1] bg-[#f6f7fb] pl-10 pr-4 text-[0.82rem] font-medium text-[#11182d] outline-none transition-all focus:border-[#0f49d7] lg:w-72"
              />
            </div>
          </div>

          {/* Deals List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#c6cede] bg-[#f8f9fd] py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#6d7892] shadow-sm">
                  <Percent className="h-5 w-5" />
                </div>
                <h3 className="text-[1.05rem] font-semibold text-[#11182d]">No campaigns found</h3>
                <p className="mt-1 text-[0.82rem] text-[#6d7892]">Start by creating a new deal to boost your sales.</p>
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div key={deal._id} className="group relative rounded-[18px] border border-[#e1e5f1] bg-white p-4 transition-all hover:border-[#b3bdd2]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                    {/* Visual Type */}
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] border border-[#e1e5f1] bg-[#f1f4fb]">
                      <Zap className={`h-6 w-6 ${deal.status === 'live' ? 'animate-pulse text-[#0f49d7]' : 'text-[#6d7892]'}`} />
                      <div className="absolute -right-2 -top-2 rounded-lg bg-[#11182d] px-1.5 py-0.5 text-[0.7rem] font-bold text-white">
                        {deal.discountValue}%
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider ${getStatusStyle(deal.status)}`}>
                          {deal.status}
                        </span>
                        <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#6d7892]">{deal.dealType} DEAL</span>
                      </div>
                      <h3 className="truncate text-[0.95rem] font-semibold text-[#11182d] transition-colors group-hover:text-[#0f49d7]">
                        {deal.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6d7892]">
                          <Calendar className="h-3.5 w-3.5 text-[#0f49d7]" />
                          {deal.startDateTime ? new Date(deal.startDateTime).toLocaleDateString() : 'N/A'} - {deal.endDateTime ? new Date(deal.endDateTime).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6d7892]">
                          <Package className="h-3.5 w-3.5 text-[#0f49d7]" />
                          {deal.productIds?.length || 0} product(s) linked
                        </div>
                      </div>
                    </div>

                    {/* Actions & Metrics */}
                    <div className="flex items-center gap-4 border-[#e1e5f1] lg:border-l lg:pl-5">
                      <div className="text-right">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#6d7892]">CLAIMED</p>
                        <p className="text-[1.1rem] font-semibold text-[#11182d]">{deal.claimedCount || 0}</p>
                      </div>
                      <Link
                        to={`/seller/deals/${deal._id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f6f7fb] text-[#11182d] shadow-sm transition-all hover:bg-[#0f49d7] hover:text-white"
                      >
                        <ArrowRight className="h-4.5 w-4.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Simple Bottom Banner for Rejection */}
                  {deal.status === 'rejected' && deal.rejectionReason && (
                    <div className="mt-3 flex items-center gap-2 border-t border-rose-100 pt-3 text-rose-600">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <p className="text-[0.78rem] font-semibold">REJECTION REASON: {deal.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDeals;
