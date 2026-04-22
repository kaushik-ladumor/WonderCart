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
  ChevronLeft,
  ChevronRight,
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 pb-10 font-poppins bg-[#f8f9fc] min-h-screen px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Order Settlement Hub</h1>
          <p className="mt-1 text-sm text-[#66728d]">
            Monitor platform-wide transactions, tracking, and fulfillment cycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Find Order ID, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 bg-white border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-medium outline-none transition-all focus:border-[#2563eb] shadow-sm"
              />
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="bg-transparent text-[13px] font-semibold focus:outline-none pr-4"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Dispatched', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Fulfillment Goal', value: '4.8d', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Platform GMV', value: `₹${orders.filter(o => o.status !== 'cancelled').reduce((acc, current) => acc + (current.totalAmount || 0), 0).toLocaleString()}`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((met, i) => (
          <div key={i} className="rounded-[22px] border border-[#e7ebf5] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${met.bg} flex items-center justify-center ${met.color}`}>
                <met.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{met.label}</p>
                <h4 className="text-base font-bold text-[#1a2238] leading-none truncate">{met.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {paginatedOrders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[24px] border border-[#e7ebf5] shadow-sm">
             <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-sm font-bold text-[#1a2238]">No orders found in catalog</p>
             <p className="text-xs text-gray-400 mt-1">Try resetting your filters or search query.</p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-[24px] border border-[#eef2f8] overflow-hidden hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300">
              {/* Row Header */}
              <div 
                onClick={() => toggleExpand(order._id)}
                className="px-6 py-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-white rounded-xl border border-[#eef2f8] flex items-center justify-center text-[#1a2238] shadow-sm">
                     <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">M-O-ID</p>
                     <h3 className="text-sm font-bold text-[#141b2d] font-mono tracking-tight">{order.orderId}</h3>
                  </div>
                </div>

                <div className="hidden lg:block lg:min-w-[140px]">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Customer Account</p>
                   <p className="text-xs font-bold text-[#1a2238] truncate">{order.user?.name || "Premium User"}</p>
                </div>

                <div className="hidden sm:block">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 text-center">Settlement Status</p>
                   <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status?.replaceAll("_", " ")}
                   </span>
                </div>

                <div className="lg:min-w-[100px] text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Net Flow</p>
                   <p className="text-sm font-bold text-[#1a2238]">₹{order.totalAmount?.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-4">
                   <div className="hidden xl:block text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Created</p>
                      <p className="text-[11px] font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                   </div>
                   <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${expandedOrder === order._id ? "bg-[#0f172a] text-white" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                      {expandedOrder === order._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                   </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {expandedOrder === order._id && (
                <div className="px-6 pb-6 pt-2 border-t border-[#f1f4f9] bg-[#fcfdfe]/50 animate-in fade-in slide-in-from-top-1 duration-300">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                      
                      {/* Shipping Context */}
                      <div className="lg:col-span-4 space-y-4">
                         <div className="bg-white p-5 rounded-[20px] border border-[#eef2f8] shadow-sm">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                               <MapPin className="w-3.5 h-3.5" /> Logistic Protocol
                            </h4>
                            <div className="space-y-1">
                               <p className="text-[13px] font-bold text-[#1a2238]">{order.address?.fullName}</p>
                               <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                                  {order.address?.street}<br />
                                  {order.address?.city}, {order.address?.state} - {order.address?.zipCode}
                               </p>
                               <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                  <span className="text-[11px] font-bold text-[#1a2238]">MOB: {order.address?.phone}</span>
                               </div>
                            </div>
                         </div>

                         <div className="bg-[#0f172a] p-5 rounded-[20px] text-white shadow-xl shadow-gray-200">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Transaction Audit</h4>
                            <div className="space-y-3">
                               <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Ledger Entry</span>
                                  <span className="font-bold">₹{order.totalAmount?.toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Credit Credits</span>
                                  <span className="font-bold text-blue-400 font-mono">- ₹{order.walletAmount?.toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Channel</p>
                                   <p className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">{order.paymentMethod}</p>
                                </div>
                            </div>
                         </div>
                      </div>

                      {/* Package Breakdown */}
                      <div className="lg:col-span-8">
                         <div className="flex items-center justify-between mb-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                               <Package className="w-3.5 h-3.5" /> Fulfillment Units ({order.subOrders?.length})
                            </h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.subOrders?.map((sub, idx) => (
                               <div key={idx} className="bg-white p-5 rounded-[22px] border border-[#eef2f8] shadow-sm flex flex-col justify-between hover:border-blue-100 transition-colors">
                                  <div>
                                     <div className="flex justify-between items-start mb-4">
                                        <div>
                                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">S-O-ID</p>
                                           <p className="text-xs font-bold text-[#1a2238] font-mono">{sub.subOrderId}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(sub.status)}`}>
                                           {sub.status}
                                        </span>
                                     </div>
                                     
                                     <div className="space-y-3">
                                        {sub.items?.map((item, iIdx) => (
                                           <div key={iIdx} className="flex gap-3">
                                              <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden shadow-sm">
                                                 <img 
                                                   src={item.image || item.product?.image || item.product?.variants?.[0]?.images?.[0]} 
                                                   alt="" 
                                                   className="w-full h-full object-contain p-1" 
                                                 />
                                              </div>
                                              <div className="min-w-0">
                                                 <p className="text-[11px] font-bold text-gray-800 truncate">{item.name}</p>
                                                 <p className="text-[9px] text-gray-400 font-bold uppercase">Qty: {item.quantity} &bull; {item.size}</p>
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>

                                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                                     <div>
                                        <p className="text-[9px] font-black text-gray-300 uppercase leading-none mb-1">Origin Partner</p>
                                        <p className="text-[11px] font-bold text-blue-600 truncate">{sub.seller?.shopName || "Vendor"}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-300 uppercase leading-none mb-1">Platform Cut</p>
                                        <p className="text-[11px] font-bold text-emerald-600">₹{sub.platformCommission}</p>
                                     </div>
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-[#eef2f8] rounded-[24px] px-8 py-5 shadow-sm">
          <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">
            Displaying <span className="text-[#1a2238]">{paginatedOrders.length}</span> of <span className="text-[#1a2238]">{filteredOrders.length}</span> Master Records
          </p>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-[#eef2f8] text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
             >
               <ChevronLeft className="h-5 w-5" />
             </button>
             
             {[...Array(totalPages)].map((_, i) => (
                <button
                   key={i + 1}
                   onClick={() => setCurrentPage(i + 1)}
                   className={`h-10 w-10 flex items-center justify-center rounded-xl text-[13px] font-bold transition-all ${
                      currentPage === i + 1 
                      ? "bg-[#0f172a] text-white shadow-xl shadow-gray-200" 
                      : "bg-white border border-[#eef2f8] text-gray-400 hover:text-[#0f172a]"
                   }`}
                >
                   {i + 1}
                </button>
             ))}

             <button 
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-[#eef2f8] text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
             >
               <ChevronRight className="h-5 w-5" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
