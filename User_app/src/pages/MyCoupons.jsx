import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Gift,
  Search,
  ShoppingBag,
  Target,
  Ticket,
  Truck,
  Zap,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../utils/constants";

const getCouponTypeIcon = (coupon) => {
  if (coupon.dealType === "free_shipping") return Truck;
  if (coupon.targetCategory) return ShoppingBag;
  return Ticket;
};

const isCouponExpired = (coupon) =>
  Boolean(coupon.expirationDate) &&
  new Date(coupon.expirationDate).getTime() < Date.now();

const formatDiscount = (coupon) => {
  if (coupon.dealType === "percentage") return `${coupon.discount}%`;
  if (coupon.dealType === "free_shipping") return "Rs 0";
  return `Rs ${Number(coupon.discount || 0).toLocaleString()}`;
};

const formatDescription = (coupon) =>
  coupon.description ||
  `Get ${coupon.discount}${coupon.dealType === "percentage" ? "%" : " Rs"} off on your next purchase.`;

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

  const filteredCoupons = useMemo(() => {
    if (!searchTerm) return coupons;

    return coupons.filter(
      (coupon) =>
        coupon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [coupons, searchTerm]);

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
    <div className="min-h-screen bg-[#f6f7fb] pb-6 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="rounded-[18px] bg-[#f2f4fb] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#dfe7ff] text-[#0f49d7]">
              <Gift className="h-5 w-5" />
            </div>
            <h1 className="mt-3 text-[1.55rem] font-semibold tracking-tight text-[#11182d] sm:text-[1.75rem]">
              My Rewards
            </h1>
            <p className="mt-1.5 text-[0.82rem] text-[#4e5b78] sm:text-[0.86rem]">
              Exclusive offers and coupons tailored for you
            </p>

            <div className="mx-auto mt-4 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b87a0]" />
                <input
                  type="text"
                  placeholder="Search for coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-[14px] border border-[#dfe5f2] bg-[#eef2ff] pl-10 pr-4 text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#7b87a0]"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[16px] bg-white px-5 py-12 text-center text-[0.82rem] text-[#62708d]">
            Loading your rewards...
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="mt-4 space-y-3">
            {filteredCoupons.map((coupon) => {
              const expired = isCouponExpired(coupon);
              const Icon = getCouponTypeIcon(coupon);

              return (
                <div
                  key={coupon._id}
                  className={`overflow-hidden rounded-[16px] border ${
                    expired
                      ? "border-[#e5e8f0] bg-[#f4f6fa] text-[#8a93a7]"
                      : "border-[#e0e6f2] bg-white"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[90px_minmax(0,1fr)_160px]">
                    <div
                      className={`flex min-h-[96px] items-center justify-center ${
                        expired ? "bg-[#eef1f6]" : "bg-[#edf2ff]"
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-[#0f49d7]">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="border-b border-[#edf1f7] px-4 py-4 lg:border-b-0 lg:border-r">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className={`text-[1rem] font-semibold ${
                            expired ? "text-[#7e8799]" : "text-[#11182d]"
                          }`}
                        >
                          {coupon.name || "Special Offer"}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            expired
                              ? "bg-[#e7ebf2] text-[#8a93a7]"
                              : "bg-[#dfe7ff] text-[#0f49d7]"
                          }`}
                        >
                          {coupon.code}
                        </span>
                      </div>

                      <p
                        className={`mt-1.5 text-[0.8rem] leading-5 ${
                          expired ? "text-[#9aa3b5]" : "text-[#2f3a55]"
                        }`}
                      >
                        {formatDescription(coupon)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span
                          className={`flex items-center gap-2 ${
                            expired ? "text-[#9aa3b5]" : "text-[#6a7690]"
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                          {formatExpiry(coupon)}
                        </span>

                        {coupon.isFirstOrderOnly && (
                          <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f49d7]">
                            First Order
                          </span>
                        )}

                        {coupon.minOrderValue > 0 && (
                          <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3362a8]">
                            Min Rs {Number(coupon.minOrderValue).toLocaleString()}
                          </span>
                        )}

                        {coupon.targetCategory && (
                          <span className="rounded-full bg-[#f2f4f8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a576f]">
                            {coupon.targetCategory}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start justify-center gap-2.5 px-4 py-4 lg:items-end">
                      <div className="text-left lg:text-right">
                        <div
                          className={`text-[1.5rem] font-semibold ${
                            expired ? "text-[#a0a8b8]" : "text-[#11182d]"
                          }`}
                        >
                          {formatDiscount(coupon)}
                        </div>
                        <div
                          className={`mt-0.5 text-[0.76rem] font-semibold uppercase tracking-[0.12em] ${
                            expired ? "text-[#a0a8b8]" : "text-[#11182d]"
                          }`}
                        >
                          Off
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyCode(coupon)}
                        disabled={expired}
                        className={`min-w-[120px] rounded-xl px-3 py-2 text-[0.78rem] font-semibold ${
                          expired
                            ? "bg-[#dfe4ec] text-[#7f889a]"
                            : "bg-[#0f49d7] text-white"
                        }`}
                      >
                        {expired ? "Expired" : "Copy Code"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] bg-white px-5 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#eef2ff] text-[#0f49d7]">
              <Gift className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-[1rem] font-semibold text-[#11182d]">
              {searchTerm ? "No matching coupons" : "No active rewards"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[0.82rem] leading-5 text-[#62708d]">
              {searchTerm
                ? `No results found for "${searchTerm}".`
                : "Keep shopping and you'll unlock exclusive coupons and rewards soon."}
            </p>
            <button
              onClick={() => (searchTerm ? setSearchTerm("") : navigate("/shop"))}
              className="mt-4 rounded-xl bg-[#0f49d7] px-4 py-2 text-[0.8rem] font-semibold text-white"
            >
              {searchTerm ? "Clear Search" : "Shop Now"}
            </button>
          </div>
        )}

        <div className="mt-5 rounded-[18px] bg-[#283146] px-5 py-6 text-white sm:px-6">
          <h3 className="text-center text-[1.2rem] font-semibold">
            How to use your coupons
          </h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {rewardSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="mt-3 text-[0.95rem] font-semibold">{step.title}</h4>
                  <p className="mt-1.5 text-[0.78rem] leading-5 text-[#c3cada]">
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
