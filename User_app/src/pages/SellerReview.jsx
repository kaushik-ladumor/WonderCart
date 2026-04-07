import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { Star, X, MessageSquare, ShieldCheck, Send } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] font-body">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-tonal-md overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[95vh] overflow-y-auto">
        
        {/* Header Section */}
        <div className="px-6 pt-8 pb-0 text-center relative">
          <button 
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">Feedback Center</span>
          <h2 className="font-display text-[1.2rem] font-semibold text-[#141b2d]">Rate Performance</h2>
          <p className="text-[0.76rem] text-[#5c6880] mt-1 mb-6 leading-relaxed">
            Help us maintain quality by rating your experience with <span className="font-semibold text-[#141b2d]">{subOrder.seller?.shopName || "the Seller"}</span>.
          </p>
        </div>

        {/* Rating Body */}
        <div className="px-6 py-4">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-3.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 ${
                      (hover || rating) >= star
                        ? "fill-[#ffc107] text-[#ffc107]"
                        : "text-[#f0f4ff] fill-[#f0f4ff]"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] font-black text-[#004ac6] animate-in fade-in slide-in-from-top-1">
                {rating === 1 && "Disappointing"}
                {rating === 2 && "Unsatisfactory"}
                {rating === 3 && "Good experience"}
                {rating === 4 && "Great service"}
                {rating === 5 && "Exceptional!"}
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                Additional Comments
              </label>
              <div className="relative group">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-[#5c6880]/40 group-focus-within:text-[#004ac6] transition-colors" />
                <textarea
                  className="w-full pl-10 pr-4 py-3 bg-[#f0f4ff] rounded-xl text-[0.82rem] text-[#141b2d] focus:bg-white focus:ring-2 focus:ring-[#004ac6]/10 transition-all border border-transparent focus:border-[#004ac6]/20 resize-none h-28 placeholder:text-[#5c6880]/50"
                  placeholder="Share details about delivery or packaging..."
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full h-12 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-xl text-[0.76rem] font-semibold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-500/10 active:scale-95"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Feedback
                  </>
                )}
              </button>
              
              <button
                onClick={handleSkip}
                disabled={submitting}
                className="w-full h-10 bg-transparent text-[#5c6880] rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:text-[#141b2d] hover:bg-[#f0f4ff] transition-all"
              >
                Not now, maybe later
              </button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="px-6 pb-6 pt-2 border-t border-[#f0f4ff] bg-gray-50/30">
          <div className="flex items-center gap-3 text-[#5c6880]">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#f0f4ff]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#004ac6]" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium leading-tight">Your verified review helps the community shop with confidence.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerReview;
