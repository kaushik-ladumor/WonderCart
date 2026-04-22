import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  X,
  Plus,
  Minus,
  Package,
  Tag,
  ImageIcon,
  Save,
  ChevronDown,
} from "lucide-react";
import { API_URL } from "../../utils/constants";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [variants, setVariants] = useState([
    {
      color: "",
      imageFiles: [],
      imagePreviews: [],
      sizes: [{ size: "", stock: 0, originalPrice: "", sellingPrice: "" }],
    },
  ]);

  useEffect(() => {
    fetchApprovedCategories();
  }, []);

  const fetchApprovedCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/seller/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Complete your profile to add products");
        navigate("/seller/dashboard");
      } else {
        console.error("Failed to fetch categories:", err);
      }
    } finally {
      setFetchingCategories(false);
    }
  };

  const calculateDiscount = (originalPrice, sellingPrice) => {
    const op = parseFloat(originalPrice);
    const sp = parseFloat(sellingPrice);
    if (!op || op === 0 || !sp) return 0;
    if (sp > op) return 0;
    return Math.round(((op - sp) / op) * 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, value) => {
    const updated = [...variants];
    updated[index].color = value;
    setVariants(updated);
  };

  const handleSizeChange = (vIdx, sIdx, field, value) => {
    const updated = [...variants];
    updated[vIdx].sizes[sIdx][field] =
      field === "stock"
        ? parseInt(value) || 0
        : field === "originalPrice" || field === "sellingPrice"
          ? parseFloat(value) || ""
          : value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color: "",
        imageFiles: [],
        imagePreviews: [],
        sizes: [{ size: "", stock: 0, originalPrice: "", sellingPrice: "" }],
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    } else {
      toast.error("At least one variant is required");
    }
  };

  const addSize = (vIdx) => {
    const updated = [...variants];
    updated[vIdx].sizes.push({
      size: "",
      stock: 0,
      originalPrice: "",
      sellingPrice: "",
    });
    setVariants(updated);
  };

  const removeSize = (vIdx, sIdx) => {
    const updated = [...variants];
    if (updated[vIdx].sizes.length > 1) {
      updated[vIdx].sizes.splice(sIdx, 1);
      setVariants(updated);
    } else {
      toast.error("At least one size per variant is required");
    }
  };

  const handleImageUpload = (vIdx, files) => {
    const color = variants[vIdx].color.trim();
    if (!color) {
      toast.error("Enter color name first");
      return;
    }

    const fileArray = Array.from(files);
    const totalImages = variants[vIdx].imageFiles.length + fileArray.length;

    if (totalImages > 5) {
      toast.error("Maximum 5 images per variant");
      return;
    }

    const updated = [...variants];
    updated[vIdx].imageFiles = [...updated[vIdx].imageFiles, ...fileArray];
    updated[vIdx].imagePreviews = [
      ...updated[vIdx].imagePreviews,
      ...fileArray.map((file) => URL.createObjectURL(file)),
    ];
    setVariants(updated);
  };

  const removeImage = (vIdx, imgIdx) => {
    const updated = [...variants];
    URL.revokeObjectURL(updated[vIdx].imagePreviews[imgIdx]);
    updated[vIdx].imageFiles.splice(imgIdx, 1);
    updated[vIdx].imagePreviews.splice(imgIdx, 1);
    setVariants(updated);
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.category) {
      toast.error("Fill all basic fields");
      return false;
    }

    for (let i = 0; i < variants.length; i += 1) {
      const variant = variants[i];
      if (!variant.color.trim()) {
        toast.error(`Enter color for variant ${i + 1}`);
        return false;
      }
      if (variant.imageFiles.length === 0) {
        toast.error(`Upload at least 1 image for ${variant.color}`);
        return false;
      }
      for (let j = 0; j < variant.sizes.length; j += 1) {
        const size = variant.sizes[j];
        if (
          !size.size.trim() ||
          size.stock < 0 ||
          !size.originalPrice ||
          parseFloat(size.originalPrice) <= 0 ||
          !size.sellingPrice ||
          parseFloat(size.sellingPrice) <= 0
        ) {
          toast.error(`Invalid size/price/stock in ${variant.color}`);
          return false;
        }
        if (parseFloat(size.sellingPrice) > parseFloat(size.originalPrice)) {
          toast.error(
            `Selling price cannot be greater than original price in ${variant.color}`,
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);

      const variantsData = variants.map((variant) => ({
        color: variant.color.trim(),
        sizes: variant.sizes.map((size) => ({
          size: size.size.trim(),
          stock: parseInt(size.stock),
          originalPrice: parseFloat(size.originalPrice),
          sellingPrice: parseFloat(size.sellingPrice),
        })),
      }));
      formDataToSend.append("variants", JSON.stringify(variantsData));

      variants.forEach((variant) => {
        variant.imageFiles.forEach((file) => {
          formDataToSend.append(variant.color, file);
        });
      });

      await axios.post(`${API_URL}/product/create`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product published successfully! It is now live for customers.", {
        duration: 4000,
      });
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5 px-0 pb-1">
      <div className="mx-auto max-w-6xl">
        <div className="px-1 py-0.5 sm:px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9aa6c7]">
            Seller Products
          </p>
          <h1 className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em] text-[#11182d]">
            Add New Product
          </h1>
          <p className="mt-0.5 pb-1.5 text-[11px] text-[#6d7894]">
            Fill in the details below to add a new product.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
            <div className="mb-5 flex items-center gap-3 border-b border-[#edf1ff] pb-3">
              <div className="rounded-2xl bg-[#eef2ff] p-2">
                <Package className="h-[18px] w-[18px] text-[#2f5fe3]" />
              </div>
              <h2 className="text-[16px] font-semibold text-[#141b2d]">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Wireless Headphones"
                  className="w-full rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                  Category *{" "}
                  {categories.length === 0 && !fetchingCategories && (
                    <span className="normal-case text-[#d14343]">
                      (No approved categories)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    disabled={fetchingCategories || categories.length === 0}
                    className="w-full appearance-none rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none focus:border-[#2f5fe3]"
                  >
                    <option value="">Select an approved category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#91a0c5]">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-[#7d88a8]">
                  Don&apos;t see your category?
                  <Link
                    to="/seller/profile"
                    className="font-semibold text-[#2f5fe3] hover:underline"
                  >
                    Request more info →
                  </Link>
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe features, materials, benefits..."
                  className="w-full resize-none rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
            <div className="mb-5 flex flex-col gap-3 border-b border-[#edf1ff] pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#eef2ff] p-2">
                  <Tag className="h-[18px] w-[18px] text-[#2f5fe3]" />
                </div>
                <h2 className="text-[16px] font-semibold text-[#141b2d]">
                  Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f5fe3] px-4 py-2.5 text-[12px] font-semibold text-white sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </button>
            </div>

            {variants.map((variant, vIdx) => (
              <div
                key={vIdx}
                className="mb-4 rounded-[24px] border border-[#e7ebff] bg-[#f8f9ff] p-4 last:mb-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#141b2d]">
                    Variant {vIdx + 1} {variant.color && `- ${variant.color}`}
                  </h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="rounded-full p-1.5 hover:bg-[#eef2ff]"
                    >
                      <X className="h-4 w-4 text-[#d14343]" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={variant.color}
                    onChange={(e) => handleVariantChange(vIdx, e.target.value)}
                    placeholder="e.g., Space Gray, Midnight Blue"
                    className="w-full rounded-2xl border border-[#d8dff3] bg-white px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Images (Max 5) *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variant.imagePreviews.map((src, iIdx) => (
                      <div key={iIdx} className="relative">
                        <img
                          src={src}
                          alt={`Preview ${iIdx + 1}`}
                          className="h-20 w-20 rounded-2xl border border-[#d8dff3] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(vIdx, iIdx)}
                          className="absolute -right-2 -top-2 rounded-full bg-[#d14343] p-1 text-white"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                    {variant.imagePreviews.length < 5 && (
                      <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd5f4] bg-white">
                        <Upload className="mb-1 h-5 w-5 text-[#8a97ba]" />
                        <span className="text-[11px] text-[#7d88a8]">Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(vIdx, e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-[#7d88a8]">
                    {variant.imagePreviews.length}/5 images
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                      Sizes & Pricing *
                    </label>
                    <button
                      type="button"
                      onClick={() => addSize(vIdx)}
                      className="flex w-full items-center justify-center gap-1 rounded-2xl border border-[#d7def7] bg-white px-3 py-2 text-[11px] font-semibold text-[#55617f] sm:w-auto"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Size
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {variant.sizes.map((size, sIdx) => {
                      const disc = calculateDiscount(
                        size.originalPrice,
                        size.sellingPrice,
                      );
                      return (
                        <div
                          key={sIdx}
                          className="grid grid-cols-1 items-center gap-2.5 rounded-[20px] border border-[#e4e9fb] bg-white p-3 sm:grid-cols-5"
                        >
                          <input
                            type="text"
                            required
                            value={size.size}
                            onChange={(e) =>
                              handleSizeChange(vIdx, sIdx, "size", e.target.value)
                            }
                            placeholder="Size"
                            className="rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3 py-2.5 text-[12px] outline-none focus:border-[#2f5fe3]"
                          />
                          <input
                            type="number"
                            min="0"
                            required
                            value={size.stock}
                            onChange={(e) =>
                              handleSizeChange(vIdx, sIdx, "stock", e.target.value)
                            }
                            placeholder="Stock"
                            className="rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3 py-2.5 text-[12px] outline-none focus:border-[#2f5fe3]"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7d88a8]">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              required
                              value={size.originalPrice}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIdx,
                                  sIdx,
                                  "originalPrice",
                                  e.target.value,
                                )
                              }
                              placeholder="Original Price"
                              className="w-full rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] py-2.5 pl-8 pr-3 text-[12px] outline-none focus:border-[#2f5fe3]"
                            />
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7d88a8]">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              required
                              value={size.sellingPrice}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIdx,
                                  sIdx,
                                  "sellingPrice",
                                  e.target.value,
                                )
                              }
                              placeholder="Selling Price"
                              className={`w-full rounded-2xl py-2.5 pl-8 pr-3 text-[12px] outline-none focus:border-[#2f5fe3] ${size.sellingPrice &&
                                  size.originalPrice &&
                                  parseFloat(size.sellingPrice) >
                                  parseFloat(size.originalPrice)
                                  ? "border border-[#efb4b4] bg-[#fff3f3]"
                                  : "border border-[#d8dff3] bg-[#f7f8ff]"
                                }`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {disc > 0 ? (
                              <span className="whitespace-nowrap rounded-full bg-[#ebf8ef] px-2 py-1 text-[11px] font-semibold text-[#18794e]">
                                {disc}% OFF
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[11px] text-[#99a5c5]">
                                No discount
                              </span>
                            )}
                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSize(vIdx, sIdx)}
                                className="rounded-full p-1.5 hover:bg-[#fff1f1]"
                              >
                                <Minus className="h-4 w-4 text-[#d14343]" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-end gap-3 rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:flex-row sm:px-5">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              disabled={loading}
              className="order-2 rounded-2xl border border-[#d7def7] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#55617f] disabled:opacity-50 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="order-1 flex items-center justify-center gap-2 rounded-2xl bg-[#2f5fe3] px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
