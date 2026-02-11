import React, { useState } from "react";
import {
  X,
  Star,
  Package,
  Tag,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function ProductDetailModal({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const currentVariant = product.variants?.[selectedVariant];
  const currentSize = currentVariant?.sizes?.[selectedSize];
  const discountedPrice = currentSize?.sellingPrice || 0;

  const closeModal = () => {
    document.getElementById("product_detail_modal").close();
  };

  const nextImage = () => {
    if (currentVariant?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % currentVariant.images.length);
    }
  };

  const prevImage = () => {
    if (currentVariant?.images) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + currentVariant.images.length) %
          currentVariant.images.length,
      );
    }
  };

  const StatusIndicator = ({ status }) => {
    const config = {
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
      },
      approved: {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
      },
      rejected: {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200",
      },
    };

    const { bg, text, border } = config[status] || config.pending;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="font-semibold tracking-wide capitalize">{status}</span>
      </div>
    );
  };

  return (
    <dialog
      id="product_detail_modal"
      className="modal backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="modal-box p-0 max-w-5xl rounded-3xl overflow-hidden bg-white shadow-2xl">
        {/* Header Overlay (Mobile) */}
        <div className="lg:hidden absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <StatusIndicator status={product.status} />
          <button
            onClick={closeModal}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/10 backdrop-blur-md text-black hover:bg-black/20 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Close Button */}
        <button
          onClick={closeModal}
          className="hidden lg:flex absolute top-6 right-6 z-20 w-12 h-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-black hover:bg-white border border-gray-100 shadow-sm transition-all duration-300 active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] lg:max-h-[800px]">
          {/* Left Column - Visual Gallery */}
          <div className="lg:w-[55%] bg-[#F9FBFC] flex flex-col h-full border-r border-gray-50">
            <div className="flex-1 relative flex items-center justify-center p-8 md:p-12 min-h-[300px] lg:min-h-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(249,251,252,1)_100%)]" />
              <img
                src={currentVariant?.images?.[currentImageIndex] || "/placeholder.png"}
                alt={product.name}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out"
              />

              {/* Gallery Navigation */}
              {currentVariant?.images?.length > 1 && (
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                  <button
                    onClick={prevImage}
                    className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white hover:bg-white transition-all active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white hover:bg-white transition-all active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails Strip */}
            {currentVariant?.images?.length > 1 && (
              <div className="px-6 py-6 border-t border-gray-100/50 bg-white/50">
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar justify-center">
                  {currentVariant.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${currentImageIndex === index
                          ? "border-black scale-105 shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img src={image} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Context */}
          <div className="lg:w-[45%] flex flex-col bg-white h-full">
            <div className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {/* Meta & Title */}
                <div className="space-y-3">
                  <div className="hidden lg:block">
                    <StatusIndicator status={product.status} />
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {product.category}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
                    Overview
                  </h3>
                  <p className="text-sm border-gray-100 text-gray-600 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>

                {/* Selection Details */}
                <div className="space-y-6">
                  {/* Colors */}
                  {product.variants?.length > 1 && (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
                        Available Variants
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v, i) => (
                          <button
                            key={i}
                            onClick={() => { setSelectedVariant(i); setSelectedSize(0); setCurrentImageIndex(0); }}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all ${selectedVariant === i ? "border-black bg-black text-white" : "border-gray-100 hover:border-gray-200 text-gray-600"
                              }`}
                          >
                            {v.color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes & Direct Price */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Configuration & Inventory
                    </h3>
                    <div className="grid gap-3">
                      {currentVariant?.sizes?.map((size, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border-2 transition-all ${selectedSize === i ? "border-black bg-black/5" : "border-gray-50"
                            }`}
                          onClick={() => setSelectedSize(i)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${size.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="font-black text-gray-900">{size.size}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-gray-900">
                                ₹{size.sellingPrice.toLocaleString()}
                              </div>
                              {size.originalPrice > size.sellingPrice && (
                                <div className="text-[10px] font-bold text-gray-400 line-through">
                                  ₹{size.originalPrice.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-gray-500">
                            <span>Inventory Level: <span className={size.stock < 10 ? 'text-orange-500' : 'text-emerald-500'}>{size.stock} units</span></span>
                            {size.discount > 0 && <span className="text-black font-black">{size.discount}% OFF</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security/ID Footer */}
                <div className="pt-8 border-t border-gray-100 opacity-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Product UID: {product._id}</span>
                  <span>Review Priority: HIGH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close modal by clicking outside */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  );
}

export default ProductDetailModal;
