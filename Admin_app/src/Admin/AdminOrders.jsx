import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import { useAuth } from "../context/AuthProvider";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  ShoppingBag,
  Clock,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Truck,
  AlertCircle
} from "lucide-react";

const RUPEE = "₹";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { token } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/order/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusColor = (status) => {
    const config = {
      pending: "bg-gray-100 text-gray-700 border-gray-200",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      processing: "bg-amber-50 text-amber-700 border-amber-200",
      packed: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
      partially_shipped: "bg-indigo-50 text-indigo-600 border-indigo-100",
      delivered: "bg-emerald-600 text-white border-transparent",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
      returned: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return config[status?.toLowerCase()] || "bg-gray-50 text-gray-600";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Master Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and monitor all platform-wide customer transactions</p>
          </div>
          
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                   type="text" 
                   placeholder="Search ID, Name, Email..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
             </div>
             <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="bg-transparent text-sm font-medium focus:outline-none"
                >
                   <option value="All">All Status</option>
                   <option value="pending">Pending</option>
                   <option value="confirmed">Confirmed</option>
                   <option value="processing">Processing</option>
                   <option value="shipped">Shipped</option>
                   <option value="delivered">Delivered</option>
                   <option value="cancelled">Cancelled</option>
                </select>
             </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
               <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-500 font-medium">No orders found matching your criteria</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Master Row */}
                <div 
                   onClick={() => toggleExpand(order._id)}
                   className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Order Identifier</p>
                      <h3 className="text-[15px] font-bold text-gray-900 font-mono">{order.orderId}</h3>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                    <p className="text-sm font-semibold text-gray-900">{order.user?.name}</p>
                    <p className="text-[11px] text-gray-500">{order.user?.email}</p>
                  </div>

                  <div className="hidden lg:block">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-900">{RUPEE}{order.totalAmount?.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-500">{order.paymentMethod}</p>
                  </div>

                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 text-center font-body ">Status</p>
                     <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status?.replaceAll("_", " ")}
                     </span>
                  </div>

                  <div className="flex items-center gap-3">
                     <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Date</p>
                        <p className="text-xs font-medium text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                     </div>
                     <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400">
                        {expandedOrder === order._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                     </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order._id && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                      
                      {/* Shipping & User Info */}
                      <div className="space-y-4">
                         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                               <MapPin className="w-3.5 h-3.5" /> Shipping Details
                            </h4>
                            <p className="text-sm font-bold text-gray-900 mb-1">{order.address?.fullName}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                               {order.address?.street}<br />
                               {order.address?.city}, {order.address?.state} - {order.address?.zipCode}
                            </p>
                            <p className="mt-2 text-xs font-medium text-gray-900">T: {order.address?.phone}</p>
                         </div>

                         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                               <IndianRupee className="w-3.5 h-3.5" /> Financial Split
                            </h4>
                            <div className="space-y-2">
                               <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Master Total</span>
                                  <span className="font-bold text-gray-900">{RUPEE}{order.totalAmount?.toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Wallet Usage</span>
                                  <span className="font-bold text-gray-900">{RUPEE}{order.walletAmount?.toLocaleString()}</span>
                               </div>
                               <div className="pt-2 border-t border-gray-100 flex justify-between text-xs">
                                  <span className="font-bold text-gray-900">Settlement Method</span>
                                  <span className="font-bold text-indigo-600">{order.paymentMethod}</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Packages (Sub-Orders) */}
                      <div className="lg:col-span-2">
                         <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            <Package className="w-3.5 h-3.5" /> Constituent Sub-Orders ({order.subOrders?.length})
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.subOrders?.map((sub, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                 <div>
                                    <div className="flex justify-between items-start mb-3">
                                       <div>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Sub-Order ID</p>
                                          <p className="text-sm font-bold text-gray-900">{sub.subOrderId}</p>
                                       </div>
                                       <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-lg border ${getStatusColor(sub.status)}`}>
                                          {sub.status}
                                       </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                       {sub.items?.map((item, iIdx) => (
                                          <div key={iIdx} className="flex gap-3">
                                             <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                                                <img src={item.product?.image || item.product?.images?.[0]} alt="" className="w-full h-full object-contain p-1" />
                                             </div>
                                             <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-medium">Qty: {item.quantity} &bull; {item.size}</p>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                                    <div className="flex justify-between text-xs">
                                       <span className="text-gray-500 font-medium">Seller Platform</span>
                                       <span className="font-bold text-gray-900">{sub.seller?.shopName || "Vendor"}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                       <span className="text-gray-500 font-medium">Commission (Admin)</span>
                                       <span className="font-bold text-emerald-600">{RUPEE}{sub.platformCommission}</span>
                                    </div>
                                    {sub.trackingId && (
                                       <div className="flex items-center gap-1.5 mt-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                          <Truck className="w-3 h-3" />
                                          <span className="text-[10px] font-bold uppercase tracking-tight">Tracking ID: {sub.trackingId}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
