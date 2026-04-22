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
    <div className="overflow-hidden rounded-[24px] border border-[#e3e8ff] bg-white">
      <Link
        to={`/seller/products/${product._id}`}
        className="relative block aspect-square overflow-hidden bg-[#f6f8ff]"
      >
        <img
          src={getProductImage(product.variants)}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses}`}
          >
            {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "Active"}
          </span>
        </div>

        {hasMultipleColors && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#55617f]">
              <Tag className="h-3 w-3" />
              {product.variants.length} colors
            </span>
          </div>
        )}
      </Link>

      <div className="space-y-3.5 p-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.26em] text-[#96a2c2]">
              {product.category || "Uncategorized"}
            </p>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#f5f7ff] px-2.5 py-1 text-[10px] font-semibold text-[#202a42]">
              <Star className="h-3 w-3 fill-[#f2b63d] text-[#f2b63d]" />
              {product.averageRating?.toFixed(1) || "0.0"}
            </div>
          </div>

          <Link to={`/seller/products/${product._id}`}>
            <h3 className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#11182d]">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-[#e7ebff] bg-[#f7f8ff] px-3 py-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#97a2c2]">
              Stock
            </p>
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-[#7481a2]" />
              <p
                className={`text-[13px] font-semibold ${isOutOfStock
                    ? "text-[#d14343]"
                    : isLowStock
                      ? "text-[#c77719]"
                      : "text-[#18794e]"
                  }`}
              >
                {stock} units
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7ebff] bg-[#f7f8ff] px-3 py-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#97a2c2]">
              Price
            </p>
            <p className="truncate text-[13px] font-semibold text-[#11182d]">
              {getPriceRange(product.variants)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-[#edf1ff] pt-3.5">
          <Link
            to={`/seller/products/edit/${product._id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#2f5fe3] px-3 py-2.5 text-[11px] font-semibold text-white"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>

          <Link
            to={`/seller/products/${product._id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#d7def7] bg-white px-3 py-2.5 text-[11px] font-semibold text-[#4b587a]"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Link>

          <button
            onClick={() => onDelete(product._id)}
            disabled={deleteLoading?.[product._id]}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-[#f1c9c9] bg-white px-3 py-2.5 text-[11px] font-semibold text-[#d14343] disabled:opacity-60"
          >
            {deleteLoading?.[product._id] ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d14343] border-t-transparent" />
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
