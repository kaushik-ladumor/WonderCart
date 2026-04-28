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

const formatPrice = (price) =>
  `Rs ${Math.round(Number(price || 0)).toLocaleString("en-IN")}`;

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
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center font-poppins">
         <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[18px] flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
         </div>
         <h2 className="text-[1.5rem] font-bold text-[#11182d]">{error}</h2>
         <button onClick={() => navigate('/seller/deals')} className="mt-8 text-[#0f49d7] font-bold flex items-center gap-2 hover:underline">
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
      <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d] font-poppins">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 pb-12">
         {/* Hero Header */}
         <div className="bg-white rounded-[18px] border border-[#e1e5f1] p-6 lg:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
               <div className="w-20 h-20 bg-[#f6f7fb] rounded-[14px] border border-[#e1e5f1] flex items-center justify-center shrink-0">
                  <Zap className={`w-8 h-8 ${deal.status === 'live' ? 'text-[#0f49d7]' : 'text-[#6d7892]'}`} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                     <span className={`px-2 py-1 rounded-md text-[0.7rem] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${status.bg} ${status.color} ${status.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {deal.status}
                     </span>
                     <span className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest">
                        {deal.dealType} STRATEGY
                     </span>
                  </div>
                  <h1 className="text-[1.5rem] lg:text-[1.75rem] font-bold text-[#11182d] leading-tight mb-2">
                     {deal.title}
                  </h1>
                  <p className="text-[#6d7892] text-[0.88rem] max-w-2xl">
                     {deal.description || "No specific description provided for this campaign."}
                  </p>
               </div>
            </div>

            {/* Status Prompt */}
            <div className={`mt-6 p-4 rounded-[14px] border ${status.bg} ${status.border} ${status.color} bg-opacity-30`}>
               <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <p className="text-[0.88rem] font-semibold">
                     {status.desc}
                  </p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Statistics Columns */}
            <div className="lg:col-span-2 space-y-4">

               {/* Performance Snapshot */}
               <div className="bg-[#11182d] rounded-[18px] p-6 text-white shadow-md">
                  <h3 className="text-[0.75rem] font-bold uppercase tracking-widest text-[#6d7892] mb-6">Performance Snapshot</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                     <div>
                        <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest mb-1">Redemptions</p>
                        <p className="text-[1.5rem] font-bold">{deal.claimedCount || 0}</p>
                        <p className="text-[0.7rem] text-[#18794e] font-bold mt-1">Total claims processed</p>
                     </div>
                     <div>
                        <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest mb-1">Discount</p>
                        <p className="text-[1.5rem] font-bold text-[#0f49d7]">{deal.discountValue}%</p>
                        <p className="text-[0.7rem] text-[#6d7892] font-bold mt-1">Flash reduction rate</p>
                     </div>
                     <div className="col-span-2 lg:col-span-1">
                        <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest mb-1">Remaining Stock</p>
                        <p className="text-[1.5rem] font-bold">{deal.maxUses - (deal.claimedCount || 0)}</p>
                        <p className="text-[0.7rem] text-[#ea580c] font-bold mt-1">Units before auto-stop</p>
                     </div>
                  </div>
               </div>

               {/* Linked Products */}
               <div className="bg-white rounded-[18px] border border-[#e1e5f1] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-[1.1rem] font-bold text-[#11182d]">Campaign Scope</h3>
                     <span className="bg-[#f6f7fb] text-[#0f49d7] px-2.5 py-1 rounded-md text-[0.7rem] font-bold tracking-widest uppercase">{deal.productIds?.length || 0} PRODUCTS</span>
                  </div>

                  <div className="space-y-3">
                     {deal.productIds?.map((product, idx) => (
                        <div key={idx} className="flex items-center lg:items-center gap-4 p-3 rounded-[14px] border border-[#e1e5f1] bg-white">
                           <div className="w-14 h-14 rounded-[10px] border border-[#e1e5f1] overflow-hidden bg-[#f6f7fb] shrink-0">
                              <img src={product.variants?.[0]?.images?.[0]} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[0.88rem] font-bold text-[#11182d] truncate">{product.name}</p>
                              <p className="text-[0.75rem] font-medium text-[#6d7892] mt-0.5">Linked for this specific campaign duration</p>
                           </div>
                           <Link to={`/seller/products/${product._id}`} className="p-2.5 rounded-[10px] bg-[#f6f7fb] text-[#11182d] transition-colors hover:bg-[#e1e5f1]">
                              <ArrowUpRight className="w-4 h-4" />
                           </Link>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Sidebar Context */}
            <div className="space-y-4">

               {/* Timeline */}
               <div className="bg-white rounded-[18px] border border-[#e1e5f1] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                     <Calendar className="w-4 h-4 text-[#0f49d7]" />
                     <h4 className="text-[0.75rem] font-bold uppercase tracking-widest text-[#11182d]">Campaign Duration</h4>
                  </div>

                  <div className="space-y-5">
                     <div className="relative pl-5 py-1">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e1e5f1]" />
                        <div className="absolute left-[-2.5px] top-2 w-1.5 h-1.5 rounded-full bg-[#0f49d7]" />
                        <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest mb-1">Start Activation</p>
                        <p className="text-[0.88rem] font-bold text-[#11182d]">{new Date(deal.startDateTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-[0.8rem] font-semibold text-[#0f49d7]">{new Date(deal.startDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                     <div className="relative pl-5 py-1">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e1e5f1]" />
                        <div className="absolute left-[-2.5px] top-2 w-1.5 h-1.5 rounded-full bg-[#6d7892]" />
                        <p className="text-[0.7rem] font-bold text-[#6d7892] uppercase tracking-widest mb-1">Scheduled End</p>
                        <p className="text-[0.88rem] font-bold text-[#11182d]">{new Date(deal.endDateTime).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-[0.8rem] font-semibold text-[#6d7892]">{new Date(deal.endDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                  </div>
               </div>

               {/* Fees Breakdown */}
               <div className="bg-[#f6f7fb] rounded-[18px] border border-[#e1e5f1] p-6">
                  <h4 className="text-[0.75rem] font-bold uppercase tracking-widest text-[#11182d] mb-4">Commercial Details</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center bg-white p-3 rounded-[12px] border border-[#e1e5f1]">
                        <span className="text-[0.82rem] font-semibold text-[#6d7892]">Platform Fee</span>
                        <span className="text-[0.82rem] font-bold text-[#11182d]">{formatPrice(50)}</span>
                     </div>
                     <div className="flex justify-between items-center bg-white p-3 rounded-[12px] border border-[#e1e5f1]">
                        <span className="text-[0.82rem] font-semibold text-[#6d7892]">Payment Status</span>
                        <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-md ${deal.commissionPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                           {deal.commissionPaid ? "PAID" : "PENDING"}
                        </span>
                     </div>
                  </div>
                  <p className="mt-4 text-[0.75rem] text-[#6d7892] font-medium text-center">
                     Fees are deducted from your shop wallet upon campaign approval.
                  </p>
               </div>

               {/* Support Call-to-action */}
               <div className="bg-[#f6f7fb] rounded-[18px] p-6 border border-[#e1e5f1] text-center">
                  <div className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center mx-auto mb-3 text-[#0f49d7] shadow-sm">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-[0.88rem] font-bold text-[#11182d] mb-1">Need help with this?</h4>
                  <p className="text-[0.75rem] text-[#6d7892] mb-4">Our partner success team is available 24/7</p>
                  <button className="w-full py-2.5 bg-white text-[#11182d] border border-[#e1e5f1] rounded-[12px] font-bold text-[0.88rem] hover:bg-[#e1e5f1] transition-colors">
                     Contact Account Manager
                  </button>
               </div>

            </div>

         </div>
        </div>
      </div>
   );
};

export default SellerDealDetails;
