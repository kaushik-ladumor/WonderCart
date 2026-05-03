import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Gift,
  ShoppingBag,
  Target,
  Ticket,
  Truck,
  Zap,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

const getCouponTypeIcon = (coupon) => {
  if (coupon.couponType === "free_shipping") return Truck;
  if (coupon.targetCategory) return ShoppingBag;
  return Ticket;
};

const isCouponExpired = (coupon) =>
  Boolean(coupon.expirationDate) &&
  new Date(coupon.expirationDate).getTime() < Date.now();

const formatDiscount = (coupon) => {
  if (coupon.couponType === "percentage") return `${coupon.discountAmount}%`;
  if (coupon.couponType === "free_shipping") return "Rs 0";
  return `Rs ${Number(coupon.discountAmount || 0).toLocaleString()}`;
};

const formatDescription = (coupon) =>
  coupon.description ||
  `Get ${coupon.discountAmount}${coupon.couponType === "percentage" ? "%" : " Rs"} off on your next purchase.`;

const formatExpiry = (coupon) =>
  coupon.expirationDate
    ? `Expires ${new Date(coupon.expirationDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`
    : "Never expires";

const rewardSteps = [
  {
    title: "Instant Savings",
    description:
      "Simply copy the code and paste it at checkout to apply your discount instantly.",
    icon: Zap,
  },
  {
    title: "Exclusive Offers",
    description:
      "Check back often for premium rewards selected around your shopping preferences.",
    icon: Target,
  },
  {
    title: "Special Occasions",
    description:
      "Seasonal and milestone rewards appear automatically when you become eligible.",
    icon: Gift,
  },
];

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const couponsRes = await axios.get(`${API_URL}/coupon/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setCoupons(couponsRes.data.coupons || []);
      } catch (error) {
        toast.error("Failed to load your rewards");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCopyCode = async (coupon) => {
    if (isCouponExpired(coupon)) return;

    try {
      await navigator.clipboard.writeText(coupon.code || "");
      toast.success("Coupon code copied");
    } catch (error) {
      toast.error("Failed to copy coupon code");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-10 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Clean Checkout-style Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff] text-[#0f49d7]">
              <Gift className="h-4 w-4" />
            </div>
            <h1 className="text-[1.55rem] font-bold tracking-tight text-[#11182d]">
              My Rewards
            </h1>
          </div>
          <p className="text-[0.82rem] text-[#6d7892] ml-11">
            Exclusive offers and coupons tailored for you
          </p>
        </div>

        {loading ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : coupons.length > 0 ? (
          <div className="space-y-3">
            <div className="px-1 mb-2">
              <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#6d7892]">
                Available Rewards ({coupons.length})
              </h2>
            </div>

            {coupons.map((coupon) => {
              const isUsed = coupon.isUsed;
              const expired = isCouponExpired(coupon) || isUsed;
              const Icon = getCouponTypeIcon(coupon);

              return (
                <div
                  key={coupon._id}
                  className={`relative overflow-hidden rounded-[18px] border transition-all ${
                    expired
                      ? "border-[#e5e8f0] bg-[#fcfdfe]"
                      : "border-[#e1e5f1] bg-white hover:border-[#0f49d7]/30 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Value Section */}
                    <div
                      className={`flex w-full items-center justify-center p-5 lg:w-[120px] ${
                        expired ? "bg-[#f8f9fb]" : "bg-[#f4f7ff]"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-sm ${
                            expired ? "text-[#8a93a7]" : "text-[#0f49d7]"
                          }`}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div
                          className={`text-[1rem] font-bold ${expired ? "text-[#8a93a7]" : "text-[#11182d]"}`}
                        >
                          {formatDiscount(coupon)}
                        </div>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 border-t border-[#edf1f7] p-5 lg:border-l lg:border-t-0">
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-[0.95rem] font-semibold ${expired ? "text-[#7e8799]" : "text-[#11182d]"}`}
                            >
                              {coupon.name || "Special Offer"}
                            </h3>
                            <span
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                expired
                                  ? "bg-[#f0f2f5] text-[#8a93a7]"
                                  : "bg-[#0f49d7] text-white"
                              }`}
                            >
                              {coupon.code}
                            </span>
                          </div>

                          <p
                            className={`mt-1.5 text-[0.78rem] leading-5 ${expired ? "text-[#9aa3b5]" : "text-[#42506d]"}`}
                          >
                            {formatDescription(coupon)}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#f4f7fb] pt-3.5">
                          <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-[#6d7892]">
                            <Calendar className="h-3.5 w-3.5 text-[#0f49d7]" />
                            {formatExpiry(coupon)}
                          </div>

                          {coupon.minOrderValue > 0 && (
                            <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-[#6d7892]">
                              <Target className="h-3.5 w-3.5 text-[#0f49d7]" />
                              Min Rs{" "}
                              {Number(coupon.minOrderValue).toLocaleString()}
                            </div>
                          )}

                          {coupon.isFirstOrderOnly && (
                            <span className="rounded-md bg-[#f0fdf4] px-2 py-0.5 text-[9px] font-bold uppercase text-[#15803d]">
                              First Order
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col items-center justify-center p-5 lg:w-[160px] lg:border-l lg:border-[#f4f7fb]">
                      <button
                        onClick={() => handleCopyCode(coupon)}
                        disabled={expired}
                        className={`w-full rounded-[12px] h-10 text-[0.78rem] font-semibold transition-all ${
                          expired
                            ? "bg-[#f0f2f5] text-[#8a93a7] cursor-not-allowed"
                            : "bg-[#11182d] text-white hover:bg-black"
                        }`}
                      >
                        {isUsed ? "Used" : expired ? "Expired" : "Copy Code"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[18px] bg-white border border-[#e1e5f1] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#f8f9fb] text-[#b0b8cb]">
              <Ticket className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-[1.1rem] font-semibold text-[#11182d]">
              No active rewards
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.82rem] text-[#6d7892]">
              Keep exploring our collection for new exclusive offers.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="mt-5 rounded-[12px] bg-[#0f49d7] px-5 py-2 text-[0.78rem] font-semibold text-white transition-all hover:bg-[#0042cc]"
            >
              Start Shopping
            </button>
          </div>
        )}



        {/* Info Section */}
        <div className="mt-8">
          <div className="px-1 mb-4">
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#6d7892]">
              Usage Guide
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {rewardSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-[18px] bg-white border border-[#e1e5f1] p-5"
                >
                  <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f4f7ff] text-[#0f49d7]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-[0.9rem] font-semibold text-[#11182d]">
                    {step.title}
                  </h4>
                  <p className="mt-1.5 text-[0.76rem] leading-5 text-[#5d6a84]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoupons;
