import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';

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
            // Corrected API endpoint base URL
            const url = filter === 'pending' 
                ? `${API_URL}/api/deals/admin/pending`
                : `${API_URL}/api/deals?status=${filter}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure deals is always an array
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

    // Format currency 
    const formatINR = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="p-6 bg-[#f8f9fc] min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-[#11182d] flex items-center gap-3">
                    🛍️ Deal Management
                    <span className="bg-[#e63946] text-white text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-widest font-black shadow-lg shadow-[#e63946]/10">
                        {(deals || []).length} Proposals 
                    </span>
                </h2>
                
                <div className="bg-white rounded-2xl p-1 border border-[#eef2ff] flex flex-wrap gap-1">
                    {['pending', 'approved', 'live', 'rejected', 'expired'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${filter === f ? 'bg-[#0f49d7] text-white' : 'text-[#5c6880] hover:bg-[#f8f9fd]'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-[32px] border border-[#eef2ff]">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0f49d7] border-t-transparent"></div>
                </div>
            ) : (!deals || deals.length === 0) ? (
                <div className="bg-white rounded-[32px] p-24 text-center border-2 border-dashed border-[#eef2ff]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <span className="text-2xl">🏝️</span>
                    </div>
                    <p className="text-[#5c6880] font-bold">No deals found in this category.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-[#eef2ff] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8f9fd] border-b border-[#eef2ff]">
                                <tr>
                                    <th className="p-5 text-[10px] font-black uppercase text-[#5c6880] tracking-widest">Product Info</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-[#5c6880] tracking-widest">Seller</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-[#5c6880] tracking-widest">Economics</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-[#5c6880] tracking-widest">Timing</th>
                                    <th className="p-5 text-[10px] font-black uppercase text-[#5c6880] tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f1f5f9]">
                                {deals.map(deal => (
                                    <tr key={deal._id} className="hover:bg-[#fcfdfe] transition-colors">
                                        <td className="p-5 font-medium">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 bg-[#f8f9fd] rounded-xl overflow-hidden border border-[#eef2ff] p-2 flex items-center justify-center">
                                                    <img 
                                                        src={deal.productId?.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/100'} 
                                                        alt={deal.productId?.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-[#11182d] text-sm line-clamp-1">{deal.productId?.name}</p>
                                                    <span className="text-[9px] bg-[#eef2ff] text-[#0f49d7] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                                        {deal.dealType.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-[#11182d] text-xs">{deal.sellerId?.username || 'Seller'}</p>
                                            <p className="text-[10px] text-[#5c6880] opacity-70">{deal.sellerId?.email}</p>
                                        </td>
                                        <td className="p-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[#b0b8cb] text-[10px] line-through">{formatINR(deal.originalPrice)}</span>
                                                    <span className="font-black text-[#11182d]">{formatINR(deal.dealPrice)}</span>
                                                </div>
                                                <div className="bg-[#dcfce7] text-[#166534] text-[9px] font-black px-1.5 py-0.5 rounded inline-block">
                                                    {deal.discountPercent}% OFF
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-[10px] font-bold text-[#11182d]">
                                                <span className="text-[#b0b8cb] uppercase tracking-tighter mr-1">Starts:</span> 
                                                {new Date(deal.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                            <p className="text-[10px] font-bold text-[#11182d]">
                                                <span className="text-[#b0b8cb] uppercase tracking-tighter mr-1">Ends:</span> 
                                                {new Date(deal.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </td>
                                        <td className="p-5 text-right">
                                            {deal.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleApprove(deal._id)}
                                                        className="bg-[#0f49d7] text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#0c39a8] shadow-lg shadow-[#0f49d7]/10"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowRejectModal(deal._id)}
                                                        className="bg-[#fef2f2] text-[#e63946] px-4 py-2 rounded-xl text-[10px] font-black"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {deal.status === 'rejected' && (
                                                <div className="text-right">
                                                    <span className="text-[9px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-black uppercase">Rejected</span>
                                                    <p className="text-[9px] text-gray-400 mt-1 italic">{deal.rejectionReason}</p>
                                                </div>
                                            )}
                                            {deal.status === 'live' && (
                                               <span className="bg-[#dcfce7] text-[#166534] text-[10px] px-3 py-1 rounded-full font-black tracking-tighter">LIVE</span>
                                            )}
                                             {deal.status === 'approved' && (
                                               <span className="bg-[#fef9c3] text-[#854d0e] text-[10px] px-3 py-1 rounded-full font-black tracking-tighter">SCHEDULED</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-[#eef2ff]">
                        <h3 className="text-xl font-black mb-2 text-[#11182d]">Rejection Reason</h3>
                        <p className="text-xs text-[#5c6880] mb-6">Specify why this deal proposal is being rejected.</p>
                        <textarea
                            className="w-full h-32 p-4 bg-[#f8f9fd] border border-[#eef2ff] rounded-2xl outline-none focus:ring-2 ring-[#0f49d7]/10 text-sm"
                            placeholder="Reason..."
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-4 mt-6">
                            <button 
                                className="flex-1 bg-gray-100 text-[#5c6880] py-4 rounded-2xl font-black text-xs uppercase"
                                onClick={() => { setShowRejectModal(null); setRejectionReason(''); }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="flex-1 bg-[#e63946] text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-[#e63946]/10"
                                onClick={() => handleReject(showRejectModal)}
                            >
                                Reject Deal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDeals;
