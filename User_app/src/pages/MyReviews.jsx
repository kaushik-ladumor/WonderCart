import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { 
  Star, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  ChevronRight,
  MessageSquare,
  X,
  Upload,
  Loader2
} from "lucide-react";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/review/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyReviews();
  }, [token]);

  if (loading) return <Loader />;

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await axios.delete(`${API_URL}/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Review deleted");
        setReviews(reviews.filter(r => r._id !== reviewId));
      }
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const EditReviewModal = ({ review, onClose, onRefresh }) => {
    const [rating, setRating] = useState(review.rating);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(review.comment);
    const [images, setImages] = useState(review.images || []);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async () => {
      setIsSubmitting(true);
      try {
        const res = await axios.put(`${API_URL}/review/${review._id}`, 
          { rating, comment, images },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success("Review updated successfully");
          onRefresh();
          onClose();
        }
      } catch (err) {
        toast.error("Failed to update review");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#11182d]/20 backdrop-blur-[4px]">
        <div className="bg-white rounded-[24px] w-full max-w-lg overflow-hidden relative border border-[#e1e5f1] shadow-2xl animate-in fade-in zoom-in duration-200">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f8f9fb] text-[#90a0be] hover:text-[#11182d] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-7">
            <h3 className="font-display text-[1rem] font-semibold text-[#11182d] mb-1">Modify Review</h3>
            <p className="font-body text-[0.76rem] text-[#6d7892] mb-6 font-medium">Your feedback helps the community shop better.</p>

            <div className="space-y-5">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fb] rounded-2xl border border-[#eef2ff]">
                <div className="w-14 h-14 bg-white rounded-xl p-1.5 border border-[#eef2ff]">
                  <img 
                    src={review.product?.images?.[0] || review.product?.variants?.[0]?.images?.[0] || "/placeholder.jpg"} 
                    alt="" 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <p className="font-display text-[0.82rem] font-semibold text-[#11182d] line-clamp-1">{review.product?.name}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col items-center gap-3">
                <span className="font-body text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.14em]">Overall Satisfaction</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        className={`w-9 h-9 ${
                          s <= (hoverRating || rating)
                            ? "text-[#ffb800] fill-[#ffb800]"
                            : "text-[#f1f4f9] fill-[#f1f4f9]"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="font-body text-[9px] font-bold text-[#6d7892] uppercase tracking-widest mb-2 block px-1">Detailed Experience</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows="4"
                  className="w-full px-5 py-4 bg-[#f8f9fb] border border-[#e1e5f1] rounded-2xl font-body text-[0.82rem] text-[#11182d] focus:outline-none focus:border-[#0f49d7] focus:ring-4 focus:ring-[#0f49d7]/5 transition-all resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-3.5 border border-[#e1e5f1] text-[#11182d] font-semibold rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#f8f9fb] transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-3.5 bg-[#11182d] text-white font-semibold rounded-xl text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 pb-20 text-[#11182d]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="h-1 w-8 rounded-full bg-[#0f49d7]"></span>
               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0f49d7]">Account Community</span>
            </div>
            <h1 className="text-[1.75rem] font-bold text-[#11182d] tracking-tight">Product Feedback</h1>
            <p className="text-[0.85rem] text-[#64748b] mt-1.5 font-medium">Manage and view all the reviews you've shared</p>
          </div>
          <div className="bg-white px-8 py-5 rounded-[24px] border border-[#e2e8f0] flex items-center gap-5 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-[#eff6ff] flex items-center justify-center text-[#0f49d7]">
               <MessageSquare className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[1.5rem] font-bold text-[#11182d] leading-none">{reviews.length}</p>
               <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mt-1">Total Reviews</p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#e2e8f0] p-16 md:p-24 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#f8fafc] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-[#94a3b8] border border-[#f1f5f9]">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-[1.25rem] font-bold text-[#11182d]">No reviews found</h3>
            <p className="text-[0.88rem] text-[#64748b] mt-2 mb-8 max-w-xs mx-auto font-medium leading-relaxed">
              Your feedback helps other shoppers make better decisions. Share your thoughts on your recent orders!
            </p>
            <button 
              onClick={() => navigate("/my-orders")}
              className="px-10 py-3.5 bg-[#11182d] text-white font-bold rounded-xl text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/5"
            >
              Check My Orders
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {reviews.map((rev) => (
              <div 
                key={rev._id} 
                className="bg-white rounded-[16px] border border-[#e2e8f0] p-4 shadow-sm transition-all hover:border-[#0f49d7]/30"
              >
                <div className="flex flex-col gap-3">
                  {/* Product Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f8fafc] border border-[#f1f5f9] flex items-center justify-center p-1.5 flex-shrink-0">
                      <img 
                        src={rev.product?.images?.[0] || rev.product?.variants?.[0]?.images?.[0] || "/placeholder.jpg"} 
                        alt={rev.product?.name || "Product"} 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[0.78rem] font-bold text-[#11182d] truncate cursor-pointer hover:text-[#0f49d7]" onClick={() => navigate(`/product-detail/${rev.product?._id}`)}>
                        {rev.product?.name || "Product"}
                      </h4>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-2.5 h-2.5 ${i < (rev.rating || 5) ? "text-[#ffb800] fill-[#ffb800]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="bg-[#f8fafc] rounded-lg p-3 border border-[#f1f5f9] h-[80px] overflow-y-auto">
                    <p className="text-[0.74rem] text-[#334155] italic leading-relaxed font-medium">
                      "{rev.comment || "No comment."}"
                    </p>
                  </div>

                  {/* Footer Actions & Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingReview(rev)}
                        className="p-2 rounded-lg border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc] transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(rev._id)}
                        className="p-2 rounded-lg border border-[#fee2e2] text-[#ef4444] hover:bg-[#fef2f2] transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingReview && (
        <EditReviewModal 
          review={editingReview} 
          onClose={() => setEditingReview(null)} 
          onRefresh={fetchMyReviews}
        />
      )}
    </div>
  );
};

export default MyReviews;
