import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ChevronRight,
  ArrowRight,
  MessageSquare,
  ArrowLeft,
  Mail,
  Zap,
  Star as StarIcon
} from "lucide-react";
import Loader from "../components/Loader";
import ChatBotPanel from '../AiFeatures/ChatBot'
import HeroSlider from "../components/HeroSlider";
import CategorySlider from "../components/CategorySlider";
import ProductCard from "../components/ProductCard";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addingToWishlist, setAddingToWishlist] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch trending products
        const productsRes = await axios.get(`${API_URL}/product/get?limit=8`);
        setTrendingProducts(productsRes.data.data || []);

        // Fetch categories
        const categoriesRes = await axios.get(`${API_URL}/product/categories`);
        setCategories(categoriesRes.data.categories || []);

        // Fetch wishlist if logged in
        const token = localStorage.getItem("token");
        if (token) {
          const wishlistRes = await axios.get(`${API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (wishlistRes.data.success) {
            setWishlist(wishlistRes.data.wishlist?.items?.map(item => item.product) || []);
          }
        }
      } catch (error) {
        console.error("Home data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to manage wishlist");
      return;
    }
    setAddingToWishlist(prev => ({ ...prev, [product._id]: true }));
    try {
      if (wishlist.includes(product._id)) {
        await axios.delete(`${API_URL}/wishlist/remove/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(prev => prev.filter(id => id !== product._id));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`${API_URL}/wishlist/add`, { productId: product._id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(prev => [...prev, product._id]);
        toast.success("Added to wishlist!");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    } finally {
      setAddingToWishlist(prev => ({ ...prev, [product._id]: false }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f9f9ff]">

      {/* Hero Slider */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto overflow-hidden rounded-[2.5rem] bg-[#141b2d] relative aspect-[16/8] lg:aspect-[21/9]">
          <HeroSlider />
        </div>
      </section>

      {/* Category Selection */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] text-[#004ac6] font-bold uppercase tracking-[0.2em] mb-2.5 block">Curated Discovery</span>
            <h2 className="font-display text-4xl font-extrabold text-[#141b2d] tracking-tight">Shop by Categories</h2>
          </div>
          <button
            onClick={() => navigate("/categories")}
            className="group flex items-center gap-2 font-display font-bold text-sm text-[#141b2d] hover:text-[#004ac6] transition-colors"
          >
            Explore all artifacts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <CategorySlider
          categories={categories}
          onCategoryClick={(cat) => navigate(`/shop?category=${encodeURIComponent(cat)}`)}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
        />
      </section>

      {/* Trending Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="max-w-xl">
              <span className="text-[10px] text-[#004ac6] font-bold uppercase tracking-[0.2em] mb-2.5 block">Season's Most Wanted</span>
              <h2 className="font-display text-4xl font-extrabold text-[#141b2d] tracking-tight leading-tight">
                Trending <span className="text-[#004ac6]">Now</span>.
              </h2>
              <p className="font-body text-[13px] text-[#5c6880] mt-4 max-w-md leading-relaxed">Our most coveted designs this week, selected for their timeless appeal and superior craftsmanship.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wishlist={wishlist}
                addingToWishlist={addingToWishlist}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate("/shop")}
              className="px-10 py-4 border-2 border-[#141b2d] text-[#141b2d] rounded-2xl font-display font-bold text-sm hover:bg-[#141b2d] hover:text-white transition-all active:scale-95"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-16 bg-[#f9f9ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-[#f0f4ff] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#004ac6] shadow-tonal-sm">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#141b2d]">Curated Quality</h3>
            <p className="font-body text-xs text-[#5c6880] leading-relaxed max-w-[240px] mx-auto">
              Every artifact in our collection passes a rigorous audit of craft and aesthetic integrity.
            </p>
          </div>
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-[#f0f4ff] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#004ac6] shadow-tonal-sm">
              <ArrowRight className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#141b2d]">Editorial Shipping</h3>
            <p className="font-body text-xs text-[#5c6880] leading-relaxed max-w-[240px] mx-auto">
              Standard delivery on all orders above ₹999. Thoughtfully packaged, securely delivered.
            </p>
          </div>
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-[#f0f4ff] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#004ac6] shadow-tonal-sm">
              <StarIcon className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#141b2d]">Design Support</h3>
            <p className="font-body text-xs text-[#5c6880] leading-relaxed max-w-[240px] mx-auto">
              Our support collective is available 24/7 to assist with your selection and queries.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto bg-[#f0f4ff]/70 border border-[#e1e8fd] rounded-[3rem] p-10 lg:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#004ac6]/5 rounded-full blur-3xl -mr-40 -mt-40 group-hover:bg-[#004ac6]/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/50 rounded-full blur-2xl -ml-30 -mb-30" />

          <div className="grid lg:grid-cols-2 items-center gap-12 relative z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#004ac6] mb-4 block">Newsletter</span>
              <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-[#141b2d] tracking-tight leading-[1.1] mb-6 italic">
                Curated insights <br /> <span className="text-[#004ac6] not-italic">delivered weekly.</span>
              </h2>
              <p className="font-body text-[13px] text-[#5c6880] mb-8 max-w-sm leading-relaxed">
                Join 50,000+ tastemakers receiving exclusive early access to drops, designer interviews, and seasonal edits.
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-premium-sm border border-[#f0f4ff]">
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-6 py-4 text-[#141b2d] font-body text-sm outline-none bg-transparent placeholder:text-gray-300"
                />
                <button className="px-10 py-4 bg-[#004ac6] text-white rounded-xl font-display font-bold text-xs hover:bg-[#141b2d] transition-all active:scale-95 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Chatbot FAB ── */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Open chat"
        className={`fixed bottom-8 right-8 z-40 w-16 h-16 bg-[#141b2d] text-white rounded-2xl flex items-center justify-center shadow-premium hover:bg-[#004ac6] hover:scale-105 active:scale-95 transition-all duration-300 group ${chatOpen ? "opacity-0 pointer-events-none translate-y-20" : "opacity-100"
          }`}
      >
        <MessageSquare className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* ── Slide-in Chat Panel ── */}
      {chatOpen && (
        <div
          className="fixed inset-0 bg-[#141b2d]/40 z-40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setChatOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-700 ease-out-expo ${chatOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <ChatBotPanel onClose={() => setChatOpen(false)} />
      </div>
    </div>
  );
}

export default HomePage;
