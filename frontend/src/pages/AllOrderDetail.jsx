import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Search,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowUpDown,
  ChevronDown,
  X,
  FileText,
  Wallet,
  Home,
  Globe,
  Edit,
  MessageCircle,
  Copy,
} from "lucide-react";

const ViewAllOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // toast.error("Please login"); // Optional: prevent spamming toast on load
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/order`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const mappedOrders = response.data.orders.map(order => ({
          id: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.status,
          paymentStatus: order.paymentStatus || (order.paymentMethod === "COD" ? "pending" : "paid"),
          total: order.totalAmount || 0,
          itemCount: order.items.reduce((acc, item) => acc + (item.quantity || 1), 0),
          customer: order.address?.fullName || "User",
          email: order.user?.email || "",
          phone: order.address?.phone || "",
          shippingAddress: `${order.address?.city || ''}, ${order.address?.state || ''}`,
          paymentMethod: order.paymentMethod,
          paymentId: order.razorpayPaymentId || "N/A",
          orderItems: order.items.map(item => ({
            id: item._id,
            name: item.product?.name || item.name || "Product",
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.product?.variants?.[0]?.images?.[0] || item.product?.images?.[0] || "",
            color: item.color
          }))
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "processing":
        return <RefreshCw className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "Razorpay":
        return <Wallet className="w-5 h-5" />;
      case "COD":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      }
      if (sortBy === "total") {
        return sortOrder === "desc" ? b.total - a.total : a.total - b.total;
      }
      return 0;
    });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCopyOrderId = () => {
    if (selectedOrder) {
      navigator.clipboard.writeText(selectedOrder.id);
      alert("Order ID copied to clipboard!");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Management
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage all customer orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {orders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl border border-yellow-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {
                    orders.filter((o) =>
                      ["processing", "shipped"].includes(o.status)
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  $
                  {orders
                    .reduce((sum, order) => sum + order.total, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID, customer name, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="delivered">Delivered</option>
                  <option value="shipped">Shipped</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <div className="relative flex-1 md:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="total">Sort by Amount</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowUpDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Order Details
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Payment
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Total
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">
                            {order.id}
                          </span>
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {order.date}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {order.itemCount} items • ${order.total.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer}
                        </p>
                        <p className="text-sm text-gray-600">{order.email}</p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(order.paymentMethod)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.paymentMethod}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.paymentId}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-lg font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Orders Message */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">
                          Order Details
                        </h2>
                        <button
                          onClick={handleCopyOrderId}
                          className="text-white/80 hover:text-white"
                          title="Copy Order ID"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-300">{selectedOrder.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/10 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="p-8 space-y-8">
                  {/* Order Summary Card */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Order Date
                            </p>
                            <p className="font-semibold text-gray-900">
                              {selectedOrder.date}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(selectedOrder.status).split(" ")[0]
                              }`}
                          >
                            {getStatusIcon(selectedOrder.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Order Status
                            </p>
                            <p className="font-semibold text-gray-900">
                              {selectedOrder.status.charAt(0).toUpperCase() +
                                selectedOrder.status.slice(1)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            {getPaymentIcon(selectedOrder.paymentMethod)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Payment
                            </p>
                            <p className="font-semibold text-gray-900">
                              {selectedOrder.paymentMethod}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span>Order Items</span>
                      <span className="text-sm font-normal text-gray-600">
                        ({selectedOrder.itemCount} items)
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                              {item.image && item.image.startsWith("http") ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">{item.image || "📦"}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Color: {item.color}</span>
                                <span>Quantity: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Customer Information
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.customer}
                            </p>
                            <p className="text-sm text-gray-600">Customer</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              Email Address
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              Phone Number
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Home className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Shipping Address
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {selectedOrder.customer}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedOrder.shippingAddress}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Globe className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">
                              United States
                            </p>
                            <p className="text-sm text-gray-600">Country</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Payment Method
                        </p>
                        <div className="flex items-center gap-3">
                          {getPaymentIcon(selectedOrder.paymentMethod)}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {selectedOrder.paymentMethod}
                            </p>
                            <p className="text-xs text-gray-600">
                              ID: {selectedOrder.paymentId}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Payment Status
                        </p>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium bg-green-100 text-green-800 border-green-200`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Paid
                        </span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 pt-6 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                          ${(selectedOrder.total * 0.9).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-gray-900">
                          $15.00
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">
                          ${(selectedOrder.total * 0.1).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-6 border-t">
                    <button className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Contact Customer
                    </button>
                    <button className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
                      <Edit className="w-5 h-5" />
                      Update Status
                    </button>
                    <button className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      View Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAllOrdersPage;
