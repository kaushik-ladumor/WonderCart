import React, { useState } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Package,
  IndianRupee,
} from "lucide-react";

const ProductDetailModal = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const currentVariant = product.variants?.[selectedVariant];
  const currentSize = currentVariant?.sizes?.[selectedSize];

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

  const StatusBadge = ({ status }) => {
    const config = {
      pending: {
        icon: <Clock className="w-3 h-3" />,
        bg: "bg-gray-100",
        text: "text-gray-900",
        border: "border-gray-200",
      },
      approved: {
        icon: <CheckCircle className="w-3 h-3" />,
        bg: "bg-gray-900",
        text: "text-white",
        border: "border-gray-800",
      },
      rejected: {
        icon: <XCircle className="w-3 h-3" />,
        bg: "bg-gray-200",
        text: "text-gray-900",
        border: "border-gray-300",
      },
    };

    const { bg, text, border } = config[status] || config.pending;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider border ${bg} ${text} ${border}`}
      >
        {status}
      </div>
    );
  };

  return (
    <dialog
      id="product_detail_modal"
      className="modal backdrop:bg-black/50 p-0"
    >
      <div className="bg-white w-full max-w-4xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <StatusBadge status={product.status} />
          <button
            onClick={closeModal}
            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <X className="w-3.5 h-3.5 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Images */}
          <div className="lg:w-1/2 bg-gray-50 p-6 border-r border-gray-200">
            <div className="relative aspect-square flex items-center justify-center">
              <img
                src={
                  currentVariant?.images?.[currentImageIndex] ||
                  "/placeholder.png"
                }
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />

              {/* Image Navigation */}
              {currentVariant?.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-900" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {currentVariant?.images?.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {currentVariant.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-12 h-12 border ${currentImageIndex === index
                        ? "border-black bg-white"
                        : "border-gray-200 bg-white/50 hover:border-gray-400"
                      } transition-colors p-1`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-1/2 p-5">
            <div className="space-y-5">
              {/* Title & Category */}
              <div>
                <h2 className="text-sm font-medium text-gray-900 uppercase tracking-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                    {product.category || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-3 border border-gray-200">
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Variants / Colors */}
              {product.variants?.length > 0 && (
                <div>
                  <h3 className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Color / Variant
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedVariant(index);
                          setSelectedSize(0);
                          setCurrentImageIndex(0);
                        }}
                        className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider border ${selectedVariant === index
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          } transition-colors`}
                      >
                        {variant.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes & Pricing */}
              <div>
                <h3 className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Size & Pricing
                </h3>
                <div className="space-y-1.5">
                  {currentVariant?.sizes?.map((size, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedSize(index)}
                      className={`flex items-center justify-between p-2.5 border text-xs cursor-pointer ${selectedSize === index
                          ? "border-black bg-gray-50"
                          : "border-gray-200 bg-white hover:border-gray-400"
                        } transition-colors`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2 h-2 rounded-full ${size.stock > 0 ? "bg-gray-900" : "bg-gray-300"
                            }`}
                        />
                        <span className="text-[11px] font-medium uppercase tracking-wider">
                          {size.size}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {size.stock} in stock
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">
                          ₹{size.sellingPrice?.toLocaleString()}
                        </span>
                        {size.originalPrice > size.sellingPrice && (
                          <span className="text-[9px] text-gray-400 line-through">
                            ₹{size.originalPrice?.toLocaleString()}
                          </span>
                        )}
                        {size.discount > 0 && (
                          <span className="text-[9px] font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5">
                            {size.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Meta */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-[9px] text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3 h-3" />
                    <span>ID: {product._id || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {product.status === "pending" && (
                <div className="pt-2">
                  <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Review Actions
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // This will be handled by parent component
                        document.getElementById("product_detail_modal").close();
                      }}
                      className="flex-1 py-2 bg-gray-900 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById("product_detail_modal").close();
                      }}
                      className="flex-1 py-2 bg-gray-200 text-gray-900 text-[10px] font-medium uppercase tracking-wider hover:bg-gray-300 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop Click to Close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ProductDetailModal;
