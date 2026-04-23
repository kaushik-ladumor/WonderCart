import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Package,
  Tag,
  Edit,
  Calendar,
  Layers,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "../../components/Loader";
import { API_URL } from "../../utils/constants";

const RUPEE = "\u20B9";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productData = res.data.data;
        setProduct(productData);

        if (productData.variants?.length > 0) {
          setSelectedColor(productData.variants[0].color);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/review/${id}`);
        const rd = res.data.data;
        const reviewsData = rd?.reviews || res.data.reviews || [];
        setReviews(reviewsData);
        // Fail-safe: Update product document stats if missing
        if (rd && rd.reviewCount !== undefined) {
          setProduct(prev => ({
            ...prev,
            reviewCount: rd.reviewCount,
            ratingAverage: rd.ratingAverage
          }));
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [id]);

  const getCurrentVariant = () =>
    product?.variants?.find((variant) => variant.color === selectedColor) ||
    product?.variants?.[0];

  const getAvailableImages = () => getCurrentVariant()?.images || [];

  const getTotalStock = () => {
    if (!product?.variants?.length) return 0;
    return product.variants.reduce(
      (total, variant) =>
        total +
        (variant.sizes?.reduce((sum, size) => sum + (size.stock || 0), 0) || 0),
      0,
    );
  };

  const getTotalVariants = () => product?.variants?.length || 0;

  const getTotalSizes = () => {
    if (!product?.variants?.length) return 0;
    return product.variants.reduce(
      (total, variant) => total + (variant.sizes?.length || 0),
      0,
    );
  };

  const handleEditProduct = () => {
    navigate(`/seller/products/edit/${id}`);
  };

  const formatColorName = (color) =>
    color ? color.charAt(0).toUpperCase() + color.slice(1) : "Default";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="px-0 py-2">
        <div className="mx-auto max-w-md rounded-[26px] border border-[#e3e8ff] bg-white px-5 py-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef0f0]">
            <AlertCircle className="h-7 w-7 text-[#d14343]" />
          </div>
          <p className="text-[18px] font-semibold text-[#11182d]">Product not found</p>
          <button
            onClick={() => navigate("/seller/products")}
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#2f5fe3] px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const availableImages = getAvailableImages();
  const totalStock = getTotalStock();
  const totalVariants = getTotalVariants();
  const totalSizes = getTotalSizes();
  const currentVariant = getCurrentVariant();

  const statCards = [
    {
      label: "Total Stock",
      value: totalStock,
      icon: Package,
      iconClasses: "bg-[#eaf0ff] text-[#2f5fe3]",
      valueClasses: "text-[#11182d]",
    },
    {
      label: "Color Variants",
      value: totalVariants,
      icon: Tag,
      iconClasses: "bg-[#f5f7ff] text-[#7481a2]",
      valueClasses: "text-[#11182d]",
    },
    {
      label: "Total Sizes",
      value: totalSizes,
      icon: Layers,
      iconClasses: "bg-[#e9f8ef] text-[#18794e]",
      valueClasses: "text-[#18794e]",
    },
    {
      label: "Customer Reviews",
      value: reviews.length,
      icon: Users,
      iconClasses: "bg-[#fff4e8] text-[#c77719]",
      valueClasses: "text-[#11182d]",
    },
  ];

  return (
    <div className="space-y-3 px-0 pb-1">
      <section className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9aa6c7]">
              Seller Products
            </p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-[#11182d]">
              Product Details
            </h1>
            <p className="mt-1 text-[12px] text-[#6d7894]">
              Review product information, stock details, variants, and customer
              feedback.
            </p>
          </div>

          <button
            onClick={handleEditProduct}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2f5fe3] px-4 py-2.5 text-[12px] font-semibold text-white lg:min-w-[152px]"
          >
            <Edit className="h-4 w-4" />
            Edit Product
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-[22px] border border-[#e3e8ff] bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#98a4c4]">
                    {card.label}
                  </p>
                  <p className={`mt-2 text-[22px] font-semibold ${card.valueClasses}`}>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.iconClasses}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,1.08fr)]">
        <div className="overflow-hidden rounded-[26px] border border-[#e3e8ff] bg-white">
          <div className="border-b border-[#edf1ff] px-4 py-3.5 sm:px-5">
            <h2 className="text-[16px] font-semibold text-[#141b2d]">Product Gallery</h2>
            <p className="mt-1 text-[12px] text-[#6d7894]">
              Preview images for the selected variant.
            </p>
          </div>

          <div className="px-4 py-4 sm:px-5">
            <div className="flex aspect-square max-h-[430px] items-center justify-center rounded-[22px] bg-[#f6f8ff] p-3">
              {availableImages.length > 0 ? (
                <img
                  src={availableImages[selectedImage]}
                  alt={`${product.name} - ${formatColorName(selectedColor)}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-[#7b86a5]">
                  <div className="mb-2 text-4xl">{"\uD83D\uDCF7"}</div>
                  <p className="text-[12px]">No image available</p>
                </div>
              )}
            </div>
          </div>

          {availableImages.length > 1 && (
            <div className="flex flex-wrap gap-2.5 border-t border-[#edf1ff] bg-[#fbfcff] px-4 py-3 sm:px-5">
              {availableImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border ${
                    selectedImage === index
                      ? "border-[#2f5fe3] bg-[#edf2ff] "
                      : "border-[#dde4fa] bg-white"
                  } h-[68px] w-[68px] shrink-0`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#99a5c5]">
                {product.category || "Uncategorized"}
              </p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#11182d]">
                {product.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.ratingAverage || 0) ? "text-[#2563eb] fill-[#2563eb]" : "text-[#e2e8f0] fill-[#e2e8f0]"}`} />
                ))}
              </div>
              <span className="text-[12px] text-[#6b7280] font-medium leading-none mt-0.5">
                {product.ratingAverage || 0} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="rounded-[22px] border border-[#e7ebff] bg-[#f8f9ff] px-4 py-3.5">
              <h3 className="text-[13px] font-semibold text-[#141b2d]">Description</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#6d7894]">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#7d88a8]">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: {formatDate(product.createdAt)}</span>
            </div>

            {product.variants?.length > 0 && (
              <div>
                <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.26em] text-[#99a5c5]">
                  Color Variants
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.color}
                      onClick={() => {
                        setSelectedColor(variant.color);
                        setSelectedImage(0);
                      }}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-[12px] font-medium ${
                        selectedColor === variant.color
                          ? "border-[#2f5fe3] bg-[#edf2ff] text-[#2f5fe3]"
                          : "border-[#d7def7] bg-white text-[#55617f]"
                      }`}
                    >
                      <div
                        className="h-3 w-3 rounded-full border border-[#d8dff3]"
                        style={{
                          backgroundColor:
                            variant.color === "natural" || variant.color === "white"
                              ? "#f5f5f5"
                              : variant.color || "#e5e5e5",
                        }}
                      />
                      <span>{formatColorName(variant.color)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentVariant?.sizes?.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-[#141b2d]">
                  Size & Stock Details ({formatColorName(selectedColor)})
                </h3>
                <div className="mt-2.5 space-y-2">
                  {currentVariant.sizes.map((sizeObj) => (
                    <div
                      key={sizeObj.size}
                      className="flex flex-col gap-2.5 rounded-[20px] border border-[#e7ebff] bg-[#f8f9ff] px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <span className="min-w-10 text-[12px] font-semibold text-[#141b2d]">
                          {sizeObj.size}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">
                          <span className="text-[#7d88a8]">Price:</span>
                          <span className="font-semibold text-[#141b2d]">
                            {RUPEE}
                            {sizeObj.sellingPrice?.toLocaleString()}
                          </span>
                          {sizeObj.discount > 0 && (
                            <>
                              <span className="text-[#99a5c5] line-through">
                                {RUPEE}
                                {sizeObj.originalPrice?.toLocaleString()}
                              </span>
                              <span className="rounded-full bg-[#ebf8ef] px-2 py-1 text-[11px] font-semibold text-[#18794e]">
                                {sizeObj.discount}% off
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                          sizeObj.stock > 0 ? "text-[#18794e]" : "text-[#d14343]"
                        }`}
                      >
                        {sizeObj.stock > 0 ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {sizeObj.stock} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-[#141b2d]">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="mt-1 text-[12px] text-[#6d7894]">
              Recent feedback from your customers.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f7ff] px-3 py-2 text-[12px] font-semibold text-[#202a42]">
            <Star className="h-4 w-4 fill-[#f2b63d] text-[#f2b63d]" />
            {product.ratingAverage?.toFixed(1) || "0.0"} out of 5
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f5ff]">
              <Users className="h-6 w-6 text-[#7a85a4]" />
            </div>
            <p className="text-[12px] text-[#6d7894]">
              No customer reviews yet. Check back later for feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review._id}
                className="rounded-[22px] border border-[#e7ebff] bg-[#fbfcff] px-4 py-3.5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#f2f5ff] border border-[#e3e8ff] flex items-center justify-center text-sm font-bold text-[#141b2d] shrink-0 overflow-hidden">
                      {review.user?.profile && review.user.profile !== "https://cdn-icons-png.flaticon.com/512/149/149071.png" ? (
                        <img src={review.user.profile} alt={review.user.username} className="w-full h-full object-cover" />
                      ) : (
                        review.user?.username?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#141b2d]">
                          {review.user?.username || "Anonymous Customer"}
                        </span>
                        {review.user?.isVerified && (
                          <span className="rounded-full bg-[#ebf8ef] px-2 py-1 text-[11px] font-semibold text-[#18794e]">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-[#f2b63d] text-[#f2b63d]"
                                  : "text-[#cfd6ea]"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#7d88a8]">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-2.5 text-[12px] leading-5 text-[#596683]">
                  {review.comment}
                </p>
              </div>
            ))}

            {reviews.length > 5 && (
              <button className="pt-1 text-[12px] font-medium text-[#2f5fe3]">
                View all {reviews.length} reviews
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
