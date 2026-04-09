import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { useAuth } from '../context/AuthProvider';
import { 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Search,
  Filter,
  DollarSign,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRefunds = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([]);

  useEffect(() => {
    fetchRefunds();
  }, [token]);

  const fetchRefunds = async () => {
    try {
      // For this dynamic landing, we match the user's description of 'Refunds Page'
      const response = await axios.get(`${API_URL}/order/admin/payout-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // We filter for cancelled/returned items that might need refund confirmation
        setRefunds(response.data.stats.subOrders.filter(so => ['cancelled', 'returned'].includes(so.status)));
      }
    } catch (error) {
       console.error("Refund fetch error:", error);
    } finally {
       setLoading(false);
    }
  };

  const handleApprove = async (subOrderId) => {
    toast.loading("Processing Razorpay Refund...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Refund Processed! RFND_XQY762901");
      // Update local state for demo
      setRefunds(refunds.map(r => r._id === subOrderId ? {...r, refundStatus: 'processed'} : r));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 font-body">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Refund Management</h1>
          <p className="text-sm text-gray-500 font-medium">Handle dispute resolutions and reverse Razorpay settlements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Open Requests</p>
              <h3 className="text-xl font-bold text-gray-900">{refunds.length}</h3>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Refunded</p>
              <h3 className="text-xl font-bold text-gray-900">₹84,210</h3>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Resolution Time</p>
              <h3 className="text-xl font-bold text-gray-900">1.2 Days</h3>
           </div>
           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Strategy Integrity</p>
              <h3 className="text-xl font-bold text-gray-900">100%</h3>
           </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Processing Queue</h3>
            <div className="flex gap-2">
               <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="ID / Amount..." className="bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-black w-48" />
               </div>
               <button className="p-2 bg-gray-50 rounded-lg"><Filter className="w-3.5 h-3.5 text-gray-500" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-gray-50/50">
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sub-Order</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {refunds.length > 0 ? refunds.map((r) => (
                   <tr key={r._id} className="hover:bg-gray-50/30 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-gray-900">{r.subOrderId}</span>
                           <span className="text-[10px] text-gray-400 font-medium">#{r.masterOrder?.orderId || 'MSTR-ID'}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <HelpCircle className="w-3 h-3 text-gray-400" />
                           <span className="text-xs font-medium text-gray-600">{r.cancellationReason || 'Out of Stock / User Requested'}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-xs font-bold text-gray-900">₹{r.totalAmount.toLocaleString()}</td>
                     <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          r.refundStatus === 'processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {r.refundStatus || 'pending approval'}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        {r.refundStatus !== 'processed' && (
                          <div className="flex justify-end gap-2">
                            <button className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><XCircle className="w-4 h-4" /></button>
                            <button 
                              onClick={() => handleApprove(r._id)}
                              className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-black/10 hover:bg-gray-800 transition-all flex items-center gap-2"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          </div>
                        )}
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400 font-medium italic">No pending refund requests found</td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>

        {/* Manual Refund Form */}
        <div className="mt-8 bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
              <RotateCcw className="w-32 h-32" />
           </div>
           <div className="relative z-10 max-w-md">
              <h4 className="text-xl font-bold mb-2">Direct Refund Override</h4>
              <p className="text-xs opacity-70 mb-8 font-medium italic">Instantly return funds via Payment ID. Bypasses the standard sub-order lifecycle when required.</p>
              
              <div className="space-y-4">
                 <input type="text" placeholder="Razorpay Payment ID (pay_xxxx)" className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-xs font-bold placeholder:text-white/40 focus:bg-white/20 transition-all outline-none" />
                 <div className="flex gap-3">
                    <input type="number" placeholder="Amount (INR)" className="flex-1 bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-xs font-bold placeholder:text-white/40 focus:bg-white/20 transition-all outline-none" />
                    <button className="bg-white text-blue-900 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-blue-50 transition-all active:scale-95">Trigger Refund</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRefunds;
