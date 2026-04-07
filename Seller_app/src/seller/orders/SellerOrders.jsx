import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  Search,
  Clock,
  Package,
  ShoppingBag,
  DollarSign,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";
import { API_URL } from "../../utils/constants";

const RUPEE = "\u20B9";

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const statusOptions = [
    "All",
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "READY_TO_SHIP",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/order/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (mustShipBy) => {
    const today = new Date();
    const deadline = new Date(mustShipBy);
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredOrders = orders.filter((pkg) => {
    const searchLower = searchTerm.toLowerCase();
    const buyerEmail = pkg.masterOrder?.user?.email || "";
    const matchesSearch =
      buyerEmail.toLowerCase().includes(searchLower) ||
      pkg.subOrderId.toLowerCase().includes(searchLower);

    const matchesStatus = selectedStatus === "All" || pkg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusClasses = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-[#f4f6fb] text-[#5f6b88]";
      case "CONFIRMED":
        return "bg-[#ebf2ff] text-[#2f5fe3]";
      case "PROCESSING":
        return "bg-[#fff7e8] text-[#c77719]";
      case "READY_TO_SHIP":
        return "bg-[#edf8ef] text-[#18794e]";
      case "SHIPPED":
        return "bg-[#eef1ff] text-[#5162b5]";
      case "DELIVERED":
        return "bg-[#e9f8ef] text-[#18794e]";
      case "CANCELLED":
        return "bg-[#fef0f0] text-[#d14343]";
      default:
        return "bg-[#f5f7ff] text-[#6f7b99]";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <Loader />;

  const activeOrders = orders.filter((order) => order.status !== "DELIVERED").length;
  const dueOrders = orders.filter(
    (order) =>
      calculateDaysLeft(order.mustShipBy) <= 1 &&
      !["SHIPPED", "DELIVERED"].includes(order.status),
  ).length;
  const projectedPayout = orders.reduce(
    (sum, order) => sum + (order.sellerPayout || 0),
    0,
  );
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;

  const statCards = [
    {
      label: "Active Orders",
      value: activeOrders,
      icon: ShoppingBag,
      iconClasses: "bg-[#eaf0ff] text-[#2f5fe3]",
      valueClasses: "text-[#11182d]",
    },
    {
      label: "Shipment SLAs",
      value: `${dueOrders} Due`,
      icon: Clock,
      iconClasses: "bg-[#fff7e8] text-[#c77719]",
      valueClasses: "text-[#c77719]",
    },
    {
      label: "Projected Payout",
      value: `${RUPEE}${projectedPayout.toLocaleString("en-IN")}`,
      icon: DollarSign,
      iconClasses: "bg-[#e9f8ef] text-[#18794e]",
      valueClasses: "text-[#18794e]",
    },
    {
      label: "Delivered Orders",
      value: deliveredOrders,
      icon: Package,
      iconClasses: "bg-[#f5f7ff] text-[#7481a2]",
      valueClasses: "text-[#11182d]",
    },
  ];

  return (
    <div className="space-y-4 px-0 pb-1">
      <div className="mx-auto max-w-7xl">
        <div className="px-1 py-0.5 sm:px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9aa6c7]">
            Seller Orders
          </p>
          <h1 className="mt-0.5 text-[18px] font-semibold tracking-[-0.03em] text-[#11182d]">
            Seller Orders
          </h1>
          <p className="mt-0.5 pb-1.5 text-[11px] text-[#6d7894]">
            Manage your shipments, fulfillment timeline, and seller payouts.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-[24px] border border-[#e3e8ff] bg-white px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98a4c4]">
                      {card.label}
                    </p>
                    <p className={`mt-2 text-[22px] font-semibold ${card.valueClasses}`}>
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.iconClasses}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4.5 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7d88a8]" />
              <input
                type="text"
                placeholder="Search order ID or buyer email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#d9e0f7] bg-[#f7f8ff] py-2.5 pl-11 pr-10 text-[12px] text-[#11182d] outline-none placeholder:text-[#7f8aac] focus:border-[#2f5fe3]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#7d88a8]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-2xl border border-[#d9e0f7] bg-[#f7f8ff] px-4 py-2.5 text-[12px] text-[#11182d] outline-none focus:border-[#2f5fe3]"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 border-t border-[#edf1ff] pb-2.5 pt-3">
            <p className="text-[11px] text-[#7d88a8]">
              Showing <span className="font-semibold text-[#11182d]">{filteredOrders.length}</span>{" "}
              orders{selectedStatus !== "All" ? ` in ${selectedStatus.replaceAll("_", " ")}` : ""}
            </p>
          </div>
        </section>

        <section className="space-y-3 pt-1.5">
          {filteredOrders.length === 0 ? (
            <div className="rounded-[26px] border border-[#e3e8ff] bg-white px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#f2f5ff]">
                <Package className="h-6 w-6 text-[#7481a2]" />
              </div>
              <p className="text-[13px] font-medium text-[#6d7894]">
                No orders found for the selected criteria.
              </p>
            </div>
          ) : (
            filteredOrders.map((pkg) => {
              const daysLeft = calculateDaysLeft(pkg.mustShipBy);
              const isUrgent =
                !["SHIPPED", "DELIVERED", "CANCELLED"].includes(pkg.status) &&
                daysLeft <= 1;

              return (
                <div
                  key={pkg._id}
                  className="rounded-[24px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5f7ff] text-[12px] font-semibold text-[#7481a2]">
                        {pkg.items.length}x
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14px] font-semibold text-[#11182d]">
                            {pkg.subOrderId}
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                              pkg.paymentStatus === "paid"
                                ? "bg-[#ebf8ef] text-[#18794e]"
                                : "bg-[#fff4e8] text-[#c77719]"
                            }`}
                          >
                            {pkg.paymentStatus === "paid" ? "Prepaid" : "COD"}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#7d88a8]">
                          <span className="truncate">{pkg.masterOrder?.user?.email}</span>
                          <span className="text-[#c3cce2]">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(pkg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(pkg.status)}`}
                      >
                        {pkg.status.replaceAll("_", " ")}
                      </span>

                      {!["SHIPPED", "DELIVERED", "CANCELLED"].includes(pkg.status) && (
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            isUrgent
                              ? "bg-[#fef0f0] text-[#d14343]"
                              : "bg-[#f5f7ff] text-[#6f7b99]"
                          }`}
                        >
                          {daysLeft < 0 ? "Delayed" : `Ship in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                        </span>
                      )}

                      <div className="min-w-[112px]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98a4c4]">
                          Earnings
                        </p>
                        <p className="mt-1 text-[14px] font-semibold text-[#18794e]">
                          {RUPEE}
                          {Number(pkg.sellerPayout || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(`/seller/orders/${pkg._id}`)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d7def7] bg-[#f7f8ff] text-[#5c6989]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default SellerOrders;
