import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  Package,
  MapPin,
  User,
  Clock,
  Truck,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { API_URL } from "../../utils/constants";

const RUPEE = "\u20B9";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const statusOptions = [
    { value: "PLACED", label: "Placed", color: "bg-[#f4f6fb] text-[#5f6b88]" },
    {
      value: "CONFIRMED",
      label: "Confirmed",
      color: "bg-[#ebf2ff] text-[#2f5fe3]",
    },
    {
      value: "PROCESSING",
      label: "Processing",
      color: "bg-[#fff7e8] text-[#c77719]",
    },
    {
      value: "READY_TO_SHIP",
      label: "Ready to Ship",
      color: "bg-[#edf8ef] text-[#18794e]",
    },
    {
      value: "SHIPPED",
      label: "Shipped",
      color: "bg-[#eef1ff] text-[#5162b5]",
    },
    {
      value: "DELIVERED",
      label: "Delivered",
      color: "bg-[#e9f8ef] text-[#18794e]",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      color: "bg-[#fef0f0] text-[#d14343]",
    },
  ];

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/order/seller/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        setTrackingId(data.order.trackingId || "");
      }
    } catch (err) {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === "SHIPPED" && !trackingId) {
      toast.error("Tracking ID is required for Shipped status");
      return;
    }

    try {
      setUpdating(true);
      const { data } = await axios.put(
        `${API_URL}/order/seller/id/${id}/status`,
        { status: newStatus, trackingId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (data.success) {
        toast.success("Status updated");
        fetchOrder();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="px-0 py-2">
        <div className="mx-auto max-w-md rounded-[26px] border border-[#e3e8ff] bg-white px-5 py-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fef0f0]">
            <AlertCircle className="h-7 w-7 text-[#d14343]" />
          </div>
          <p className="text-[18px] font-semibold text-[#11182d]">
            Order Not Found
          </p>
        </div>
      </div>
    );
  }

  const activeStatusClasses =
    statusOptions.find((status) => status.value === order.status)?.color ||
    "bg-[#f5f7ff] text-[#6f7b99]";

  return (
    <div className="space-y-3 px-0 pb-1">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-1 inline-flex items-center gap-2 px-1 text-[11px] font-semibold text-[#6d7894]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Orders
        </button>

        <div className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9aa6c7]">
                Seller Orders
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[18px] font-semibold tracking-[-0.03em] text-[#11182d]">
                  {order.subOrderId}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${activeStatusClasses}`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 pb-1 text-[11px] text-[#6d7894]">
                <Clock className="h-3.5 w-3.5" />
                Ordered on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="rounded-2xl border border-[#d9e0f7] bg-[#f7f8ff] px-4 py-2.5 text-[12px] text-[#11182d] outline-none focus:border-[#2f5fe3]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
                className="rounded-2xl bg-[#2f5fe3] px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="space-y-3">
            {(newStatus === "SHIPPED" || order.trackingId) && (
              <section className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-[#eef2ff] p-2">
                    <Truck className="h-[18px] w-[18px] text-[#2f5fe3]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#141b2d]">
                    Shipment Tracking
                  </h3>
                </div>

                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                  Assignment AWB / Tracking ID
                </label>
                <input
                  type="text"
                  placeholder="Enter Tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  readOnly={
                    order.status === "SHIPPED" || order.status === "DELIVERED"
                  }
                  className="w-full rounded-2xl border border-[#d8dff3] bg-[#f7f8ff] px-3.5 py-2.5 text-[12px] text-[#11182d] outline-none placeholder:text-[#91a0c5] focus:border-[#2f5fe3]"
                />
                <p className="mt-2 text-[11px] text-[#6d7894]">
                  Verify the tracking ID with your courier partner before
                  updating.
                </p>
              </section>
            )}

            <section className="overflow-hidden rounded-[26px] border border-[#e3e8ff] bg-white">
              <div className="flex items-center justify-between border-b border-[#edf1ff] px-4 py-4 sm:px-5">
                <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#141b2d]">
                  <Package className="h-4 w-4 text-[#2f5fe3]" />
                  Items Summary
                </h3>
                <span className="text-[11px] font-semibold text-[#98a4c4]">
                  {order.items.length} products
                </span>
              </div>

              <div className="space-y-4 px-4 py-4 sm:px-5">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-[22px] border border-[#e7ebff] bg-[#fbfcff] p-4 sm:flex-row"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e4e9fb] bg-[#f5f7ff]">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-7 w-7 text-[#c4cee8]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-[14px] font-semibold text-[#11182d]">
                        {item.name}
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f5f7ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f7b99]">
                          Color: {item.color}
                        </span>
                        <span className="rounded-full bg-[#f5f7ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f7b99]">
                          Size: {item.size}
                        </span>
                        <span className="rounded-full bg-[#f5f7ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f7b99]">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="mt-3 text-[13px] font-semibold text-[#11182d]">
                        {RUPEE}
                        {Number(item.price || 0).toLocaleString("en-IN")}
                        <span className="ml-1 text-[11px] font-medium text-[#98a4c4]">
                          / unit
                        </span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[14px] font-semibold text-[#11182d]">
                        {RUPEE}
                        {Number(
                          (item.price || 0) * (item.quantity || 0),
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-3">
            <section className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef2ff]">
                  <User className="h-4 w-4 text-[#2f5fe3]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#141b2d]">
                  Customer Details
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                    Buyer
                  </label>
                  <p className="mt-1 text-[13px] font-semibold text-[#11182d]">
                    {order.masterOrder?.user?.name}
                  </p>
                  <p className="text-[12px] text-[#6d7894]">
                    {order.masterOrder?.user?.email}
                  </p>
                </div>

                <div className="border-t border-[#edf1ff] pt-4">
                  <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#99a5c5]">
                    <MapPin className="h-3.5 w-3.5" />
                    Shipping To
                  </label>
                  <p className="mt-2 text-[13px] font-semibold text-[#11182d]">
                    {order.masterOrder?.address?.fullName}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#6d7894]">
                    {order.masterOrder?.address?.street},{" "}
                    {order.masterOrder?.address?.city}
                    <br />
                    {order.masterOrder?.address?.state} -{" "}
                    {order.masterOrder?.address?.zipCode}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-[#e3e8ff] bg-white px-4 py-4 sm:px-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8ef]">
                  <DollarSign className="h-4 w-4 text-[#18794e]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#141b2d]">
                  Earnings Breakdown
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#6d7894]">Subtotal</span>
                  <span className="font-semibold text-[#11182d]">
                    {RUPEE}
                    {Number(order.subTotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#6d7894]">Commission</span>
                  <span className="font-semibold text-[#d14343]">
                    -{RUPEE}
                    {Number(order.platformCommission || 0).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#6d7894]">Shipping</span>
                  <span className="font-semibold text-[#11182d]">
                    {RUPEE}
                    {Number(order.shippingCost || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-[#edf1ff] pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#99a5c5]">
                        Seller Payout
                      </p>
                      <p className="mt-1 text-[11px] text-[#6d7894]">
                        Released after delivery
                      </p>
                    </div>
                    <p className="text-[20px] font-semibold text-[#18794e]">
                      {RUPEE}
                      {Number(order.sellerPayout || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-[20px] border border-[#e7ebff] bg-[#f8f9ff] px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-[#2f5fe3]" />
                  <p className="text-[11px] text-[#6d7894]">
                    Payment via{" "}
                    <span className="font-semibold text-[#11182d]">
                      {order.masterOrder?.paymentMethod}
                    </span>{" "}
                    ({order.paymentStatus})
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
