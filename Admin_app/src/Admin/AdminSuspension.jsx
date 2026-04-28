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
  Gavel,
  X
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
      ACTIVE: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
      RESOLVED_REINSTATED: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
      RESOLVED_PERMANENT_BAN: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"
    };
    return (
      <span className={`px-2.5 py-1 rounded-[8px] text-[9px] font-bold uppercase tracking-wider border ${configs[status] || configs.ACTIVE}`}>
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
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
           <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">Trust & Safety Central</h1>
           <p className="mt-1 text-[0.85rem] text-[#64748b]">
              Manage seller suspensions, process appeals, and maintain marketplace integrity.
           </p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowNewModal(true)}
             className="flex items-center gap-2 h-[38px] px-4 bg-[#11182d] text-white rounded-[10px] text-[10px] font-bold uppercase tracking-wider border border-[#11182d]"
           >
              <Plus className="w-4 h-4" />
              New Intervention
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[18px] border border-[#d7dcea] overflow-hidden min-h-[500px]">
         <div className="px-6 py-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f8fafc]">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
               {['cases', 'warnings', 'compliance'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 rounded-[10px] text-[10px] font-bold uppercase tracking-wider border ${activeTab === tab ? "bg-[#0f49d7] text-white border-[#0f49d7]" : "bg-white text-[#64748b] border-[#d7dcea]"}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            
            <div className="relative w-full sm:w-auto">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
               <input 
                 type="text" 
                 placeholder="Search Case ID or Seller..."
                 className="w-full sm:w-64 bg-white border border-[#d7dcea] rounded-[10px] py-2 pl-10 pr-4 text-[0.85rem] font-medium text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-4 focus:ring-[#0f49d7]/10"
               />
            </div>
         </div>

         {/* Cases List */}
         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1000px]">
               <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <tr>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Case Identifier</th>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Merchant Profile</th>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Infraction Type</th>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Escrow State</th>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Case Status</th>
                     <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Control</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#e2e8f0]">
                  <tr>
                     <td colSpan="6" className="px-6 py-24 text-center">
                        <FileSearch className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
                        <p className="text-[0.95rem] font-bold text-[#11182d]">No Active Enforcement Records Found</p>
                        <p className="text-[0.85rem] text-[#64748b] mt-1">All vendors are currently in good standing</p>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      {/* Intervention Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
           <div className="absolute inset-0" onClick={() => setShowNewModal(false)} />
           <div className="relative w-full max-w-[480px] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              
              {/* Modal Header */}
              <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                 <div>
                    <h2 className="text-[1.1rem] font-bold text-[#11182d] flex items-center gap-2">
                       <Gavel className="w-5 h-5 text-[#0f49d7]" /> 
                       Trust Enforcement Action
                    </h2>
                    <p className="text-[10px] font-bold text-[#6d7892] uppercase tracking-wider">Regulatory Interface Protocol V1.0</p>
                 </div>
                 <button onClick={() => setShowNewModal(false)} className="p-1 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="px-6 pb-5 space-y-2.5">
                 {/* Intervention Type */}
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setInterventionType("warning")}
                      className={`flex-1 py-1 text-[0.8rem] font-semibold rounded-lg border transition-all ${interventionType === 'warning' ? "bg-white text-[#d97706] border-[#fde68a] shadow-sm" : "bg-[#f8f9fc] text-[#6d7892] border-transparent"}`}
                    >
                       Warning
                    </button>
                    <button 
                      onClick={() => setInterventionType("suspension")}
                      className={`flex-1 py-1 text-[0.8rem] font-semibold rounded-lg border transition-all ${interventionType === 'suspension' ? "bg-white text-[#dc2626] border-[#fecaca] shadow-sm" : "bg-[#f8f9fc] text-[#6d7892] border-transparent"}`}
                    >
                       Suspension
                    </button>
                 </div>

                 <div className="space-y-2">
                    <div>
                       <label className="text-[0.75rem] font-bold text-[#25324d] mb-0.5 block uppercase tracking-wide">Merchant ID</label>
                       <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7892]" />
                          <input 
                            value={interventionSellerId}
                            onChange={(e) => setInterventionSellerId(e.target.value)}
                            placeholder="SELLER-8829-1100" 
                            className="w-full bg-white border border-[#d9deeb] rounded-lg py-1.5 pl-9 pr-3 text-[0.85rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]" 
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-[0.75rem] font-bold text-[#25324d] mb-0.5 block uppercase tracking-wide">Root Cause</label>
                       <textarea 
                         value={interventionReason}
                         onChange={(e) => setInterventionReason(e.target.value)}
                         placeholder="Policy violation details..."
                         className="w-full bg-white border border-[#d9deeb] rounded-lg py-1.5 px-3 text-[0.85rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] min-h-[48px] resize-none placeholder:text-[#94a3b8]"
                       />
                    </div>

                    <div>
                       <label className="text-[0.75rem] font-bold text-[#25324d] mb-0.5 block uppercase tracking-wide">Evidence IDs</label>
                       <input 
                         value={interventionComplaintIds}
                         onChange={(e) => setInterventionComplaintIds(e.target.value)}
                         placeholder="COMP-001..." 
                         className="w-full bg-white border border-[#d9deeb] rounded-lg py-1.5 px-3 text-[0.85rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] placeholder:text-[#94a3b8]" 
                       />
                    </div>
                 </div>

                 <div className={`${interventionType === 'warning' ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-[#fef2f2] border-[#fecaca]'} rounded-lg p-2.5 border`}>
                    <div className="flex gap-2">
                       <AlertTriangle className={`w-4 h-4 mt-0.5 ${interventionType === 'warning' ? 'text-[#d97706]' : 'text-[#dc2626]'} shrink-0`} />
                       <p className={`text-[0.75rem] ${interventionType === 'warning' ? 'text-[#b45309]' : 'text-[#b91c1c]'} font-semibold leading-tight`}>
                          {interventionType === 'warning' 
                            ? "Reaching 3 warnings in 90 days triggers auto-suspension." 
                            : "Suspension freezes funds and hides all active listings."
                          }
                       </p>
                    </div>
                 </div>

                 <button 
                   onClick={handleIntervention}
                   disabled={loading}
                   className="w-full bg-[#0f49d7] text-white font-bold rounded-lg h-9 text-[0.8rem] uppercase tracking-wider hover:bg-[#003da3] transition-colors disabled:opacity-50"
                 >
                    {loading ? "Processing..." : `EXECUTE ${interventionType}`}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminSuspension;
