import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  Percent,
  Calendar,
  Zap,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  TrendingUp,
  XCircle,
  ArrowUpRight,
  Monitor,
  ShoppingBag,
  Info
} from 'lucide-react';
import { API_URL } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import Loader from '../../components/Loader';

const RUPEE = '₹';

const SellerDealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDealDetails();
  }, [id, token]);

  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      // We can use the public /api/deals/:id route for details
      const response = await axios.get(`${API_URL}/api/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDeal(response.data.data);
      }
    } catch (err) {
      console.error('Fetch deal details error:', err);
      setError('Failed to load deal details. It might have been deleted or the link is invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#141b2d]">{error}</h2>
      <button onClick={() => navigate('/seller/deals')} className="mt-8 text-[#2156d8] font-bold flex items-center gap-2 hover:underline">
        <ChevronLeft className="w-4 h-4" /> Back to My Campaigns
      </button>
    </div>
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case 'live':
        return { color: 'text-[#18794e]', bg: 'bg-[#e9f8ef]', border: 'border-[#b7ebc6]', icon: TrendingUp, desc: 'Your campaign is currently visible to all customers.' };
      case 'pending':
        return { color: 'text-[#ea580c]', bg: 'bg-[#fff7ed]', border: 'border-[#ffedd5]', icon: Clock, desc: 'WonderCart admins are reviewing your proposal.' };
      case 'approved':
        return { color: 'text-[#2156d8]', bg: 'bg-[#ebf2ff]', border: 'border-[#dbe6ff]', icon: CheckCircle2, desc: 'Approved! Campaign will go live at the scheduled start time.' };
      case 'expired':
        return { color: 'text-[#64748b]', bg: 'bg-[#f1f5f9]', border: 'border-[#e2e8f0]', icon: Monitor, desc: 'This campaign has ended.' };
      case 'rejected':
        return { color: 'text-[#ef4444]', bg: 'bg-[#fef2f2]', border: 'border-[#fee2e2]', icon: XCircle, desc: 'Proposal was rejected. Check the reason below.' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', icon: Info, desc: 'Status unknown' };
    }
  };

  const status = getStatusInfo(deal.status);
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 pb-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[#7c87a2] font-medium px-1">
        <Link to="/seller/deals" className="hover:text-[#141b2d] transition-colors">Campaigns</Link>
        <span className="text-[#cbd5e1] font-light">/</span>
        <span className="text-[#141b2d] font-bold truncate">Detailed Analytics</span>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-[40px] border border-[#eef1f8] p-8 lg:p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
            <div className="w-24 h-24 bg-[#f8faff] rounded-[32px] border border-[#eef1f8] flex items-center justify-center shrink-0">
               <Zap className={`w-10 h-10 ${deal.status === 'live' ? 'text-[#2156d8] animate-pulse' : 'text-[#7c87a2]'}`} />
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${status.bg} ${status.color} ${status.border}`}>
                     <StatusIcon className="w-3 h-3" />
                     {deal.status}
                  </span>
                  <span className="text-[11px] font-black text-[#7c87a2] uppercase tracking-[0.2em]">
                     {deal.dealType} STRATEGY
                  </span>
               </div>
               <h1 className="text-[28px] lg:text-[34px] font-black text-[#141b2d] leading-tight mb-2">
                  {deal.title}
               </h1>
               <p className="text-[#6d7894] font-medium text-sm leading-relaxed max-w-2xl">
                  {deal.description || "No specific description provided for this campaign."}
               </p>
            </div>
        </div>

        {/* Status Prompt */}
        <div className={`mt-8 p-5 rounded-3xl border ${status.bg} ${status.border} ${status.color} bg-opacity-30`}>
           <div className="flex items-center gap-3">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-[13px] font-bold tracking-tight">
                 {status.desc}
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistics Columns */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Performance Snapshot */}
            <div className="bg-[#1a1a1a] rounded-[40px] p-8 text-white shadow-xl shadow-gray-200">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Performance Snapshot</h3>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Redemptions</p>
                    <p className="text-3xl font-black">{deal.claimedCount || 0}</p>
                    <p className="text-[10px] text-green-400 font-bold mt-1 tracking-tight">Total claims processed</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Discount</p>
                    <p className="text-3xl font-black text-[#2156d8]">{deal.discountValue}%</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight">Flash reduction rate</p>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Remaining Stock</p>
                    <p className="text-3xl font-black">{deal.maxUses - (deal.claimedCount || 0)}</p>
                    <p className="text-[10px] text-orange-400 font-bold mt-1 tracking-tight">Units before auto-stop</p>
                  </div>
               </div>
            </div>

            {/* Linked Products */}
            <div className="bg-white rounded-[40px] border border-[#eef1f8] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[18px] font-black text-[#141b2d]">Campaign Scope</h3>
                  <span className="bg-[#f8faff] text-[#2156d8] px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase">{deal.productIds?.length || 0} PRODUCTS</span>
               </div>
               
               <div className="space-y-3">
                  {deal.productIds?.map((product, idx) => (
                     <div key={idx} className="group flex items-center lg:items-center gap-5 p-4 rounded-3xl border border-transparent hover:border-[#eef1f8] hover:bg-[#f8faff]/50 transition-all cursor-default">
                        <div className="w-16 h-16 rounded-2xl border border-[#eef1f8] overflow-hidden bg-[#f8faff] shrink-0">
                           <img src={product.variants?.[0]?.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[14px] font-black text-[#141b2d] truncate group-hover:text-[#2156d8] transition-colors">{product.name}</p>
                           <p className="text-[11px] font-medium text-[#7c87a2] mt-0.5">Linked for this specific campaign duration</p>
                        </div>
                        <Link to={`/seller/products/${product._id}`} className="p-2.5 rounded-xl bg-[#f8faff] text-[#7c87a2] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1a1a1a] hover:text-white">
                           <ArrowUpRight className="w-4 h-4" />
                        </Link>
                     </div>
                  ))}
               </div>
            </div>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
            
            {/* Timeline */}
            <div className="bg-white rounded-[40px] border border-[#eef1f8] p-7 shadow-sm">
               <div className="flex items-center gap-2.5 mb-6">
                  <Calendar className="w-4 h-4 text-[#2156d8]" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#141b2d]">Campaign Duration</h4>
               </div>
               
               <div className="space-y-6">
                  <div className="relative pl-6 py-1">
                     <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100" />
                     <div className="absolute left-[-2px] top-2 w-1.5 h-1.5 rounded-full bg-[#2156d8]" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Start Activation</p>
                     <p className="text-[14px] font-bold text-[#141b2d]">{new Date(deal.startDateTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     <p className="text-[12px] font-bold text-[#2156d8]">{new Date(deal.startDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="relative pl-6 py-1">
                     <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100" />
                     <div className="absolute left-[-2px] top-2 w-1.5 h-1.5 rounded-full bg-[#6d7894]" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Scheduled End</p>
                     <p className="text-[14px] font-bold text-[#141b2d]">{new Date(deal.endDateTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     <p className="text-[12px] font-bold text-[#6d7894]">{new Date(deal.endDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
            </div>

            {/* Fees Breakdown */}
            <div className="bg-[#f8faff] rounded-[40px] border border-[#eef1f8] p-7">
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#141b2d] mb-6">Commercial Details</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#eef1f8]">
                     <span className="text-[12px] font-bold text-[#6d7894]">Platform Fee</span>
                     <span className="text-[12px] font-black text-[#141b2d]">₹50</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#eef1f8]">
                     <span className="text-[12px] font-bold text-[#6d7894]">Payment Status</span>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${deal.commissionPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {deal.commissionPaid ? "PAID" : "PENDING"}
                     </span>
                  </div>
               </div>
               <p className="mt-6 text-[10px] text-[#7c87a2] font-medium leading-relaxed italic text-center">
                  * Fees are automatically deducted from your shop wallet upon campaign approval.
               </p>
            </div>

            {/* Support Call-to-action */}
            <div className="bg-[#eff6ff] rounded-[40px] p-7 border border-[#dbeafe] text-center">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2156d8] shadow-sm">
                  <AlertCircle className="w-5 h-5" />
               </div>
               <h4 className="text-[13px] font-black text-[#2156d8] mb-1">Need help with this?</h4>
               <p className="text-[11px] text-[#3b82f6] font-bold mb-5">Our partner success team is available 24/7</p>
               <button className="w-full py-3 bg-white text-[#2156d8] rounded-2xl font-bold text-[12px] shadow-sm hover:bg-[#2156d8] hover:text-white transition-all">
                  Contact Account Manager
               </button>
            </div>

        </div>

      </div>
    </div>
  );
};

export default SellerDealDetails;
