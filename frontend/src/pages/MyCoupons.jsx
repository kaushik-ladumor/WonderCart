import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  Calendar,
  ChevronLeft,
  ShoppingBag,
  Zap,
  Target,
  Gift,
  Search,
  HelpCircle,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const response = await axios.get(`${API_URL}/user/coupons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoupons(response.data.coupons || []);
      } catch (error) {
        toast.error("Failed to load your rewards");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [navigate]);

  const filteredCoupons = searchTerm
    ? coupons.filter(
      (coupon) =>
        coupon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    : coupons;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header - FAQ style */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <Gift className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">My Rewards</h1>
          <p className="text-gray-600 text-sm">
            Exclusive offers and coupons tailored for you
          </p>
        </div>

        {/* Search - FAQ style */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm">Loading your rewards...</p>
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="space-y-4 mb-5">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {coupon.name || "Special Offer"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          Code:{" "}
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {coupon.code}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {coupon.dealType === "percentage"
                          ? `${coupon.discount}%`
                          : `₹${coupon.discount}`}
                      </span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        OFF
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {coupon.description ||
                      `Get ${coupon.discount}${coupon.dealType === "percentage" ? "%" : "₹"} off on your next purchase.`}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {coupon.expirationDate
                          ? `Expires ${new Date(coupon.expirationDate).toLocaleDateString()}`
                          : "Never expires"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {coupon.isFirstOrderOnly && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-100">
                          <Zap className="w-3 h-3" /> 1st Order
                        </div>
                      )}
                      {coupon.minOrderValue > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                          Min: ₹{coupon.minOrderValue}
                        </div>
                      )}
                      {coupon.targetCategory && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <ShoppingBag className="w-3 h-3" />
                          {coupon.targetCategory}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mb-5">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {searchTerm ? "No matching coupons" : "No active rewards"}
            </h3>
            <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
              {searchTerm
                ? `No results found for "${searchTerm}"`
                : "Keep shopping and you'll unlock exclusive coupons and rewards soon."}
            </p>
            <button
              onClick={() => (searchTerm ? setSearchTerm("") : navigate("/"))}
              className="inline-block bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              {searchTerm ? "Clear search" : "Shop Now"}
            </button>
          </div>
        )}

        {/* Info Section - FAQ style CTA */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-lg p-5">
          <h3 className="text-base font-bold mb-3 text-center">
            How to use your coupons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-sm text-white mb-1">
                Instant Savings
              </h4>
              <p className="text-xs text-gray-300">Apply codes at checkout</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-sm text-white mb-1">
                Exclusive Offers
              </h4>
              <p className="text-xs text-gray-300">Based on your preferences</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-sm text-white mb-1">
                Special Occasions
              </h4>
              <p className="text-xs text-gray-300">
                Birthday & anniversary offers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoupons;
