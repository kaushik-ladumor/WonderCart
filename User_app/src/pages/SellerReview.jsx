import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { Star, X, MessageSquare, ShieldCheck, Send, ChevronRight, Zap, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Seller Review Component
 * Handles 1-5 star rating and optional feedback for a specific seller/sub-order.
 */
function SellerReview({ subOrder, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !subOrder) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/seller-review/create`,
        { subOrderId: subOrder._id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Thanks for your feedback!");
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/seller-review/skip`,
        { subOrderId: subOrder._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Skip failed", err);
      onClose(); // Close anyway
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-white rounded-[18px] w-full max-w-[400px] border border-[#e1e5f1] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-7 pb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d7892] mb-1">
            Feedback Center
          </p>
          <h3 className="text-[1.3rem] font-semibold text-[#11182d]">
            Seller Performance
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1.5 leading-relaxed">
            Rate your experience with <span className="font-semibold text-[#11182d]">{subOrder.seller?.shopName || "the Seller"}</span>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 overflow-y-auto scrollbar-hide">
          {/* Rating Section */}
          <div className="text-center bg-[#fcfdfe] py-5 rounded-[14px] border border-[#f0f4ff] mb-6">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hover || rating) >= star
                        ? "fill-[#ffb800] text-[#ffb800]"
                        : "fill-[#f1f4f9] text-[#f1f4f9]"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 ? (
              <p className="mt-3 text-[9px] uppercase tracking-[0.16em] font-bold text-[#0f49d7] animate-in fade-in slide-in-from-top-1">
                {rating === 1 && "Disappointing"}
                {rating === 2 && "Unsatisfactory"}
                {rating === 3 && "Good experience"}
                {rating === 4 && "Great service"}
                {rating === 5 && "Exceptional!"}
              </p>
            ) : (
                <p className="mt-3 text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.16em]">TAP TO RATE</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892] px-1 block">
                Additional Comments
              </label>
              <div className="bg-white rounded-[14px] px-4 py-3 border border-[#d7dcea] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                <textarea
                  className="w-full bg-transparent text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#b3bdd2] resize-none h-24 font-medium leading-relaxed"
                  placeholder="Share details about delivery or packaging..."
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.78rem] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>Submit Review <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Multi-badge Footer */}
        <div className="px-6 py-4 bg-[#f4f6fb] border-t border-[#e1e5f1] mt-auto">
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
}

export default SellerReview;
