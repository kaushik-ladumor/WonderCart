import React from 'react';
import { Heart, ShoppingBag, ChevronRight } from "lucide-react";
import useCountdown from '../hooks/useCountdown';
import { Link } from "react-router-dom";

const DealCard = ({ deal, onAddToCart }) => {
    const representativeProduct = deal.productIds?.[0] || {};
    const { isExpired } = useCountdown(deal.endDateTime);
    
    // Formatting helper
    const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

    const productName = representativeProduct.name || "Special Campaign";
    const productImage = representativeProduct.variants?.[0]?.images?.[0] || representativeProduct.image || 'https://via.placeholder.com/300';
    const originalPrice = representativeProduct.price || 0;
    
    // Calculate deal price if it's a percentage
    const displayPrice = deal.discountType === 'percent' 
        ? originalPrice * (1 - deal.discountValue / 100)
        : Math.max(0, originalPrice - deal.discountValue);

    return (
        <div className={`bg-white rounded-[32px] p-5 shadow-sm border border-[#eef2ff] transition-all hover:shadow-xl hover:shadow-blue-50/50 group ${isExpired ? 'opacity-70' : ''}`}>
            
            {/* Image Container */}
            <div className="relative aspect-square mb-5 bg-[#f8f9fd] rounded-[24px] overflow-hidden flex items-center justify-center p-6 group-hover:scale-[1.02] transition-transform">
                <img 
                    src={productImage} 
                    alt={productName}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                    loading="lazy"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-[#2156d8] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg shadow-blue-100 uppercase tracking-widest">
                    {deal.discountType === 'percent' ? `-${deal.discountValue}%` : `-${formatINR(deal.discountValue)}`}
                </div>

                <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-[#b0b8cb] hover:text-red-500 shadow-sm transition-colors">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Info Section */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-[#2156d8] uppercase tracking-[0.2em]">
                        {deal.dealType}
                    </span>
                </div>
                
                <h3 className="text-[14px] font-bold text-[#11182d] line-clamp-1 uppercase tracking-tight">
                    {deal.title || productName}
                </h3>

                <div className="flex items-center gap-2 pt-1">
                    <span className="text-[15px] font-black text-[#11182d]">
                        {formatINR(displayPrice)}
                    </span>
                    <span className="text-[#b0b8cb] text-[11px] line-through font-bold">
                        {formatINR(originalPrice)}
                    </span>
                </div>

                {/* Status / Claim Button */}
                <Link
                    to={`/product-detail/${representativeProduct._id}`}
                    className={`w-full mt-4 h-12 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all ${
                        isExpired 
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#eff4ff] text-[#2156d8] hover:bg-[#2156d8] hover:text-white active:scale-95 shadow-sm'
                    }`}
                >
                    {isExpired ? 'Expired' : (
                        <>
                            Claim Deal
                            <ChevronRight className="w-3.5 h-3.5" />
                        </>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default DealCard;
