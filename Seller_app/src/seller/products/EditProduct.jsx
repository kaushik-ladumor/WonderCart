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
      <div className="px-0 py-2">
        <div className="mx-auto max-w-md rounded-[26px] border border-[#e3e8ff] bg-white px-5 py-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef0f0]">
            <AlertCircle className="h-7 w-7 text-[#d14343]" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#11182d]">{error}</h2>
          <button
            onClick={() => navigate("/seller/products")}
            className="mt-5 rounded-2xl bg-[#2f5fe3] px-5 py-2.5 text-[12px] font-semibold text-white"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 px-0 pb-1">
      <div className="mx-auto max-w-6xl">
        <div className="px-1 py-0.5 sm:px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9aa6c7]">
            Seller Products
          </p>
          <h1 className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em] text-[#11182d]">
            Edit Product
          </h1>
          <p className="mt-0.5 pb-1.5 text-[11px] text-[#6d7894]">
            Update your product details and variants.
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
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="w-full rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="e.g., T-Shirts, Shoes"
                  className="w-full rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe your product in detail..."
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

            {formData.variants.map((variant, vIdx) => (
              <div
                key={vIdx}
                className="mb-4 rounded-[24px] border border-[#e7ebff] bg-[#f8f9ff] p-4 last:mb-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#141b2d]">
                    Variant {vIdx + 1} {variant.color && `- ${variant.color}`}
                  </h3>
                  {formData.variants.length > 1 && (
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
                    Color *
                  </label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(vIdx, "color", e.target.value)}
                    required
                    placeholder="e.g., Black, Navy Blue"
                    className="w-full rounded-2xl border border-[#d8dff3] bg-white px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                  />
                </div>

                <div className="mb-5">
                  <label className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Images *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variant.images?.map((img, i) => (
                      <div key={`exist-${i}`} className="relative">
                        <img
                          src={img}
                          alt="Existing"
                          className="h-20 w-20 rounded-2xl border border-[#d8dff3] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(vIdx, i)}
                          className="absolute -right-2 -top-2 rounded-full bg-[#d14343] p-1 text-white"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}

                    {newImages[variant.color]?.map((file, i) => (
                      <div key={`new-${i}`} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New"
                          className="h-20 w-20 rounded-2xl border border-[#d8dff3] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(variant.color, i)}
                          className="absolute -right-2 -top-2 rounded-full bg-[#d14343] p-1 text-white"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}

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
                  </div>
                  <p className="mt-2 text-[11px] text-[#7d88a8]">
                    {variant.images?.length || 0} existing +{" "}
                    {newImages[variant.color]?.length || 0} new ={" "}
                    {(variant.images?.length || 0) + (newImages[variant.color]?.length || 0)}{" "}
                    images
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
                              value={size.originalPrice}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIdx,
                                  sIdx,
                                  "originalPrice",
                                  e.target.value,
                                )
                              }
                              min="1"
                              step="0.01"
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
                              value={size.sellingPrice}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIdx,
                                  sIdx,
                                  "sellingPrice",
                                  e.target.value,
                                )
                              }
                              min="1"
                              step="0.01"
                              placeholder="Selling Price"
                              className={`w-full rounded-2xl py-2.5 pl-8 pr-3 text-[12px] outline-none focus:border-[#2f5fe3] ${
                                size.sellingPrice &&
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
              disabled={saving}
              className="order-2 rounded-2xl border border-[#d7def7] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#55617f] disabled:opacity-50 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="order-1 flex items-center justify-center gap-2 rounded-2xl bg-[#2f5fe3] px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50 sm:order-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
