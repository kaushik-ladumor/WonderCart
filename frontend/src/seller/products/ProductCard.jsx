import React from "react";
import { Link } from "react-router-dom";
import { Star, Package, Edit, Eye, Trash2 } from "lucide-react";

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

  const getProductImage = (variants) => {
    return (
      variants?.[0]?.images?.[0] ||
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
    );
  };

  const getPriceRange = (variants) => {
    if (!variants?.length) return "₹0";

    const allPrices = variants
      .flatMap((v) => v.sizes?.map((s) => s.sellingPrice || 0) || [0])
      .filter((p) => p > 0);

    if (allPrices.length === 0) return "₹0";

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    return minPrice === maxPrice
      ? `₹${minPrice.toLocaleString()}`
      : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
  };

  const stock = getTotalStock(product.variants);
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
      {/* Image Section */}
      <Link to={`/seller/products/${product._id}`} className="block relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={getProductImage(product.variants)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Status & Stock Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.status === "pending" && (
            <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase rounded shadow-sm">
              Pending Approval
            </span>
          )}
          {product.status === "rejected" && (
            <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase rounded shadow-sm">
              Rejected
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-1 bg-gray-600 text-white text-[10px] font-bold uppercase rounded shadow-sm">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase rounded shadow-sm">
              Low Stock
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-600 text-white text-[10px] font-bold uppercase rounded shadow-sm">
              Active
            </span>
          )}
        </div>

        {/* Variant Count Badge */}
        {product.variants?.length > 0 && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded backdrop-blur-sm">
              {product.variants.length} colors
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-4">
        {/* Category & Name */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
            {product.category || "Uncategorized"}
          </p>
          <Link to={`/seller/products/${product._id}`}>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-700 transition mt-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 flex items-center gap-1">
              <Package className="w-3 h-3" />
              Stock
            </span>
            <span
              className={`font-medium ${isOutOfStock
                ? "text-red-600"
                : isLowStock
                  ? "text-amber-600"
                  : "text-green-600"
                }`}
            >
              {stock} units
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Price Range</span>
            <span className="font-medium text-gray-900">
              {getPriceRange(product.variants)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Rating</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-medium text-gray-900">
                {product.averageRating?.toFixed(1) || "0.0"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Link
            to={`/seller/products/edit/${product._id}`}
            className="flex-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" />
            Edit
          </Link>
          <Link
            to={`/seller/products/${product._id}`}
            className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition flex items-center justify-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Details
          </Link>
          <button
            onClick={() => onDelete(product._id)}
            disabled={deleteLoading?.[product._id]}
            className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded hover:bg-red-50 transition flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {deleteLoading?.[product._id] ? (
              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
