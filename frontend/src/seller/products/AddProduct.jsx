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
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

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
      sizes: [{ size: "", stock: 0, price: "", discount: 0 }],
    },
  ]);

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
      field === "stock" || field === "discount"
        ? parseInt(value) || 0
        : field === "price"
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
        sizes: [{ size: "", stock: 0, price: "", discount: 0 }],
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
    updated[vIdx].sizes.push({ size: "", stock: 0, price: "", discount: 0 });
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
          !s.price ||
          parseFloat(s.price) <= 0 ||
          s.discount < 0 ||
          s.discount > 100
        ) {
          toast.error(`Invalid size/price/stock/discount in ${v.color}`);
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
          price: parseFloat(s.price),
          discount: parseInt(s.discount) || 0,
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
    <div className="min-h-screen sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-semibold text- text-center">
            Add New Product
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-md p-8"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Package className="w-4 h-4 text-black" />
              </div>
              <h2 className="text-2xl font-semibold text-black">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Wireless Headphones"
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, Fashion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe features, materials, benefits..."
                  className="w-full px-3 py-2  border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </motion.section>

          {/* Variants */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Tag className="w-4 h-4 text-black" />
                </div>
                <h2 className="text-2xl font-semibold text-black">
                  Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Variant
              </button>
            </div>

            {variants.map((variant, vIdx) => (
              <motion.div
                key={vIdx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">
                    Variant {vIdx + 1}
                  </h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Color */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={variant.color}
                    onChange={(e) => handleVariantChange(vIdx, e.target.value)}
                    placeholder="e.g., Space Gray, Midnight Blue"
                    className="w-full px-3 py-2  border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                {/* Images */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Images (Max 5) *
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {variant.imagePreviews.map((src, iIdx) => (
                      <div key={iIdx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${iIdx + 1}`}
                          className="w-full h-32 object-cover rounded-2xl border-2 border-gray-200 group-hover:border-black transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(vIdx, iIdx)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                    {variant.imagePreviews.length < 5 && (
                      <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload</span>
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
                  <p className="text-sm text-gray-500 mt-3">
                    {variant.imagePreviews.length}/5 images
                  </p>
                </div>

                {/* Sizes Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-gray-700">
                      Sizes & Pricing *
                    </label>
                    <button
                      type="button"
                      onClick={() => addSize(vIdx)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Size
                    </button>
                  </div>

                  <div className="space-y-4">
                    {variant.sizes.map((size, sIdx) => (
                      <motion.div
                        key={sIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
                      >
                        <input
                          type="text"
                          required
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(vIdx, sIdx, "size", e.target.value)
                          }
                          placeholder="Size"
                          className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
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
                              e.target.value
                            )
                          }
                          placeholder="Stock"
                          className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <input
                            min="1"
                            step="0.01"
                            required
                            value={size.price}
                            onChange={(e) =>
                              handleSizeChange(
                                vIdx,
                                sIdx,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Price"
                            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                          <input
                            min="0"
                            max="100"
                            required
                            value={size.discount}
                            onChange={(e) =>
                              handleSizeChange(
                                vIdx,
                                sIdx,
                                "discount",
                                e.target.value
                              )
                            }
                            placeholder="Discount"
                            className="w-full pl-10 px-3 py-2  border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                          />
                        </div>
                        {variant.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSize(vIdx, sIdx)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Product...
                </>
              ) : (
                "Publish Product"
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
