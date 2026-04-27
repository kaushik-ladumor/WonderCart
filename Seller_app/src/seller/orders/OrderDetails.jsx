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

const RUPEE = "₹";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const statusOptions = [
    { value: "placed", label: "Placed", color: "bg-[#f4f6fb] text-[#5f6b88]" },
    { value: "confirmed", label: "Confirmed", color: "bg-[#ebf2ff] text-[#2f5fe3]" },
    { value: "processing", label: "Processing", color: "bg-[#fff7e8] text-[#c77719]" },
    { value: "shipped", label: "Shipped", color: "bg-[#eef1ff] text-[#5162b5]" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "bg-[#e1f5fe] text-[#0288d1]" },
    { value: "delivered", label: "Delivered", color: "bg-[#e9f8ef] text-[#18794e]" },
    { value: "cancelled", label: "Cancelled", color: "bg-[#fef0f0] text-[#d14343]" },
    { value: "return_requested", label: "Return Requested", color: "bg-[#fff3e0] text-[#e65100]" },
    { value: "returned", label: "Returned", color: "bg-[#f3e5f5] text-[#7b1fa2]" },
    { value: "refunded", label: "Refunded", color: "bg-[#e0f2f1] text-[#00796b]" }
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-[#fef2f2] text-[#ef4444]">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-[#141b2d]">Order Not Found</h2>
        <p className="mt-2 text-[#7c87a2]">The order you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/seller/orders")} className="mt-8 rounded-2xl bg-[#2156d8] px-8 py-3 font-bold text-white transition hover:bg-[#1d4ed8]">
          Back to Orders
        </button>
      </div>
    );
  }

  const activeStatus = statusOptions.find((s) => s.value === order.status);

  return (
    <div className="min-h-screen pb-4 pt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-[#141b2d]">
                {order.subOrderId}
              </h1>
              <span className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${activeStatus?.color || "bg-gray-100 text-gray-400"}`}>
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#7c87a2]">
              <Clock className="h-4 w-4" />
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {newStatus === "shipped" && (
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7c87a2]" />
                <input
                  type="text"
                  placeholder="Tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="h-12 w-full sm:w-48 rounded-2xl border border-[#e2e8f0] bg-white pl-11 pr-4 text-[13px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7c87a2]" />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-[#e2e8f0] bg-[#f8faff] pl-11 pr-10 text-[13px] font-bold text-[#141b2d] outline-none focus:border-[#2156d8] transition-all"
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
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2156d8] px-8 text-[14px] font-bold text-white shadow-xl shadow-blue-100 transition hover:bg-[#1d4ed8] disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-[32px] border border-[#e2e8f0] bg-white">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] px-8 py-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-[#141b2d]">Items Summary</h3>
                  <span className="rounded-lg bg-[#eff4ff] px-2 py-0.5 text-[11px] font-bold text-[#2156d8]">
                    {order.items.length} Items
                  </span>
                </div>
              </div>

              <div className="divide-y divide-[#f1f5f9] px-8">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-6 py-8">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#0f172a] overflow-hidden">
                      <img
                        src={item.image || item.product?.variants?.[0]?.images?.[0] || item.product?.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[#141b2d]">{item.name}</h4>
                      <div className="mt-2 flex gap-4 text-xs font-medium text-[#7c87a2]">
                        <span className="flex items-center gap-1.5">Color: <span className="text-[#141b2d]">{item.color}</span></span>
                        <span className="flex items-center gap-1.5">Size: <span className="text-[#141b2d]">{item.size}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#141b2d]">{RUPEE}{Number(item.price).toLocaleString()}</p>
                      <p className="mt-1 text-xs font-bold text-[#7c87a2]">Qty: {item.quantity.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#f1f5f9] bg-[#fcfdfe] px-8 py-8 text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7c87a2]">Subtotal Value</p>
                <p className="mt-2 text-2xl font-bold text-[#141b2d]">{RUPEE}{Number(order.subTotal).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Tracking ID Card */}
              <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-8">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7c87a2]">Tracking ID</p>
                  <button className="text-[#7c87a2] hover:text-[#2156d8] transition"><Copy className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#18794e]">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#141b2d] uppercase">{order.trackingId || "PENDING-ID"}</p>
                    <p className="text-[11px] font-medium text-[#7c87a2]">via {order.masterOrder?.shippingMethod || "Standard Courier"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Details Card */}
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-8">
              <h3 className="text-base font-bold text-[#141b2d]">Customer Details</h3>

              <div className="mt-8 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#f1f5f9] flex items-center justify-center text-base font-bold text-[#7c87a2] overflow-hidden border border-[#e2e8f0]">
                  <img src={`https://ui-avatars.com/api/?name=${order.masterOrder?.address?.fullName || order.masterOrder?.user?.fullName || 'Customer'}&background=eff4ff&color=2156d8&bold=true`} alt="User" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#141b2d]">
                    {order.masterOrder?.address?.fullName || order.masterOrder?.user?.fullName || order.masterOrder?.user?.username || "Customer"}
                  </p>
                  <p className="text-xs font-medium text-[#7c87a2]">
                    Premium Customer
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7c87a2]">Contact</p>
                  <p className="mt-1 text-sm font-bold text-[#141b2d]">{order.masterOrder?.user?.email}</p>
                  <p className="text-sm font-bold text-[#141b2d]">{order.masterOrder?.address?.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Card */}
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-8">
              <h3 className="text-base font-bold text-[#141b2d] mb-6">Shipping To</h3>

              <p className="text-sm font-medium leading-relaxed text-[#5f6b88]">
                {order.masterOrder?.address?.street}, {order.masterOrder?.address?.city}, {order.masterOrder?.address?.state} - {order.masterOrder?.address?.zipCode}, India
              </p>
            </div>

            {/* Earnings Breakdown */}
            <div className="relative overflow-hidden rounded-[32px] bg-[#2156d8] p-8 text-white shadow-xl shadow-blue-100">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">Earnings Breakdown</p>
                  <span className="rounded-lg bg-[#ffffff20] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    {order.paymentStatus === 'paid' ? 'PROCESSED' : 'PENDING'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[13px] font-bold opacity-80">
                    <span>Order Subtotal</span>
                    <span>{RUPEE}{Number(order.subTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] font-bold opacity-80">
                    <span>Platform Commission (12%)</span>
                    <span>-{RUPEE}{Number(order.platformCommission || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px] font-bold opacity-80">
                    <span>Shipping Charges</span>
                    <span>+{RUPEE}{Number(order.shippingCost || 0).toLocaleString()}</span>
                  </div>

                  <div className="mt-8 border-t border-white/20 pt-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">Actual Payout</p>
                        <p className="mt-2 text-[32px] font-black leading-none">{RUPEE}{Number(order.sellerPayout || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stylized Icon Watermark */}
              <div className="absolute -bottom-4 -right-4 opacity-15">
                <CreditCard className="h-28 w-28 rotate-12" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
