import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ChevronRight, Check } from 'lucide-react';

const TopSellerCard = ({ seller, isFeatured = false }) => {
  const navigate = useNavigate();
  const { rank, productId, productName, productImage, price, originalPrice, rating, reviewCount, salesCount } = seller;
  
  const discount = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;
    
  const handleAddToCart = (e) => {
      e.stopPropagation();
      e.preventDefault();
      navigate(`/product-detail/${productId}`);
  }

  if (isFeatured) {
    return (
      <div 
        className="bg-white rounded-[24px] overflow-hidden border border-[#eef2ff] shadow-sm flex flex-col md:flex-row h-full cursor-pointer relative"
        onClick={() => navigate(`/product-detail/${productId}`)}
      >
        <div className="md:w-[40%] bg-[#0e1112] relative overflow-hidden flex items-center justify-center p-8">
           {/* Rank Badge */}
           <div className="absolute top-4 left-4 bg-[#0f49d7] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 z-10">
             <Star className="w-3 h-3 fill-white" />
             #1 Elite Choice
           </div>
           
           <img 
            src={productImage} 
            alt={productName}
            className="w-full h-full object-contain mix-blend-normal"
          />
        </div>

        <div className="md:w-[60%] p-8 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
                <div className="max-w-[70%]">
                    <h3 className="text-[1.5rem] font-bold text-[#141b2d] leading-tight mb-2">
                        {productName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#1e293b] flex items-center justify-center">
                             <ShoppingCart className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[0.76rem] font-bold text-[#0f49d7] uppercase tracking-tight">Official Store</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[1.5rem] font-bold text-[#141b2d]">₹{price?.toLocaleString()}</p>
                    {discount > 0 && <p className="text-[0.85rem] font-bold text-[#10b981]">{discount}% OFF</p>}
                </div>
            </div>

            <p className="text-[0.82rem] text-[#5c6880] leading-relaxed mb-8 line-clamp-3">
               Engineered for high-intensity performance with responsive cushioning and a breathable mesh upper for peak results.
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex text-[#ff9c07]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < 5 ? "fill-current" : "opacity-20"}`} />
                        ))}
                    </div>
                    <span className="text-[0.82rem] text-[#5c6880]">({(reviewCount / 1000).toFixed(1)}k reviews)</span>
                </div>
                
                <button 
                    onClick={handleAddToCart}
                    className="bg-[#0f49d7] text-white px-8 py-3 rounded-xl font-bold text-[0.88rem] flex items-center gap-2"
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
      onClick={() => navigate(`/product-detail/${productId}`)}
    >
      {/* Image Container */}
      <div className="bg-[#f8f9fc] rounded-[20px] aspect-[4/3] overflow-hidden p-6 relative mb-4">
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-[#141b2d] shadow-sm">
           #{rank} Ranking
        </div>
        <img 
          src={productImage} 
          alt={productName}
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="px-2 pb-2">
        <div className="flex justify-between items-start gap-2 mb-2">
           <h3 className="text-[1.1rem] font-bold text-[#141b2d] flex-1">
             {productName}
           </h3>
           <p className="text-[1.1rem] font-bold text-[#141b2d]">₹{price?.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[0.7rem] text-[#5c6880] font-medium truncate">{seller.shopName || "WonderCart Certified"}</span>
        </div>
        
        <div className="flex items-center justify-between border-t border-[#f0f4ff] pt-4">
          <div className="flex items-center gap-1.5">
             <Star className="w-4 h-4 fill-[#ff9c07] text-[#ff9c07]" />
             <span className="text-[0.82rem] font-bold text-[#141b2d]">{rating}</span>
          </div>
          <span className="text-[0.82rem] font-bold text-[#0f49d7] hover:underline">View Details</span>
        </div>
      </div>
    </div>
  );
};

export default TopSellerCard;
