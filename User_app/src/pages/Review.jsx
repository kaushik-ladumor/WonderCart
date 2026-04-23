import React, { useState, useEffect } from "react";
import { Star, X, Upload, Check, Loader2, Trash2, ChevronRight, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-white rounded-[18px] w-full max-w-[400px] border border-[#e1e5f1] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={internalClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-7 pb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d7892] mb-1">
            Verified Experience
          </p>
          <h3 className="text-[1.3rem] font-semibold text-[#11182d]">
            Review Purchase
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1.5 leading-relaxed">
            Share your authentic feedback with the community.
          </p>
        </div>

        {/* Product Preview */}
        <div className="mx-6 mb-5 p-3 bg-[#f8f9fb] rounded-[14px] border border-[#eef2ff] flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-white overflow-hidden flex-shrink-0 border border-[#eef2ff] p-1 shadow-sm">
            <img 
              src={productImage || "/placeholder.jpg"} 
              alt={productName} 
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <p className="text-[0.72rem] font-bold text-[#11182d] line-clamp-1 leading-tight flex-1">
            {productName}
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 overflow-y-auto scrollbar-hide">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Star Rating */}
            <div className="text-center bg-[#fcfdfe] py-4 rounded-[14px] border border-[#f0f4ff]">
              <div className={`flex justify-center gap-1.5 mb-2.5 ${showError ? "animate-shake" : ""}`}>
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
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "text-[#ffb800] fill-[#ffb800]"
                          : "text-[#f1f4f9] fill-[#f1f4f9]"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 ? (
                <p className="text-[9px] font-bold text-[#0f49d7] uppercase tracking-[0.16em] animate-in fade-in slide-in-from-top-1 duration-300">
                  {ratingLabels[rating]}
                </p>
              ) : (
                <p className="text-[9px] font-bold text-[#6d7892] uppercase tracking-[0.16em]">TAP TO RATE</p>
              )}
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892]">Experience</label>
                <span className={`text-[9px] font-bold ${comment.length > 500 ? "text-red-500" : "text-[#b3bdd2]"}`}>
                  {comment.length}/500
                </span>
              </div>
              <div className="bg-white rounded-[14px] px-4 py-3 border border-[#d7dcea] focus-within:border-[#0f49d7] focus-within:ring-1 focus-within:ring-[#0f49d7] transition-all">
                <textarea
                  {...register("comment", {
                    minLength: { value: 10, message: "Review must be at least 10 characters" },
                    maxLength: { value: 500, message: "Maximum 500 characters allowed" }
                  })}
                  placeholder="Share your experience with this item..."
                  rows="3"
                  className="bg-transparent w-full text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#b3bdd2] resize-none font-medium leading-relaxed"
                />
              </div>
              {errors.comment && (
                <p className="text-red-500 text-[9px] font-bold px-1 uppercase tracking-wide">{errors.comment.message}</p>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d7892] px-1 block">
                Attachments (Optional)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-[12px] overflow-hidden border border-[#eef2ff] group/img shadow-sm animate-in zoom-in duration-200">
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
                  <label className="w-12 h-12 flex flex-col items-center justify-center bg-[#f8f9fb] rounded-[12px] cursor-pointer border border-dashed border-[#d7dcea] hover:border-[#0f49d7] hover:bg-[#eef2ff] transition-all text-[#90a0be] hover:text-[#0f49d7] group">
                    <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
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

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.78rem] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>Submit Review <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </div>
          </form>
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
};

export default Review;
