// src/seller/products/EditProduct.jsx
import React, { useState, useEffect } from "react";
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
  Type,
  Image as ImageIcon,
  ChevronLeft,
} from "lucide-react";
import Loader from "../../components/Loader";
import axios from "axios"; // Add axios for better error handling

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

      const response = await axios.get(
        `http://localhost:4000/product/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

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

    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.color.trim()) {
        toast.error(`Color required for variant ${i + 1}`);
        return false;
      }

      const hasImages = v.images.length > 0 || newImages[v.color]?.length > 0;
      if (!hasImages) {
        toast.error(`At least one image required for variant ${i + 1}`);
        return false;
      }

      for (let j = 0; j < v.sizes.length; j++) {
        const s = v.sizes[j];
        if (!s.size.trim()) {
          toast.error(`Size name required`);
          return false;
        }
        if (!s.price || s.price <= 0) {
          toast.error(`Valid price required`);
          return false;
        }
        if (s.discount < 0 || s.discount > 100) {
          toast.error(`Discount must be 0–100%`);
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
        navigate("/login");
        return;
      }

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
        newImages[color].forEach((file) => {
          formDataToSend.append(color, file);
        });
      });

      const response = await axios.put(
        `http://localhost:4000/product/update/${id}`,
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

  if (loading) {
    return (
        <Loader />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{error}</h2>
          <button
            onClick={() => navigate("/seller/products")}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600 mt-1">
                Update your product details and variants
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
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., T-Shirts, Shoes"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Describe your product in detail..."
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

            {formData.variants.map((variant, vIdx) => (
              <div
                key={vIdx}
                className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200 last:mb-0"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-medium text-gray-900">
                    Variant {vIdx + 1} {variant.color && `- ${variant.color}`}
                  </h3>
                  {formData.variants.length > 1 && (
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
                    Color *
                  </label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) =>
                      handleVariantChange(vIdx, "color", e.target.value)
                    }
                    required
                    className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="e.g., Black, Navy Blue"
                  />
                </div>

                {/* Images Section */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Images *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {/* Existing Images */}
                    {variant.images?.map((img, i) => (
                      <div key={`exist-${i}`} className="relative">
                        <img
                          src={img}
                          alt="Existing"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(vIdx, i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}

                    {/* New Images */}
                    {newImages[variant.color]?.map((file, i) => (
                      <div key={`new-${i}`} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(variant.color, i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}

                    {/* Upload Button */}
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
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {variant.images?.length || 0} existing +{" "}
                    {newImages[variant.color]?.length || 0} new ={" "}
                    {(variant.images?.length || 0) +
                      (newImages[variant.color]?.length || 0)}{" "}
                    images
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
                    {variant.sizes.map((size, sIdx) => (
                      <div
                        key={sIdx}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
                      >
                        <input
                          type="text"
                          value={size.size}
                          onChange={(e) =>
                            handleSizeChange(vIdx, sIdx, "size", e.target.value)
                          }
                          placeholder="Size"
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                        <input
                          value={size.stock}
                          onChange={(e) =>
                            handleSizeChange(
                              vIdx,
                              sIdx,
                              "stock",
                              e.target.value,
                            )
                          }
                          min="0"
                          placeholder="Stock"
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            ₹
                          </span>
                          <input
                            value={size.price}
                            onChange={(e) =>
                              handleSizeChange(
                                vIdx,
                                sIdx,
                                "price",
                                e.target.value,
                              )
                            }
                            min="1"
                            step="0.01"
                            placeholder="Price"
                            className="w-full text-sm pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              %
                            </span>
                            <input
                              value={size.discount}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIdx,
                                  sIdx,
                                  "discount",
                                  e.target.value,
                                )
                              }
                              min="0"
                              max="100"
                              placeholder="Discount"
                              className="w-full text-sm pl-8 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                          </div>
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
                    ))}
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
              disabled={saving}
              className="px-5 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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
