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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[18px] w-full max-w-sm mx-auto relative max-h-[90vh] overflow-hidden flex flex-col border border-[#e1e5f1]">
        
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-7 pb-0 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d7892] mb-1">
            Wallet Services
          </p>
          <h3 className="text-[1.3rem] font-semibold text-[#11182d]">
            Recharge Funds
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1.5 mb-5 leading-relaxed">
            Add balance to your secure wallet for instantaneous checkouts.
          </p>
        </div>

        <div className="px-6 py-4 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892] px-1 block text-left">
              Credit Amount
            </label>
            <div className="relative bg-white rounded-[14px] px-4 py-3 border border-[#d7dcea] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#11182d]">₹</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent w-full pl-6 text-[1.1rem] font-semibold text-[#11182d] outline-none placeholder:text-[#b3bdd2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {presets.map(p => (
              <button 
                key={p}
                onClick={() => setAmount(p.toString())}
                className={`py-2.5 rounded-[12px] border text-[0.7rem] font-bold uppercase tracking-wider transition-all ${
                  amount === p.toString() 
                    ? "bg-[#0f49d7] border-[#0f49d7] text-white" 
                    : "bg-white border-[#d7dcea] text-[#6d7892] hover:border-[#0f49d7] hover:text-[#0f49d7]"
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
              className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.78rem] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
              ) : (
                <>Continue to Payment <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#f4f6fb] mt-auto">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0f7a32]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">SECURE</span>
            </div>
            <div className="w-px h-3 bg-[#d7dcea]"></div>
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">INSTANT</span>
            </div>
            <div className="w-px h-3 bg-[#d7dcea]"></div>
            <div className="flex items-center gap-1.5 text-[#5d6a84]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0f49d7]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.12em]">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
