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

const formatPrice = (price) =>
  `Rs ${Math.round(Number(price || 0)).toLocaleString("en-IN")}`;

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
      <div className="px-0 py-2 font-poppins">
        <div className="mx-auto max-w-md rounded-[18px] border border-[#d7dcea] bg-white px-5 py-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100">
            <AlertCircle className="h-7 w-7 text-rose-600" />
          </div>
          <h2 className="text-[1.1rem] font-bold text-[#11182d]">Product not found</h2>
          <button
            onClick={() => navigate("/seller/products")}
            className="mt-6 rounded-[14px] bg-[#0f49d7] px-6 py-2.5 text-[0.82rem] font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95"
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
      iconClasses: "bg-[#eaf0ff] text-[#0f49d7]",
    },
    {
      label: "Color Variants",
      value: totalVariants,
      icon: Tag,
      iconClasses: "bg-[#f8f9fd] text-[#6d7892]",
    },
    {
      label: "Total Sizes",
      value: totalSizes,
      icon: Layers,
      iconClasses: "bg-[#ebf8ef] text-[#18794e]",
    },
    {
      label: "Reviews",
      value: reviews.length,
      icon: Users,
      iconClasses: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d] font-poppins">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <section className="rounded-[18px] border border-[#e1e5f1] bg-white px-5 py-4 sm:px-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <div
              onClick={() => navigate("/seller/products")}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f8f9fd] text-[#6d7892] hover:bg-[#0f49d7] hover:text-white transition-all shadow-sm border border-[#d7dcea]"
            >
              <Package className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-[1.5rem] font-semibold tracking-tight text-[#11182d]">Product Details</h1>
              <p className="mt-0.5 text-[0.82rem] text-[#6d7892]">Full view of your inventory item.</p>
            </div>
          </div>
          <button
            onClick={handleEditProduct}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-6 py-2.5 text-[0.82rem] font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 lg:min-w-[152px]"
          >
            <Edit className="h-4 w-4" />
            Edit Product
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[18px] border border-[#d7dcea] bg-white p-4 shadow-sm transition-all hover:border-[#0f49d7]/30">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconClasses}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892]">
                {card.label}
              </p>
              <p className="mt-1 text-[1.25rem] font-black text-[#11182d]">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="sticky top-5 space-y-5">
            <div className="overflow-hidden rounded-[18px] border border-[#d7dcea] bg-white shadow-sm">
              <div className="relative flex aspect-square items-center justify-center bg-[#f8f9fd] p-6">
                {availableImages.length > 0 ? (
                  <img
                    src={availableImages[selectedImage]}
                    alt={product.name}
                    className="h-full w-full object-contain mix-blend-multiply animate-in zoom-in-95 duration-500"
                  />
                ) : (
                  <div className="text-center text-[#98a4bd]">
                    <Package className="mx-auto mb-2 h-10 w-10 opacity-20" />
                    <p className="text-[0.75rem] font-bold">NO IMAGE</p>
                  </div>
                )}
              </div>
              {availableImages.length > 1 && (
                <div className="flex flex-wrap gap-3 border-t border-[#d7dcea] bg-white p-4">
                  {availableImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-[12px] border-2 transition-all ${selectedImage === index ? "border-[#0f49d7] scale-105 shadow-md" : "border-[#d7dcea] hover:border-[#0f49d7]/50"
                        }`}
                    >
                      <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 space-y-5">
          <div className="rounded-[18px] border border-[#d7dcea] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.75rem] font-bold text-white shadow-sm">
                1
              </span>
              <div>
                <h2 className="text-[1rem] font-bold text-[#11182d]">Basic Information</h2>
                <p className="text-[0.72rem] text-[#6d7892]">General details and categorization.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-[0.65rem] font-black uppercase tracking-widest text-[#0f49d7] border border-[#d7dcea]">
                  {product.category || "General"}
                </span>
                <h2 className="mt-2 text-[1.4rem] font-black tracking-tight text-[#11182d]">
                  {product.name}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.round(product.ratingAverage || 0) ? "fill-[#0f49d7] text-[#0f49d7]" : "fill-[#d7dcea] text-[#d7dcea]"}`} />
                    ))}
                  </div>
                  <span className="text-[0.75rem] font-bold text-[#11182d]">
                    {product.ratingAverage || 0}
                  </span>
                  <span className="text-[0.75rem] text-[#6d7892]">
                    ({product.reviewCount || 0} Reviews)
                  </span>
                </div>
              </div>

              <div className="rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] p-4">
                <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] mb-2">Description</h3>
                <p className="text-[0.82rem] leading-relaxed text-[#11182d]">
                  {product.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[0.7rem] font-bold text-[#6d7892]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Created: {formatDate(product.createdAt)}
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  Status: Active
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#d7dcea] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.75rem] font-bold text-white shadow-sm">
                2
              </span>
              <div>
                <h2 className="text-[1rem] font-bold text-[#11182d]">Variants & Stock</h2>
                <p className="text-[0.72rem] text-[#6d7892]">Pricing, inventory, and color selection.</p>
              </div>
            </div>

            <div className="space-y-6">
              {product.variants?.length > 0 && (
                <div>
                  <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1 mb-3 block">
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.color}
                        onClick={() => {
                          setSelectedColor(variant.color);
                          setSelectedImage(0);
                        }}
                        className={`inline-flex items-center gap-2.5 rounded-[14px] border px-4 py-2 text-[0.78rem] font-bold transition-all ${selectedColor === variant.color
                            ? "border-[#0f49d7] bg-[#eef2ff] text-[#0f49d7] shadow-sm"
                            : "border-[#d7dcea] bg-white text-[#6d7892] hover:border-[#0f49d7]/50"
                          }`}
                      >
                        <div
                          className="h-3.5 w-3.5 rounded-full border border-[#d7dcea] shadow-inner"
                          style={{
                            backgroundColor: variant.color?.toLowerCase() === "white" ? "#ffffff" : variant.color || "#e5e5e5",
                          }}
                        />
                        {formatColorName(variant.color)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentVariant?.sizes?.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                    Sizes & Pricing ({formatColorName(selectedColor)})
                  </label>
                  <div className="space-y-3">
                    {currentVariant.sizes.map((sizeObj) => (
                      <div
                        key={sizeObj.size}
                        className="flex flex-col gap-4 rounded-[18px] border border-[#d7dcea] bg-[#f8f9fd] p-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:bg-white hover:shadow-md border-l-4 border-l-[#0f49d7]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 min-w-[42px] px-2.5 items-center justify-center rounded-[12px] bg-white border border-[#d7dcea] font-black text-[#11182d] text-[0.82rem] shadow-sm shrink-0">
                            {sizeObj.size}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[1.15rem] font-black tracking-tight text-[#11182d]">
                                {formatPrice(sizeObj.sellingPrice)}
                              </span>
                              {sizeObj.discount > 0 && (
                                <span className="inline-flex rounded-full bg-[#ebf8ef] px-2.5 py-0.5 text-[0.68rem] font-black text-[#18794e] border border-[#dcfce7]">
                                  {sizeObj.discount}% OFF
                                </span>
                              )}
                            </div>
                            {sizeObj.discount > 0 && (
                              <p className="text-[0.72rem] font-bold text-[#98a4bd] line-through ml-0.5 opacity-70">
                                {formatPrice(sizeObj.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className={`flex items-center gap-2.5 rounded-[12px] px-4 py-2 text-[0.75rem] font-bold shadow-sm border transition-colors ${sizeObj.stock > 10
                            ? "bg-[#ebf8ef] text-[#18794e] border-[#dcfce7]"
                            : sizeObj.stock > 0
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                          {sizeObj.stock > 0 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="uppercase tracking-wider">{sizeObj.stock} Units In Stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#d7dcea] bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.75rem] font-bold text-white shadow-sm">
                  3
                </span>
                <div>
                  <h2 className="text-[1rem] font-bold text-[#11182d]">Customer Reviews</h2>
                  <p className="text-[0.72rem] text-[#6d7892]">What buyers are saying.</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-[12px] bg-[#f8f9fd] border border-[#d7dcea] px-3 py-1.5 text-[0.78rem] font-bold text-[#11182d]">
                <Star className="h-3.5 w-3.5 fill-[#0f49d7] text-[#0f49d7]" />
                {product.ratingAverage?.toFixed(1) || "0.0"} / 5.0
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="py-10 text-center rounded-[14px] border-2 border-dashed border-[#d7dcea] bg-[#f8f9fd]">
                <Users className="mx-auto mb-3 h-8 w-8 text-[#98a4bd] opacity-40" />
                <p className="text-[0.8rem] font-bold text-[#6d7892]">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review._id} className="rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] p-4 transition-all hover:bg-white">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f49d7] font-black text-white text-[0.8rem] shadow-md border-2 border-white">
                        {review.user?.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-[0.82rem] font-black text-[#11182d]">
                            {review.user?.username || "Guest User"}
                          </h4>
                          <span className="shrink-0 text-[0.65rem] font-bold text-[#98a4bd]">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-2.5 w-2.5 ${i < review.rating ? "fill-[#0f49d7] text-[#0f49d7]" : "fill-[#d7dcea] text-[#d7dcea]"}`} />
                          ))}
                        </div>
                        <p className="mt-2 text-[0.8rem] leading-relaxed text-[#6d7892]">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {reviews.length > 5 && (
                  <button className="w-full rounded-[12px] py-2 text-[0.75rem] font-black text-[#0f49d7] hover:bg-[#eef2ff] transition-colors">
                    VIEW ALL {reviews.length} REVIEWS
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductDetail;
