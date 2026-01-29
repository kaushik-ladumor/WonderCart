// ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";

const ProductCard = ({
  product,
  wishlist,
  addingToWishlist,
  toggleWishlist,
}) => {
  const getTotalStock = (variants) => {
    if (!variants?.length) return 0;
    return variants.reduce(
      (total, variant) =>
        total +
        (variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0),
      0
    );
  };

  const getProductImage = (variants) => {
    return (
      variants?.[0]?.images?.[0] ||
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
    );
  };

  const getLowestPrice = (variants) => {
    if (!variants?.length) return 0;

    let lowest = Infinity;

    variants.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        const discountAmount = size.price * (size.discount / 100);
        const finalPrice = size.price - discountAmount;

        if (finalPrice < lowest) {
          lowest = finalPrice;
        }
      });
    });

    return lowest === Infinity ? 0 : Math.round(lowest);
  };

  const getOriginalPrice = (variants) => {
    if (!variants?.length) return 0;

    let lowest = Infinity;

    variants.forEach((variant) => {
      variant.sizes?.forEach((size) => {
        if (size.price < lowest) {
          lowest = size.price;
        }
      });
    });

    return lowest === Infinity ? 0 : lowest;
  };

  const stock = getTotalStock(product.variants);
  const price = getLowestPrice(product.variants);
  const originalPrice = getOriginalPrice(product.variants);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const isWishlisted = wishlist.includes(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group h-full"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
        <Link to={`/product-detail/${product._id}`} className="flex-shrink-0">
          {/* Image Section - Clean & Minimal */}
          <div className="relative aspect-square overflow-hidden bg-white">
            <img
              src={getProductImage(product.variants)}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000 ease-out"
            />

            {/* Wishlist Button - Clean top-right */}
            <button
              onClick={(e) => toggleWishlist(e, product)}
              disabled={addingToWishlist[product._id]}
              className="absolute top-3 right-3 w-9 h-9 sm:w-11 sm:h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  isWishlisted
                    ? "text-black fill-black"
                    : "text-gray-700 hover:text-black"
                }`}
              />
            </button>

            {/* Sold Out Overlay */}
            {stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg sm:text-2xl font-bold tracking-wider">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Content Section */}
        <Link
          to={`/product-detail/${product._id}`}
          className="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-grow flex flex-col"
        >
          {/* Category */}
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {product.category || "Collection"}
          </p>

          {/* Product Name */}
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 line-clamp-2 leading-tight flex-grow">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < Math.round(product.averageRating || 4)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-yellow-400"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-600">
              {product.numReviews || 0} reviews
            </span>
          </div>

          {/* Price & Discount Section - Responsive Layout */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-semibold text-gray-900">
                ₹{price.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {discount > 0 && (
              <div className="relative group">
                <span className="px-2 py-0.5 sm:py-1 bg-black text-white text-xs font-bold rounded-lg transition-all group-hover:scale-105">
                  {discount}% OFF
                </span>
                <div className="absolute inset-0 bg-black blur-sm opacity-30 group-hover:opacity-50 rounded-lg -z-10" />
              </div>
            )}
          </div>

          {/* Low Stock Alert */}
          {stock > 0 && stock <= 5 && (
            <p className="text-xs sm:text-sm font-semibold text-red-600 animate-pulse">
              Only {stock} left in stock!
            </p>
          )}

          {/* Variant Info - Subtle */}
          {product.variants?.length > 0 && (
            <p className="text-xs text-gray-500">
              Available in {product.variants.length} color
              {product.variants.length > 1 ? "s" : ""}
            </p>
          )}
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
