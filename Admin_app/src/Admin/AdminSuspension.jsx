import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { 
  ShieldAlert, 
  Search, 
  RotateCcw, 
  ChevronRight, 
  Users, 
  AlertTriangle,
  History,
  FileSearch,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  MoreVertical,
  Filter,
  Plus,
  ArrowLeft,
  DollarSign,
  Gavel
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSuspension = () => {
  const [activeTab, setActiveTab] = useState('cases'); 
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  
  // Form State for Intervention
  const [interventionSellerId, setInterventionSellerId] = useState("");
  const [interventionType, setInterventionType] = useState("warning"); // warning | suspension
  const [interventionReason, setInterventionReason] = useState("");
  const [interventionComplaintIds, setInterventionComplaintIds] = useState("");

  const StatusBadge = ({ status }) => {
    const configs = {
      ACTIVE: "bg-rose-50 text-rose-600 border-rose-100",
      RESOLVED_REINSTATED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      RESOLVED_PERMANENT_BAN: "bg-gray-50 text-gray-400 border-gray-200"
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${configs[status] || configs.ACTIVE}`}>
        {status?.replace(/_/g, ' ')}
      </span>
    );
  };

  const handleIntervention = async () => {
    if(!interventionSellerId || !interventionReason) return toast.error("Required fields missing");
    
    setLoading(true);
    try {
      const endpoint = interventionType === 'warning' ? '/admin/suspension/issue-warning' : '/admin/suspension/suspend';
      const payload = {
        sellerId: interventionSellerId,
        reason: interventionReason,
        reasonCode: interventionReason, // simplified mapping
        description: interventionReason,
        complaintIds: interventionComplaintIds.split(',').map(id => id.trim()).filter(id => id)
      };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      if(res.data.success) {
        toast.success(res.data.message);
        setShowNewModal(false);
        setInterventionSellerId("");
        setInterventionReason("");
        // Refresh list
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Action Failed");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="h-8 w-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center border border-rose-100 shadow-sm">
                <ShieldAlert className="w-4 h-4" />
             </div>
             <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Trust & Safety Central</h1>
          </div>
          <p className="text-sm text-[#66728d]">
            Manage seller suspensions, process appeals, and maintain marketplace integrity.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowNewModal(true)}
             className="flex items-center gap-2 h-[42px] px-5 bg-[#0f172a] hover:bg-black text-white rounded-xl text-[13px] font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
           >
              <Plus className="w-4 h-4" />
              New Intervention
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[24px] border border-[#eef2f8] shadow-sm overflow-hidden min-h-[500px]">
         <div className="px-6 py-5 border-b border-[#f1f4f9] flex items-center justify-between overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2">
               {['cases', 'warnings', 'compliance'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-[#f1f4ff] text-[#2563eb]" : "text-gray-400 hover:text-gray-600"}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            
            <div className="flex items-center gap-3 ml-4">
                <div className="relative hidden sm:block">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search Case ID or Seller..."
                     className="w-56 bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:bg-white focus:ring-1 focus:ring-blue-100 transition-all"
                   />
                </div>
            </div>
         </div>

         {/* Cases List */}
         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1000px]">
               <thead className="bg-[#fcfdfe]">
                  <tr>
                     <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Identifier</th>
                     <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Merchant Profile</th>
                     <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Infraction Type</th>
                     <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Escrow State</th>
                     <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Status</th>
                     <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Control</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#f1f4f9]">
                  <tr>
                     <td colSpan="6" className="px-6 py-24 text-center">
                        <FileSearch className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-900 italic">No Active Enforcement Records Found</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">All vendors are currently in good standing</p>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* Intervention Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
           <div className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="px-8 py-6 bg-rose-600 text-white flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                       <Gavel className="w-5 h-5" /> 
                       Trust Enforcement Action
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1 focus:outline-none">Regulatory Interface Protocol V1.0</p>
                 </div>
                 <button onClick={() => setShowNewModal(false)} className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all">
                    <XCircle className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 {/* Intervention Type */}
                 <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => setInterventionType("warning")}
                      className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${interventionType === 'warning' ? "bg-white text-amber-600 shadow-sm" : "text-gray-400"}`}
                    >
                       Issue Formal Warning
                    </button>
                    <button 
                      onClick={() => setInterventionType("suspension")}
                      className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${interventionType === 'suspension' ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "text-gray-400"}`}
                    >
                       Execute Suspension
                    </button>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Merchant ID</label>
                       <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            value={interventionSellerId}
                            onChange={(e) => setInterventionSellerId(e.target.value)}
                            placeholder="SELLER-8829-1100" 
                            className="w-full bg-gray-50 border border-transparent rounded-[20px] py-3.5 pl-11 pr-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-500 transition-all outline-none" 
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enforcement Root Cause</label>
                       <textarea 
                         value={interventionReason}
                         onChange={(e) => setInterventionReason(e.target.value)}
                         placeholder="Describe the policy violation in detail..."
                         className="w-full bg-gray-50 border border-transparent rounded-[20px] py-4 px-5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-500 transition-all outline-none min-h-[120px]"
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidence / Complaint IDs (Optional)</label>
                       <input 
                         value={interventionComplaintIds}
                         onChange={(e) => setInterventionComplaintIds(e.target.value)}
                         placeholder="COMP-001, COMP-002..." 
                         className="w-full bg-gray-50 border border-transparent rounded-[20px] py-3.5 px-5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-500 transition-all outline-none" 
                       />
                    </div>
                 </div>

                 <div className="bg-amber-50 rounded-[20px] p-5 border border-amber-100">
                    <div className="flex gap-3">
                       <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                       <div className="text-[11px] text-amber-800 leading-relaxed font-bold">
                          {interventionType === 'warning' 
                            ? "This warning will be logged permanently. Reaching 3 warnings in 90 days triggers auto-suspension review." 
                            : "DANGER: Suspension will immediately freeze the seller's funds, hide all listings, and notify active buyers. This action is irreversible without formal appeal."
                          }
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleIntervention}
                   disabled={loading}
                   className={`w-full py-4 rounded-[22px] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${interventionType === 'warning' ? "bg-amber-500 text-white shadow-amber-200" : "bg-rose-600 text-white shadow-rose-200"}`}
                 >
                    {loading ? "Processing Protocol..." : `EXECUTE ${interventionType} PROTOCOL`}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuspension;
