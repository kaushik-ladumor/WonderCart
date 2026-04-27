import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Upload,
  X,
  Plus,
  Minus,
  Package,
  Tag,
  Save,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import Loader from "../../components/Loader";
import axios from "axios";
import { API_URL } from "../../utils/constants";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    variants: [],
  });
  const [newImages, setNewImages] = useState({});

  const calculateDiscount = (originalPrice, sellingPrice) => {
    const op = parseFloat(originalPrice);
    const sp = parseFloat(sellingPrice);
    if (!op || op === 0 || !sp) return 0;
    if (sp > op) return 0;
    return Math.round(((op - sp) / op) * 100);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        document.getElementById("login_modal")?.showModal();
        return;
      }

      const response = await axios.get(`${API_URL}/product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      if (!data.success) {
        setError(data.message || "Failed to load product");
        return;
      }

      const userString = localStorage.getItem("Users");
      const currentUser = userString ? JSON.parse(userString) : null;
      const currentUserId = currentUser?._id;
      const ownerId =
        typeof data.data.owner === "object" ? data.data.owner._id : data.data.owner;

      if (!currentUserId || String(ownerId) !== String(currentUserId)) {
        setError("You don't have permission to edit this product");
        setTimeout(() => navigate("/seller/products"), 2000);
        return;
      }

      const updatedVariants = data.data.variants.map((variant) => ({
        ...variant,
        sizes: variant.sizes.map((size) => ({
          ...size,
          originalPrice: size.originalPrice || 0,
          sellingPrice: size.sellingPrice || 0,
          discount: size.discount || 0,
        })),
      }));

      setFormData({ ...data.data, variants: updatedVariants });
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    const oldColor = updatedVariants[index].color;

    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));

    if (field === "color" && oldColor && value && oldColor !== value && newImages[oldColor]) {
      setNewImages((prev) => {
        const updated = { ...prev };
        updated[value] = updated[oldColor];
        delete updated[oldColor];
        return updated;
      });
    }
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes[sizeIndex] = {
      ...updatedVariants[variantIndex].sizes[sizeIndex],
      [field]:
        field === "stock"
          ? parseInt(value) || 0
          : field === "originalPrice" || field === "sellingPrice"
            ? parseFloat(value) || ""
            : value,
    };
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          images: [],
          sizes: [{ size: "", stock: 0, originalPrice: "", sellingPrice: "" }],
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 1) return;

    const colorToRemove = formData.variants[index].color;
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variants: updatedVariants }));

    if (colorToRemove && newImages[colorToRemove]) {
      setNewImages((prev) => {
        const updated = { ...prev };
        delete updated[colorToRemove];
        return updated;
      });
    }
  };

  const addSize = (variantIndex) => {
    const updated = [...formData.variants];
    updated[variantIndex].sizes.push({
      size: "",
      stock: 0,
      originalPrice: "",
      sellingPrice: "",
    });
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const removeSize = (variantIndex, sizeIndex) => {
    if (formData.variants[variantIndex].sizes.length <= 1) return;
    const updated = [...formData.variants];
    updated[variantIndex].sizes.splice(sizeIndex, 1);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleImageUpload = (variantIndex, files) => {
    const color = formData.variants[variantIndex].color;
    if (!color) {
      toast.error("Please enter a color name first");
      return;
    }

    const filesArray = Array.from(files);
    const existingImages = formData.variants[variantIndex].images.length;
    const existingNewImages = newImages[color]?.length || 0;
    const totalImages = existingImages + existingNewImages + filesArray.length;

    if (totalImages > 5) {
      toast.error("Maximum 5 images per variant");
      return;
    }

    setNewImages((prev) => ({
      ...prev,
      [color]: [...(prev[color] || []), ...filesArray],
    }));
  };

  const removeExistingImage = (variantIndex, imageIndex) => {
    const updated = [...formData.variants];
    updated[variantIndex].images.splice(imageIndex, 1);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const removeNewImage = (color, index) => {
    setNewImages((prev) => {
      const updated = { ...prev };
      updated[color].splice(index, 1);
      if (updated[color].length === 0) delete updated[color];
      return updated;
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.category.trim()) {
      toast.error("Category is required");
      return false;
    }

    for (let i = 0; i < formData.variants.length; i += 1) {
      const variant = formData.variants[i];
      if (!variant.color.trim()) {
        toast.error(`Color required for variant ${i + 1}`);
        return false;
      }

      const hasImages = variant.images.length > 0 || newImages[variant.color]?.length > 0;
      if (!hasImages) {
        toast.error(`At least one image required for variant ${i + 1}`);
        return false;
      }

      for (let j = 0; j < variant.sizes.length; j += 1) {
        const size = variant.sizes[j];
        if (!size.size.trim()) {
          toast.error("Size name required");
          return false;
        }
        if (!size.originalPrice || size.originalPrice <= 0) {
          toast.error("Valid original price required");
          return false;
        }
        if (!size.sellingPrice || size.sellingPrice <= 0) {
          toast.error("Valid selling price required");
          return false;
        }
        if (parseFloat(size.sellingPrice) > parseFloat(size.originalPrice)) {
          toast.error("Selling price cannot be greater than original price");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        document.getElementById("login_modal")?.showModal();
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);

      const variantsData = formData.variants.map((variant) => ({
        color: variant.color,
        existingImages: variant.images || [],
        sizes: variant.sizes.map((size) => ({
          size: size.size,
          stock: parseInt(size.stock),
          originalPrice: parseFloat(size.originalPrice),
          sellingPrice: parseFloat(size.sellingPrice),
        })),
      }));

      formDataToSend.append("variants", JSON.stringify(variantsData));

      Object.keys(newImages).forEach((color) => {
        newImages[color].forEach((file) => {
          formDataToSend.append(color, file);
        });
      });

      const response = await axios.put(
        `${API_URL}/product/update/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        navigate("/seller/products");
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="px-0 py-2 font-poppins">
        <div className="mx-auto max-w-md rounded-[18px] border border-[#d7dcea] bg-white px-5 py-7 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100">
            <AlertCircle className="h-7 w-7 text-rose-600" />
          </div>
          <h2 className="text-[1.1rem] font-bold text-[#11182d]">{error}</h2>
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
              <h1 className="text-[1.35rem] font-bold tracking-tight text-[#11182d]">Edit Product</h1>
              <p className="mt-0.5 text-[0.8rem] text-[#6d7892]">Keep your product listing up to date.</p>
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
                placeholder="Enter product name"
                className="w-full rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] px-4 py-2.5 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#98a4bd] focus:border-[#0f49d7] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#6d7892] ml-1">
                Category *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., T-Shirts, Shoes"
                  className="w-full rounded-[14px] border border-[#d7dcea] bg-[#f8f9fd] px-4 py-2.5 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#98a4bd] focus:border-[#0f49d7] focus:bg-white transition-all"
                />
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
                placeholder="Describe your product in detail..."
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
                <p className="text-[0.72rem] text-[#6d7892]">Update colors, stock, and photos.</p>
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
            {formData.variants.map((variant, vIdx) => (
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
                  {formData.variants.length > 1 && (
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
                      Color *
                    </label>
                    <input
                      type="text"
                      required
                      value={variant.color}
                      onChange={(e) => handleVariantChange(vIdx, "color", e.target.value)}
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
                      {variant.images?.map((img, i) => (
                        <div key={`exist-${i}`} className="group relative">
                          <img
                            src={img}
                            alt="Existing"
                            className="h-20 w-20 rounded-[14px] border border-[#d7dcea] object-cover shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(vIdx, i)}
                            className="absolute -right-2 -top-2 rounded-full bg-white text-rose-600 shadow-md p-0.5 hover:scale-110 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {newImages[variant.color]?.map((file, i) => (
                        <div key={`new-${i}`} className="group relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="New Preview"
                            className="h-20 w-20 rounded-[14px] border border-[#d7dcea] border-dashed object-cover shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(variant.color, i)}
                            className="absolute -right-2 -top-2 rounded-full bg-white text-rose-600 shadow-md p-0.5 hover:scale-110 transition-transform"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {(variant.images?.length || 0) + (newImages[variant.color]?.length || 0) < 5 && (
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
                            <div className="flex items-center justify-between pb-1 gap-2">
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
                              {formData.variants[vIdx].sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSize(vIdx, sIdx)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
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
            disabled={saving}
            className="inline-flex items-center justify-center rounded-[14px] border border-[#d7dcea] bg-white px-8 py-3 text-[0.82rem] font-bold text-[#6d7892] hover:bg-[#f8f9fd] transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-8 py-3 text-[0.82rem] font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
