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

  const getOriginalPrice = (variants) => {
    if (!variants?.length) return 0;
    return Math.round(variants[0]?.sizes?.[0]?.originalPrice || 0);
  };

  const getSellingPrice = (variants) => {
    if (!variants?.length) return 0;
    return Math.round(variants[0]?.sizes?.[0]?.sellingPrice || 0);
  };

  const getDiscount = (variants) => {
    if (!variants?.length) return 0;
    const firstVariant = variants[0];
    if (!firstVariant?.sizes?.length) return 0;
    return firstVariant.sizes[0]?.discount || 0;
  };

  const stock = getTotalStock(product.variants);
  const originalPrice = getOriginalPrice(product.variants);
  const sellingPrice = getSellingPrice(product.variants);
  const discount = getDiscount(product.variants);
  const isWishlisted = wishlist.includes(product._id);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#f3f4f6]">
      <Link to={`/product-detail/${product._id}`}>
        <div className="relative bg-[#f9fafb] aspect-[4/4]">
          <img
            src={getProductImage(product.variants)}
            alt={product.name}
            className="w-full h-full object-contain p-6 mix-blend-multiply"
          />

          <button
            onClick={(e) => toggleWishlist(e, product)}
            disabled={addingToWishlist[product._id]}
            className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-[#9ca3af] hover:text-[#141b2d] z-20 shadow-sm"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`}
            />
          </button>

          {discount > 0 && stock > 0 && (
            <div className="absolute top-3 left-3 bg-[#e11d48] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
              {discount}% OFF
            </div>
          )}

          {stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="bg-[#1f2937] text-white text-[9px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[10px] uppercase font-bold text-[#9ca3af] mb-1 tracking-wider">
          {product.category || "General"}
        </p>
        <Link to={`/product-detail/${product._id}`}>
          <h3 className="font-bold text-[#141b2d] text-[13px] leading-tight line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[15px] text-[#141b2d]">₹{sellingPrice.toLocaleString()}</span>
            {discount > 0 && (
              <span className="text-[11px] line-through text-[#9ca3af] font-medium">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
            <span className="text-[11px] font-bold text-[#141b2d]">{product.average_rating || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
