import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  User, 
  ShoppingBag, 
  History,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

const AdminDeals = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('pending');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Use the new admin/all endpoint for full access
            const url = `${API_URL}/api/deals/admin/all?status=${filter}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeals(response.data?.data || []);
        } catch (err) {
            console.error('Fetch error:', err.response?.data || err.message);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, [filter]);

    const handleApprove = async (id) => {
        try {
            await axios.patch(`${API_URL}/api/deals/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchDeals();
        } catch (err) {
            alert('Approval failed');
        }
    };

    const handleReject = async (id) => {
        if (!rejectionReason) return alert('Reason required');
        try {
            await axios.patch(`${API_URL}/api/deals/${id}/reject`, {
                reason: rejectionReason
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRejectionReason('');
            setShowRejectModal(null);
            fetchDeals();
        } catch (err) {
            alert('Rejection failed');
        }
    };

    const formatINR = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'live': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#e4e8f5]">
                <div>
                   <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-3">
                        Deal Governance
                        <span className="bg-[#2563eb] text-white text-[11px] px-3 py-1 rounded-full font-bold">
                            {deals.length}
                        </span>
                    </h2>
                    <p className="text-sm text-[#64748b] mt-1">Review and manage platform-wide deal proposals.</p>
                </div>
                
                <div className="bg-[#f8fafc] rounded-xl p-1 border border-[#e2e8f0] flex flex-wrap gap-1">
                    {['pending', 'approved', 'live', 'rejected', 'expired'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-[#2563eb] shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-[24px] border border-[#e4e8f5]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563eb] border-t-transparent"></div>
                </div>
            ) : deals.length === 0 ? (
                <div className="bg-white rounded-[24px] p-24 text-center border-2 border-dashed border-[#e2e8f0]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <History className="w-8 h-8 text-[#94a3b8]" />
                    </div>
                    <p className="text-[#64748b] font-medium">No proposals found in "{filter}" category.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden lg:block bg-white rounded-[24px] border border-[#e4e8f5] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#64748b] tracking-widest">Product Info</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#64748b] tracking-widest">Seller</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#64748b] tracking-widest">Value</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#64748b] tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {deals.map(deal => (
                                    <tr key={deal._id} className="hover:bg-[#f8fafc]/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl overflow-hidden border border-[#e2e8f0] p-1.5 shrink-0 bg-white">
                                                    <img 
                                                        src={deal.productId?.variants?.[0]?.images?.[0]} 
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#0f172a] text-sm truncate">{deal.productId?.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                       <span className="text-[10px] bg-[#eef2ff] text-[#2563eb] px-2 py-0.5 rounded font-bold uppercase">
                                                          {deal.dealType}
                                                       </span>
                                                       <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                                                          <Clock className="w-3 h-3" />
                                                          Exp: {new Date(deal.endTime).toLocaleDateString()}
                                                       </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2.5">
                                               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#64748b]">
                                                  <User className="w-4 h-4" />
                                               </div>
                                               <div>
                                                  <p className="font-bold text-[#0f172a] text-[13px]">{deal.sellerId?.username}</p>
                                                  <p className="text-[11px] text-[#94a3b8]">{deal.sellerId?.email}</p>
                                               </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#94a3b8] text-xs line-through">{formatINR(deal.originalPrice)}</span>
                                                    <span className="font-bold text-[#0f172a]">{formatINR(deal.dealPrice)}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                                    {deal.discountPercent}% MARGIN
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {deal.status === 'pending' ? (
                                                   <>
                                                      <button 
                                                          onClick={() => setShowRejectModal(deal._id)}
                                                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                          title="Reject"
                                                      >
                                                          <XCircle className="w-5 h-5" />
                                                      </button>
                                                      <button 
                                                          onClick={() => handleApprove(deal._id)}
                                                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                          title="Approve"
                                                      >
                                                          <CheckCircle className="w-5 h-5" />
                                                      </button>
                                                   </>
                                                ) : (
                                                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(deal.status)}`}>
                                                      {deal.status}
                                                   </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View (Cards) */}
                    <div className="lg:hidden space-y-4">
                       {deals.map(deal => (
                          <div key={deal._id} className="bg-white p-5 rounded-[24px] border border-[#e4e8f5] space-y-4">
                             <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                   <div className="h-12 w-12 rounded-xl border border-[#e2e8f0] p-1 bg-white shrink-0">
                                      <img src={deal.productId?.variants?.[0]?.images?.[0]} alt="" className="w-full h-full object-contain" />
                                   </div>
                                   <div>
                                      <h3 className="font-bold text-[#0f172a] text-sm leading-tight line-clamp-2">{deal.productId?.name}</h3>
                                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase mt-1 tracking-wider">{deal.dealType}</p>
                                   </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatusStyle(deal.status)}`}>
                                   {deal.status}
                                </span>
                             </div>

                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#f1f5f9]">
                                <div>
                                   <p className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Pricing</p>
                                   <p className="text-sm font-bold text-[#0f172a]">{formatINR(deal.dealPrice)}</p>
                                   <p className="text-[10px] text-green-600 font-bold">-{deal.discountPercent}% Off</p>
                                </div>
                                <div>
                                   <p className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Seller</p>
                                   <p className="text-sm font-bold text-[#0f172a] truncate">{deal.sellerId?.username}</p>
                                   <p className="text-[10px] text-[#64748b]">{deal.sellerId?.email}</p>
                                </div>
                             </div>

                             {deal.status === 'pending' && (
                                <div className="flex gap-2 pt-2">
                                   <button 
                                      onClick={() => setShowRejectModal(deal._id)}
                                      className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-wider"
                                   >
                                      Reject
                                   </button>
                                   <button 
                                      onClick={() => handleApprove(deal._id)}
                                      className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-100"
                                   >
                                      Approve
                                   </button>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                </>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-[#e4e8f5]">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                              <AlertTriangle className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold text-[#0f172a]">Reject Proposal</h3>
                              <p className="text-sm text-[#64748b]">Please provide a reason for the seller.</p>
                           </div>
                        </div>

                        <textarea
                            className="w-full h-32 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl outline-none focus:border-[#2563eb] text-sm transition-all"
                            placeholder="e.g. Discount insufficient, incomplete product info..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                        />
                        
                        <div className="flex gap-3 mt-8">
                            <button 
                                className="flex-1 bg-gray-50 text-[#64748b] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                onClick={() => { setShowRejectModal(null); setRejectionReason(''); }}
                            >
                                Back
                            </button>
                            <button 
                                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
                                onClick={() => handleReject(showRejectModal)}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDeals;
