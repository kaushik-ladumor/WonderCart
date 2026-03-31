import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  ShoppingBag,
  Zap,
  Globe,
  Smile,
  Book,
  MonitorPlay,
  Shirt,
  Armchair,
  Sparkles
} from "lucide-react";
import { useTopSellers } from "../hooks/useTopSellers";
import TopSellerCard from "../components/TopSellerCard";
import Loader from "../components/Loader";

const CATEGORY_ICONS = {
  "All": <Globe className="w-4 h-4" />,
  "Electronics": <MonitorPlay className="w-4 h-4" />,
  "Fashion": <Shirt className="w-4 h-4" />,
  "Home & Kitchen": <Armchair className="w-4 h-4" />,
  "Beauty": <Sparkles className="w-4 h-4" />,
  "Toys": <Smile className="w-4 h-4" />,
  "Books": <Book className="w-4 h-4" />,
  "Sports": <Zap className="w-4 h-4" />
};

const TopSellers = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const {
    data: products,
    rising,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    nextRefresh
  } = useTopSellers(activeCategory);

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getCategoryIcon = (catName) => {
    return CATEGORY_ICONS[catName] || <ShoppingBag className="w-4 h-4" />;
  };

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#f8f9fc]">
         <p className="text-red-500 font-bold mb-4">Error loading top sellers.</p>
         <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#0f49d7] text-white rounded-lg">Retry</button>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold text-[#0f49d7] uppercase tracking-[0.15em] block mb-3">
              Premium Marketplace
            </span>
            <h1 className="text-[1.55rem] font-semibold tracking-tight sm:text-[1.8rem] text-[#11182d] mb-2">
              Top Sellers
            </h1>
            <p className="text-[0.82rem] text-[#42506d] max-w-lg">
              A real-time curation of the highest-velocity products across our premium vendor network. Updated hourly based on global demand.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#e8efff] p-1 rounded-2xl border border-[#0f49d7]/10">
            <div className="bg-[#0f49d7] p-2.5 rounded-xl text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div className="pr-4">
              <p className="text-[9px] font-bold text-[#5c6880] uppercase tracking-[0.1em]">Refreshed In</p>
              <p className="text-lg font-bold text-[#11182d] leading-none">
                {formatTime(nextRefresh)}
              </p>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS AND SORT */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {["All", ...categories.map(c => c.category)].map((cat, idx) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.76rem] font-medium transition-colors ${
                    isActive 
                      ? "bg-[#0f49d7] text-white" 
                      : "bg-white text-[#42506d] border border-[#eef2ff] hover:bg-[#f6f8fd]"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  {cat}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2 text-[0.76rem] text-[#42506d] whitespace-nowrap">
            <span>Sort by:</span>
            <span className="font-bold text-[#141b2d]">Trending Velocity</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* MAIN CONTENT AREA */}
          <div className="space-y-6">
            {loading && products.length === 0 ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-[24px] p-20 text-center border border-[#eef2ff]">
                <p className="text-[#42506d] text-[0.82rem]">No items in this collection yet.</p>
              </div>
            ) : (
              <>
                {/* GRID OF PRODUCTS (Card component will handle #1 vs others) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {products.map((product, idx) => (
                    <div key={product._id} className={idx === 0 ? "sm:col-span-2" : ""}>
                      <TopSellerCard seller={product} isFeatured={idx === 0} />
                    </div>
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-10 py-3 bg-white border border-[#eef2ff] text-[#11182d] rounded-xl font-semibold text-[0.8rem] hover:bg-[#f8f9fd]"
                    >
                      {loadingMore ? "Loading..." : "Discover More"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* INFO BANNER */}
            <div className="bg-[#eef2ff] rounded-[18px] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-full text-[#11182d] shadow-sm">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#11182d] text-[0.88rem]">Recalculated Hourly</h4>
                  <p className="text-[#5d6a84] text-[0.74rem]">Rankings are determined by sales volume, user ratings, and stock availability.</p>
                </div>
              </div>
              <button className="bg-white px-4 py-2 rounded-lg text-[0.74rem] font-semibold text-[#11182d] border border-white shadow-sm whitespace-nowrap">
                Learn Methodology
              </button>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            {/* Live Ranking Widget */}
            <div className="bg-[#1e293b] rounded-[24px] p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-white" />
                   <h3 className="font-semibold text-[1.1rem] text-white">Live Ranking</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md text-white/70">Real-time</span>
              </div>
              
              {/* Simplified Bar Chart visualization */}
              <div className="flex items-end justify-between h-[120px] gap-2 mb-8 px-2">
                 <div className="w-full bg-white/20 rounded-t-sm h-[30%]"></div>
                 <div className="w-full bg-white/40 rounded-t-sm h-[50%]"></div>
                 <div className="w-full bg-white/60 rounded-t-sm h-[80%]"></div>
                 <div className="w-full bg-white/40 rounded-t-sm h-[40%]"></div>
                 <div className="w-full bg-white/60 rounded-t-sm h-[70%]"></div>
                 <div className="w-full bg-white/80 rounded-t-sm h-[90%]"></div>
              </div>

              <div className="space-y-5">
                {rising.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-[0.76rem] font-bold">#{idx + 4} {item.productName}</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-tight">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#10b981]">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] font-bold">+{Math.floor(Math.random() * 100) + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Collections */}
            <div className="bg-white rounded-[24px] p-6 border border-[#eef2ff] shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-[#11182d]" />
                <h3 className="font-semibold text-[1.1rem] text-[#11182d]">Core Collections</h3>
              </div>
              
              <div className="space-y-3">
                {categories.slice(0, 4).map((cat, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveCategory(cat.category)}
                    className="w-full flex items-center justify-between p-3.5 bg-[#f8f9fd] hover:bg-[#f0f4ff] rounded-[16px] group transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-[0.82rem] font-bold text-[#141b2d]">{cat.category}</p>
                      <p className="text-[10px] text-[#5c6880]">{Math.floor(Math.random() * 50) + 10} items for the season</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#b0b8cb] group-hover:text-[#0f49d7]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSellers;
