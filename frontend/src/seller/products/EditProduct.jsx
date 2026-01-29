// src/seller/products/EditProduct.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Type,
} from "lucide-react";

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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        navigate("/login");
        return;
      }
      const response = await fetch(`http://localhost:4000/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to load product");
        return;
      }

      const userString = localStorage.getItem("Users");
      const currentUser = userString ? JSON.parse(userString) : null;
      const currentUserId = currentUser?._id;

      const ownerId =
        typeof data.data.owner === "object"
          ? data.data.owner._id
          : data.data.owner;

      if (!currentUserId || String(ownerId) !== String(currentUserId)) {
        setError("You don't have permission to edit this product");
        setTimeout(() => navigate("/seller/products"), 2000);
        return;
      }

      const updatedVariants = data.data.variants.map((variant) => ({
        ...variant,
        sizes: variant.sizes.map((size) => ({
          ...size,
          discount: size.discount || 0,
        })),
      }));

      setFormData({ ...data.data, variants: updatedVariants });
    } catch (err) {
      setError("Failed to load product data");
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

    if (
      field === "color" &&
      oldColor &&
      value &&
      oldColor !== value &&
      newImages[oldColor]
    ) {
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
        field === "stock" || field === "discount"
          ? parseInt(value) || 0
          : field === "price"
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
          sizes: [{ size: "", stock: 0, price: "", discount: 0 }],
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
      price: "",
      discount: 0,
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
    if (!formData.name.trim()) return alert("Product name is required"), false;
    if (!formData.category.trim()) return alert("Category is required"), false;

    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.color.trim())
        return toast.error(`Color required for variant ${i + 1}`), false;

      const hasImages = v.images.length > 0 || newImages[v.color]?.length > 0;
      if (!hasImages)
        return toast.error(`At least one image required for variant ${i + 1}`), false;

      for (let j = 0; j < v.sizes.length; j++) {
        const s = v.sizes[j];
        if (!s.size.trim()) return toast.error(`Size name required`), false;
        if (!s.price || s.price <= 0)
          return toast.error(`Valid price required`), false;
        if (s.discount < 0 || s.discount > 100)
          return toast.error(`Discount must be 0–100%`), false;
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
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);

      const variantsData = formData.variants.map((v) => ({
        color: v.color,
        existingImages: v.images || [],
        sizes: v.sizes.map((s) => ({
          size: s.size,
          stock: parseInt(s.stock),
          price: parseFloat(s.price),
          discount: parseInt(s.discount) || 0,
        })),
      }));

      formDataToSend.append("variants", JSON.stringify(variantsData));

      Object.keys(newImages).forEach((color) => {
        newImages[color].forEach((file) => formDataToSend.append(color, file));
      });

      const res = await fetch(`http://localhost:4000/product/update/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");

      toast.success("Product updated successfully!");
      navigate("/seller/products");
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Package className="w-12 h-12 text-gray-800" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md border border-gray-200"
        >
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{error}</h2>
          <button
            onClick={() => navigate("/seller/products")}
            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Back to Products
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Edit Product
          </h1>
          <p className="text-gray-600 text-sm">
            Update your product details and variants
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Package className="w-6 h-6 text-gray-800" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  placeholder="e.g., T-Shirts, Shoes, Electronics"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                  placeholder="Describe your product in detail..."
                />
              </div>
            </div>
          </motion.section>

          {/* Variants Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Tag className="w-5 h-5 text-gray-800" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Variant
              </button>
            </div>

            {formData.variants.map((variant, vIdx) => (
              <motion.div
                key={vIdx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Variant {vIdx + 1} {variant.color && `- ${variant.color}`}
                  </h3>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIdx)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>

                {/* Color */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) =>
                      handleVariantChange(vIdx, "color", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
                    placeholder="e.g., Black, Navy Blue"
                  />
                </div>

                {/* Images */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Images *
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {variant.images?.map((img, i) => (
                      <div key={`exist-${i}`} className="relative group">
                        <img
                          src={img}
                          alt="Existing"
                          className="w-32 h-32 object-cover rounded-xl border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(vIdx, i)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {newImages[variant.color]?.map((file, i) => (
                      <div key={`new-${i}`} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New"
                          className="w-32 h-32 object-cover rounded-xl border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(variant.color, i)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <label className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-600 hover:bg-gray-100 transition">
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm text-gray-600">Upload</span>
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
                  </div>
                </div>

                {/* Sizes Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Sizes & Pricing *
                    </label>
                    <button
                      type="button"
                      onClick={() => addSize(vIdx)}
                      className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Size
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variant.sizes.map((size, sIdx) => (
                      <div
                        key={sIdx}
                        className="grid grid-cols-4 gap-4 items-center"
                      >
                        <input
                          type="text"
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(vIdx, sIdx, "size", e.target.value)
                          }
                          placeholder="Size"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
                        />
                        <input
                          value={size.stock}
                          onChange={(e) =>
                            handleSizeChange(
                              vIdx,
                              sIdx,
                              "stock",
                              e.target.value
                            )
                          }
                          min="0"
                          placeholder="Stock"
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
                        />
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                            ₹
                          </span>
                          <input
                            value={size.price}
                            onChange={(e) =>
                              handleSizeChange(
                                vIdx,
                                sIdx,
                                "price",
                                e.target.value
                              )
                            }
                            min="1"
                            step="0.01"
                            placeholder="Price"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
                          />
                        </div>
                        <div className="relative flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                              %
                            </span>
                            <input
                              value={size.discount}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIdx,
                                  sIdx,
                                  "discount",
                                  e.target.value
                                )
                              }
                              min="0"
                              max="100"
                              placeholder="Disc"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none transition"
                            />
                          </div>
                          {variant.sizes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSize(vIdx, sIdx)}
                              className="p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <Minus className="w-5 h-5 text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-xl  hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
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
