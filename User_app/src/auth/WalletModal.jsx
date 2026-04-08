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
          theme: { color: "#0f49d7" }
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#11182d]/20 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-sm mx-auto shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-7 pt-7 pb-0 text-center">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#0f49d7] font-bold block mb-1">
            WALLET SERVICES
          </span>
          <h3 className="font-display text-[1.25rem] font-semibold text-[#11182d]">
            Recharge Funds
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1 mb-5 leading-relaxed font-medium">
            Add balance to your secure wallet for instantaneous checkouts.
          </p>
        </div>

        <div className="px-7 py-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#6d7892] px-1 block text-left">
              Credit Amount
            </label>
            <div className="relative bg-[#f8f9fb] rounded-xl px-4 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0f49d7]/10 transition-all border border-[#f1f4f9] focus-within:border-[#0f49d7]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#11182d]">₹</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent w-full pl-6 text-[1.1rem] font-bold text-[#11182d] outline-none placeholder:text-[#6d7892]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {presets.map(p => (
              <button 
                key={p}
                onClick={() => setAmount(p.toString())}
                className={`py-3 rounded-xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                  amount === p.toString() 
                    ? "bg-[#11182d] border-[#11182d] text-white shadow-lg shadow-black/10" 
                    : "bg-white border-[#f1f4f9] text-[#6d7892] hover:border-[#0f49d7] hover:text-[#0f49d7]"
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
              className="w-full bg-[#11182d] text-white font-bold rounded-xl h-12 text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
              ) : (
                <>CONTINUE TO PAYMENT <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        <div className="px-7 py-5 bg-[#f8f9fb] border-t border-[#e1e5f1]">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2 text-[#6d7892] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15753a]" />
              <span className="text-[9px] uppercase tracking-widest">SECURE</span>
            </div>
            <div className="w-px h-3 bg-[#e1e5f1]"></div>
            <div className="flex items-center gap-2 text-[#6d7892] font-bold">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[9px] uppercase tracking-widest">INSTANT</span>
            </div>
            <div className="w-px h-3 bg-[#e1e5f1]"></div>
            <div className="flex items-center gap-2 text-[#6d7892] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span className="text-[9px] uppercase tracking-widest">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
