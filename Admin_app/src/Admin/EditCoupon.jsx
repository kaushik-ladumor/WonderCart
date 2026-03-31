import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Tag,
  Ticket,
  Calendar,
  Users,
  Info,
  Sparkles,
  Gift,
  Percent,
  CreditCard,
} from "lucide-react";

function EditCoupon() {
  const { token } = useAuth();
  const { couponId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    dealType: "",
    discount: "",
    maxDiscount: "",
    perUserLimit: 1,
    startDate: "",
    expirationDate: "",
    neverExpires: false,
    targetType: "all",
    targetRole: "user",
    targetCategory: "",
    minCompletedOrders: "",
    minOrderValue: "",
    isFirstOrderOnly: false,
    randomUserCount: "",
  });

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/admin/coupons/${couponId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const coupon = res.data.data;
        if (coupon) {
          setFormData({
            code: coupon.code || "",
            name: coupon.name || "",
            description: coupon.description || "",
            dealType: coupon.dealType || "",
            discount: coupon.discount || "",
            maxDiscount: coupon.maxDiscount || "",
            perUserLimit: coupon.perUserLimit || 1,
            startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
            expirationDate: coupon.expirationDate
              ? coupon.expirationDate.split("T")[0]
              : "",
            neverExpires: !coupon.expirationDate,
            targetType: coupon.targetType || "all",
            targetRole: coupon.targetRole || "user",
            targetCategory: coupon.targetCategory || "",
            minCompletedOrders: coupon.minCompletedOrders || "",
            minOrderValue: coupon.minOrderValue || "",
            isFirstOrderOnly: !!coupon.isFirstOrderOnly,
            randomUserCount: coupon.randomUserCount || "",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load coupon details");
      } finally {
        setLoading(false);
      }
    };

    if (couponId && token) {
      fetchCoupon();
    }
  }, [couponId, token]);

  const updateCoupon = async (e) => {
    e.preventDefault();

    const isDiscountRequired = formData.dealType !== "free_shipping";
    const isExpirationRequired = !formData.neverExpires;

    if (!formData.code || !formData.name || (isDiscountRequired && formData.discount === "") || (isExpirationRequired && !formData.expirationDate)) {
      toast.error("Please fill in all required fields (Code, Name, Discount/Date)");
      return;
    }

    setUpdating(true);
    const dataToSend = {
      ...formData,
      discount: isDiscountRequired ? formData.discount : 0,
      expirationDate: formData.neverExpires ? null : formData.expirationDate,
    };
    try {
      await axios.put(`${API_URL}/admin/coupons/update/${couponId}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Coupon updated successfully");
      navigate("/admin/coupon");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header - FAQ style */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <Gift className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Edit Campaign
          </h1>
          <p className="text-gray-600 text-sm">
            Modify your existing discount code settings
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-5">
          <button
            onClick={() => navigate("/admin/coupon")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </button>
        </div>

        <form onSubmit={updateCoupon} className="space-y-4">
          {/* General Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  General Information
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Coupon Code
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="code"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm font-mono uppercase"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Campaign Name
                  </label>
                  <input
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm resize-none"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Rewards Configuration Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Rewards Configuration
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Deal Type
                </label>
                <select
                  name="dealType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm bg-white"
                  value={formData.dealType}
                  onChange={handleChange}
                >
                  <option value="fixed">Fixed Amount Discount</option>
                  <option value="percentage">Percentage Discount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.dealType !== "free_shipping" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      {formData.dealType === "percentage"
                        ? "Percentage (%)"
                        : "Amount (₹)"}
                    </label>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      value={formData.discount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                {formData.dealType === "percentage" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Maximum Cap (₹)
                    </label>
                    <input
                      name="maxDiscount"
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Per User Limit
                  </label>
                  <input
                    name="perUserLimit"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    value={formData.perUserLimit}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Min Order Value (₹)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="minOrderValue"
                      type="number"
                      min="0"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      placeholder="e.g., 500"
                      value={formData.minOrderValue}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Schedule & Validity
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Start Date (Read Only)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="startDate"
                    type="date"
                    readOnly
                    className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                    value={formData.startDate}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="neverExpires"
                    name="neverExpires"
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={formData.neverExpires}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        neverExpires: e.target.checked,
                        expirationDate: e.target.checked ? "" : prev.expirationDate,
                      }))
                    }
                  />
                  <label
                    htmlFor="neverExpires"
                    className="text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    Never Expires (Lifetime Coupon)
                  </label>
                </div>

                {!formData.neverExpires && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Expiration Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="expirationDate"
                        type="date"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        value={formData.expirationDate}
                        onChange={handleChange}
                        required={!formData.neverExpires}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audience Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Audience Targeting
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["all", "new_users", "loyal_users", "specific_users"].map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, targetType: type }))
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${formData.targetType === type
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {type
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFirstOrderOnly"
                    name="isFirstOrderOnly"
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    checked={formData.isFirstOrderOnly}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFirstOrderOnly: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="isFirstOrderOnly"
                    className="text-xs font-medium text-gray-700 cursor-pointer"
                  >
                    First Order Only (Valid for new customers only)
                  </label>
                </div>
              </div>

              {formData.targetType === "loyal_users" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                  <label className="text-xs font-medium text-blue-900">
                    Minimum Completed Orders
                  </label>
                  <input
                    name="minCompletedOrders"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={formData.minCompletedOrders}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-blue-700">
                    Delivered orders required for eligibility.
                  </p>
                </div>
              )}

              {formData.targetType === "specific_users" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-purple-900">
                      Target User Role
                    </label>
                    <select
                      name="targetRole"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      value={formData.targetRole}
                      onChange={handleChange}
                    >
                      <option value="user">User (Customer)</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-purple-900">
                      Random User Count
                    </label>
                    <input
                      name="randomUserCount"
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      value={formData.randomUserCount}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-[10px] text-purple-700">
                      Note: Changing role or count here won't re-randomize users. Use "allowedUsers" list for manual control.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Targeting Card */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Inventory Targeting
                </h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Product Category (Optional)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="targetCategory"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    placeholder="e.g., Footwear, Electronics (Leave empty for all)"
                    value={formData.targetCategory}
                    onChange={handleChange}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  If set, this coupon will only apply to products in this category.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
}

export default EditCoupon;
