import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ChevronRight, Check } from 'lucide-react';

const TopSellerCard = ({ seller, isFeatured = false }) => {
  const navigate = useNavigate();
  const { rank, productId, productName, productImage, price, originalPrice, salesCount } = seller;
  
  const discount = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;
    
  const displayRating = (typeof productId === 'object' ? productId?.ratingAverage : seller.rating) || 0;
  const displayReviewCount = (typeof productId === 'object' ? productId?.reviewCount : seller.reviewCount) || 0;
    
  const handleAddToCart = (e) => {
      e.stopPropagation();
      e.preventDefault();
      navigate(`/product-detail/${productId?._id || productId}`);
  }

  if (isFeatured) {
    return (
      <div 
        className="bg-white rounded-[24px] overflow-hidden border border-[#eef2ff] shadow-sm flex flex-col md:flex-row h-full cursor-pointer relative"
        onClick={() => navigate(`/product-detail/${productId?._id || productId}`)}
      >
        <div className="md:w-[40%] bg-[#0e1112] relative overflow-hidden flex items-center justify-center p-8">
           {/* Rank Badge */}
           <div className="absolute top-4 left-4 bg-[#0f49d7] text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 z-10">
             <Star className="w-3 h-3 fill-white" />
             #1 Elite Choice
           </div>
           
           <img 
            src={productImage} 
            alt={productName}
            className="w-full h-full object-contain mix-blend-normal"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="absolute inset-0 items-center justify-center bg-[#0e1112] hidden">
             <span className="text-6xl">✨</span>
          </div>
        </div>

        <div className="md:w-[60%] p-8 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
                <div className="max-w-[70%]">
                    <h3 className="text-[1.5rem] font-semibold text-[#141b2d] leading-tight mb-2 tracking-tight">
                        {productName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1e293b] flex items-center justify-center font-semibold">
                             <ShoppingCart className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[#0f49d7] uppercase tracking-[0.16em]">Official Store</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[1.5rem] font-semibold text-[#141b2d] tracking-tight">₹{price?.toLocaleString()}</p>
                    {discount > 0 && <p className="text-[10px] font-semibold text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-lg uppercase tracking-widest">{discount}% OFF</p>}
                </div>
            </div>

            <p className="text-[0.82rem] text-[#5c6880] leading-relaxed mb-8 line-clamp-3 font-medium">
               Engineered for high-intensity performance with responsive cushioning and a breathable mesh upper for peak results.
            </p>

             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-2 flex-wrap">
                     <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(displayRating) ? "fill-[#ff9c07] text-[#ff9c07]" : "fill-[#f1f5fb] text-[#d9deeb]"}`} />
                        ))}
                    </div>
                    <span className="text-[0.76rem] text-[#6d7892] font-semibold uppercase tracking-wider">({displayReviewCount} reviews)</span>
                </div>
                
                <button 
                    onClick={handleAddToCart}
                    className="bg-[#0f49d7] w-full sm:w-auto justify-center text-white px-8 py-3 rounded-xl font-semibold text-[0.88rem] flex items-center gap-2"
                >
                    Buy Now <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-[24px] overflow-hidden border border-[#eef2ff] shadow-sm relative flex flex-col h-full cursor-pointer p-4" 
      onClick={() => navigate(`/product-detail/${productId?._id || productId}`)}
    >
      {/* Image Container */}
      <div className="bg-[#f8f9fc] rounded-[20px] aspect-[4/3] overflow-hidden p-6 relative mb-4">
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-semibold text-[#141b2d] shadow-sm">
           #{rank} Ranking
        </div>
        <img 
          src={productImage} 
          alt={productName}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="absolute inset-0 items-center justify-center bg-[#f8f9fc] hidden">
           <span className="text-5xl">🛍️</span>
        </div>
      </div>
      
      <div className="px-2 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
           <h3 className="text-[1.1rem] font-semibold text-[#141b2d] flex-1">
             {productName}
           </h3>
           <p className="text-[1.1rem] font-semibold text-[#141b2d]">₹{price?.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[10px] text-[#5c6880] font-semibold uppercase tracking-[0.12em] truncate">{seller.shopName || "WonderCart Certified"}</span>
        </div>
        
        <div className="flex items-center justify-between border-t border-[#f0f4ff] pt-4">
          <div className="flex items-center gap-1.5">
             <Star className="w-4 h-4 fill-[#ff9c07] text-[#ff9c07]" />
             <span className="text-[0.82rem] font-semibold text-[#141b2d]">{displayRating || "0.0"}</span>
          </div>
          <span className="text-[0.82rem] font-semibold text-[#0f49d7] hover:underline">View Details</span>
        </div>
      </div>
    </div>
  );
};

export default TopSellerCard;
