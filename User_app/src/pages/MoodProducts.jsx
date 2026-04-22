import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, ArrowLeft, Heart } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { API_URL } from "../utils/constants";

const MoodProducts = () => {
    const { moodName } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [moodInfo, setMoodInfo] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [addingToWishlist, setAddingToWishlist] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const [productsRes, allMoodsRes] = await Promise.all([
                    axios.get(`${API_URL}/mood/products/${moodName}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }),
                    axios.get(`${API_URL}/mood`)
                ]);

                setProducts(productsRes.data.data || []);
                
                const currentMood = allMoodsRes.data.data?.find(m => m.name === moodName);
                setMoodInfo(currentMood);

                if (token) {
                    const wishlistRes = await axios.get(`${API_URL}/wishlist`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (wishlistRes.data.success) {
                      setWishlist(
                        wishlistRes.data.wishlist?.items
                          ?.map((item) => item.product?._id || item.product)
                          .filter(Boolean) || [],
                      );
                    }
                }
            } catch (error) {
                console.error("Mood products fetch error:", error);
                toast.error("Failed to load mood products");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [moodName]);

    const toggleWishlist = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
    
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to manage wishlist");
          return;
        }
    
        setAddingToWishlist((prev) => ({ ...prev, [product._id]: true }));
    
        try {
          if (wishlist.includes(product._id)) {
            await axios.delete(`${API_URL}/wishlist/remove/${product._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setWishlist((prev) => prev.filter((id) => id !== product._id));
            toast.success("Removed from wishlist");
          } else {
            await axios.post(
              `${API_URL}/wishlist/add`,
              { productId: product._id },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setWishlist((prev) => [...prev, product._id]);
            toast.success("Added to wishlist");
          }
        } catch (error) {
          toast.error("Failed to update wishlist");
        } finally {
          setAddingToWishlist((prev) => ({ ...prev, [product._id]: false }));
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-[#f6f7fb] py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-[0.8rem] font-bold text-[#62708d] uppercase tracking-widest hover:text-[#0f49d7] transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-[#e2e6f3] shadow-sm overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">{moodInfo?.emoji}</span>
                                <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0f49d7] bg-[#edf2ff] px-3 py-1 rounded-full">Mood Collection</span>
                            </div>
                            <h1 className="text-3xl font-bold text-[#11182d]">{moodInfo?.label || moodName} Selection</h1>
                            <p className="mt-2 text-[#62708d] text-sm max-w-md">
                                Highly-ranked products curated specifically for your {moodInfo?.label.toLowerCase()} vibes.
                            </p>
                        </div>
                        <Sparkles className="absolute -right-6 -bottom-6 w-48 h-48 text-[#edf2ff] rotate-12" />
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-[#e2e6f3]">
                        <div className="text-5xl mb-4">💨</div>
                        <h2 className="text-xl font-bold text-[#11182d]">No products found</h2>
                        <p className="text-[#62708d] mt-2">We're still curating products for this mood. Check back soon!</p>
                        <button onClick={() => navigate("/shop")} className="mt-6 px-6 py-3 bg-[#0f49d7] text-white rounded-xl font-bold text-sm">
                            Explore All Shop
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                wishlist={wishlist}
                                addingToWishlist={addingToWishlist}
                                toggleWishlist={toggleWishlist}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoodProducts;
