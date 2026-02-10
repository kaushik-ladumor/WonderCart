// src/seller/products/AddProduct.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  X,
  Plus,
  Minus,
  Package,
  Tag,
  ArrowLeft,
  Image as ImageIcon,
  Save,
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Calculate discount percentage
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
    updated[vIdx].sizes.push({ size: "", stock: 0, originalPrice: "", sellingPrice: "" });
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
      ...fileArray.map((f) => URL.createObjectURL(f)),
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

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.color.trim()) {
        toast.error(`Enter color for variant ${i + 1}`);
        return false;
      }
      if (v.imageFiles.length === 0) {
        toast.error(`Upload at least 1 image for ${v.color}`);
        return false;
      }
      for (let j = 0; j < v.sizes.length; j++) {
        const s = v.sizes[j];
        if (
          !s.size.trim() ||
          s.stock < 0 ||
          !s.originalPrice ||
          parseFloat(s.originalPrice) <= 0 ||
          !s.sellingPrice ||
          parseFloat(s.sellingPrice) <= 0
        ) {
          toast.error(`Invalid size/price/stock in ${v.color}`);
          return false;
        }
        if (parseFloat(s.sellingPrice) > parseFloat(s.originalPrice)) {
          toast.error(`Selling price cannot be greater than original price in ${v.color}`);
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

      const variantsData = variants.map((v) => ({
        color: v.color.trim(),
        sizes: v.sizes.map((s) => ({
          size: s.size.trim(),
          stock: parseInt(s.stock),
          originalPrice: parseFloat(s.originalPrice),
          sellingPrice: parseFloat(s.sellingPrice),
        })),
      }));
      formDataToSend.append("variants", JSON.stringify(variantsData));

      variants.forEach((v) => {
        v.imageFiles.forEach((file) => {
          formDataToSend.append(v.color, file);
        });
      });

      await axios.post("http://localhost:4000/product/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product added successfully!");
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Fill in the details below to add a new product
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Wireless Headphones"
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, Fashion"
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe features, materials, benefits..."
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            {variants.map((variant, vIdx) => (
              <div
                key={vIdx}
                className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200 last:mb-0"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-medium text-gray-900">
                    Variant {vIdx + 1} {variant.color && `- ${variant.color}`}
                  </h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="p-1.5 hover:bg-gray-200 rounded transition"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>

                {/* Color Input */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={variant.color}
                    onChange={(e) => handleVariantChange(vIdx, e.target.value)}
                    placeholder="e.g., Space Gray, Midnight Blue"
                    className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {/* Images Section */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Images (Max 5) *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {variant.imagePreviews.map((src, iIdx) => (
                      <div key={iIdx} className="relative">
                        <img
                          src={src}
                          alt={`Preview ${iIdx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(vIdx, iIdx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {variant.imagePreviews.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition">
                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(vIdx, e.target.files)
                          }
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {variant.imagePreviews.length}/5 images
                  </p>
                </div>

                {/* Sizes Section */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <label className="text-xs font-medium text-gray-700">
                      Sizes & Pricing *
                    </label>
                    <button
                      type="button"
                      onClick={() => addSize(vIdx)}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center gap-1 w-full sm:w-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Size
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variant.sizes.map((size, sIdx) => {
                      const disc = calculateDiscount(size.originalPrice, size.sellingPrice);
                      return (
                        <div
                          key={sIdx}
                          className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                        >
                          <input
                            type="text"
                            required
                            value={size.size}
                            onChange={(e) =>
                              handleSizeChange(vIdx, sIdx, "size", e.target.value)
                            }
                            placeholder="Size"
                            className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                          <input
                            min="0"
                            required
                            value={size.stock}
                            onChange={(e) =>
                              handleSizeChange(
                                vIdx,
                                sIdx,
                                "stock",
                                e.target.value,
                              )
                            }
                            placeholder="Stock"
                            className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              ₹
                            </span>
                            <input
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
                              className="w-full text-sm pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              ₹
                            </span>
                            <input
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
                              className={`w-full text-sm pl-8 pr-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-900 ${size.sellingPrice && size.originalPrice && parseFloat(size.sellingPrice) > parseFloat(size.originalPrice)
                                  ? "border-red-400 bg-red-50"
                                  : "border-gray-300"
                                }`}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            {disc > 0 ? (
                              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
                                {disc}% OFF
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 px-2 py-1">
                                No discount
                              </span>
                            )}
                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSize(vIdx, sIdx)}
                                className="p-1.5 hover:bg-red-50 rounded transition"
                              >
                                <Minus className="w-4 h-4 text-red-500" />
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              disabled={loading}
              className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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
