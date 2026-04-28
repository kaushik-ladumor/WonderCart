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
  ShoppingBag,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";

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
      pending: "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
      confirmed: "bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]",
      processing: "bg-[#fffbeb] text-[#b45309] border-[#fef3c7]",
      packed: "bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]",
      shipped: "bg-[#eef2ff] text-[#4338ca] border-[#e0e7ff]",
      partially_shipped: "bg-[#f5f3ff] text-[#6d28d9] border-[#ede9fe]",
      delivered: "bg-[#059669] text-white border-transparent",
      cancelled: "bg-[#fef2f2] text-[#b91c1c] border-[#fee2e2]",
      returned: "bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]",
    };
    return config[status?.toLowerCase()] || "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="mx-auto max-w-7xl space-y-6 pb-10 font-poppins bg-[#f6f7fb] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">Order Management</h1>
          <p className="mt-1 text-[0.85rem] text-[#64748b]">
            Monitor platform-wide transactions, tracking, and fulfillment cycles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
           <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input 
                type="text" 
                placeholder="Find Order ID, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 bg-white border border-[#d7dcea] rounded-[14px] py-2.5 pl-10 pr-4 text-[0.85rem] font-medium text-[#11182d] outline-none transition-all focus:border-[#0f49d7] focus:ring-4 focus:ring-[#0f49d7]/10 shadow-sm"
              />
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#d7dcea] rounded-[14px] shadow-sm w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#94a3b8]" />
                <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="bg-transparent text-[0.85rem] font-semibold text-[#11182d] focus:outline-none pr-4 w-full"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length, icon: ShoppingBag },
          { label: 'Dispatched', value: orders.filter(o => o.status === 'shipped').length, icon: Truck },
          { label: 'Fulfillment Goal', value: '4.8d', icon: Clock },
          { label: 'Platform GMV', value: `₹${orders.filter(o => o.status !== 'cancelled').reduce((acc, current) => acc + (current.totalAmount || 0), 0).toLocaleString()}`, icon: ShieldCheck },
        ].map((met, i) => (
          <div 
            key={i} 
            className="rounded-[18px] border border-[#d7dcea] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#0f49d7] hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 flex items-center justify-center rounded-[12px] bg-[#f8fafc] text-[#0f49d7] transition-colors group-hover:bg-[#eef2ff]">
                <met.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.75rem] font-bold text-[#64748b] uppercase tracking-wider mb-1">{met.label}</p>
                <h4 className="text-[1.2rem] font-bold text-[#11182d] truncate">{met.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {paginatedOrders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[18px] border border-[#d7dcea] shadow-sm">
             <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
             <p className="text-[0.95rem] font-bold text-[#11182d]">No orders found in catalog</p>
             <p className="text-[0.85rem] text-[#64748b] mt-1">Try resetting your filters or search query.</p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-[18px] border border-[#d7dcea] overflow-hidden hover:shadow-md hover:border-[#cbd5e1] transition-all duration-200">
              {/* Row Header */}
              <div 
                onClick={() => toggleExpand(order._id)}
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex items-center justify-center text-[#0f49d7] shadow-sm">
                     <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Order ID</p>
                     <h3 className="text-[0.9rem] font-bold text-[#11182d] font-mono">{order.orderId}</h3>
                  </div>
                </div>

                <div className="hidden lg:block lg:min-w-[140px]">
                   <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Customer</p>
                   <p className="text-[0.85rem] font-bold text-[#11182d] truncate">{order.user?.name || order.user?.username || order.address?.fullName || "Premium User"}</p>
                </div>

                <div className="hidden sm:block">
                   <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5 text-center">Status</p>
                   <span className={`inline-flex px-3 py-1 rounded-[10px] text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status?.replaceAll("_", " ")}
                   </span>
                </div>

                <div className="lg:min-w-[100px] text-right">
                   <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Total</p>
                   <p className="text-[0.9rem] font-bold text-[#11182d]">₹{order.totalAmount?.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-4">
                   <div className="hidden xl:block text-right">
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Date</p>
                      <p className="text-[0.8rem] font-semibold text-[#475569]">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                   </div>
                   <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${expandedOrder === order._id ? "bg-[#11182d] text-white" : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]"}`}>
                      {expandedOrder === order._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                   </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              {expandedOrder === order._id && (
                <div className="px-6 pb-6 pt-2 border-t border-[#d7dcea] bg-[#f8fafc]/50">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                      
                      {/* Shipping Address */}
                      <div className="flex flex-col">
                         <h4 className="flex items-center gap-2 text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-3 shrink-0">
                            <MapPin className="w-4 h-4" /> Shipping Address
                         </h4>
                         <div className="bg-white p-5 rounded-[16px] border border-[#d7dcea] shadow-sm flex flex-col justify-between flex-1">
                            <div className="space-y-1">
                               <p className="text-[0.9rem] font-bold text-[#11182d]">{order.address?.fullName}</p>
                               <p className="text-[0.8rem] text-[#475569] leading-relaxed font-medium">
                                  {order.address?.street}<br />
                                  {order.address?.city}, {order.address?.state} - {order.address?.zipCode}
                               </p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center gap-2">
                               <div className="h-1.5 w-1.5 rounded-full bg-[#0f49d7]"></div>
                               <span className="text-[0.8rem] font-bold text-[#11182d]">{order.address?.phone}</span>
                            </div>
                         </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="flex flex-col">
                         <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-3 shrink-0">Payment Summary</h4>
                         <div className="bg-white p-5 rounded-[16px] border border-[#d7dcea] shadow-sm flex flex-col justify-between flex-1">
                            <div className="space-y-3">
                               <div className="flex justify-between text-[0.8rem]">
                                  <span className="text-[#64748b] font-medium">Subtotal</span>
                                  <span className="font-bold text-[#11182d]">₹ {order.totalAmount?.toLocaleString()}</span>
                               </div>
                               <div className="flex justify-between text-[0.8rem]">
                                  <span className="text-[#64748b] font-medium">Wallet Used</span>
                                  <span className="font-bold text-[#0f49d7] font-mono">- ₹ {order.walletAmount?.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex justify-between items-center">
                               <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Method</p>
                               <p className="text-[10px] font-bold text-[#0f49d7] bg-[#eef2ff] px-2.5 py-1 rounded-[8px] uppercase tracking-wider">{order.paymentMethod}</p>
                            </div>
                         </div>
                      </div>

                      {/* Package Breakdown */}
                      <div className="lg:col-span-1 flex flex-col">
                         <div className="flex items-center justify-between mb-3 shrink-0">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                               <Package className="w-4 h-4" /> Sub-Orders ({order.subOrders?.length})
                            </h4>
                         </div>
                         <div className="flex flex-col gap-4 flex-1">
                            {order.subOrders?.map((sub, idx) => (
                               <div key={idx} className="bg-white p-5 rounded-[16px] border border-[#d7dcea] shadow-sm flex flex-col justify-between hover:border-[#cbd5e1] transition-colors flex-1">
                                  <div>
                                     <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#e2e8f0]">
                                        <div>
                                           <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Sub-Order ID</p>
                                           <p className="text-[0.85rem] font-bold text-[#11182d] font-mono">{sub.subOrderId}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-[8px] border ${getStatusColor(sub.status)}`}>
                                           {sub.status}
                                        </span>
                                     </div>
                                     
                                     <div className="space-y-3">
                                        {sub.items?.map((item, iIdx) => (
                                           <div key={iIdx} className="flex gap-3 items-center">
                                              <div className="h-12 w-12 bg-[#f8fafc] rounded-[10px] flex items-center justify-center border border-[#e2e8f0] shrink-0 overflow-hidden">
                                                 <img 
                                                   src={item.image || item.product?.image || item.product?.variants?.[0]?.images?.[0]} 
                                                   alt="" 
                                                   className="w-full h-full object-contain p-1" 
                                                 />
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                 <p className="text-[0.85rem] font-bold text-[#11182d] truncate">{item.name}</p>
                                                 <p className="text-[0.75rem] text-[#64748b] font-semibold mt-0.5">Qty: {item.quantity} • {item.size}</p>
                                              </div>
                                              {item.price && (
                                                <div className="text-right pl-2">
                                                    <p className="text-[0.85rem] font-bold text-[#11182d]">₹ {item.price}</p>
                                                </div>
                                              )}
                                           </div>
                                        ))}
                                     </div>
                                  </div>

                                  <div className="mt-5 pt-3 border-t border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc] -mx-5 -mb-5 px-5 py-3 rounded-b-[16px]">
                                     <div>
                                        <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Seller</p>
                                        <p className="text-[0.8rem] font-bold text-[#0f49d7] truncate">{sub.seller?.shopName || "Vendor"}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider mb-0.5">Platform Fee</p>
                                        <p className="text-[0.8rem] font-bold text-[#059669]">₹ {sub.platformCommission}</p>
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
        <div className="flex items-center justify-between bg-white border border-[#d7dcea] rounded-[18px] px-6 py-4 shadow-sm">
          <p className="text-[0.8rem] text-[#64748b] font-semibold">
            Showing <span className="text-[#11182d] font-bold">{paginatedOrders.length}</span> of <span className="text-[#11182d] font-bold">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="h-9 w-9 flex items-center justify-center rounded-[12px] bg-white border border-[#d7dcea] text-[#475569] hover:bg-[#f8fafc] hover:text-[#11182d] disabled:opacity-50 disabled:hover:bg-white transition-all"
             >
               <ChevronLeft className="h-4 w-4" />
             </button>
             
             {[...Array(totalPages)].map((_, i) => (
                <button
                   key={i + 1}
                   onClick={() => setCurrentPage(i + 1)}
                   className={`h-9 w-9 flex items-center justify-center rounded-[12px] text-[0.85rem] font-bold transition-all ${
                      currentPage === i + 1 
                      ? "bg-[#0f49d7] text-white shadow-md shadow-blue-500/20" 
                      : "bg-white border border-[#d7dcea] text-[#475569] hover:bg-[#f8fafc] hover:text-[#11182d]"
                   }`}
                >
                   {i + 1}
                </button>
             ))}

             <button 
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="h-9 w-9 flex items-center justify-center rounded-[12px] bg-white border border-[#d7dcea] text-[#475569] hover:bg-[#f8fafc] hover:text-[#11182d] disabled:opacity-50 disabled:hover:bg-white transition-all"
             >
               <ChevronRight className="h-4 w-4" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
