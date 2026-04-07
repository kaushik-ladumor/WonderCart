import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { 
  X, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Loader2,
  CheckCircle2
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal header */}
        <div className="px-6 pt-6 pb-0 text-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
            WALLET SERVICES
          </span>
          <h3 className="font-display text-[1.2rem] font-semibold text-[#141b2d]">
            Recharge Funds
          </h3>
          <p className="text-[0.76rem] text-[#5c6880] mt-1 mb-5 leading-relaxed">
            Add balance to your secure wallet for instantaneous checkouts.
          </p>
        </div>

        {/* Modal body */}
        <div className="px-6 py-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">
              Credit Amount
            </label>
            <div className="relative bg-[#f0f4ff] rounded-xl px-4 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#141b2d]">₹</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent w-full pl-6 text-[1.1rem] font-semibold text-[#141b2d] outline-none placeholder:text-[#5c6880]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {presets.map(p => (
              <button 
                key={p}
                onClick={() => setAmount(p.toString())}
                className={`py-2.5 rounded-xl border border-transparent text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  amount === p.toString() 
                    ? "bg-[#004ac6] text-white shadow-lg shadow-blue-500/20" 
                    : "bg-[#f0f4ff] text-[#004ac6] hover:bg-[#e1e8fd]"
                }`}
              >
                ₹{p}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button 
              onClick={handleTopUp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-semibold rounded-xl h-12 text-[0.76rem] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/80" />
              ) : (
                <>CONTINUE TO PAYMENT <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-6 pb-6 pt-4 border-t border-[#f0f4ff] bg-gray-50/30">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2 text-[#5c6880] opacity-60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">SECURE</span>
            </div>
            <div className="w-px h-3 bg-[#e1e8fd]"></div>
            <div className="flex items-center gap-2 text-[#5c6880] opacity-60">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">INSTANT</span>
            </div>
            <div className="w-px h-3 bg-[#e1e8fd]"></div>
            <div className="flex items-center gap-2 text-[#5c6880] opacity-60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
