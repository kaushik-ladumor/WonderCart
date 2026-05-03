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
    mood: "",
  });
  const [moods, setMoods] = useState([]);
  const [fetchingMoods, setFetchingMoods] = useState(true);
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
    fetchMoods();
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

  const fetchMoods = async () => {
    try {
      const res = await axios.get(`${API_URL}/mood`);
      // Wait, I should check the mood route
      if (res.data.success) {
        setMoods(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch moods:", err);
    } finally {
      setFetchingMoods(false);
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
      formDataToSend.append("moods", JSON.stringify([formData.mood]));

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
    <div className="mx-auto max-w-5xl space-y-5 px-0 pb-6 font-poppins text-[#11182d]">
      <section className="rounded-[18px] border border-[#d7dcea] bg-white px-5 py-4 sm:px-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3.5">
            <Link
              to="/seller/products"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8f9fd] text-[#6d7892] hover:bg-[#0f49d7] hover:text-white transition-all shadow-sm border border-[#d7dcea]"
            >
              <Minus className="h-4 w-4 rotate-90" />
            </Link>
            <div>
              <h1 className="text-[1.35rem] font-bold tracking-tight text-[#11182d]">Add New Product</h1>
              <p className="mt-0.5 text-[0.8rem] text-[#6d7892]">List your product for the world to see.</p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-[18px] border border-[#d7dcea] bg-white p-5 sm:p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.75rem] font-bold text-white shadow-sm">
              1
            </span>
            <div>
              <h2 className="text-[1rem] font-bold text-[#11182d]">Basic Information</h2>
              <p className="text-[0.72rem] text-[#6d7892]">Name, category, and description.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Premium Wireless Headphones"
                className="w-full rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] px-4 py-2.5 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#98a4bd] focus:border-[#0f49d7] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                Category *
              </label>
              <div className="relative">
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  disabled={fetchingCategories || categories.length === 0}
                  className="w-full appearance-none rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] px-4 py-2.5 text-[0.82rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:bg-white transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#98a4bd]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                Product Mood *
              </label>
              <div className="relative">
                <select
                  name="mood"
                  required
                  value={formData.mood}
                  onChange={handleChange}
                  disabled={fetchingMoods || moods.length === 0}
                  className="w-full appearance-none rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] px-4 py-2.5 text-[0.82rem] text-[#11182d] outline-none focus:border-[#0f49d7] focus:bg-white transition-all"
                >
                  <option value="">Select Mood</option>
                  {moods.map((mood) => (
                    <option key={mood._id} value={mood.name}>
                      {mood.emoji} {mood.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#98a4bd]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us more about your product..."
                className="w-full resize-none rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] px-4 py-3 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#98a4bd] focus:border-[#0f49d7] focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#d7dcea] bg-white p-5 sm:p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f49d7] text-[0.75rem] font-bold text-white shadow-sm">
                2
              </span>
              <div>
                <h2 className="text-[1rem] font-bold text-[#11182d]">Variants & Images</h2>
                <p className="text-[0.72rem] text-[#6d7892]">Add colors, stock, and photos.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#eef2ff] px-5 py-2.5 text-[0.78rem] font-bold text-[#0f49d7] shadow-sm hover:bg-[#0f49d7] hover:text-white transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Color Variant
            </button>
          </div>

          <div className="space-y-6">
            {variants.map((variant, vIdx) => (
              <div
                key={vIdx}
                className="overflow-hidden rounded-[18px] border border-[#d7dcea] bg-[#f8f9fd] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-center justify-between border-b border-[#d7dcea] bg-white px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0f49d7]" />
                    <h3 className="text-[0.82rem] font-bold text-[#11182d]">
                      Variant {vIdx + 1} {variant.color && <span className="ml-1 text-[#6d7892] font-semibold">({variant.color})</span>}
                    </h3>
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="rounded-full bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                      Color Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={variant.color}
                      onChange={(e) => handleVariantChange(vIdx, e.target.value)}
                      placeholder="e.g., Phantom Black, Deep Sea Blue"
                      className="w-full rounded-[14px] border border-[#d7dcea] bg-white px-4 py-2.5 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#98a4bd] focus:border-[#0f49d7] transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Images (Max 5) *
                    </label>
                    <div className="flex flex-wrap gap-3.5">
                      {variant.imagePreviews.map((src, iIdx) => (
                        <div key={iIdx} className="group relative">
                          <img
                            src={src}
                            alt="Preview"
                            className="h-20 w-20 rounded-[14px] border border-[#d7dcea] object-cover shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(vIdx, iIdx)}
                            className="absolute -right-2 -top-2 rounded-full bg-white text-rose-600 shadow-md p-0.5 hover:scale-110 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {variant.imagePreviews.length < 5 && (
                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[#d7dcea] bg-white hover:border-[#0f49d7] hover:bg-[#eef2ff] transition-all group">
                          <Upload className="mb-1 h-5 w-5 text-[#98a4bd] group-hover:text-[#0f49d7] group-hover:scale-110 transition-all" />
                          <span className="text-[0.6rem] font-bold text-[#98a4bd] group-hover:text-[#0f49d7]">UPLOAD</span>
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
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                        Sizes & Pricing *
                      </label>
                      <button
                        type="button"
                        onClick={() => addSize(vIdx)}
                        className="inline-flex items-center gap-1.5 rounded-[12px] bg-white border border-[#d7dcea] px-4 py-1.5 text-[0.7rem] font-bold text-[#0f49d7] shadow-sm hover:bg-[#f8f9fd] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Size
                      </button>
                    </div>

                    <div className="space-y-3">
                      {variant.sizes.map((size, sIdx) => {
                        const disc = calculateDiscount(size.originalPrice, size.sellingPrice);
                        return (
                          <div
                            key={sIdx}
                            className="grid grid-cols-1 items-end gap-4 rounded-[14px] border border-[#d7dcea] bg-white p-4 shadow-sm sm:grid-cols-5 animate-in slide-in-from-left-2 duration-300"
                          >
                            <div className="space-y-1">
                              <label className="text-[0.6rem] font-bold text-[#98a4bd]">Size</label>
                              <input
                                type="text"
                                required
                                value={size.size}
                                onChange={(e) => handleSizeChange(vIdx, sIdx, "size", e.target.value)}
                                placeholder="S, M, XL, 42..."
                                className="w-full rounded-[10px] border border-[#d7dcea] bg-[#f8f9fd] px-3 py-2 text-[0.78rem] font-bold text-[#11182d] outline-none focus:border-[#0f49d7] focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6rem] font-bold text-[#98a4bd]">Stock</label>
                              <input
                                type="number"
                                min="0"
                                required
                                value={size.stock}
                                onChange={(e) => handleSizeChange(vIdx, sIdx, "stock", e.target.value)}
                                placeholder="0"
                                className="w-full rounded-[10px] border border-[#d7dcea] bg-[#f8f9fd] px-3 py-2 text-[0.78rem] font-bold text-[#11182d] outline-none focus:border-[#0f49d7] focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6rem] font-bold text-[#98a4bd]">Original Price</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.7rem] font-bold text-[#98a4bd]">₹</span>
                                <input
                                  type="number"
                                  min="1"
                                  step="0.01"
                                  required
                                  value={size.originalPrice}
                                  onChange={(e) => handleSizeChange(vIdx, sIdx, "originalPrice", e.target.value)}
                                  className="w-full rounded-[10px] border border-[#d7dcea] bg-[#f8f9fd] pl-6 pr-3 py-2 text-[0.78rem] font-bold text-[#11182d] outline-none focus:border-[#0f49d7] focus:bg-white transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[0.6rem] font-bold text-[#98a4bd]">Selling Price</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.7rem] font-bold text-[#98a4bd]">₹</span>
                                <input
                                  type="number"
                                  min="1"
                                  step="0.01"
                                  required
                                  value={size.sellingPrice}
                                  onChange={(e) => handleSizeChange(vIdx, sIdx, "sellingPrice", e.target.value)}
                                  className={`w-full rounded-[10px] pl-6 pr-3 py-2 text-[0.78rem] font-bold text-[#11182d] outline-none focus:border-[#0f49d7] focus:bg-white transition-all ${size.sellingPrice && size.originalPrice && parseFloat(size.sellingPrice) > parseFloat(size.originalPrice)
                                      ? "border-rose-300 bg-rose-50"
                                      : "border-[#d7dcea] bg-[#f8f9fd]"
                                    }`}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col pb-1 gap-1">
                              <div className="flex-1">
                                {disc > 0 ? (
                                  <span className="inline-flex h-8 w-full items-center justify-center rounded-[10px] bg-emerald-50 text-[0.68rem] font-black text-emerald-600 border border-emerald-100 shadow-inner">
                                    {disc}% OFF
                                  </span>
                                ) : (
                                  <span className="inline-flex h-8 w-full items-center justify-center text-[0.6rem] font-bold text-[#98a4bd]">
                                    NO DISCOUNT
                                  </span>
                                )}
                              </div>
                              {size.sellingPrice && (
                                <div className="text-[10px] font-medium text-[#6d7892] space-y-0.5 px-1">
                                  <div className="flex justify-between">
                                    <span>SGST (2.5% Inc.)</span>
                                    <span className="font-bold">₹{((size.sellingPrice / 1.05) * 0.025).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>CGST (2.5% Inc.)</span>
                                    <span className="font-bold">₹{((size.sellingPrice / 1.05) * 0.025).toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                              {variant.sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSize(vIdx, sIdx)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors self-end mt-1"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 rounded-[18px] border border-[#d7dcea] bg-white p-5 sm:flex-row sm:justify-end shadow-sm">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-[14px] border border-[#d7dcea] bg-white px-8 py-3 text-[0.82rem] font-bold text-[#6d7892] hover:bg-[#f8f9fd] transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-8 py-3 text-[0.82rem] font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                Publish Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
