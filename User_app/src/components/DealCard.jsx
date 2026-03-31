import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import useCountdown from '../hooks/useCountdown';

const DealCard = ({ deal, onAddToCart }) => {
    const { isExpired } = useCountdown(deal.endTime);
    
    const isLightning = deal.dealType === 'lightning';
    const isFullyClaimed = (deal.claimedCount / deal.stockLimit) * 100 >= 100;
    const isDisabled = isExpired || isFullyClaimed;

    // Format currency to Indian Rupees
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className={`bg-white rounded-[24px] p-4 shadow-sm border border-[#eef2ff] ${isDisabled ? 'opacity-75' : ''}`}>
            
            {/* Image Container */}
            <div className="relative aspect-square mb-4 bg-[#f8f9fd] rounded-[20px] overflow-hidden flex items-center justify-center p-6">
                <img 
                    src={deal.productId?.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/300'} 
                    alt={deal.productId?.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-[#e63946] text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                    -{deal.discountPercent}%
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full text-[#42506d] shadow-sm">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {/* Info Section */}
            <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#0f49d7] uppercase tracking-[0.1em]">
                    {deal.category || 'General'}
                </span>
                
                <h3 className="text-sm font-semibold text-[#11182d] line-clamp-1">
                    {deal.productId?.name}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-[#b0b8cb] text-xs line-through">
                        {formatCurrency(deal.originalPrice)}
                    </span>
                    <span className="text-sm font-black text-[#11182d]">
                        {formatCurrency(deal.dealPrice)}
                    </span>
                </div>

                {/* Progress Bar (Subtle) */}
                <div className="pt-1">
                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#0f49d7]" 
                            style={{ width: `${Math.min((deal.claimedCount / deal.stockLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <button
                    disabled={isDisabled}
                    onClick={onAddToCart}
                    className={`w-full mt-4 py-2.5 rounded-xl font-bold text-[0.8rem] flex items-center justify-center gap-2 ${
                        isDisabled 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#eef2ff] text-[#0f49d7] hover:bg-[#0f49d7] hover:text-white'
                    }`}
                >
                    {isFullyClaimed ? 'Out of Stock' : isExpired ? 'Deal Expired' : (
                        <>
                            Buy Now
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DealCard;
