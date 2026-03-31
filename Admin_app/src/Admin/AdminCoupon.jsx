import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";
import axios from "axios";
import {
  Trash2,
  Plus,
  Pencil,
  Ticket,
  Calendar,
  Users,
  Percent,
  CreditCard,
  ChevronRight,
  HelpCircle,
  Tag,
  Gift,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function AdminCoupon() {
  const [coupon, setCoupon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/admin/coupons/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCoupon(response.data.data.coupon);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch coupons");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, []);

  const deleteCoupon = async (couponId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/coupons/delete/${couponId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCoupon((prev) => prev.filter((c) => c._id !== couponId));
      toast.success("Campaign deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete campaign");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Header - FAQ style */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <Gift className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Marketing Hub
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Design and manage your promotional strategies
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
            <Ticket className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Total Campaigns: {coupon.length}
            </span>
          </div>
        </div>

        {/* Add Button - FAQ style CTA */}
        <div className="mb-8 text-center">
          <Link
            to="/admin/coupon/add"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {coupon.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
              Start by creating your first promotional discount code to boost
              sales.
            </p>
            <Link
              to="/admin/coupon/add"
              className="inline-flex items-center gap-2 text-black font-medium text-sm hover:gap-3 transition-all"
            >
              Create Campaign <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {coupon.map((c) => (
              <div
                key={c._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
              >
                <div className="p-5">
                  {/* Header with Code and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-base truncate">
                          {c.code}
                        </h3>
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.name}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <Link
                        to={`/admin/coupon/edit/${c._id}`}
                        className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => deleteCoupon(c._id)}
                        className="p-1.5 border border-gray-200 rounded hover:bg-red-50 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Deal Type Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${c.dealType === "percentage"
                        ? "bg-orange-50 text-orange-700 border border-orange-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                    >
                      {c.dealType === "percentage" ? (
                        <Percent className="w-3 h-3" />
                      ) : (
                        <CreditCard className="w-3 h-3" />
                      )}
                      {c.dealType === "percentage"
                        ? `${c.discount}% OFF`
                        : `₹${c.discount} OFF`}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Target</span>
                      <span className="font-medium text-gray-900">
                        {c.targetType
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Expires
                      </span>
                      <span className="font-medium text-gray-900">
                        {c.expirationDate
                          ? new Date(c.expirationDate).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Per user
                      </span>
                      <span className="font-medium text-gray-900">
                        {c.perUserLimit} time{c.perUserLimit > 1 ? "s" : ""}
                      </span>
                    </div>
                    {c.minOrderValue > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Min Order
                        </span>
                        <span className="font-medium text-gray-900 border-b border-dashed border-gray-300">
                          ₹{c.minOrderValue}
                        </span>
                      </div>
                    )}
                    {c.isFirstOrderOnly && (
                      <div className="flex items-center justify-between text-xs text-blue-600 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> First Order Only
                        </span>
                      </div>
                    )}
                    {c.targetCategory && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Category
                        </span>
                        <span className="font-medium text-black bg-gray-100 px-1.5 py-0.5 rounded">
                          {c.targetCategory}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Tag className="w-3 h-3" />
                      <span>Campaign ID: {c._id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCoupon;
