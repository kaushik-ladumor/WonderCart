import React, { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Clock, Store, User, Mail, FileText, MessageSquare,
  ChevronDown, ChevronRight, Building2, Landmark, Tag, Shield, AlertTriangle,
  Eye, ArrowLeft, Search, Filter, Send,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../utils/constants";

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

  const handleRequestInfo = async () => {
    if (!infoMessage.trim()) { toast.error("Message required"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/admin/seller-applications/${selectedApp._id}/request-info`,
        { message: infoMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Info requested from seller");
      setShowInfoModal(false);
      setSelectedApp(null);
      setInfoMessage("");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to request info");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoryAction = async (requestId, action, reason = "") => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/admin/seller-applications/${selectedApp._id}/category/${requestId}/${action}`;
      await axios.put(url, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Category ${action}d`);
      viewDetail(selectedApp._id);
    } catch (err) {
      toast.error(`Failed to ${action} category`);
    }
  };

  const statusBadge = (status) => {
    const config = {
      submitted: { color: "amber", label: "Pending Review" },
      active: { color: "green", label: "Active" },
      rejected: { color: "red", label: "Rejected" },
      email_pending: { color: "gray", label: "Incomplete" },
      email_verified: { color: "blue", label: "Profile Setup" },
      suspended: { color: "gray", label: "Suspended" },
    };
    const c = config[status] || config.submitted;
    return (
      <span className={`px-2.5 py-1 bg-${c.color}-100 text-${c.color}-800 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
        {c.label}
      </span>
    );
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  // ─── DETAIL VIEW ───
  if (selectedApp) {
    const p = selectedApp;
    const u = p.user;
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => setSelectedApp(null)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </button>

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={p.shopLogo || u?.profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="" className="w-14 h-14 rounded-full border-2 border-gray-200 object-cover" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{p.shopName || "Unnamed Shop"}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {u?.username}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {u?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(p.profileStatus)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Business Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">Business Type</p><p className="font-medium">{p.businessType || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">PAN</p><p className="font-mono font-medium">{p.panNumber || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">GST</p><p className="font-mono font-medium">{p.gstNumber || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Support Email</p><p className="font-medium">{p.supportEmail || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Support Phone</p><p className="font-medium">{p.supportPhone || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Submitted</p><p className="font-medium">{formatDate(p.submittedAt)}</p></div>
                </div>

                {/* address */}
                {p.businessAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Business Address</p>
                    <p className="text-sm text-gray-700">
                      {p.businessAddress.addressLine1}, {p.businessAddress.addressLine2 && `${p.businessAddress.addressLine2}, `}
                      {p.businessAddress.city}, {p.businessAddress.state} — {p.businessAddress.pinCode}
                    </p>
                  </div>
                )}

                {/* Documents Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {p.panCardDocument && (
                      <a href={p.panCardDocument} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm group">
                        <span className="text-xs font-semibold text-gray-600">PAN Card</span>
                        <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                      </a>
                    )}
                    {p.identityDocument && (
                      <a href={p.identityDocument} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm group">
                        <span className="text-xs font-semibold text-gray-600">Identity Doc</span>
                        <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                      </a>
                    )}
                    {p.gstBill && (
                      <a href={p.gstBill} target="_blank" rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm group">
                        <span className="text-xs font-semibold text-gray-600">GST Bill</span>
                        <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Requested Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {p.sellerCategories?.map(c => (
                      <span key={c} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Landmark className="w-4 h-4" /> Bank Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">Account Holder</p><p className="font-medium">{p.bankAccountHolder || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Account Number</p><p className="font-mono font-medium">{p.bankAccountNumber ? `****${p.bankAccountNumber.slice(-4)}` : "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">IFSC</p><p className="font-mono font-medium">{p.bankIfscCode || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Bank</p><p className="font-medium">{p.bankName || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Branch</p><p className="font-medium">{p.bankBranch || "—"}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Type</p><p className="font-medium">{p.bankAccountType || "—"}</p></div>
                </div>
              </div>

              {/* Category Requests */}
              {p.categoryRequests?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Category Requests</h3>
                  {p.categoryRequests.map(r => (
                    <div key={r._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.category}</p>
                        <p className="text-xs text-gray-500">{r.reason}</p>
                      </div>
                      {r.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleCategoryAction(r._id, "approve")}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Approve</button>
                          <button onClick={() => handleCategoryAction(r._id, "reject", "Not applicable")}
                            className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50">Reject</button>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${r.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {r.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Log */}
              {p.actionLogs?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Action Log</h3>
                  <div className="space-y-3">
                    {p.actionLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${log.action === "approve" ? "bg-green-500" : log.action === "reject" ? "bg-red-500" : "bg-blue-500"}`} />
                        <div>
                          <p className="text-gray-700"><span className="font-semibold">{log.adminName}</span> — {log.action}</p>
                          <p className="text-xs text-gray-400">{log.reason} · {formatDate(log.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="space-y-4">
              {p.profileStatus === "submitted" && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Actions</h3>
                  <button onClick={handleApprove} disabled={actionLoading}
                    className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <CheckCircle className="w-4 h-4" /> Approve Seller
                  </button>
                  <button onClick={() => setShowRejectModal(true)} disabled={actionLoading}
                    className="w-full py-3 border-2 border-red-300 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => setShowInfoModal(true)} disabled={actionLoading}
                    className="w-full py-3 border-2 border-blue-300 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    <MessageSquare className="w-4 h-4" /> Request More Info
                  </button>
                </div>
              )}

              {/* Meta Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">Joined</span><span className="font-medium">{formatDate(u?.createdAt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Submitted</span><span className="font-medium">{formatDate(p.submittedAt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Approved</span><span className="font-medium">{formatDate(p.approvedAt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Email Verified</span><span className="font-medium">{p.emailVerified ? "Yes" : "No"}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> Reject Application</h3>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm mb-3 bg-white">
                <option value="">Select reason</option>
                <option value="Incomplete or invalid documents">Incomplete or invalid documents</option>
                <option value="Mismatch in business details">Mismatch in business details</option>
                <option value="Invalid PAN or GST number">Invalid PAN or GST number</option>
                <option value="Suspicious or fraudulent application">Suspicious / fraudulent</option>
                <option value="Other">Other</option>
              </select>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" rows={3}
                placeholder="Additional note for the seller (optional)" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={handleReject} disabled={actionLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">Reject</button>
              </div>
            </div>
          </div>
        )}

        {/* Request Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-500" /> Request Information</h3>
              <textarea value={infoMessage} onChange={e => setInfoMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" rows={4}
                placeholder="What info do you need from the seller?" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowInfoModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={handleRequestInfo} disabled={actionLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Applications</h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage seller applications</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "submitted", label: "Pending Review", count: applications.length },
            { key: "active", label: "Active" },
            { key: "rejected", label: "Rejected" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === tab.key
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {tab.label}
              {filter === tab.key && tab.count !== undefined && (
                <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No applications</h3>
            <p className="text-sm text-gray-500">No {filter} seller applications found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Seller</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Shop</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Categories</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={app.user?.profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            alt="" className="w-9 h-9 rounded-full border border-gray-200" />
                          <div>
                            <p className="font-semibold text-gray-900">{app.user?.username}</p>
                            <p className="text-xs text-gray-400">{app.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">{app.shopName || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {app.sellerCategories?.slice(0, 2).map(c => (
                            <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">{c}</span>
                          ))}
                          {app.sellerCategories?.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px]">+{app.sellerCategories.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(app.submittedAt || app.createdAt)}</td>
                      <td className="px-5 py-4">{statusBadge(app.profileStatus)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => viewDetail(app._id)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1 ml-auto">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellerApplications;
