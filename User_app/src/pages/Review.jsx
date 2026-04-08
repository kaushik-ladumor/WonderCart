import React, { useState, useEffect } from "react";
import { Star, X, Upload, Check, Loader2, Trash2, ChevronRight, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../utils/constants";

const Review = ({ id, productName, productImage, orderItemId, onSuccess, isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      comment: ""
    }
  });

  const comment = watch("comment", "");

  const ratingLabels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent"
  };

  if (!isOpen) return null;

  const internalClose = () => {
    reset();
    setRating(0);
    setImages([]);
    setImagePreviews([]);
    setShowError(false);
    onClose();
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    for (const file of files) {
      // Format check
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Only JPG, PNG or WEBP allowed");
        continue;
      }

      // Size check (1MB)
      if (file.size > 1024 * 1024) {
        toast.error("Image must be under 1MB");
        continue;
      }

      // Previews
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);

      // Client-side compression "simulation" (In real app, use canvas or library)
      newImages.push(file);
    }

    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data) => {
    if (rating === 0) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const reviewData = {
        productId: id,
        orderItemId: orderItemId,
        rating: rating,
        comment: data.comment,
        images: imagePreviews // using base64 for simplicity
      };

      const res = await axios.post(`${API_URL}/review/add`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Thank you! Your review has been submitted.");
        internalClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#11182d]/20 backdrop-blur-[4px] font-body text-[#11182d]">
      <div className="bg-white rounded-[24px] w-full max-w-[400px] border border-[#e1e5f1] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={internalClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#f8f9fb] text-[#90a0be] hover:text-[#11182d] transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal header */}
        <div className="px-7 pt-7 pb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#0f49d7] font-semibold block mb-1">
            Verified Experience
          </span>
          <h3 className="font-display text-[1.1rem] font-semibold text-[#11182d]">
            Review Your Purchase
          </h3>
        </div>

        {/* Product Preview */}
        <div className="mx-7 mb-4 p-3 bg-[#f8f9fb] rounded-[18px] border border-[#eef2ff] flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-[#eef2ff] p-1.5 shadow-sm">
            <img 
              src={productImage || "/placeholder.jpg"} 
              alt={productName} 
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <p className="font-display text-[0.76rem] font-semibold text-[#11182d] line-clamp-2 leading-tight">
            {productName}
          </p>
        </div>

        {/* Modal body */}
        <div className="px-7 pb-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <div className={`flex justify-center gap-1.5 mb-2 ${showError ? "animate-shake" : ""}`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(star);
                      setShowError(false);
                    }}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        star <= (hoverRating || rating)
                          ? "text-[#ffb800] fill-[#ffb800]"
                          : "text-[#f1f4f9] fill-[#f1f4f9]"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 ? (
                <p className="text-[10px] font-bold text-[#0f49d7] uppercase tracking-[0.18em] animate-in fade-in slide-in-from-top-1 duration-300">
                  {ratingLabels[rating]}
                </p>
              ) : (
                <p className="text-[10px] font-bold text-[#6d7892] uppercase tracking-[0.18em]">TAP TO RATE</p>
              )}
              {showError && (
                <p className="text-[#d12828] text-[9px] font-bold mt-2 uppercase tracking-wide">Rating is mandatory</p>
              )}
            </div>

            {/* Review Text */}
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="font-body text-[9px] uppercase tracking-widest font-bold text-[#6d7892]">Description</label>
                <span className={`text-[9px] font-bold ${comment.length > 500 ? "text-[#d12828]" : "text-[#6d7892]"}`}>
                  {comment.length}/500
                </span>
              </div>
              <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-[#e1e5f1] focus-within:border-[#0f49d7] transition-all">
                <textarea
                  {...register("comment", {
                    minLength: { value: 10, message: "Review must be at least 10 characters" },
                    maxLength: { value: 500, message: "Maximum 500 characters allowed" }
                  })}
                  placeholder="Share your experience with this item..."
                  rows="3"
                  className="bg-transparent w-full font-body text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#90a0be] resize-none font-medium leading-relaxed"
                />
              </div>
              {errors.comment && (
                <p className="text-[#d12828] text-[9px] font-bold mt-1.5 ml-1 uppercase tracking-wide">{errors.comment.message}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="font-body text-[9px] uppercase tracking-widest font-bold text-[#6d7892] mb-2.5 block px-1">
                Attachment (UP TO 5)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#eef2ff] group/img shadow-sm animate-in zoom-in duration-200">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-14 h-14 flex flex-col items-center justify-center bg-[#f8f9fb] rounded-xl cursor-pointer border-2 border-dashed border-[#e1e5f1] hover:border-[#0f49d7] hover:bg-[#eef2ff] transition-all text-[#90a0be] hover:text-[#0f49d7] group">
                    <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <input 
                      type="file" 
                      multiple 
                      accept="image/jpeg,image/png,image/webp" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-[#11182d] text-white font-semibold rounded-xl h-11 text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                ) : (
                  <>Submit Feedback <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modal footer */}
        <div className="px-7 py-5 bg-[#f8f9fb] border-t border-[#e1e5f1]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#eef2ff] flex-shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#15753a]" />
            </div>
            <span className="text-[9px] font-bold text-[#6d7892] uppercase tracking-tight flex-1 leading-[1.3] pt-0.5">Community standards: Reviews are internally screened for authenticity and policy compliance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
