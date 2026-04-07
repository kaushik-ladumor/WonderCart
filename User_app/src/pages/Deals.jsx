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
            const variant = deal.productId?.variants?.[0];
            const sizeObj = variant?.sizes?.[0];

            if(!variant || !sizeObj) {
                return alert('Product options not found');
            }

            const response = await axios.post(`${API_URL}/cart/add`, {
                productId: deal.productId._id,
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

            {/* HERO SECTION - TIGHTER PADDING */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                {loading && !featuredDeal ? (
                    <div className="h-[350px] w-full bg-white animate-pulse rounded-[24px] border border-[#eef2ff]"></div>
                ) : featuredDeal ? (
                    <div className="relative bg-white rounded-[24px] overflow-hidden border border-[#eef2ff] shadow-sm">
                        <div className="flex flex-col md:flex-row items-center min-h-[350px]">
                            {/* Text Info */}
                            <div className="flex-1 p-6 md:p-10 lg:p-12 space-y-4 z-10">
                                <div className="inline-block bg-[#0f49d7] text-white text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    DEAL OF THE DAY
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-[1.2rem] md:text-[1.5rem] lg:text-[1.75rem] font-semibold text-[#11182d] leading-none">
                                        {featuredDeal.productId?.name}
                                    </h2>
                                    <p className="text-[#5c6880] text-[0.76rem] md:text-[0.82rem] max-w-sm line-clamp-2 leading-relaxed">
                                        Limited time curated selection of high-performance items. Don't miss out on this exclusive offer.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 py-2 border-b border-gray-50 max-w-sm">
                                    <div className="space-y-0.5">
                                        <p className="text-[#b0b8cb] text-[10px] line-through font-semibold">
                                            {formatINR(featuredDeal.originalPrice)}
                                        </p>
                                        <p className="text-[1.5rem] font-semibold text-[#11182d] leading-none">
                                            {formatINR(featuredDeal.dealPrice)}
                                        </p>
                                    </div>
                                    <div className="bg-[#0f49d7] text-white px-3 py-1.5 rounded-xl text-[10px] font-semibold shadow-lg shadow-[#0f49d7]/10">
                                        {featuredDeal.discountPercent}% OFF
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-wrap items-center gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-semibold text-[#5c6880] uppercase tracking-wider">ENDS IN</p>
                                        {new Date(featuredDeal.endTime) > new Date() ? (
                                            <DealTimer endTime={featuredDeal.endTime} />
                                        ) : (
                                            <div className="text-[#e63946] font-semibold text-[0.82rem] italic">Offer Expired</div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleAddToCart(featuredDeal)}
                                        disabled={addingToCart === featuredDeal._id}
                                        className="bg-[#0f49d7] active:scale-95 text-white px-8 py-4 rounded-xl font-semibold text-[0.76rem] shadow-lg shadow-[#0f49d7]/10 transition-transform disabled:opacity-50"
                                    >
                                        {addingToCart === featuredDeal._id ? 'Processing...' : 'Claim Deal Now'}
                                    </button>
                                </div>
                            </div>

                            {/* Image Part */}
                            <div className="flex-1 relative w-full h-[300px] md:h-auto flex items-center justify-center p-8 overflow-hidden">
                                <div className="absolute inset-0 bg-[#f8f9fd] z-0 transform rotate-6 scale-125 rounded-[80px]"></div>
                                <img
                                    src={featuredDeal.productId?.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/600'}
                                    alt={featuredDeal.productId?.name}
                                    className="relative z-10 max-w-[80%] max-h-full object-contain drop-shadow-xl"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[250px] w-full flex flex-col items-center justify-center bg-white rounded-[24px] border-2 border-dashed border-[#eef2ff]">
                        <TicketPercent className="w-10 h-10 text-gray-200 mb-3" />
                        <h4 className="font-semibold text-gray-300 uppercase tracking-tighter">No Active Deals Found</h4>
                    </div>
                )}
            </div>

            {/* DYNAMIC CATEGORY SELECTOR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-center gap-5 md:gap-10 overflow-x-auto no-scrollbar">
                    {/* Always show "All" */}
                    {[ 'All', ...availableCategories ].map((catId) => {
                        const Icon = CATEGORY_ICONS[catId] || Sparkles;
                        const isActive = activeCategory === catId;
                        return (
                            <button
                                key={catId}
                                onClick={() => setActiveCategory(catId)}
                                className="flex flex-col items-center gap-3 flex-shrink-0"
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-sm ${isActive
                                        ? 'bg-[#0f49d7] text-white'
                                        : 'bg-white text-[#11182d] border border-[#eef2ff]'
                                    }`}>
                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <span className={`text-[10px] md:text-[0.78rem] font-semibold tracking-tight ${isActive ? 'text-[#0f49d7]' : 'text-[#5c6880]'
                                    }`}>
                                    {catId}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CURATED PICKS SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-[0.9rem] font-semibold text-[#11182d] tracking-tight">Curated Picks</h3>
                        <p className="text-[0.7rem] text-[#5c6880]">Handpicked and curated by experts.</p>
                    </div>
                    <Link to="/shop" className="text-[0.7rem] font-semibold text-[#0f49d7] flex items-center gap-1">
                        View all <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading && filteredDeals.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                       {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white p-4 rounded-[24px] border border-[#eef2ff]">
                                <div className="bg-gray-100 aspect-square mb-4 rounded-[20px]"></div>
                                <div className="bg-gray-100 h-4 w-3/4 mb-2 rounded"></div>
                                <div className="bg-gray-100 h-3 w-1/2 mb-4 rounded"></div>
                                <div className="bg-gray-100 h-10 w-full rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredDeals.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[24px] border border-[#eef2ff]">
                        <Zap className="w-8 h-8 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-[0.8rem] font-semibold text-gray-400 uppercase">No active deals in {activeCategory}</h4>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filteredDeals.map(deal => (
                            <DealCard 
                                key={deal._id} 
                                deal={deal} 
                                onAddToCart={() => handleAddToCart(deal)} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deals;
