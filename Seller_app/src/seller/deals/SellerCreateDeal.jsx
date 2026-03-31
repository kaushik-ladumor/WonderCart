import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';

const SellerCreateDeal = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        productId: '',
        dealType: 'day_deal',
        discountPercent: 10,
        originalPrice: 0,
        costPrice: '',
        startTime: '',
        endTime: '',
        stockLimit: 100,
        category: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                // Use API_URL constant for consistency across the seller app
                const response = await axios.get(`${API_URL}/product/seller/product`, {
                   headers: { Authorization: `Bearer ${token}` }
                });
                
                // Controller returns response.data.products
                setProducts(response.data.products || []);
            } catch (err) {
                console.error('Fetch products error:', err.response?.data || err.message);
                setError('Failed to load products. Check your connection or login again.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const selectedProduct = products.find(p => p._id === formData.productId);
        if (selectedProduct) {
            // Use the first variant's first size's sellingPrice as the base originalPrice for the deal
            const basePrice = selectedProduct.variants?.[0]?.sizes?.[0]?.sellingPrice || 0;
            setFormData(prev => ({ 
                ...prev, 
                originalPrice: basePrice,
                category: selectedProduct.category 
            }));
        }
    }, [formData.productId, products]);

    const dealPrice = Math.round(formData.originalPrice * (1 - formData.discountPercent / 100));
    const platformCommission = dealPrice * 0.1;
    const sellerReceives = dealPrice - platformCommission;
    const sellerProfit = sellerReceives - (formData.costPrice || 0);
    const isNegativeMargin = sellerReceives <= (formData.costPrice || 0);
    const showWarning = !isNegativeMargin && (sellerProfit / dealPrice) < 0.05;

    const formatINR = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            
            // Note: Deals endpoint DOES include /api prefix in Main.Routes.js
            await axios.post(`${API_URL}/api/deals`, {
                ...formData,
                dealPrice
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            setSuccess(true);
            setFormData({
                productId: '',
                dealType: 'day_deal',
                discountPercent: 10,
                originalPrice: 0,
                costPrice: '',
                startTime: '',
                endTime: '',
                stockLimit: 100,
                category: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit deal');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-[24px] border border-[#eef2ff]">
            <h2 className="text-xl font-black mb-6 text-[#11182d]">Propose a New Deal</h2>
            
            {success && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    <p className="font-bold text-sm">Deal submitted for review!</p>
                    <p className="text-xs opacity-80">Admin will review your proposal shortly.</p>
                </div>
            )}

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <p className="font-bold text-sm">Action Required</p>
                    <p className="text-xs opacity-80">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Select Product</label>
                        {loading ? (
                             <div className="w-full p-3 bg-gray-100 animate-pulse rounded-xl h-12"></div>
                        ) : (
                            <select
                                required
                                className="w-full p-3 border border-[#eef2ff] bg-[#f8f9fd] rounded-xl text-sm outline-none"
                                value={formData.productId}
                                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                            >
                                <option value="">-- {products.length === 0 ? 'No products found' : 'Choose one of your products'} --</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} ({formatINR(p.variants?.[0]?.sizes?.[0]?.sellingPrice || 0)})
                                    </option>
                                ))}
                            </select>
                        )}
                        {products.length === 0 && !loading && (
                            <p className="text-[10px] text-red-500 mt-1 font-bold">You need to add a product first!</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Deal Type</label>
                        <div className="flex gap-2">
                            {['lightning', 'day_deal', 'coupon'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, dealType: type })}
                                    className={`flex-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight ${formData.dealType === type ? 'bg-[#0f49d7] text-white border-[#0f49d7]' : 'bg-[#f8f9fd] text-[#5c6880] border-[#eef2ff]'}`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Discount % ({formData.discountPercent}%)</label>
                        <input
                            type="range" min="5" max="80" step="5"
                            className="w-full h-1.5 bg-[#eef2ff] rounded-lg appearance-none cursor-pointer accent-[#0f49d7]"
                            value={formData.discountPercent}
                            onChange={e => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Actual Cost (Per Item)</label>
                        <input
                            type="number" required placeholder="Cost to you..."
                            className="w-full p-3 border border-[#eef2ff] bg-[#f8f9fd] rounded-xl text-sm outline-none"
                            value={formData.costPrice}
                            onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || '' })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Stock Limit</label>
                        <input
                            type="number" required
                            className="w-full p-3 border border-[#eef2ff] bg-[#f8f9fd] rounded-xl text-sm outline-none"
                            value={formData.stockLimit}
                            onChange={e => setFormData({ ...formData, stockLimit: parseInt(e.target.value) || '' })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Deal Start</label>
                            <input
                                type="datetime-local" required
                                className="w-full p-3 border border-[#eef2ff] bg-[#f8f9fd] rounded-xl text-[10px] outline-none"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-[#5c6880] uppercase tracking-wider mb-2">Deal Ends</label>
                            <input
                                type="datetime-local" required
                                className="w-full p-3 border border-[#eef2ff] bg-[#f8f9fd] rounded-xl text-[10px] outline-none"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="bg-[#f8f9fd] rounded-[24px] p-6 border border-[#eef2ff] space-y-4">
                        <h3 className="text-xs font-black text-[#11182d] uppercase tracking-wider border-b border-[#eef2ff] pb-3">Financial Preview</h3>
                        
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#5c6880]">Selling Price:</span>
                            <span className="font-black text-[#11182d] text-base">{formatINR(dealPrice)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#5c6880]">Admin Fees:</span>
                            <span className="text-[#e63946] font-bold">-{formatINR(platformCommission)}</span>
                        </div>

                        <div className="flex justify-between items-center text-xs border-t border-[#eef2ff] pt-3">
                            <span className="text-[#11182d] font-bold">Your Earnings:</span>
                            <span className="font-black text-[#0f49d7] text-lg">{formatINR(sellerReceives)}</span>
                        </div>

                        <div className={`p-4 rounded-2xl flex flex-col gap-1 ${isNegativeMargin ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                            <span className="text-[10px] uppercase font-black tracking-wider opacity-60">Estimated Profit Margin</span>
                            <span className="text-lg font-black">{formatINR(sellerProfit)} ({dealPrice > 0 ? ((sellerProfit / dealPrice) * 100).toFixed(1) : 0}%)</span>
                        </div>

                        {isNegativeMargin && formData.costPrice > 0 && (
                            <div className="bg-[#e63946] text-white p-3 rounded-xl text-[10px] font-bold text-center">
                                🚨 ALERT: You will lose money on this deal! Reduce the discount.
                            </div>
                        )}
                    </div>

                     <button
                        type="submit"
                        disabled={submitting || isNegativeMargin || !formData.productId}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest ${submitting || isNegativeMargin || !formData.productId ? 'bg-gray-200 text-gray-300 cursor-not-allowed' : 'bg-[#0f49d7] text-white'}`}
                    >
                        {submitting ? 'Submitting...' : 'Submit Proposed Deal'}
                    </button>
                    <p className="text-[10px] text-center text-[#b0b8cb] pt-2">Deal proposals are reviewed by admin within 24-48 hours.</p>
                </div>
            </form>
        </div>
    );
};

export default SellerCreateDeal;
