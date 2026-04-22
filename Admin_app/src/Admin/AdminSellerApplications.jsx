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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
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

  // ... same helper functions
  const statusBadge = (status) => {
    const config = {
      submitted: { color: "text-amber-600", bg: "bg-amber-50", label: "Pending Review" },
      active: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Active" },
      rejected: { color: "text-rose-600", bg: "bg-rose-50", label: "Rejected" },
    };
    const c = config[status] || config.submitted;
    return (
      <span className={`px-2.5 py-1 ${c.bg} ${c.color} rounded-full text-[10px] font-bold uppercase tracking-wider border currentColor`}>
        {c.label}
      </span>
    );
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (loading) return <Loader />;

  if (selectedApp) {
    const p = selectedApp;
    const u = p.user;
    return (
      <div className="mx-auto max-w-[1240px] space-y-6 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
        <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#1a2238] transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Return to Applications
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Business Profile */}
            <div className="flex-1 space-y-6">
                <div className="bg-white rounded-[24px] border border-[#eef2f8] p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-indigo-50 rounded-[22px] border-2 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                <img src={p.shopLogo || "https://ui-avatars.com/api/?name=" + (p.shopName || "S") + "&background=4f46e5&color=fff"} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#1a2238] leading-tight">{p.shopName || "Unnamed Shop"}</h1>
                                <p className="text-sm text-gray-500 font-medium">Applied on {formatDate(p.submittedAt)}</p>
                            </div>
                        </div>
                        {statusBadge(p.profileStatus)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#f1f4f9]">
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Ownership Audit</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><User className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Vendor Name</p><p className="text-sm font-bold text-[#1a2238]">{u?.username}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Mail className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Official Email</p><p className="text-sm font-bold text-[#1a2238]">{u?.email}</p></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Regulatory Data</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Shield className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">GST Verification</p><p className="text-sm font-bold text-[#1a2238] font-mono">{p.gstNumber || "NOT PROVIDED"}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><FileText className="w-4 h-4" /></div>
                                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Tax Identifier (PAN)</p><p className="text-sm font-bold text-[#1a2238] font-mono">{p.panNumber || "NOT PROVIDED"}</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Ledger Details */}
                <div className="bg-white rounded-[24px] border border-[#eef2f8] p-8 shadow-sm">
                    <h3 className="text-base font-bold text-[#1a2238] mb-6 flex items-center gap-3">
                       <Landmark className="w-5 h-5 text-indigo-600" /> Settlement Bridge (Bank Details)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Account Holder</p>
                             <p className="text-sm font-bold text-[#1a2238]">{p.bankAccountHolder || "—"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bank Name</p>
                             <p className="text-sm font-bold text-[#1a2238]">{p.bankName || "—"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                             <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">IFSC Protocol</p>
                             <p className="text-sm font-bold font-mono text-[#1a2238]">{p.bankIfscCode || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Document verification */}
                <div className="bg-white rounded-[24px] border border-[#eef2f8] p-8 shadow-sm">
                    <h3 className="text-base font-bold text-[#1a2238] mb-6 flex items-center gap-3">
                       <FileText className="w-5 h-5 text-indigo-600" /> Verification Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'PAN Card Scan', url: p.panCardDocument },
                            { label: 'Identity Proof', url: p.identityDocument },
                            { label: 'Business License', url: p.gstBill }
                        ].map((doc, idx) => (
                            doc.url && (
                                <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border border-[#eef2f8] rounded-2xl hover:border-black transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-black"><FileText className="w-4 h-4" /></div>
                                        <span className="text-sm font-bold text-[#1a2238]">{doc.label}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </a>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Actions */}
            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-[#1a2238] rounded-[24px] p-6 text-white shadow-xl shadow-gray-200">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Decision Center</h3>
                    <div className="space-y-3">
                        {p.profileStatus === 'submitted' ? (
                            <>
                                <button onClick={handleApprove} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Authorize Seller
                                </button>
                                <button onClick={() => setShowRejectModal(true)} className="w-full py-4 bg-rose-600 hover:bg-rose-700 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2">
                                    <XCircle className="w-4 h-4" /> Decline Entry
                                </button>
                            </>
                        ) : (
                            <div className="py-8 text-center border-2 border-dashed border-white/10 rounded-2xl">
                                <Activity className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Terminal</p>
                                <p className="text-sm font-bold mt-1">Status: {p.profileStatus}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-[#eef2f8] p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Infrastructure Specs</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-400 uppercase">Profile Ver.</span>
                            <span className="text-[#1a2238]">4.0.2-LST</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-400 uppercase">Region Code</span>
                            <span className="text-[#1a2238]">IN-HUB-01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Modals same as before but restyled */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-[#1a2238] mb-6 flex items-center gap-3"><AlertTriangle className="w-6 h-6 text-rose-500" /> Confirm Rejection</h3>
                <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-[#eef2f8] rounded-2xl text-sm font-bold mb-4 outline-none focus:border-rose-500 transition-all">
                    <option value="">Reason for failure</option>
                    <option value="invalid_docs">Invalid Regulatory Documents</option>
                    <option value="mismatch">Identity Mismatch Found</option>
                    <option value="policy">Policy Violation Risk</option>
                </select>
                <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} className="w-full h-32 px-5 py-4 bg-gray-50 border border-[#eef2f8] rounded-2xl text-sm outline-none focus:border-rose-500 resize-none mb-6" placeholder="Internal log note (Optional)" />
                <div className="flex gap-3">
                    <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-gray-100">Cancel</button>
                    <button onClick={handleReject} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest">Reject</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Merchant Onboarding</h1>
          <p className="mt-1 text-sm text-[#66728d]">Monitor incoming vendor applications and verify business integrity.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-[#eef2f8] w-fit flex gap-1 shadow-sm">
        {[
          { key: "submitted", label: "Pending Audit" },
          { key: "active", label: "Live Vendors" },
          { key: "rejected", label: "Deactivated" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${filter === tab.key ? "bg-[#1a2238] text-white shadow-lg shadow-gray-200" : "text-gray-400 hover:text-[#1a2238]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[24px] border border-[#eef2f8] overflow-x-auto scrollbar-hide shadow-sm">
         <table className="w-full">
            <thead className="bg-[#fcfdfe]">
               <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor Prospect</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Legal Name</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Recv.</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Operations</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f9]">
               {applications.length === 0 ? (
                 <tr><td colSpan="4" className="px-6 py-20 text-center font-bold text-gray-400 italic uppercase text-xs tracking-widest">Terminal Clean: No matching applications</td></tr>
               ) : (
                 applications.map(app => (
                   <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-600 font-black uppercase text-xs">
                               {(app.user?.username || "V").substring(0, 1)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#1a2238]">{app.user?.username}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase">{app.user?.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-sm font-bold text-[#1a2238]">{app.shopName || "UNTITLED SHOP"}</p>
                         <div className="flex gap-2 mt-1">
                            {app.sellerCategories?.slice(0, 2).map(c => <span className="text-[9px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded font-black uppercase">{c}</span>)}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-xs font-bold text-[#1a2238]">{formatDate(app.submittedAt)}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button onClick={() => viewDetail(app._id)} className="h-[38px] px-5 bg-gray-900 shadow-lg shadow-gray-200 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Audit Review</button>
                      </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }) => <ChevronRight className={className} />;

export default AdminSellerApplications;
