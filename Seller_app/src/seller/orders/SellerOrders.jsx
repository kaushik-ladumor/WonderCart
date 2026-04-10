import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  Search,
  Package,
  ShoppingBag,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  RotateCcw
} from "lucide-react";
import { API_URL } from "../../utils/constants";

const RUPEE = "\u20B9";

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Orders");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const tabs = ["All Orders", "Pending", "Shipped", "Completed"];

  const filteredOrders = orders
    .filter((pkg) => {
      const searchLower = searchTerm.toLowerCase();
      const buyerEmail = pkg.masterOrder?.user?.email || "";
      const buyerName = pkg.masterOrder?.user?.fullName || pkg.masterOrder?.user?.username || "";
      const matchesSearch =
        buyerEmail.toLowerCase().includes(searchLower) ||
        buyerName.toLowerCase().includes(searchLower) ||
        pkg.subOrderId.toLowerCase().includes(searchLower);

      let matchesTab = true;
      if (activeTab === "Pending") matchesTab = ["placed", "confirmed", "processing"].includes(pkg.status);
      if (activeTab === "Shipped") matchesTab = ["shipped", "out_for_delivery"].includes(pkg.status);
      if (activeTab === "Completed") matchesTab = ["delivered", "returned", "refunded"].includes(pkg.status);
      
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "placed":
      case "confirmed":
      case "processing":
        return "bg-[#ebf2ff] text-[#2156d8]";
      case "shipped":
      case "out_for_delivery":
        return "bg-[#eef2ff] text-[#5162b5]";
      case "delivered":
      case "returned":
      case "refunded":
        return "bg-[#e9f8ef] text-[#18794e]";
      case "cancelled":
        return "bg-[#fef2f2] text-[#ef4444]";
      case "return_requested":
        return "bg-[#fff7ed] text-[#ea580c]";
      default:
        return "bg-[#f1f5f9] text-[#64748b]";
    }
  };

  const formatDateTime = (dateString, showTime = true) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return showTime ? (
      <div className="text-left">
        <p className="text-[13px] font-medium text-[#1e293b]">{dateStr}</p>
        <p className="text-[11px] text-[#94a3b8] uppercase tracking-wider">{timeStr}</p>
      </div>
    ) : dateStr;
  };

  if (loading) return <Loader />;

  const newOrders = orders.filter(o => o.status === "placed").length;
  const pendingOrders = orders.filter(o => ["confirmed", "processing"].includes(o.status)).length;
  const totalPayout = orders.reduce((sum, o) => sum + (o.sellerPayout || 0), 0);
  const returns = orders.filter(o => ["return_requested", "returned", "refunded"].includes(o.status)).length;

  const stats = [
    { label: "New Orders", value: newOrders, icon: ShoppingBag, bg: "bg-[#eef2ff]", color: "text-[#2156d8]" },
    { label: "Pending Shipments", value: pendingOrders, icon: Package, bg: "bg-[#f0fdf4]", color: "text-[#16a34a]" },
    { label: "Total Revenue", value: `${RUPEE}${totalPayout.toLocaleString("en-IN")}`, icon: DollarSign, bg: "bg-[#fef9c3]", color: "text-[#854d0e]" },
    { label: "Returns", value: returns, icon: RotateCcw, bg: "bg-[#fee2e2]", color: "text-[#ef4444]" },
  ];

  return (
    <div className="min-h-screen border-l border-[#f1f5f9] px-0 pb-8 pt-2">
      <div className="w-full px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-[#141b2d]">Order Management</h1>
            <p className="mt-1 text-sm text-[#66728d]">
              Review and fulfill your store's latest transactions. Track shipping status and manage returns from a single editorial view.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-[18px] border border-[#e7ebf5] bg-white p-4 shadow-[0_8px_20px_rgba(18,36,84,0.04)]">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a849b]">{stat.label}</p>
                  <p className="text-[1.25rem] font-bold leading-tight text-[#141b2d]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-[24px] border border-[#e7ebf5] bg-white shadow-[0_12px_30px_rgba(18,36,84,0.06)]">
          {/* Tabs & Desktop Search */}
          <div className="flex flex-col gap-4 border-b border-[#f0f2f8] px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-2 text-[14px] font-semibold transition-all ${
                    activeTab === tab ? "text-[#2156d8]" : "text-[#7a849b] hover:text-[#1a2238]"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-[-17px] left-0 h-[3px] w-full rounded-full bg-[#2156d8]" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
                 <input
                   type="text"
                   placeholder="Search Order ID, name..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="h-10 w-full lg:w-64 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-9 pr-4 text-[13px] outline-none transition-all focus:border-[#2156d8] focus:bg-white"
                 />
               </div>
               <div className="flex items-center gap-2 text-sm font-medium text-[#7a849b]">
                 <span className="text-[#9ea7bc]">Sort by:</span>
                 <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-[#141b2d] outline-none cursor-pointer"
                 >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                 </select>
               </div>
            </div>
          </div>

          {/* Actual Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f0f2f8] bg-[#fcfdfe]">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Timestamp</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Customer Info</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Items</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Status</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-[#7c87a2]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f8]">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-[#7a849b]">
                      No orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order._id} className="group transition hover:bg-[#f7faff]">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-[13px] font-bold text-[#2156d8]">
                          #{order.subOrderId}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[10px] font-bold text-[#7a849b] overflow-hidden">
                              <img src={`https://ui-avatars.com/api/?name=${order.masterOrder?.address?.fullName || order.masterOrder?.user?.fullName || 'Customer'}&background=e2e8f0&color=475569`} alt="User" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#141b2d]">
                              {order.masterOrder?.address?.fullName || order.masterOrder?.user?.fullName || order.masterOrder?.user?.username || "Customer"}
                            </p>
                            <p className="text-[11px] text-[#9ea7bc]">
                              {order.masterOrder?.address?.city || "New Delhi"}, {order.masterOrder?.address?.state || "DL"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items?.slice(0, 3).map((item, i) => (
                              <div key={i} className="h-8 w-8 rounded-lg border-2 border-white bg-[#f8fafc] flex items-center justify-center overflow-hidden ring-1 ring-[#f1f5f9]">
                                {item.image || item.product?.image || item.product?.variants?.[0]?.images?.[0] ? (
                                  <img 
                                    src={item.image || item.product?.image || item.product?.variants?.[0]?.images?.[0]} 
                                    className="h-full w-full object-cover" 
                                    alt="Product"
                                  />
                                ) : (
                                  <Package className="h-4 w-4 text-[#94a3b8]" />
                                )}
                              </div>
                            ))}
                            {(order.items?.length || 0) > 3 && (
                              <div className="h-8 w-8 rounded-lg border-2 border-white bg-[#f1f5f9] flex items-center justify-center text-[10px] font-bold text-[#64748b] ring-1 ring-[#e2e8f0]">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-[#62708c]">
                            {order.items?.length || 0} Item{order.items?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[13px] font-bold text-[#141b2d]">
                          {RUPEE}{Number(order.sellerPayout || 0).toLocaleString("en-IN")}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-lg px-3 py-1.5 text-[11px] font-bold capitalize tracking-tight ${getStatusStyle(order.status)}`}>
                          {order.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => navigate(`/seller/orders/${order._id}`)}
                            className="p-1.5 text-[#9ea7bc] transition hover:bg-[#f1f5ff] hover:text-[#2156d8] rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-[#f0f2f8] bg-[#fcfdfe] px-6 py-4">
              <p className="text-[13px] text-[#7c87a2]">
                Showing <span className="font-bold text-[#141b2d]">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredOrders.length)}</span> to <span className="font-bold text-[#141b2d]">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-[#141b2d]">{filteredOrders.length}</span> orders
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e2e8f0] text-[#7c87a2] transition hover:bg-[#f8fafc] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm transition-all ${
                      currentPage === i + 1 
                        ? "bg-[#2156d8] text-white shadow-lg shadow-blue-100 ring-2 ring-blue-50" 
                        : "bg-white border border-[#e2e8f0] text-[#7c87a2] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e2e8f0] text-[#7c87a2] transition hover:bg-[#f8fafc] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
