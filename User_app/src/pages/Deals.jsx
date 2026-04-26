import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';
import {
    Globe,
    Shirt,
    MonitorPlay,
    Armchair,
    Sparkles,
    Dumbbell,
    ChevronRight,
    Heart,
    Clock,
    ShoppingBag,
    Zap,
    TicketPercent
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useDeals from '../hooks/useDeals';
import DealCard from '../components/DealCard';
import DealTimer from '../components/DealTimer';
import Loader from '../components/Loader';

// Categories mapping for icons
const CATEGORY_ICONS = {
    'Fashion': Shirt,
    'Electronics': MonitorPlay,
    'Home': Armchair,
    'Beauty': Sparkles,
    'Fitness': Dumbbell,
    'Sports': Dumbbell,
    'All': Globe
};

const Deals = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [sort, setSort] = useState('popular');
    const [page, setPage] = useState(1);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [addingToCart, setAddingToCart] = useState(null);

    const { deals, loading, error, hasMore, loadMore } = useDeals({
        category: 'All', // Fetch all to determine dynamic categories
        sort,
        page: 1, // Get the full front list
        limit: 100
    });

    useEffect(() => {
        if (deals && deals.length > 0) {
            const cats = [...new Set(deals.map(d => d.category))].filter(Boolean);
            setAvailableCategories(cats);
        }
    }, [deals]);

    // Secondary filter for specific category view in frontend for immediate feedback
    const filteredDeals = useMemo(() => {
        if (activeCategory === 'All') return deals;
        return deals.filter(d => d.category === activeCategory);
    }, [deals, activeCategory]);

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const featuredDeal = useMemo(() => {
        // Find the first deal that IS NOT expired for the hero section
        const now = new Date();
        return filteredDeals?.find(d => new Date(d.endTime) > now) || filteredDeals?.[0];
    }, [filteredDeals]);

    const handleAddToCart = async (deal) => {
        try {
            setAddingToCart(deal._id);
            const token = localStorage.getItem('token');
            if(!token) return alert('Please login to claim this deal');

            // Pick the first available variant and size for quick claim
            const representativeProduct = deal.productIds?.[0];
            const variant = representativeProduct?.variants?.[0];
            const sizeObj = variant?.sizes?.[0];

            if(!variant || !sizeObj) {
                return alert('Product options not found');
            }

            const response = await axios.post(`${API_URL}/cart/add`, {
                productId: representativeProduct._id,
                quantity: 1,
                color: variant.color,
                size: sizeObj.size
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(response.data.success) {
                alert('Deal claimed! Item added to cart.');
                // Optional: redirect to cart or update state
            }
        } catch (err) {
            console.error('Deal Claim Error:', err);
            alert(err.response?.data?.message || err.message || 'Failed to claim deal');
        } finally {
            setAddingToCart(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-10">



            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <h3 className="text-[1.5rem] font-bold text-[#111827] tracking-tight">Curated Deals</h3>
                        <p className="text-[0.88rem] font-medium text-[#64748b]">Handpicked premium selections for your lifestyle</p>
                    </div>
                    <Link to="/shop" className="text-[0.82rem] font-bold text-blue-600 flex items-center gap-1.5 hover:gap-2 transition-all group">
                        Explore Shop <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {loading && filteredDeals.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-white animate-pulse rounded-[28px] border border-[#e2e8f0]"></div>
                        ))}
                    </div>
                ) : filteredDeals.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[32px] border border-[#e2e8f0] shadow-sm">
                        <TicketPercent className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
                        <h4 className="text-[1rem] font-bold text-[#111827]">No active deals in {activeCategory}</h4>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDeals.map((deal) => {
                            const product = deal.productIds?.[0] || {};
                            const productName = deal.title || product.name || "Special Campaign";
                            const productImage = product.variants?.[0]?.images?.[0] || product.image || 'https://via.placeholder.com/300';
                            const originalPrice = product.price || 0;
                            
                            const discountPrice = deal.discountType === 'percent' 
                                ? originalPrice * (1 - deal.discountValue / 100)
                                : Math.max(0, originalPrice - deal.discountValue);
                            
                            const isAdding = addingToCart === deal._id;
                            const isExpired = new Date(deal.endDateTime) < new Date();

                            return (
                                <div
                                    key={deal._id}
                                    className={`group bg-white rounded-[28px] border border-[#e2e8f0] p-4 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-600/20 ${
                                        isExpired ? "opacity-60 grayscale" : ""
                                    }`}
                                >
                                    <div className="relative aspect-square rounded-[22px] overflow-hidden bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center p-6 mb-5">
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                        
                                        {!isExpired && (
                                           <div className="absolute top-3 left-3 bg-[#111827] text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                                               <Clock className="w-3 h-3 text-blue-400" />
                                               <div className="text-[10px] font-bold tracking-tighter">
                                                  <DealTimer endTime={deal.endDateTime} size="small" />
                                               </div>
                                           </div>
                                        )}
                                        
                                        <div className="absolute top-3 right-3 bg-blue-600 text-white w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                           <span className="text-[10px] font-bold leading-none">{deal.discountType === 'percent' ? `${deal.discountValue}%` : 'SAVE'}</span>
                                           <span className="text-[8px] font-black uppercase">Off</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                                {deal.category || "General"}
                                            </span>
                                        </div>
                                        <h4 className="text-[0.95rem] font-bold text-[#11182d] line-clamp-2 leading-tight min-h-[40px]">
                                            {productName}
                                        </h4>
                                        
                                        <div className="flex items-end justify-between pt-2">
                                            <div>
                                                <p className="text-[1.25rem] font-bold text-[#11182d] leading-none">
                                                    {formatINR(discountPrice)}
                                                </p>
                                                {originalPrice > discountPrice && (
                                                    <p className="mt-1.5 text-[0.82rem] text-[#94a3b8] line-through font-medium">
                                                        {formatINR(originalPrice)}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(deal)}
                                                disabled={isExpired || isAdding}
                                                className="h-11 w-11 rounded-2xl bg-[#111827] text-white flex items-center justify-center hover:bg-blue-600 hover:scale-105 active:scale-[0.9] transition-all disabled:opacity-30 shadow-lg shadow-black/10"
                                            >
                                                {isAdding ? (
                                                    <Loader className="w-4 h-4" />
                                                ) : (
                                                    <Zap className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deals;
