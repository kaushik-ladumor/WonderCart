import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketProvider";
import Loader from "../../components/Loader";
import { 
  Package, 
  MapPin, 
  User, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Hash,
  ArrowLeft,
  DollarSign,
  ShieldCheck
} from "lucide-react";
import { API_URL } from "../../utils/constants";

const OrderDetails = () => {
  const { id } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const statusOptions = [
    { value: "PLACED", label: "Placed", color: "bg-gray-100 text-gray-700" },
    { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-50 text-blue-700" },
    { value: "PROCESSING", label: "Processing", color: "bg-yellow-50 text-yellow-700" },
    { value: "READY_TO_SHIP", label: "Ready to Ship", color: "bg-orange-50 text-orange-700" },
    { value: "SHIPPED", label: "Shipped", color: "bg-indigo-50 text-indigo-700" },
    { value: "DELIVERED", label: "Delivered", color: "bg-green-50 text-green-700" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-red-50 text-red-700" },
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
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
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
  if (!order) return <div className="p-20 text-center">Order Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{order.subOrderId}</h1>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusOptions.find(s => s.value === order.status)?.color}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Ordered on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="bg-white p-2 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-2">
               <select 
                 value={newStatus}
                 onChange={(e) => setNewStatus(e.target.value)}
                 className="px-4 py-2 bg-transparent outline-none text-sm font-bold border-none"
               >
                 {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
               <button 
                 onClick={handleStatusUpdate}
                 disabled={updating || newStatus === order.status}
                 className="bg-black text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
               >
                 {updating ? "Updating..." : "Update Status"}
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tracking ID Section */}
            {newStatus === "SHIPPED" || order.trackingId ? (
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/10">
                 <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-6 h-6 text-indigo-200" />
                    <h3 className="text-lg font-bold">Shipment Tracking</h3>
                 </div>
                 <div className="space-y-4">
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-[0.2em]">Assignment AWB / Tracking ID</p>
                    <input 
                      type="text" 
                      placeholder="Enter Tracking ID" 
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      readOnly={order.status === 'SHIPPED' || order.status === 'DELIVERED'}
                      className="w-full bg-indigo-500/30 border border-white/20 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-indigo-200 outline-none focus:bg-indigo-500/50"
                    />
                    <p className="text-[10px] text-indigo-200 font-medium">Verify tracking ID with your courier partner before updating.</p>
                 </div>
              </div>
            ) : null}

            {/* Items Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" /> Items Summary
                  </h3>
                  <span className="text-xs font-bold text-gray-400 capitalize">{order.items.length} Products</span>
               </div>
               <div className="p-8">
                  <div className="space-y-6">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-200" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                          <div className="flex flex-wrap gap-4 mt-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Color: {item.color}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Size: {item.size}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Qty: {item.quantity}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-4">₹{item.price?.toLocaleString()} <span className="text-xs text-gray-400 font-medium ml-1">/ unit</span></p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer & Address */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Customer Details</h3>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Buyer</label>
                    <p className="text-sm font-bold text-gray-900 mt-1">{order.masterOrder?.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.masterOrder?.user?.email}</p>
                  </div>
                  <div className="pt-6 border-t border-gray-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Shipping To
                    </label>
                    <p className="text-sm font-bold text-gray-900 mt-2">{order.masterOrder?.address?.fullName}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 uppercase tracking-tight">
                      {order.masterOrder?.address?.street}, {order.masterOrder?.address?.city}<br />
                      {order.masterOrder?.address?.state} - {order.masterOrder?.address?.zipCode}
                    </p>
                  </div>
               </div>
            </div>

            {/* Payout Breakdown */}
            <div className="bg-gray-900 rounded-[2rem] text-white p-8 shadow-xl shadow-blue-900/10">
               <div className="flex items-center gap-3 mb-8">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold">Earnings Breakdown</h3>
               </div>
               
               <div className="space-y-5">
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-xs uppercase font-bold tracking-widest">Subtotal</span>
                    <span className="text-sm font-bold">₹{order.subTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-400">
                    <span className="text-xs uppercase font-bold tracking-widest">Commission</span>
                    <span className="text-sm font-bold">-₹{order.platformCommission?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-xs uppercase font-bold tracking-widest">Shipping</span>
                    <span className="text-sm font-bold">₹{order.shippingCost?.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Seller Payout</p>
                          <p className="text-[9px] text-white/40 mt-0.5 italic">Released after delivery</p>
                       </div>
                       <p className="text-2xl font-black text-green-400 tracking-tighter">₹{order.sellerPayout?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white/5 rounded-2xl p-4 flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-blue-400" />
                     <p className="text-[11px] font-medium text-white/60">Payment via <span className="text-white font-bold">{order.masterOrder?.paymentMethod}</span> ({order.paymentStatus})</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
