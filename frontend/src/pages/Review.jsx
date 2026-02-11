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
    <dialog id="my_modal_8" className="modal">
      <div className="modal-box bg-white max-w-md p-5 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Write a Review</h3>
            <p className="text-gray-600 text-xs mt-0.5">
              Share your experience with this product
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {rating}.0
                  </span>
                )}
              </div>
              {rating === 0 ? (
                <p className="text-xs text-gray-500">Click on a star to rate</p>
              ) : (
                <p className="text-xs text-green-600 font-medium">
                  {rating} star{rating !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Your Review *
              </label>
              <textarea
                placeholder="Share your experience with this product. What did you like or dislike?"
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white resize-none"
                {...register("comment", {
                  required: "Review is required",
                  minLength: {
                    value: 10,
                    message: "Review must be at least 10 characters",
                  },
                })}
              />
              {errors.comment && (
                <span className="text-red-500 text-xs block text-left mt-1">
                  {errors.comment.message}
                </span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Your review will be posted publicly on the product page
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  );
};

export default Review;
