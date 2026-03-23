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
    <div className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-[0_4px_16px_rgba(0,74,198,0.08)] transition-shadow">
      <Link to={`/product-detail/${product._id}`}>
        {/* Image section — all overlays INSIDE this */}
        <div className="relative bg-[#f0f4ff] aspect-[4/3]">
          <img
            src={getProductImage(product.variants)}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
          />

          {/* Rating badge — top left */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-semibold text-[#141b2d]">
            <span className="text-[#004ac6]">★</span> {product.averageRating || 4.5}
          </div>

          {/* Wishlist — top right */}
          <button
            onClick={(e) => toggleWishlist(e, product)}
            disabled={addingToWishlist[product._id]}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[#5c6880] hover:text-[#004ac6] transition-all z-20"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`}
            />
          </button>

          {/* Discount badge — bottom left, INSIDE image area */}
          {discount > 0 && (
            <div className="absolute bottom-2 left-2 bg-[#004ac6] text-white text-[9px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </div>
          )}

          {/* Sold Out Overlay */}
          {stock === 0 && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-[#141b2d] text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                Archived
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <p className="text-[10px] uppercase tracking-widest text-[#004ac6] font-semibold mb-0.5">
          {product.category || "General Archive"}
        </p>
        <Link to={`/product-detail/${product._id}`}>
          <h3 className="font-semibold text-[#141b2d] text-sm leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[#5c6880] text-xs font-normal">₹</span>
            <span className="font-bold text-base text-[#141b2d]">{sellingPrice.toLocaleString()}</span>
            {discount > 0 && (
              <span className="text-xs line-through text-[#5c6880] ml-1">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
          <Link
            to={`/product-detail/${product._id}`}
            className="p-1.5 rounded-full text-[#141b2d] hover:bg-[#f0f4ff] transition-colors"
          >
            <Star className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
