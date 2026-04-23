import React, { useState } from "react";
import { 
  X, 
  AlertCircle, 
  Send, 
  Loader2, 
  RotateCcw, 
  Ban,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

const OrderActionModal = ({ isOpen, onClose, onSubmit, type, orderId }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isReturn = type === "return";
  const title = isReturn ? "Return Request" : "Cancel Order";
  const subtitle = isReturn 
    ? "Please specify the reason for your return request." 
    : "Tell us why you'd like to cancel this order.";
  const icon = isReturn ? RotateCcw : Ban;
  const buttonText = isReturn ? "Submit Return" : "Confirm Cancellation";
  const buttonColor = isReturn ? "bg-[#0f49d7]" : "bg-[#ef4444]";

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }
    setLoading(true);
    await onSubmit(reason);
    setLoading(false);
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-[24px] w-full max-w-sm mx-auto relative shadow-2xl border border-[#e1e5f1] overflow-hidden flex flex-col">
        
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-8 pb-0 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#90a0be] mb-1">
            Order #{orderId?.slice(-8).toUpperCase()}
          </p>
          <h3 className="text-[1.25rem] font-semibold text-[#11182d]">
            {title}
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-2 mb-6 leading-relaxed px-2">
            {subtitle}
          </p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <div className="relative bg-[#f8f9fb] rounded-[16px] border border-[#e1e5f1] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
              <textarea 
                rows="3"
                placeholder="Ex: Item arrived damaged, changed my mind..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-transparent w-full p-4 text-[0.82rem] font-medium text-[#11182d] outline-none placeholder:text-[#b3bdd2] resize-none"
              />
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className={`w-full ${buttonColor} text-white font-bold rounded-[16px] h-12 text-[0.78rem] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg ${isReturn ? 'shadow-[#0f49d7]/10' : 'shadow-[#ef4444]/10'}`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
            ) : (
              <>{buttonText} <Send className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        <div className="px-6 py-4 bg-[#f8f9fb] border-t border-[#f1f4f9]">
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1.5 text-[#6d7892]">
              <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Verified</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#cbd5e1]"></div>
            <div className="flex items-center gap-1.5 text-[#6d7892]">
              <HelpCircle className="w-3 h-3 text-[#0f49d7]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderActionModal;
