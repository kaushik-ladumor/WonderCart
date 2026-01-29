import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Check if user is logged in
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to submit a review");
      navigate("/login");
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
        "http://localhost:4000/review/add",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    <>
      <dialog id="my_modal_8" className="modal">
        <div className="modal-box bg-white max-w-md p-8">
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-gray-400 hover:text-white"
              onClick={closeModal}
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          <h3 className="font-bold text-2xl text-black mb-6">Write a Review</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Rating Section */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
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
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {rating} out of 5
                    </span>
                  )}
                </div>
                {rating === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Click on a star to rate
                  </p>
                )}
              </div>

              {/* Comment Section */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Your Review
                </label>
                <textarea
                  placeholder="Share your experience with this product..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-400 resize-none"
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
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 10 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>

              <p className="text-center text-xs text-gray-500">
                Your review will be posted publicly on the product page
              </p>
            </div>
          </form>
        </div>

        {/* Modal backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default Review;
