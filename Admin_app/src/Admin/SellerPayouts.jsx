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
    <div className="mx-auto max-w-[1240px] space-y-8 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Merchant Settlements</h1>
          <p className="mt-1 text-sm text-[#66728d]">
            Manage Razorpay Route transfers and monitor independent vendor payout cycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Find Shop, Sub-Order..."
                className="w-full md:w-80 bg-white border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-medium outline-none transition-all focus:border-[#2563eb] shadow-sm"
              />
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="rounded-[22px] border border-[#e7ebf5] bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
               <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Escrow Locked</p>
            <h4 className="text-xl font-bold text-[#1a2238] leading-none">₹{stats.totalHeld.toLocaleString()}</h4>
         </div>

         <div className="rounded-[22px] border border-[#e7ebf5] bg-white p-5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
               <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active Liquidity</p>
            <h4 className="text-xl font-bold text-[#1a2238] leading-none">₹{stats.totalReleased.toLocaleString()}</h4>
         </div>

         <div className="col-span-2 rounded-[22px] bg-[#0f172a] p-5 shadow-xl shadow-gray-200 flex items-center justify-between text-white relative overflow-hidden">
            <div className="relative z-10">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-50">Settlement Protocol</p>
               <h3 className="text-base font-bold italic">Razorpay Route &bull; Standard Batch</h3>
               <p className="text-[11px] text-gray-500 mt-1 font-medium">Automatic transfers triggered at T+2 validation.</p>
            </div>
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10">
               <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="absolute right-0 top-0 p-8 opacity-5 rotate-12">
               <ShieldCheck className="w-32 h-32" />
            </div>
         </div>
      </div>

      {/* Settlement Table */}
      <div className="rounded-[24px] border border-[#e7ebf5] bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-[#f1f4f9]">
           <h2 className="text-base font-bold text-[#141b2d]">Sub-Order Payout Ledger</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant Intelligence</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Volume</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Payable (Commission)</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Validation State</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f9]">
              {subOrders.length > 0 ? subOrders.map((so) => (
                <tr key={so._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1a2238]">{so.seller?.shopName || 'Independent Vendor'}</span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold tracking-tighter">S-O-ID: {so.subOrderId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#1a2238]">₹{so.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-emerald-600 font-mono">₹{so.sellerPayout.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">CUT: ₹{so.platformCommission.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      so.status === 'delivered' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {so.status === 'delivered' ? <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> : <Clock className="w-2.5 h-2.5 mr-1" />}
                      {so.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {so.payoutStatus === 'released' ? (
                       <span className="inline-flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Settled
                       </span>
                    ) : so.status === 'delivered' ? (
                       <button 
                         onClick={() => handleRelease(so._id)}
                         className="px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-black transition-all"
                       >
                          Finalize Payout
                       </button>
                    ) : (
                       <div className="inline-flex items-center text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5 mr-1.5" /> Protocol Held
                       </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="5" className="px-6 py-20 text-center">
                      <CreditCard className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-400">No pending payout settlements found in ledger.</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerPayouts;
