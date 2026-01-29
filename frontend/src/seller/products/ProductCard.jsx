import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Star, Eye } from "lucide-react";

const ProductCard = ({ product, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rating = product.averageRating || 0;
  const reviewCount = product.numReviews || 0;

  // Get lowest price from variants
  const getLowestPrice = () => {
    if (!product.variants || product.variants.length === 0) return 0;

    let lowest = Infinity;
    product.variants.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        if (size.price < lowest) {
          lowest = size.price;
        }
      });
    });

    return lowest === Infinity ? 0 : lowest;
  };

  const price = getLowestPrice();
  const image = product.variants?.[0]?.images?.[0] || "";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all">
      {/* Image - Clickable to Product Detail */}
      <Link to={`${product._id}`}>
        <div className="relative h-40 overflow-hidden bg-gray-50">
          <img
            src={image || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-contain"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
          {product.name}
        </h3>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {product.category || "General"}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({reviewCount})</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">
            ₹{price.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            to={`/seller/products/edit/${product._id}`}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Link>

          <Link
            to={`/product-detail/${product._id}`}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>

          <button
            onClick={() => onDelete(product._id)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
