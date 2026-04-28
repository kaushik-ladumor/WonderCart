import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Printer,
  ChevronRight,
  ExternalLink,
  Copy,
  Info,
  CreditCard,
  FileText,
  AlertTriangle,
  Bell,
  HelpCircle
} from "lucide-react";
import { API_URL } from "../../utils/constants";

const formatPrice = (price) =>
  `Rs ${Math.round(Number(price || 0)).toLocaleString("en-IN")}`;

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const statusOptions = [
    { value: "placed", label: "Placed", color: "bg-[#f8f9fd] text-[#6d7892] border border-[#d7dcea]" },
    { value: "confirmed", label: "Confirmed", color: "bg-[#eef2ff] text-[#0f49d7] border border-[#c6d4f9]" },
    { value: "processing", label: "Processing", color: "bg-[#fff8eb] text-[#d97706] border border-[#fde68a]" },
    { value: "shipped", label: "Shipped", color: "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc]" },
    { value: "delivered", label: "Delivered", color: "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]" },
    { value: "cancelled", label: "Cancelled", color: "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]" },
    { value: "return_requested", label: "Return Requested", color: "bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]" },
    { value: "returned", label: "Returned", color: "bg-[#fdf4ff] text-[#c026d3] border border-[#fbcfe8]" },
    { value: "refunded", label: "Refunded", color: "bg-[#f0fdfa] text-[#0d9488] border border-[#ccfbf1]" }
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

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 font-poppins text-[#11182d]">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#fef2f2] text-[#ef4444]">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-[1.5rem] font-semibold text-[#11182d]">Order Not Found</h2>
        <p className="mt-2 text-[0.9rem] text-[#6d7892]">The order you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/seller/orders")} className="mt-8 rounded-[14px] bg-[#0f49d7] px-8 py-3 font-semibold text-white transition hover:bg-[#0d3ebb]">
          Back to Orders
        </button>
      </div>
    );
  }

  const activeStatus = statusOptions.find((s) => s.value === order.status);

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d] font-poppins">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
                {order.subOrderId}
              </h1>
              <span className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider ${activeStatus?.color || "bg-[#f8f9fd] text-[#6d7892] border border-[#d7dcea]"}`}>
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-[0.82rem] font-medium text-[#6d7892]">
              <Clock className="h-4 w-4" />
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {newStatus === "shipped" && (
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6d7892]" />
                <input
                  type="text"
                  placeholder="Tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="h-11 w-full sm:w-48 rounded-[14px] border border-[#d7dcea] bg-white pl-11 pr-4 text-[0.82rem] font-semibold text-[#11182d] outline-none focus:border-[#0f49d7] transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6d7892]" />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-11 w-full appearance-none rounded-[14px] border border-[#d7dcea] bg-white pl-11 pr-10 text-[0.82rem] font-semibold text-[#11182d] outline-none focus:border-[#0f49d7] transition-all"
              >
                {statusOptions
                  .filter(opt => opt.value === order.status || (order.status !== 'cancelled' && order.status !== 'delivered' && opt.value !== 'placed'))
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>
            <button
              onClick={() => handleStatusUpdate()}
              disabled={updating || (newStatus === order.status && trackingId === (order.trackingId || ""))}
              className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0f49d7] px-6 text-[0.88rem] font-semibold text-white shadow-sm transition hover:bg-[#0d3ebb] disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[18px] border border-[#e1e5f1] bg-white">
              <div className="flex items-center justify-between border-b border-[#e1e5f1] px-4 py-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-[1.1rem] font-semibold text-[#11182d]">Items Summary</h3>
                  <span className="rounded-md bg-[#eef2ff] px-2 py-0.5 text-[0.74rem] font-semibold text-[#0f49d7]">
                    {order.items.length} Items
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#e1e5f1] px-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-2.5 py-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f1f4fb] overflow-hidden border border-[#e1e5f1]">
                      <img
                        src={item.image || item.product?.variants?.[0]?.images?.[0] || item.product?.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-2 mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.82rem] font-semibold text-[#11182d]">{item.name}</p>
                      <p className="mt-0.5 text-[0.74rem] text-[#6d7892]">
                        Qty: {item.quantity}
                        {item.size ? ` • ${item.size}` : ""}
                        {item.color ? ` • ${item.color}` : ""}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] font-semibold text-[#11182d]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e1e5f1] bg-[#f8f9fd] px-4 py-4 text-right">
                <p className="text-[0.74rem] font-semibold uppercase tracking-wider text-[#6d7892]">Subtotal Value</p>
                <p className="mt-1 text-[1.25rem] font-semibold text-[#11182d]">{formatPrice(order.subTotal)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Tracking ID Card */}
              <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[0.74rem] font-bold uppercase tracking-wider text-[#6d7892]">Tracking ID</p>
                  <button className="text-[#6d7892] hover:text-[#0f49d7] transition"><Copy className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-[#11182d] uppercase">{order.trackingId || "PENDING-ID"}</p>
                    <p className="text-[0.78rem] font-medium text-[#6d7892]">via {order.masterOrder?.shippingMethod || "Standard Courier"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24">
            {/* Customer Details Card */}
            <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
              <h3 className="text-[1.05rem] font-semibold text-[#11182d] mb-3">Customer Details</h3>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#eef2ff] flex items-center justify-center text-[1rem] font-bold text-[#0f49d7] overflow-hidden border border-[#e1e5f1]">
                  <img src={`https://ui-avatars.com/api/?name=${order.masterOrder?.address?.fullName || order.masterOrder?.user?.fullName || 'Customer'}&background=eef2ff&color=0f49d7&bold=true`} alt="User" />
                </div>
                <div>
                  <p className="text-[0.9rem] font-semibold text-[#11182d]">
                    {order.masterOrder?.address?.fullName || order.masterOrder?.user?.fullName || order.masterOrder?.user?.username || "Customer"}
                  </p>
                  <p className="text-[0.78rem] text-[#6d7892]">
                    Premium Customer
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[0.74rem] font-semibold uppercase tracking-wider text-[#6d7892] mb-1">Contact</p>
                  <p className="text-[0.82rem] font-semibold text-[#11182d]">{order.masterOrder?.user?.email}</p>
                  <p className="text-[0.82rem] font-semibold text-[#11182d] mt-0.5">{order.masterOrder?.address?.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Card */}
            <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-4">
              <h3 className="text-[1.05rem] font-semibold text-[#11182d] mb-3">Shipping To</h3>

              <p className="text-[0.82rem] leading-5 text-[#33415e]">
                {order.masterOrder?.address?.street}<br/>
                {order.masterOrder?.address?.city}, {order.masterOrder?.address?.state} - {order.masterOrder?.address?.zipCode}<br/>
                India
              </p>
            </div>

            {/* Earnings Breakdown */}
            <div className="relative overflow-hidden rounded-[18px] bg-[#0f49d7] p-4 text-white shadow-sm">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[0.74rem] font-bold uppercase tracking-wider text-[#eef2ff]">Earnings Breakdown</p>
                  <span className="rounded-md bg-[#ffffff20] px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-white">
                    {order.paymentStatus === 'paid' ? 'PROCESSED' : 'PENDING'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[0.82rem] font-medium opacity-90">
                    <span>Order Subtotal</span>
                    <span>{formatPrice(order.subTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[0.82rem] font-medium opacity-90">
                    <span>Platform Commission (12%)</span>
                    <span>-{formatPrice(order.platformCommission)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[0.82rem] font-medium opacity-90">
                    <span>Shipping Charges</span>
                    <span>+{formatPrice(order.shippingCost)}</span>
                  </div>

                  <div className="mt-4 border-t border-white/20 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.74rem] font-bold uppercase tracking-wider text-[#eef2ff]">Actual Payout</p>
                        <p className="mt-1 text-[1.5rem] font-bold leading-none text-white">{formatPrice(order.sellerPayout)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stylized Icon Watermark */}
              <div className="absolute -bottom-4 -right-4 opacity-15">
                <CreditCard className="h-24 w-24 rotate-12" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
