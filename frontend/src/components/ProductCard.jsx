import React from "react";
import { Link } from "react-router-dom";
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
      0,
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
    <div className="group h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 h-full flex flex-col">
        <Link to={`/product-detail/${product._id}`} className="flex-shrink-0">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              src={getProductImage(product.variants)}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />

            {/* Wishlist Button */}
            <button
              onClick={(e) => toggleWishlist(e, product)}
              disabled={addingToWishlist[product._id]}
              className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted
                    ? "text-red-500 fill-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
              />
            </button>

            {/* Sold Out Overlay */}
            {stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-wider px-2 py-1 bg-black/70 rounded">
                  SOLD OUT
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-2 left-2">
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                  {discount}% OFF
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Content Section */}
        <Link
          to={`/product-detail/${product._id}`}
          className="p-3 space-y-2 flex-grow flex flex-col"
        >
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category || "Collection"}
          </p>

          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight flex-grow">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(product.averageRating || 4)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.numReviews || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              ₹{price.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Low Stock Alert */}
          {stock > 0 && stock <= 5 && (
            <p className="text-xs font-medium text-red-600">
              Only {stock} left!
            </p>
          )}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
