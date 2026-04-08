import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { Star, X, MessageSquare, ShieldCheck, Send, ChevronRight } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11182d]/20 backdrop-blur-[4px] font-body text-[#11182d]">
      <div className="bg-white rounded-[24px] w-full max-w-[400px] border border-[#e1e5f1] shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Header Section */}
        <div className="px-7 pt-7 pb-4">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f8f9fb] text-[#90a0be] hover:text-[#11182d] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#0f49d7] font-semibold block mb-1">Feedback Center</span>
          <h2 className="font-display text-[1.1rem] font-semibold text-[#11182d]">Seller Performance</h2>
          <p className="font-body text-[0.76rem] text-[#6d7892] mt-1 font-medium leading-relaxed">
            Rate your experience with <span className="font-semibold text-[#11182d]">{subOrder.seller?.shopName || "the Seller"}</span>.
          </p>
        </div>

        {/* Rating Body */}
        <div className="px-7 pb-7">
          <div className="text-center mb-6">
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
                    className={`w-9 h-9 ${
                      (hover || rating) >= star
                        ? "fill-[#ffb800] text-[#ffb800]"
                        : "fill-[#f1f4f9] text-[#f1f4f9]"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 ? (
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] font-bold text-[#0f49d7] animate-in fade-in slide-in-from-top-1">
                {rating === 1 && "Disappointing"}
                {rating === 2 && "Unsatisfactory"}
                {rating === 3 && "Good experience"}
                {rating === 4 && "Great service"}
                {rating === 5 && "Exceptional!"}
              </p>
            ) : (
                <p className="mt-3 text-[10px] font-bold text-[#6d7892] uppercase tracking-[0.18em]">TAP TO RATE</p>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-body text-[9px] uppercase tracking-widest font-bold text-[#6d7892] mb-2 px-1 block">
                Additional Comments
              </label>
              <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-[#e1e5f1] focus-within:border-[#0f49d7] transition-all">
                <textarea
                  className="w-full bg-transparent font-body text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#90a0be] resize-none h-24 font-medium leading-relaxed"
                  placeholder="Share details about delivery or packaging..."
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full h-11 bg-[#11182d] text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Submit Verifed Review <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </button>
              
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-7 py-5 bg-[#f8f9fb] border-t border-[#e1e5f1]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#eef2ff] flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#15753a]" />
              </div>
              <span className="text-[9px] font-bold text-[#6d7892] uppercase tracking-tight flex-1 leading-[1.3] pt-0.5">Your verified review helps the community shop with confidence.</span>
            </div>
        </div>
      </div>
    </div>
  );
}

export default SellerReview;
