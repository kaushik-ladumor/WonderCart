import React, { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Clock, Store, User, Mail, FileText, MessageSquare,
  ChevronDown, ChevronRight, Building2, Landmark, Tag, Shield, AlertTriangle,
  Eye, ArrowLeft, Search, Filter, Send, ExternalLink, Activity
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../utils/constants";
import Loader from "../components/Loader";

const AdminSellerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("submitted");
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchApplications(); }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/admin/seller-applications?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (profileId) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/admin/seller-applications/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedApp(res.data.profile);
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/admin/seller-applications/${selectedApp._id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Seller approved!");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error("Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Reason required"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/admin/seller-applications/${selectedApp._id}/reject`,
        { reason: rejectReason, note: rejectNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Seller rejected");
      setShowRejectModal(false);
      setSelectedApp(null);
      setRejectReason("");
      setRejectNote("");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    const config = {
      submitted: { color: "text-[#d97706]", bg: "bg-[#fffbeb]", border: "border-[#fde68a]", label: "Pending Review" },
      active: { color: "text-[#16a34a]", bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]", label: "Active" },
      rejected: { color: "text-[#dc2626]", bg: "bg-[#fef2f2]", border: "border-[#fecaca]", label: "Rejected" },
    };
    const c = config[status] || config.submitted;
    return (
      <span className={`px-2.5 py-1 ${c.bg} ${c.color} ${c.border} rounded-[8px] text-[9px] font-bold uppercase tracking-wider border`}>
        {c.label}
      </span>
    );
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center bg-[#f6f7fb]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f49d7] border-t-transparent" />
    </div>
  );

  if (selectedApp) {
    const p = selectedApp;
    const u = p.user;
    return (
      <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Business Profile */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-[18px] border border-[#d7dcea] p-6">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] flex items-center justify-center overflow-hidden">
                                <img src={p.shopLogo || "https://ui-avatars.com/api/?name=" + (p.shopName || "S") + "&background=0f49d7&color=fff"} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-[1.5rem] font-bold text-[#11182d] leading-tight">{p.shopName || "Unnamed Shop"}</h1>
                                <p className="text-[0.85rem] text-[#64748b] font-medium mt-1">Applied on {formatDate(p.submittedAt)}</p>
                            </div>
                        </div>
                        {statusBadge(p.profileStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#f1f5f9]">
                        <div>
                            <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-4">Ownership Audit</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-[#f8fafc] rounded-[8px] flex items-center justify-center text-[#64748b] border border-[#e2e8f0]"><User className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-[#64748b] font-bold uppercase">Vendor Name</p><p className="text-[0.85rem] font-bold text-[#11182d]">{u?.username}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-[#f8fafc] rounded-[8px] flex items-center justify-center text-[#64748b] border border-[#e2e8f0]"><Mail className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-[#64748b] font-bold uppercase">Official Email</p><p className="text-[0.85rem] font-bold text-[#11182d]">{u?.email}</p></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-4">Regulatory Data</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-[#f8fafc] rounded-[8px] flex items-center justify-center text-[#64748b] border border-[#e2e8f0]"><Shield className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-[#64748b] font-bold uppercase">GST Verification</p><p className="text-[0.85rem] font-bold text-[#11182d] font-mono">{p.gstNumber || "NOT PROVIDED"}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-[#f8fafc] rounded-[8px] flex items-center justify-center text-[#64748b] border border-[#e2e8f0]"><FileText className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-[#64748b] font-bold uppercase">Tax Identifier (PAN)</p><p className="text-[0.85rem] font-bold text-[#11182d] font-mono">{p.panNumber || "NOT PROVIDED"}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Ledger Details */}
                <div className="bg-white rounded-[18px] border border-[#d7dcea] p-6">
                    <h3 className="text-[1.1rem] font-bold text-[#11182d] mb-5 flex items-center gap-2">
                       <Landmark className="w-5 h-5 text-[#0f49d7]" /> Settlement Bridge
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                             <p className="text-[10px] font-bold text-[#64748b] uppercase mb-1 tracking-wider">Account Holder</p>
                             <p className="text-[0.85rem] font-bold text-[#11182d]">{p.bankAccountHolder || "—"}</p>
                        </div>
                        <div className="p-4 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                             <p className="text-[10px] font-bold text-[#64748b] uppercase mb-1 tracking-wider">Bank Name</p>
                             <p className="text-[0.85rem] font-bold text-[#11182d]">{p.bankName || "—"}</p>
                        </div>
                        <div className="p-4 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                             <p className="text-[10px] font-bold text-[#64748b] uppercase mb-1 tracking-wider">IFSC Protocol</p>
                             <p className="text-[0.85rem] font-bold font-mono text-[#11182d]">{p.bankIfscCode || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Document verification */}
                <div className="bg-white rounded-[18px] border border-[#d7dcea] p-6">
                    <h3 className="text-[1.1rem] font-bold text-[#11182d] mb-5 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-[#0f49d7]" /> Verification Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'PAN Card Scan', url: p.panCardDocument },
                            { label: 'Identity Proof', url: p.identityDocument },
                            { label: 'Business License', url: p.gstBill }
                        ].map((doc, idx) => (
                            doc.url && (
                                <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border border-[#d7dcea] bg-white rounded-[10px] hover:border-[#0f49d7] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0] flex items-center justify-center text-[#64748b] group-hover:text-[#0f49d7]"><FileText className="w-4 h-4" /></div>
                                        <span className="text-[0.85rem] font-bold text-[#11182d]">{doc.label}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#0f49d7]" />
                                </a>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Actions */}
            <div className="w-full lg:w-[320px] space-y-6">
                <div className="bg-[#11182d] rounded-[18px] p-6 text-white border border-[#25324d]">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-5">Decision Center</h3>
                    <div className="space-y-3">
                        {p.profileStatus === 'submitted' ? (
                            <>
                                <button onClick={handleApprove} className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] rounded-[10px] font-bold text-[0.85rem] transition-colors flex items-center justify-center gap-2 border border-[#16a34a]">
                                    <CheckCircle className="w-4 h-4" /> Authorize Seller
                                </button>
                                <button onClick={() => setShowRejectModal(true)} className="w-full py-3 bg-[#dc2626] hover:bg-[#b91c1c] rounded-[10px] font-bold text-[0.85rem] transition-colors flex items-center justify-center gap-2 border border-[#dc2626]">
                                    <XCircle className="w-4 h-4" /> Decline Entry
                                </button>
                            </>
                        ) : (
                            <div className="py-6 text-center border border-dashed border-[#25324d] bg-[#1a2238] rounded-[10px]">
                                <Activity className="w-6 h-6 text-[#94a3b8] mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Audit Terminal</p>
                                <p className="text-[0.85rem] font-bold mt-1 text-white">Status: <span className="uppercase">{p.profileStatus}</span></p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[18px] border border-[#d7dcea] p-6">
                    <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-4">Infrastructure Specs</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[0.85rem] font-medium border-b border-[#f1f5f9] pb-2">
                            <span className="text-[#64748b]">Profile Ver.</span>
                            <span className="text-[#11182d] font-bold">4.0.2-LST</span>
                        </div>
                        <div className="flex justify-between text-[0.85rem] font-medium">
                            <span className="text-[#64748b]">Region Code</span>
                            <span className="text-[#11182d] font-bold">IN-HUB-01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showRejectModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowRejectModal(false)} />
             <div className="relative bg-white rounded-2xl p-6 max-w-[420px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-[#fef2f2] rounded-full flex items-center justify-center border border-[#fecaca] shrink-0">
                        <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
                    </div>
                    <div>
                        <h3 className="text-[1.2rem] font-bold text-[#11182d]">Confirm Rejection</h3>
                        <p className="text-[0.84rem] text-[#6d7892]">Please provide a reason for rejecting this application.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">Rejection Reason</label>
                        <select 
                            value={rejectReason} 
                            onChange={e => setRejectReason(e.target.value)} 
                            className="w-full px-4 py-2.5 bg-white border border-[#d9deeb] rounded-xl text-[0.88rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] appearance-none"
                        >
                            <option value="">Select reason...</option>
                            <option value="invalid_docs">Invalid Regulatory Documents</option>
                            <option value="mismatch">Identity Mismatch Found</option>
                            <option value="policy">Policy Violation Risk</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[0.84rem] font-semibold text-[#25324d] mb-1.5 block">Internal Note (Optional)</label>
                        <textarea 
                            value={rejectNote} 
                            onChange={e => setRejectNote(e.target.value)} 
                            className="w-full h-[80px] px-4 py-2.5 bg-white border border-[#d9deeb] rounded-xl text-[0.88rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:ring-1 focus:ring-[#0f49d7] resize-none placeholder:text-[#94a3b8]" 
                            placeholder="Add details for the audit log..." 
                        />
                    </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                    <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 rounded-[10px] font-bold text-[0.88rem] text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors">Cancel</button>
                    <button onClick={handleReject} disabled={actionLoading} className="flex-1 py-2.5 rounded-[10px] bg-[#dc2626] text-white font-bold text-[0.88rem] border border-[#dc2626] hover:bg-[#b91c1c] transition-colors disabled:opacity-50">Reject Application</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-2">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">Merchant Onboarding</h1>
          <p className="mt-1 text-[0.85rem] text-[#64748b]">Monitor incoming vendor applications and verify business integrity.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1 rounded-[10px] border border-[#d7dcea] w-fit flex gap-1">
        {[
          { key: "submitted", label: "Pending Audit" },
          { key: "active", label: "Live Vendors" },
          { key: "rejected", label: "Deactivated" },
        ].map(tab => (
          <button 
            key={tab.key} 
            onClick={() => setFilter(tab.key)} 
            className={`px-4 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider transition-colors ${filter === tab.key ? "bg-[#11182d] text-white" : "text-[#64748b] hover:text-[#11182d] hover:bg-[#f8fafc]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[18px] border border-[#d7dcea] overflow-hidden">
         <div className="overflow-x-auto scrollbar-hide">
             <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                   <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Vendor Prospect</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Business Legal Name</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Date Recv.</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Operations</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                   {applications.length === 0 ? (
                     <tr><td colSpan="4" className="px-6 py-16 text-center font-medium text-[#64748b] text-[0.85rem]">No applications match the current filter.</td></tr>
                   ) : (
                     applications.map(app => (
                       <tr key={app._id} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-[#f1f5f9] rounded-[8px] flex items-center justify-center border border-[#e2e8f0] text-[#64748b] font-bold uppercase text-[0.85rem]">
                                   {(app.user?.username || "V").substring(0, 1)}
                                </div>
                                <div>
                                   <p className="text-[0.88rem] font-bold text-[#11182d]">{app.user?.username}</p>
                                   <p className="text-[10px] text-[#64748b] font-bold uppercase">{app.user?.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-[0.88rem] font-bold text-[#11182d]">{app.shopName || "Unnamed Shop"}</p>
                             <div className="flex gap-1.5 mt-1.5">
                                {app.sellerCategories?.slice(0, 2).map((c, i) => <span key={i} className="text-[9px] bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] px-1.5 py-0.5 rounded-[4px] font-bold uppercase">{c}</span>)}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-[0.85rem] font-medium text-[#64748b]">{formatDate(app.submittedAt)}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button onClick={() => viewDetail(app._id)} className="h-[34px] px-4 bg-white border border-[#d7dcea] text-[#11182d] rounded-[8px] text-[10px] font-bold uppercase tracking-wider hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-colors">Audit Review</button>
                          </td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }) => <ChevronRight className={className} />;

export default AdminSellerApplications;
