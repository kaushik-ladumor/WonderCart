import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, LogIn, Plus, Clock, Gift } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";

const SharedCart = () => {
    const { shareId } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [merging, setMerging] = useState(false);

    const fetchSharedCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/cart/share/${shareId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setData(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or broken link");
            navigate("/");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSharedCart();
    }, [shareId]);

    const handleMerge = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            document.getElementById("login_modal")?.showModal();
            return;
        }

        try {
            setMerging(true);
            const res = await axios.post(`${API_URL}/cart/share/${shareId}/add`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/cart");
            }
        } catch (error) {
            toast.error("Failed to add items to your cart");
        } finally {
            setMerging(false);
        }
    };

    if (loading) return <Loader />;

    if (data?.isEmpty) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
                <div className="max-w-md w-full text-center p-8 bg-white rounded-[28px] border border-[#e1e5f1] shadow-sm">
                    <div className="mx-auto w-16 h-16 bg-[#fff5f5] text-[#d12828] rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-[#11182d] mb-2">Cart no longer active</h2>
                    <p className="text-[#6d7892] text-sm mb-6">{data.message}</p>
                    <button onClick={() => navigate("/")} className="w-full py-3 bg-[#0f49d7] text-white rounded-xl font-semibold text-sm">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f7fb] py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-[28px] border border-[#e1e5f1] overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-6 bg-[#0f49d7] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <span className="text-[0.7rem] font-bold uppercase tracking-widest opacity-80">Social Shopping</span>
                            </div>
                            <h1 className="text-2xl font-bold">Shared Shopping Bag</h1>
                            <p className="text-sm mt-1 opacity-90">Someone shared their curated collection with you!</p>
                        </div>
                        <Gift className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
                    </div>

                    <div className="p-6">
                        <div className="space-y-4 mb-8">
                            {data.cartItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border border-[#f1f5f9] hover:bg-[#fbfcfe] transition-colors">
                                    <div className="w-16 h-16 bg-[#f8f9fc] rounded-xl flex-shrink-0 overflow-hidden">
                                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-[#11182d] truncate">{item.productName}</h3>
                                        <p className="text-[0.75rem] text-[#62708d]">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#11182d]">₹{item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!data.isLoggedIn && (
                            <div className="mb-6 p-4 bg-[#eef2ff] rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg text-[#0f49d7]">
                                    <LogIn className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#11182d]">Sign in to shop</h4>
                                    <p className="text-[0.75rem] text-[#42506d] mt-0.5">Log in to add these items to your bag and start shopping.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleMerge}
                                disabled={merging}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-[#0f49d7] text-white rounded-xl font-bold uppercase tracking-widest text-[0.8rem] shadow-lg shadow-blue-200 hover:scale-[1.01] transition-all disabled:opacity-70"
                            >
                                <Plus className="w-4 h-4" />
                                {merging ? "Adding..." : "Add all to my bag"}
                            </button>
                            {!data.isLoggedIn && (
                                <button 
                                    onClick={() => document.getElementById("login_modal")?.showModal()}
                                    className="w-full py-3 text-[#0f49d7] font-bold text-sm"
                                >
                                    Log in to my account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-center text-[#6d7892] text-[0.7rem] mt-6 uppercase tracking-widest font-semibold">
                    WonderCart • Your personal shopping experience
                </p>
            </div>
        </div>
    );
};

export default SharedCart;
