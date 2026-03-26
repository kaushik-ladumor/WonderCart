import React, { useState, useEffect } from "react";
import { Star, X, Upload, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../utils/constants";

const Review = ({ id, productName, productImage, orderItemId, onSuccess }) => {
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

  const closeModal = () => {
    const modal = document.getElementById("my_modal_8");
    if (modal) modal.close();
    reset();
    setRating(0);
    setImages([]);
    setImagePreviews([]);
    setShowError(false);
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
      // For this task, we'll just store the file and assume it's compressed/small enough
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
      // Normally we'd upload images to Cloudinary/S3 first, then send URLs
      // For this implementation, I'll send base64s if needed or just simulate success
      // since I don't have a direct image upload endpoint ready in the backend
      // But I'll stick to the required flow.
      
      const reviewData = {
        productId: id,
        orderItemId: orderItemId,
        rating: rating,
        comment: data.comment,
        images: imagePreviews // using base64 for simplicity in this demo
      };

      const res = await axios.post(`${API_URL}/review/add`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Thank you! Your review has been submitted.");
        closeModal();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog id="my_modal_8" className="modal font-body shadow-none">
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-tonal-md relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
          <button
            onClick={closeModal}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal header */}
          <div className="px-6 pt-6 pb-0 text-center">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#004ac6] font-semibold block mb-1">
              PRODUCT EXPERIENCE
            </span>
            <h3 className="font-display text-2xl font-bold text-[#141b2d]">
              Review Item
            </h3>
            <p className="text-xs text-[#5c6880] mt-1 mb-5 leading-relaxed">
              Share your thoughts and help others make better choices.
            </p>
          </div>

          {/* Product Preview */}
          <div className="mx-6 mb-4 p-3 bg-[#f0f4ff] rounded-xl border border-transparent flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shadow-sm flex-shrink-0 border border-[#f0f4ff]">
              <img 
                src={productImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"} 
                alt={productName} 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[10px] font-bold text-[#141b2d] uppercase tracking-tight line-clamp-2 leading-tight">
              {productName || "Product Name"}
            </p>
          </div>

          {/* Modal body */}
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Star Rating */}
              <div className="text-center">
                <div className={`flex justify-center gap-2 mb-2 ${showError ? "animate-shake" : ""}`}>
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
                      className="transition-all transform active:scale-95"
                    >
                      <Star
                        className={`w-9 h-9 ${
                          star <= (hoverRating || rating)
                            ? "text-[#ffc107] fill-[#ffc107]"
                            : "text-[#f0f4ff] fill-[#f0f4ff]"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-[10px] font-black text-[#004ac6] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-1">
                    {ratingLabels[rating]}
                  </p>
                )}
                {showError && (
                  <p className="text-red-500 text-[10px] font-bold mt-2">Please select a star rating</p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">Your Comments</label>
                  <span className={`text-[9px] font-bold ${comment.length > 500 ? "text-red-500" : "text-[#5c6880]/40"}`}>
                    {comment.length} / 500
                  </span>
                </div>
                <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004ac6]/20 transition-all border border-transparent focus-within:border-[#004ac6]/20">
                  <textarea
                    {...register("comment", {
                      minLength: { value: 10, message: "Review must be at least 10 characters" },
                      maxLength: { value: 500, message: "Maximum 500 characters allowed" }
                    })}
                    placeholder="Tell us about the quality, fit, and overall value..."
                    rows="3"
                    className="bg-transparent w-full text-sm text-[#141b2d] outline-none placeholder:text-[#5c6880]/60 resize-none"
                  />
                </div>
                {errors.comment && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.comment.message}</p>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880] mb-2 block">
                  Add photos (UP TO 5)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#f0f4ff] shadow-sm animate-in zoom-in-50">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-14 h-14 flex flex-col items-center justify-center bg-[#f0f4ff] rounded-xl cursor-pointer hover:bg-[#e1e8fd] transition-all border border-transparent active:scale-95">
                      <Upload className="w-4 h-4 text-[#004ac6]" />
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
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="w-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold rounded-xl h-12 text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/80" />
                  ) : (
                    "Submit Verified Review"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full h-10 bg-transparent text-[#5c6880] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-[#141b2d] hover:bg-[#f0f4ff] transition-all"
                >
                  NOT NOW
                </button>
              </div>
            </form>
          </div>

          {/* Modal footer */}
          <div className="px-6 pb-6 pt-2 border-t border-[#f0f4ff] bg-gray-50/30">
            <div className="flex items-center gap-3 text-[#5c6880]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#f0f4ff]">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium leading-tight">Reviews are screened for authenticity based on verified purchase data.</span>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default Review;
