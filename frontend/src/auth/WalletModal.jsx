import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  X, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Loader2
} from "lucide-react";
import { API_URL } from "../utils/constants";

const WalletModal = ({ isOpen, onClose, onRefresh }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const presets = [500, 1000, 2000, 5000];

  const handleTopUp = async () => {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 100) {
      toast.error("Minimum top-up amount is ₹100");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // 1. Create order on backend
      const { data } = await axios.post(
        `${API_URL}/user/wallet/topup`,
        { amount: numAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: "INR",
          name: "WonderCart Wallet",
          description: "Wallet Refill",
          order_id: data.order.id,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(
                `${API_URL}/user/wallet/verify`,
                {
                  ...response,
                  amount: numAmount
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                toast.success("Wallet recharged successfully!");
                onRefresh();
                onClose();
              }
            } catch (error) {
              toast.error("Verification failed");
            }
          },
          theme: { color: "#004ac6" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate top-up");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-[#141b2d]/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-[#f0f4ff] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center text-[#004ac6]">
              <Wallet className="w-7 h-7" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 className="font-display text-3xl font-extrabold text-[#141b2d] mb-2">Recharge Wallet</h2>
          <p className="font-body text-[#5c6880] text-sm mb-8">Add funds to your WonderCart wallet for lightning fast checkouts.</p>

          <div className="space-y-6">
             <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-2xl font-bold text-[#141b2d]">₹</span>
                <input 
                  type="number" 
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#f9f9ff] border-2 border-[#f0f4ff] focus:border-[#004ac6] outline-none rounded-[1.5rem] pl-12 pr-6 py-5 font-display text-2xl font-bold text-[#141b2d] transition-all placeholder:text-[#e1e8fd]"
                />
             </div>

             <div className="grid grid-cols-4 gap-3">
                {presets.map(p => (
                  <button 
                    key={p}
                    onClick={() => setAmount(p.toString())}
                    className="py-3 rounded-xl border border-[#f0f4ff] text-[10px] font-black tracking-widest uppercase hover:bg-[#004ac6] hover:text-white transition-all hover:-translate-y-1 active:scale-95"
                  >
                    +{p}
                  </button>
                ))}
             </div>

             <div className="pt-4">
                <button 
                  onClick={handleTopUp}
                  disabled={loading}
                  className="w-full bg-[#004ac6] text-white py-5 rounded-[1.5rem] font-display text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-[#141b2d] hover:shadow-black/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Initiate Checkout <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
             </div>

             <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 opacity-40">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-2 opacity-40">
                   <Zap className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Instant</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
