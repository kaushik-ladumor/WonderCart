import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/constants";

const Review = ({ id, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const closeModal = () => {
    document.getElementById("my_modal_8")?.close();
    reset({ comment: "" });
    setRating(0);
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to submit a review");
      document.getElementById("login_modal")?.showModal();
      closeModal();
      setIsSubmitting(false);
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      setIsSubmitting(false);
      return;
    }

    const reviewData = {
      productId: id,
      rating: rating,
      comment: data.comment,
    };

    try {
      const result = await axios.post(
        `${API_URL}/review/add`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (result.data) {
        toast.success("Review submitted successfully");
        closeModal();

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog id="my_modal_8" className="modal font-body">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button
            onClick={closeModal}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal header */}
          <div className="px-6 pt-6 pb-0 text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
              SHARE YOUR EXPERIENCE
            </span>
            <h3 className="font-display text-2xl font-bold text-[#141b2d]">
              Write a Review
            </h3>
            <p className="text-xs text-[#5c6880] mt-1 mb-5">
              How would you rate this artifact?
            </p>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Rating Selection */}
              <div className="bg-[#f0f4ff] rounded-2xl p-4 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating)
                          ? "text-[#004ac6] fill-[#004ac6]"
                          : "text-[#5c6880]/20"
                          }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#004ac6]">
                  {rating > 0 ? `${rating} Stars Selected` : "Tap to rate"}
                </p>
              </div>

              {/* Comment Section */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-1.5 block">
                  Your Perspective
                </label>
                <textarea
                  placeholder="Share your experience with this artifact..."
                  rows="4"
                  className="w-full px-4 py-3 bg-[#f0f4ff] rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#004ac6]/20 transition-all border border-transparent focus:border-[#004ac6]/20 text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/50 resize-none"
                  {...register("comment", {
                    required: "Review is required",
                    minLength: {
                      value: 10,
                      message: "Min 10 characters",
                    },
                  })}
                />
                {errors.comment && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.comment.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#141b2d] text-white font-bold rounded-xl py-3.5 text-sm hover:bg-[#004ac6] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-black/5"
              >
                {isSubmitting ? "Publishing..." : "Publish Review"}
              </button>
            </form>
          </div>

          {/* Modal footer */}
          <div className="px-6 pb-6 pt-2 text-center">
            <p className="text-[10px] text-[#5c6880] leading-relaxed">
              Your review will be shared with the WonderCart community to help others curate their collection.
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default Review;
