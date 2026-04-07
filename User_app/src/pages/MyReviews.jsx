import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative shadow-2xl">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-8">
            <h3 className="text-[1.1rem] font-semibold text-[#11182d] mb-2 uppercase tracking-tight">Edit Your Review</h3>
            <p className="text-[0.76rem] text-[#6d7892] mb-8 font-medium">Update your experience with this product</p>

            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fc] rounded-2xl border border-[#edf1f8]">
                <img 
                  src={review.product?.images?.[0] || review.product?.variants?.[0]?.images?.[0] || "/placeholder.jpg"} 
                  alt="" 
                  className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                />
                <div>
                  <p className="text-[0.82rem] font-semibold text-[#11182d] line-clamp-1">{review.product?.name}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                  >
                    <Star
                      className={`w-10 h-10 ${
                        s <= (hoverRating || rating)
                          ? "text-[#ffb800] fill-[#ffb800]"
                          : "text-[#e2e8f0] fill-[#e2e8f0]"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <div>
                <label className="text-[10px] font-semibold text-[#6d7892] uppercase tracking-widest mb-2 block px-1">Your Thoughts</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? How's the quality?"
                  rows="4"
                  className="w-full px-5 py-4 bg-[#f8f9fc] border border-[#edf1f8] rounded-2xl text-[0.82rem] focus:outline-none focus:border-[#0f49d7] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 border border-[#d8ddea] text-[#11182d] font-semibold rounded-2xl text-[0.76rem] uppercase tracking-widest hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 bg-[#0f49d7] text-white font-semibold rounded-2xl text-[0.76rem] uppercase tracking-widest hover:bg-[#003da3] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : "Update Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11182d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-[1.5rem] font-semibold text-[#11182d] tracking-tight">Product Feedback</h1>
            <p className="text-[0.82rem] text-[#5d6a84] mt-2">Manage all the reviews you've shared with the community</p>
          </div>
          <div className="bg-white px-8 py-5 rounded-[16px] flex flex-col items-center justify-center min-w-[140px] shadow-sm">
            <p className="text-[1.8rem] font-semibold text-[#0f49d7] leading-none mb-1">{reviews.length || 1}</p>
            <p className="text-[9px] font-bold text-[#5c6880] uppercase tracking-[0.16em]">Total Reviews</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-[#edf1f8] p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#eef2ff] rounded-full flex items-center justify-center mx-auto mb-6 text-[#0f49d7]">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-[1.1rem] font-semibold text-[#11182d]">No reviews found</h3>
            <p className="text-[0.82rem] text-[#5d6a84] mt-2 mb-8 max-w-xs mx-auto">
              You haven't shared your feedback on any products yet.
            </p>
            <button 
              onClick={() => navigate("/my-orders")}
              className="px-8 py-4 bg-[#11182d] text-white font-semibold rounded-2xl text-[0.74rem] uppercase tracking-widest hover:scale-[1.02] transition-transform"
            >
              Check My Orders
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div 
                key={rev._id} 
                className="bg-white rounded-[24px] border border-[#edf1f8] p-6 sm:p-8 shadow-sm group"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Product Info */}
                  <div className="flex-shrink-0 w-full sm:w-36 aspect-square rounded-[8px] overflow-hidden bg-[#11182d] flex items-center justify-center">
                    <img 
                      src={rev.product?.images?.[0] || rev.product?.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=80"} 
                      alt={rev.product?.name || "Product"} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 w-full pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-[1.1rem] font-semibold text-[#11182d] mb-3 leading-none">
                          {rev.product?.name || "Puma EvoSpeed Football"}
                        </h4>
                        <div className="flex gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < (rev.rating || 5) ? "text-[#ffb800] fill-[#ffb800]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingReview(rev)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1e5f1] text-[#42506d] font-semibold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(rev._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#f0c9c9] text-[#d12828] font-semibold text-[10px] uppercase tracking-widest hover:bg-[#fff5f5] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#f0f3fa] rounded-xl p-4 mb-5">
                      <p className="text-[0.82rem] text-[#42506d] italic leading-relaxed">
                        "{rev.comment || "this Football is looking good and play to flexible"}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                          rev.status === 'approved' || !rev.status ? 'bg-[#eaf8ef] text-[#15753a]' : 'bg-[#fff5f5] text-[#d12828]'
                        }`}>
                          {rev.status || 'APPROVED'}
                        </span>
                        <span className="text-[9px] font-semibold text-[#6d7892] uppercase tracking-[0.1em]">
                          Submitted: {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US') : "6/4/2026"}
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
