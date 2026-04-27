import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { useAuth } from '../context/AuthProvider';
import {
   Wallet,
   Search,
   Bell,
   ArrowUpRight,
   TrendingUp,
   Lock,
   ShieldCheck,
   Clock,
   Truck,
   Building2,
   Info,
   ChevronDown,
   Download,
   History
} from 'lucide-react';
import toast from 'react-hot-toast';

const SellerWallet = () => {
   const { token, authUser } = useAuth();
   const [balance, setBalance] = useState({ available: 12480, onHold: 5600 });
   const [history, setHistory] = useState([]);

   const sellerName = authUser?.name || "Alex Rivera";
   const sellerId = authUser?._id?.substring(0, 6).toUpperCase() || "88219";

   return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 font-sans text-[#1e293b]">
         <div className="space-y-6">
            {/* Balance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Main Card */}
               <div className="bg-[#1e293b] rounded-[22px] p-6 text-white relative shadow-xl overflow-hidden">
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                        <p className="text-[12px] font-medium text-[#94a3b8] uppercase tracking-[0.16em]">Releaseable Balance</p>
                        <div className="bg-[#2d3a4f] text-[#cbd5e1] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">T+2 CYCLE</div>
                     </div>

                     <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-xl font-light text-white/70">₹</span>
                        <h2 className="text-[1.55rem] font-bold leading-none text-white">{balance.available.toLocaleString()}</h2>
                        <div className="ml-4 flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                           <TrendingUp className="w-3.5 h-3.5" /> 12%
                        </div>
                     </div>

                     <button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all">
                        <Wallet className="w-4 h-4" /> Withdraw to Linked Bank
                     </button>
                  </div>
                  {/* Abstract background element */}
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
               </div>

               {/* Escrow Card */}
               <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                     <p className="text-[12px] font-medium text-[#94a3b8] uppercase tracking-[0.16em] mb-4">Funds on Hold (Escrow)</p>
                     <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-xl font-light text-[#94a3b8]">₹</span>
                        <h2 className="text-[1.55rem] font-semibold text-[#0f172a] leading-none">{balance.onHold.toLocaleString()}</h2>
                     </div>
                  </div>

                  <div className="bg-[#f8fafc] p-5 rounded-2xl border border-[#f1f5f9] flex items-start gap-4">
                     <div className="p-3 bg-white rounded-xl shadow-sm border border-[#f1f5f9]">
                        <Lock className="w-5 h-5 text-[#2563eb]" />
                     </div>
                     <p className="text-[11px] text-[#64748b] leading-relaxed font-medium">
                        Escrow funds are temporarily held to ensure successful delivery. These are automatically released to your liquid balance upon order completion.
                     </p>
                  </div>
               </div>
            </div>

            {/* Money Journey */}
            <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 md:p-10 shadow-sm relative overflow-hidden">
               <h3 className="text-[12px] font-medium text-[#0f172a] uppercase tracking-[0.16em] mb-10">Your Money Journey</h3>

               <div className="grid grid-cols-2 md:flex md:items-center md:justify-between relative md:px-10 gap-y-10">
                  {/* Connection Line - Desktop Only */}
                  <div className="hidden md:block absolute top-[28px] left-20 right-20 h-0.5 bg-[#f1f5f9] z-0"></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-3 relative z-10">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-[#2563eb] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] md:text-xs font-bold text-[#0f172a]">Sale Made</p>
                        <p className="text-[9px] font-bold text-[#94a3b8] uppercase mt-0.5">Capture</p>
                     </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-3 relative z-10">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-[#2563eb] rounded-2xl flex items-center justify-center text-[#2563eb]">
                        <Lock className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] md:text-xs font-bold text-[#0f172a]">On Hold</p>
                        <p className="text-[9px] font-bold text-[#94a3b8] uppercase mt-0.5">Escrow</p>
                     </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-3 relative z-10 opacity-30">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-[#64748b]">
                        <Truck className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] md:text-xs font-bold text-[#64748b]">Delivered</p>
                        <p className="text-[9px] font-bold text-[#94a3b8] uppercase mt-0.5">Release</p>
                     </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center gap-3 relative z-10 opacity-30">
                     <div className="w-12 h-12 md:w-14 md:h-14 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex items-center justify-center text-[#64748b]">
                        <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] md:text-xs font-bold text-[#64748b]">Settled</p>
                        <p className="text-[9px] font-bold text-[#94a3b8] uppercase mt-0.5">Bank</p>
                     </div>
                  </div>
               </div>

               <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-3 text-[9px] md:text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider text-center">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  Infrastructure secured via Razorpay Route for automated compliance and payouts.
               </div>
            </div>

            {/* History Area */}
            <div className="space-y-4">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 px-1">
                  <h3 className="text-[12px] font-medium text-[#0f172a] uppercase tracking-[0.16em]">Settlement History</h3>
                  <button className="flex items-center gap-2 text-[#2563eb] text-[11px] font-bold hover:underline transition-all">
                     Download Detailed Report <Download className="w-3.5 h-3.5" />
                  </button>
               </div>

               <div className="bg-white border border-[#f1f5f9] rounded-[22px] shadow-sm overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                           <tr className="bg-[#f8fafc] border-b border-[#f1f5f9]">
                              <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Settlement ID</th>
                              <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Date</th>
                              <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Bank Reference</th>
                              <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Status</th>
                              <th className="px-8 py-5 text-[10px] font-black text-[#94a3b8] uppercase tracking-widest text-right">Amount</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr>
                              <td colSpan="5" className="py-24">
                                 <div className="flex flex-col items-center justify-center text-center px-8">
                                    <div className="w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center mb-6">
                                       <History className="w-8 h-8 text-[#cbd5e1]" />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0f172a] mb-2">No settlements generated</h4>
                                    <p className="text-xs text-[#94a3b8] max-w-xs leading-relaxed font-medium">
                                       Settlements are processed every T+2 days.
                                    </p>
                                 </div>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden divide-y divide-[#f1f5f9]">
                     <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                        <History className="w-10 h-10 text-[#cbd5e1] mb-4" />
                        <p className="text-sm font-bold text-[#0f172a]">No recent activity</p>
                        <p className="text-xs text-[#94a3b8] mt-1">Your settlement ledger is currently empty.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default SellerWallet;
