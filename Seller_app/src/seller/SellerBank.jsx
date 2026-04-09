import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { useAuth } from '../context/AuthProvider';
import { 
  Building2, 
  ShieldCheck, 
  ChevronRight, 
  History, 
  Info, 
  Clock, 
  ArrowRight,
  Landmark,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SellerBank = () => {
  const { token, authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState({
    beneficiaryName: 'ARJUN MEHTA RETAILS PVT LTD',
    accountNumber: '5692',
    ifsc: 'HDFC0001242',
    bankName: 'HDFC Bank Limited'
  });

  useEffect(() => {
    fetchBankDetails();
  }, [token]);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.profile) {
        // In a real app, we'd use response.data.profile
        setLoading(false);
      }
    } catch (err) {
       console.error(err);
       setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-[#1e293b] space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Bank Configuration</h1>
        <p className="text-[13px] font-medium text-[#64748b] leading-relaxed">
          Manage your registered bank account for automated Razorpay settlements and view your verification status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Forms & Active Card */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Active Settlement Destination */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] pl-1">Active Settlement Destination</h3>
            <div className="bg-[#1e293b] rounded-[22px] p-5 md:p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 md:mb-16">
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/5 shrink-0">
                           <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm md:text-base font-bold truncate pr-2">{bankDetails.bankName}</p>
                           <p className="text-[9px] md:text-[10px] text-[#94a3b8] font-medium uppercase tracking-tight">Current Account</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 shrink-0">
                        <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Verified</span>
                     </div>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                     <div>
                        <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-3">Account Number</p>
                        <div className="flex flex-wrap gap-2 items-center">
                           <div className="flex gap-1">
                              {[1,2,3,4].map(i => <div key={i} className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#94a3b8] rounded-full"></div>)}
                           </div>
                           <div className="flex gap-1 mx-1 md:mx-2">
                              {[1,2,3,4].map(i => <div key={i} className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#94a3b8] rounded-full"></div>)}
                           </div>
                           <div className="flex gap-1">
                              {[1,2,3,4].map(i => <div key={i} className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#94a3b8] rounded-full"></div>)}
                           </div>
                           <span className="text-xl md:text-2xl font-bold tracking-[0.1em] md:tracking-[0.2em] ml-2 md:ml-4">{bankDetails.accountNumber}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-6 md:pt-4 border-t border-white/5">
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-1">Beneficiary</p>
                           <p className="text-[11px] md:text-xs font-bold uppercase tracking-tight break-words">{bankDetails.beneficiaryName}</p>
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] mb-1">IFSC Code</p>
                           <p className="text-[11px] md:text-xs font-bold uppercase tracking-tight">{bankDetails.ifsc}</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
            </div>
          </section>

          {/* Update Card */}
          <section className="bg-white border border-[#f1f5f9] rounded-[22px] p-8 shadow-sm">
             <div className="max-w-2xl">
                <h3 className="text-[15px] font-bold text-[#0f172a] mb-2">Update Bank Details</h3>
                <p className="text-[12px] text-[#64748b] mb-8 font-medium">
                   Request a change in your settlement destination. This process requires 24-48 hours for verification.
                </p>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success("Update request submitted."); }}>
                   <div>
                      <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] border-l-2 border-[#2563eb] pl-3 mb-3 block">Full Beneficiary Name</label>
                      <input 
                        type="text" 
                        placeholder="As per bank records"
                        className="w-full bg-[#f1f3fd] border-none rounded-2xl py-4 px-6 text-sm font-semibold text-[#0f172a] focus:ring-1 focus:ring-[#2563eb] outline-none"
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] border-l-2 border-[#2563eb] pl-3 mb-3 block">Bank Name</label>
                         <input 
                           type="text" 
                           placeholder="e.g. ICICI Bank"
                           className="w-full bg-[#f1f3fd] border-none rounded-2xl py-4 px-6 text-sm font-semibold text-[#0f172a] focus:ring-1 focus:ring-[#2563eb] outline-none"
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] border-l-2 border-[#2563eb] pl-3 mb-3 block">IFSC Code</label>
                         <input 
                           type="text" 
                           placeholder="ICIC0001234"
                           className="w-full bg-[#f1f3fd] border-none rounded-2xl py-4 px-6 text-sm font-semibold text-[#0f172a] focus:ring-1 focus:ring-[#2563eb] outline-none"
                         />
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.2em] border-l-2 border-[#2563eb] pl-3 mb-3 block">Account Number</label>
                      <input 
                        type="text" 
                        placeholder="Enter account number"
                        className="w-full bg-[#f1f3fd] border-none rounded-2xl py-4 px-6 text-sm font-semibold text-[#0f172a] focus:ring-1 focus:ring-[#2563eb] outline-none"
                      />
                   </div>

                   <div className="pt-4">
                      <button className="bg-[#2563eb] text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold shadow-xl shadow-blue-100 hover:bg-[#1d4ed8] transition-all group">
                         Request Update <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </form>
             </div>
          </section>
        </div>

        {/* Right Column - Status & Help */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Merchant Status */}
          <div className="bg-white border-l-4 border-emerald-500 rounded-[20px] p-6 shadow-sm border border-l-0 border-[#f1f5f9]">
             <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em]">Merchant Status</p>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                   <p className="text-sm font-black text-[#0f172a]">KYC Verified</p>
                   <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-tight mt-1">Completed on Oct 12, 2023</p>
                </div>
             </div>
          </div>

          {/* Test Mode Simulation */}
          <div className="bg-[#f8fafc] rounded-[22px] p-6 border border-[#f1f5f9] relative overflow-hidden">
             <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-white border border-[#f1f5f9] rounded-xl flex items-center justify-center text-[#2563eb] shadow-sm">
                   <Info className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <p className="text-xs font-bold text-[#0f172a] mb-1">Test Mode Simulation</p>
                   <p className="text-[11px] text-[#64748b] font-medium leading-relaxed">
                      Dummy details for settlement flow testing.
                   </p>
                </div>
             </div>

             <div className="bg-white p-4 rounded-xl space-y-3 border border-[#f1f5f9] relative z-10">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">Bank</span>
                   <span className="text-[10px] font-bold text-[#0f172a]">RAZORPAY TEST BANK</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">A/C No.</span>
                   <span className="text-[10px] font-bold text-[#0f172a]">000123456789</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest">IFSC</span>
                   <span className="text-[10px] font-bold text-[#0f172a]">RAZR0000001</span>
                </div>
             </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-[#f1f5f9] rounded-[22px] p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-8">
                <Clock className="w-4 h-4 text-[#0f172a]" />
                <p className="text-[12px] font-bold text-[#0f172a] uppercase tracking-tight">Settlement Timeline</p>
             </div>

             <div className="space-y-6 relative">
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[#f1f5f9]"></div>
                
                <div className="flex gap-4 relative z-10">
                   <div className="w-4 h-4 rounded-full bg-[#2563eb] ring-4 ring-blue-50 shrink-0"></div>
                   <div>
                      <p className="text-[11px] font-bold text-[#0f172a] mb-1">Delivery Confirmation</p>
                      <p className="text-[10px] text-[#94a3b8] leading-relaxed font-medium">Funds are held until the order status is marked 'Delivered'.</p>
                   </div>
                </div>

                <div className="flex gap-4 relative z-10">
                   <div className="w-4 h-4 rounded-full bg-[#e2e8f0] shrink-0"></div>
                   <div>
                      <p className="text-[11px] font-bold text-[#64748b] mb-1">Bank Transfer (T+1)</p>
                      <p className="text-[10px] text-[#94a3b8] leading-relaxed font-medium">Automated payout to your verified account by the next business day.</p>
                   </div>
                </div>
             </div>

             <div className="mt-8 bg-[#f8fafc] p-4 rounded-xl">
                <p className="text-[9px] text-[#94a3b8] leading-relaxed font-medium">
                   Note: Bank holidays and weekends may extend the transfer timeline. Please contact support for delays exceeding 48 hours.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerBank;
