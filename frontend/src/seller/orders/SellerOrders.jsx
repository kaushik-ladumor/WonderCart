import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import {
  Search,
  Truck,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  DollarSign,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { API_URL } from "../../utils/constants";

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
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED": return "bg-gray-100 text-gray-700";
      case "CONFIRMED": return "bg-blue-50 text-blue-700";
      case "READY_TO_SHIP": return "bg-green-50 text-green-700";
      case "SHIPPED": return "bg-indigo-50 text-indigo-700";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-50 text-red-700";
      default: return "bg-gray-50 text-gray-600";
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Seller Orders</h1>
            <p className="text-sm text-gray-500">Manage your product shipments and fulfillment</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Order ID / Buyer" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
              />
            </div>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer"
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <ShoppingBag className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{orders.filter(o => o.status !== 'DELIVERED').length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <Clock className="w-5 h-5 text-yellow-500 mb-3" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipment SLAs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{orders.filter(o => calculateDaysLeft(o.mustShipBy) <= 1 && !['SHIPPED', 'DELIVERED'].includes(o.status)).length} Due</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-green-600">
            <DollarSign className="w-5 h-5 mb-3" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Projected Payout</p>
            <p className="text-2xl font-bold mt-1">₹{orders.reduce((acc, o) => acc + (o.sellerPayout || 0), 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No orders found for selected criteria</p>
            </div>
          ) : (
            filteredOrders.map((pkg) => {
              const daysLeft = calculateDaysLeft(pkg.mustShipBy);
              return (
                <div key={pkg._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400 text-xs">
                        {pkg.items.length}x
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{pkg.subOrderId}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${pkg.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {pkg.paymentStatus === 'paid' ? 'PREPAID' : 'COD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{pkg.masterOrder?.user?.email}</p>
                          <span className="text-gray-300">•</span>
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDateTime(pkg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(pkg.status)}`}>
                        {pkg.status}
                      </div>
                      
                      {!['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(pkg.status) && (
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${daysLeft <= 1 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                          {daysLeft < 0 ? 'Delayed' : `Ship in ${daysLeft} Days`}
                        </div>
                      )}

                      <div className="text-right ml-auto md:ml-0">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Earnings</p>
                         <p className="text-sm font-bold text-green-600">₹{pkg.sellerPayout?.toLocaleString()}</p>
                      </div>

                      <button 
                        onClick={() => navigate(`/seller/orders/${pkg._id}`)}
                        className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-black hover:bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
