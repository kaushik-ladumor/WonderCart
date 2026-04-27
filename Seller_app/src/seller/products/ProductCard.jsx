import React from "react";
import { Link } from "react-router-dom";
import { Star, Package, Edit, Eye, Trash2, Tag } from "lucide-react";

const RUPEE = "\u20B9";

const ProductCard = ({ product, onDelete, deleteLoading }) => {
  const getTotalStock = (variants) => {
    if (!variants?.length) return 0;
    return variants.reduce(
      (total, variant) =>
        total +
        (variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0),
      0,
    );
  };

  const getProductImage = (variants) =>
    variants?.[0]?.images?.[0] ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const getPriceRange = (variants) => {
    if (!variants?.length) return `${RUPEE}0`;

    const allPrices = variants
      .flatMap((variant) => variant.sizes?.map((size) => size.sellingPrice || 0) || [0])
      .filter((price) => price > 0);

    if (!allPrices.length) return `${RUPEE}0`;

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    return minPrice === maxPrice
      ? `${RUPEE}${minPrice.toLocaleString()}`
      : `${RUPEE}${minPrice.toLocaleString()} - ${RUPEE}${maxPrice.toLocaleString()}`;
  };

  const stock = getTotalStock(product.variants);
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const hasMultipleColors = product.variants?.length > 1;

  const statusClasses = isOutOfStock
    ? "bg-[#fef0f0] text-[#d14343]"
    : isLowStock
      ? "bg-[#fff4e8] text-[#c77719]"
      : "bg-[#ebf8ef] text-[#18794e]";

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d7dcea] bg-white shadow-sm hover:shadow-md transition-all group font-poppins">
      <Link
        to={`/seller/products/${product._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[#f8f9fd]"
      >
        <img
          src={getProductImage(product.variants)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider border shadow-sm ${isOutOfStock
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : isLowStock
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}
          >
            {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "Active"}
          </span>
        </div>

        {hasMultipleColors && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-[#33415e] shadow-sm border border-white/50">
              <Tag className="h-3 w-3" />
              {product.variants.length} colors
            </span>
          </div>
        )}
      </Link>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#98a4bd]">
              {product.category || "General"}
            </p>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#f8f9fd] px-2 py-0.5 text-[0.7rem] font-bold text-[#11182d] border border-[#f1f4fb]">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.ratingAverage?.toFixed(1) || "0.0"}
            </div>
          </div>

          <Link to={`/seller/products/${product._id}`}>
            <h3 className="line-clamp-1 text-[0.88rem] font-bold leading-tight text-[#11182d] group-hover:text-[#0f49d7] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[12px] border border-[#f1f4fb] bg-[#f8f9fd] p-2.5 shadow-inner">
            <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-wider text-[#98a4bd]">
              Stock
            </p>
            <div className="flex items-center gap-1.5">
              <Package className="h-3 w-3 text-[#98a4bd]" />
              <p
                className={`text-[0.78rem] font-bold ${isOutOfStock
                  ? "text-rose-600"
                  : isLowStock
                    ? "text-amber-600"
                    : "text-emerald-700"
                  }`}
              >
                {stock} <span className="text-[0.65rem] opacity-70">units</span>
              </p>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#f1f4fb] bg-[#f8f9fd] p-2.5 shadow-inner overflow-hidden">
            <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-wider text-[#98a4bd]">
              Price
            </p>
            <p className="truncate text-[0.78rem] font-bold text-[#11182d]">
              {getPriceRange(product.variants)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to={`/seller/products/edit/${product._id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-[12px] bg-[#0f49d7] px-3 py-2 text-[0.72rem] font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>

          <button
            onClick={() => onDelete(product._id)}
            disabled={deleteLoading?.[product._id]}
            className="inline-flex items-center justify-center gap-1.5 rounded-[12px] border border-rose-100 bg-white px-3 py-2 text-[0.72rem] font-bold text-rose-600 hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-60"
          >
            {deleteLoading?.[product._id] ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
