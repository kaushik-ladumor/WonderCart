import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { useAuth } from '../context/AuthProvider';
import { 
  CreditCard, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const SellerPayouts = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subOrders, setSubOrders] = useState([]);
  const [stats, setStats] = useState({ totalHeld: 0, totalReleased: 0 });

  useEffect(() => {
    fetchPayoutData();
  }, [token]);

  const fetchPayoutData = async () => {
    try {
      const response = await axios.get(`${API_URL}/order/admin/payout-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSubOrders(response.data.stats.subOrders);
        setStats({
          totalHeld: response.data.stats.totalHeld,
          totalReleased: response.data.stats.totalReleased
        });
      }
    } catch (error) {
      console.error("Payout data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (subOrderId) => {
    try {
      toast.loading("Releasing funds...");
      const response = await axios.patch(`${API_URL}/order/sub-order/${subOrderId}/status`, {
        status: 'delivered' // My backend releases on delivered
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.dismiss();
        toast.success("Funds released successfully!");
        fetchPayoutData();
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Release failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 font-body">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Settlements</h1>
          <p className="text-sm text-gray-500 font-medium">Manage Razorpay Route transfers and independent sub-order payouts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                 <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Locked (On Hold)</p>
                 <p className="text-xl font-bold text-gray-900">₹{stats.totalHeld.toLocaleString()}</p>
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                 <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Released (Settled)</p>
                 <p className="text-xl font-bold text-gray-900">₹{stats.totalReleased.toLocaleString()}</p>
              </div>
           </div>

           <div className="bg-black p-6 rounded-2xl shadow-xl shadow-black/10 flex items-center justify-between text-white">
              <div>
                 <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Split Strategy</p>
                 <p className="text-sm font-bold">Independent Strategy 1</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-40" />
           </div>
        </div>

        {/* Payout Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Sub-Order Settlement Queue</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search sub-order..." 
                className="bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-black w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-gray-50/50">
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor & Sub-Order</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Amount</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payout Share</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {subOrders.length > 0 ? subOrders.map((so) => (
                   <tr key={so._id} className="hover:bg-gray-50/30 transition-colors group">
                     <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-gray-900">{so.seller?.shopName || 'Unknown Seller'}</span>
                           <span className="text-[10px] text-gray-400 font-mono">#{so.subOrderId}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-xs font-bold text-gray-900">₹{so.totalAmount.toLocaleString()}</td>
                     <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-indigo-600 font-mono">₹{so.sellerPayout.toLocaleString()}</span>
                           <span className="text-[10px] text-gray-400 font-medium italic">Comm: ₹{so.platformCommission.toLocaleString()}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                           {so.status === 'delivered' ? (
                             <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                               <CheckCircle2 className="w-2.5 h-2.5" /> Delivered
                             </span>
                           ) : (
                             <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                               <Clock className="w-2.5 h-2.5" /> {so.status}
                             </span>
                           )}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {so.payoutStatus === 'released' ? (
                           <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold tracking-tight">
                              <ShieldCheck className="w-3.5 h-3.5" /> Settled
                           </div>
                        ) : so.status === 'delivered' ? (
                           <button 
                             onClick={() => handleRelease(so._id)}
                             className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                           >
                              <Unlock className="w-3 h-3" /> Release Payout
                           </button>
                        ) : (
                           <div className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-lg text-[10px] font-bold cursor-not-allowed flex items-center gap-1.5">
                              <Lock className="w-3 h-3" /> Still Held
                           </div>
                        )}
                     </td>
                   </tr>
                 )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400 font-medium font-body">No pending payout settlements found</td>
                    </tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPayouts;
