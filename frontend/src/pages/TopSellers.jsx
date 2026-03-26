import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  ChevronDown, 
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function TopSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("Rating");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const res = await axios.get(`${API_URL}/seller-review/top-sellers`);
        if (res.data.success) {
          setSellers(res.data.sellers);
        }
      } catch (err) {
        console.error("Failed to fetch top sellers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopSellers();
  }, []);

  if (loading) return <Loader />;

  // Sort logic (Mocked for demo but functional on rating)
  const sortedSellers = [...sellers].sort((a, b) => {
    if (activeSort === "Rating") return b.average_rating - a.average_rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#141b2d] font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-[1.8rem] font-bold tracking-tight text-[#141b2d] mb-2 sm:text-[2.2rem]">
            Top Sellers
          </h1>
          <p className="text-[0.98rem] text-[#5c6880] max-w-3xl leading-relaxed">
            Meet the trusted curators defining the new standard of Indian craftsmanship. 
            Every merchant here is verified for quality and heritage.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#f0f4ff]/50 backdrop-blur-sm p-3 rounded-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#eef2ff]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#5c6880] uppercase tracking-[0.16em] ml-2">Sort By</span>
            <div className="flex bg-white p-1 rounded-xl shadow-tonal-sm border border-[#eef2ff]">
              {["Revenue", "Rating", "Most Followed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSort(tab)}
                  className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-none ${
                    activeSort === tab 
                      ? "bg-[#004ac6] text-white shadow-lg shadow-blue-500/10" 
                      : "text-[#5c6880] hover:bg-[#f8f9ff]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#eef2ff] shadow-tonal-sm cursor-pointer hover:bg-[#f8f9ff]">
            <Filter className="w-4 h-4 text-[#004ac6]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#5c6880]">All Categories</span>
            <ChevronDown className="w-4 h-4 text-[#90a0be]" />
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedSellers.map((seller) => (
            <div 
              key={seller._id} 
              className="bg-white rounded-[24px] border border-[#eef2ff] shadow-tonal-sm overflow-hidden flex flex-col"
            >
              {/* Card Top: Seller Info */}
              <div className="p-6 pb-0">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <img 
                      src={seller.shopLogo || "https://cdn-icons-png.flaticon.com/512/3225/3225191.png"} 
                      className="w-14 h-14 rounded-xl object-contain bg-[#f8f9ff] border border-[#eef2ff] p-1"
                      alt=""
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#004ac6] fill-[#004ac6] text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] font-bold text-[#141b2d]">{seller.shopName}</h3>
                    <p className="text-[9px] font-black text-[#5c6880] uppercase tracking-[0.16em]">
                      {seller.sellerCategories?.[0] || "Premium Curators"}
                    </p>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 bg-[#f8f9ff] rounded-xl p-3 mb-6 border border-[#eef2ff]">
                  <div className="text-center border-r border-[#eef2ff]">
                    <p className="text-[8px] font-bold text-[#90a0be] uppercase tracking-widest mb-1">Sales</p>
                    <p className="text-[0.82rem] font-bold text-[#141b2d]">₹{Math.floor(Math.random() * 90 + 10)}L</p>
                  </div>
                  <div className="text-center border-r border-[#eef2ff]">
                    <p className="text-[8px] font-bold text-[#90a0be] uppercase tracking-widest mb-1">Rating</p>
                    <p className="text-[0.82rem] font-bold text-[#141b2d] flex items-center justify-center gap-1">
                      {seller.average_rating} <Star className="w-3 h-3 text-blue-600 fill-blue-600" />
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-[#90a0be] uppercase tracking-widest mb-1">Followers</p>
                    <p className="text-[0.82rem] font-bold text-[#141b2d]">{Math.floor(Math.random() * 15 + 5)}K</p>
                  </div>
                </div>

                {/* Bestsellers Section (Mocked thumbnails) */}
                <div className="mb-6">
                  <p className="text-[9px] font-black text-[#5c6880] uppercase tracking-[0.18em] mb-3">Bestsellers</p>
                  <div className="flex gap-2.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 aspect-square rounded-xl bg-black relative overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/shop-${seller._id}-${i}/200`} 
                          className="w-full h-full object-cover opacity-60"
                          alt=""
                        />
                        <div className="absolute inset-0 flex items-end p-2 bg-black/40">
                          <p className="text-[9px] font-bold text-white tracking-widest uppercase">₹{Math.floor(Math.random() * 8000 + 1000).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Action */}
              <div className="p-6 pt-0 mt-auto">
                <button 
                  onClick={() => navigate(`/shop?seller=${seller._id}`)}
                  className="w-full h-12 bg-[#004ac6] text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] shadow-lg shadow-blue-600/10"
                >
                  Visit Shop
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Spotlight Section */}
        <div className="mt-20 relative rounded-[32px] overflow-hidden min-h-[480px] bg-[#141b2d] flex items-center">
           {/* Spotlight Image Background */}
           <img 
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            alt=""
           />
           <div className="absolute inset-0 bg-[#141b2d]/70 w-full h-full" />

           <div className="relative z-10 px-10 md:px-20 max-w-2xl py-20">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg mb-8">
                 <CheckCircle2 className="w-3 h-3" /> Platinum Partner
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Artisanal Roots
              </h2>
              <p className="text-white/70 text-[0.95rem] leading-relaxed mb-10 max-w-lg">
                Preserving the soul of rural Indian textiles. From the looms of Varanasi to the blocks of Sanganer, witness the pinnacle of slow fashion.
              </p>
              
              <div className="flex gap-12 mb-10">
                <div>
                   <p className="text-2xl font-bold text-white mb-1">₹3.4Cr+</p>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Impact</p>
                </div>
                <div>
                   <p className="text-2xl font-bold text-white mb-1">450+</p>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Artisans Supported</p>
                </div>
              </div>

              <button 
                className="bg-[#004ac6] text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-3"
              >
                View Merchant Spotlight
                <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>
        
      </div>
    </div>
  );
}

export default TopSellers;
