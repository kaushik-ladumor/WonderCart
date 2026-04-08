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
    <div className="min-h-screen bg-[#f8f9fb] py-6 pb-20 font-body text-[#11182d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0f49d7] mb-1.5 block">Account Community</span>
            <h1 className="font-display text-[1.5rem] sm:text-[1.75rem] font-semibold text-[#11182d] leading-none tracking-tight">Product Feedback</h1>
            <p className="font-body text-[0.82rem] text-[#42506d] mt-2 font-medium">Manage all the reviews you've shared</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-[18px] border border-[#e1e5f1] flex flex-col items-center justify-center min-w-[120px] shadow-sm">
            <p className="text-[1.5rem] font-semibold text-[#0f49d7] leading-none mb-1">{reviews.length}</p>
            <p className="text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.14em]">Total Reviews</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#e1e5f1] p-16 md:p-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#f8f9fb] rounded-[20px] flex items-center justify-center mx-auto mb-6 text-[#90a0be]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-display text-[1.1rem] font-semibold text-[#11182d]">No reviews found</h3>
            <p className="font-body text-[0.82rem] text-[#42506d] mt-2 mb-8 max-w-xs mx-auto font-medium leading-relaxed">
              You haven't shared your feedback on any products yet.
            </p>
            <button 
              onClick={() => navigate("/my-orders")}
              className="px-8 py-3 bg-[#11182d] text-white font-semibold rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-black/10"
            >
              Check My Orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div 
                key={rev._id} 
                className="bg-white rounded-[20px] border border-[#e1e5f1] p-5 sm:p-6 shadow-sm group hover:border-[#0f49d7]/20 transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Product Info */}
                  <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] overflow-hidden bg-[#f8f9fb] border border-[#eef2ff] flex items-center justify-center p-2">
                    <img 
                      src={rev.product?.images?.[0] || rev.product?.variants?.[0]?.images?.[0] || "/placeholder.jpg"} 
                      alt={rev.product?.name || "Product"} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 w-full pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-display text-[0.88rem] font-semibold text-[#11182d] mb-1.5 leading-tight group-hover:text-[#0f49d7] transition-colors">
                          {rev.product?.name || "Ordered Product"}
                        </h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? "text-[#ffb800] fill-[#ffb800]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingReview(rev)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#eef2ff] text-[#42506d] font-semibold text-[9px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(rev._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f0c9c9] text-[#d12828] font-semibold text-[9px] uppercase tracking-widest hover:bg-[#fff5f5] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#f8f9fd] rounded-xl p-4 mb-4 border border-[#eef2ff]">
                      <p className="font-body text-[0.82rem] text-[#42506d] italic leading-relaxed font-medium">
                        "{rev.comment || "No comment provided."}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                          rev.status === 'approved' || !rev.status ? 'bg-[#e7f6ed] text-[#15753a] border-[#d1f2e0]' : 'bg-[#fff5f5] text-[#d12828] border-[#f0c9c9]'
                        }`}>
                          {rev.status || 'APPROVED'}
                        </span>
                        <span className="text-[9px] font-semibold text-[#6d7892] uppercase tracking-[0.1em]">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                        </span>
                    </div>
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
