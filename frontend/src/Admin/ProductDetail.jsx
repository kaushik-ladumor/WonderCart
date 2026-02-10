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
      <div className="modal-box p-0 max-w-4xl rounded-xl overflow-hidden bg-white">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex flex-col lg:flex-row max-h-[85vh]">
          {/* Left Column - Images */}
          <div className="lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
              <img
                src={
                  currentVariant?.images?.[currentImageIndex] ||
                  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=800&fit=crop&q=80"
                }
                alt={product.name}
                className="w-full h-full object-contain p-6"
              />

              {/* Navigation Arrows */}
              {currentVariant?.images && currentVariant.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {currentVariant?.images && currentVariant.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {currentVariant.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {currentVariant?.images && currentVariant.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {currentVariant.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border transition-all ${currentImageIndex === index
                      ? "border-black shadow-sm"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover bg-white p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-1/2 p-4 md:p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <StatusIndicator status={product.status} />
                <h1 className="text-xl font-bold text-gray-900 mt-3 mb-2 tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">
                    {product.category || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Rating */}
              {product.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.averageRating)
                          ? "fill-black text-black"
                          : "fill-none text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({product.numReviews} review
                    {product.numReviews !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                {/* Color Selection */}
                {product.variants && product.variants.length > 1 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                      Color
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {product.variants.map((variant, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedVariant(index);
                            setSelectedSize(0);
                            setCurrentImageIndex(0);
                          }}
                          className={`px-3 py-1.5 text-sm border rounded-md font-medium transition-all ${selectedVariant === index
                            ? "border-black bg-black text-white"
                            : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                            }`}
                        >
                          {variant.color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {currentVariant?.sizes && currentVariant.sizes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                      Storage / Size
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {currentVariant.sizes.map((sizeOption, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSize(index)}
                          className={`px-3 py-1.5 text-sm border rounded-md font-medium transition-all ${selectedSize === index
                            ? "border-black bg-black text-white"
                            : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                            } ${sizeOption.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={sizeOption.stock === 0}
                        >
                          <div className="flex flex-col items-center">
                            <span>{sizeOption.size}</span>
                            {sizeOption.stock === 0 && (
                              <span className="text-xs mt-0.5">
                                Out of stock
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing */}
              {currentSize && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{discountedPrice.toLocaleString("en-IN")}
                    </span>
                    {currentSize.discount > 0 && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{currentSize.originalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          {currentSize.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span
                      className={
                        currentSize.stock > 0
                          ? "font-semibold text-emerald-700"
                          : "font-semibold text-red-600"
                      }
                    >
                      {currentSize.stock > 0
                        ? `${currentSize.stock} units in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Listed on{" "}
                    <span className="font-medium">
                      {new Date(product.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Product ID:{" "}
                  <span className="font-mono">{product._id?.slice(-8)}</span>
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
