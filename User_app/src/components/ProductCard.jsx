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
      product.image ||
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
    );
  };

  const getSellingPrice = (variants) => {
    if (!variants?.length) return 0;
    return Math.round(variants[0]?.sizes?.[0]?.sellingPrice || 0);
  };

  const stock = getTotalStock(product.variants);
  const sellingPrice = getSellingPrice(product.variants);
  const isWishlisted = wishlist?.includes(product._id);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#f1f5f9] h-full flex flex-col">
      <Link to={`/product-detail/${product._id}`} className="block relative aspect-square bg-[#f8fafc] overflow-hidden">
        <img
          src={getProductImage(product.variants)}
          alt={product.name}
          className="w-full h-full object-contain p-6 mix-blend-multiply"
        />

        {stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <span className="bg-black text-white text-[10px] font-semibold px-3 py-1 rounded-md uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => toggleWishlist(e, product)}
          disabled={addingToWishlist?.[product._id]}
          className="absolute top-3 right-3 p-2 bg-white rounded-full text-[#9ca3af] z-20 border border-[#f1f5f9]"
        >
          <Heart
            className={`w-3.5 h-3.5 ${isWishlisted ? "text-[#0f49d7] fill-[#0f49d7]" : ""}`}
          />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product-detail/${product._id}`} className="flex-grow">
          <h3 className="font-semibold text-[#11182d] text-[0.82rem] leading-tight mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-[#ffb800] fill-[#ffb800]" />
            <span className="text-[0.74rem] font-semibold text-[#6d7892]">
              {product.average_rating || 0}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[0.78rem] text-[#11182d]">₹{sellingPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
