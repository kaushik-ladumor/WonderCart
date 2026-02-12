import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import {
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

function AllOrderDetail() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
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

  const getProductImage = (item) => {
    if (item.image) return item.image;
    if (item.product?.variants) {
      if (item.color) {
        const match = item.product.variants.find(
          (v) => v.color?.toLowerCase() === item.color.toLowerCase(),
        );
        if (match?.images?.length > 0) return match.images[0];
      }
      if (item.product.variants[0]?.images?.length > 0) {
        return item.product.variants[0].images[0];
      }
    }
    return "https://via.placeholder.com/400x400?text=NO+IMAGE";
  };

  const filteredOrders = orders.filter(
    (order) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const StatusBadge = ({ status }) => {
    const config = {
      pending: "bg-gray-100 text-gray-900",
      confirmed: "bg-gray-200 text-gray-900",
      processing: "bg-gray-300 text-gray-900",
      shipped: "bg-gray-400 text-white",
      delivered: "bg-gray-900 text-white",
      cancelled: "bg-gray-200 text-gray-900",
    };
    const style = config[status?.toLowerCase()] || "bg-gray-100 text-gray-900";
    return (
      <span
        className={`inline-block px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${style}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900 uppercase tracking-tight">
            My Orders
          </h1>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"} found
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 focus:outline-none focus:border-black transition-colors bg-white"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 bg-gray-50">
          <Package className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            No orders found
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
            {searchTerm ? "Try another search" : "Start shopping to see orders"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="border border-gray-200 bg-white">
              {/* Order Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-gray-900 uppercase tracking-wider">
                    #{order._id}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-900">
                    {order.paymentMethod}
                  </span>
                  <button
                    onClick={() => toggleExpand(order._id)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-100 transition-colors"
                  >
                    {expandedOrder === order._id ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-14 h-14 border border-gray-200 bg-white overflow-hidden flex-shrink-0">
                    <img
                      src={getProductImage(order.items?.[0])}
                      alt={order.items?.[0]?.name}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80x80?text=NO+IMAGE";
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {order.items?.[0]?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[11px] text-gray-600 uppercase tracking-wider">
                        {order.items?.length}{" "}
                        {order.items?.length === 1 ? "item" : "items"}
                      </p>
                      {order.items?.[0]?.size && (
                        <p className="text-[11px] text-gray-600 uppercase tracking-wider">
                          Size: {order.items[0].size}
                        </p>
                      )}
                      {order.items?.[0]?.color && (
                        <p className="text-[11px] text-gray-600 uppercase tracking-wider">
                          Color: {order.items[0].color}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{order.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Delivery Address
                      </h4>
                      <div className="bg-white p-3 border border-gray-200 text-xs">
                        <p className="font-medium text-gray-900">
                          {order.address?.fullName}
                        </p>
                        <p className="text-gray-700 mt-1">
                          {order.address?.street}
                        </p>
                        <p className="text-gray-700">
                          {order.address?.city}, {order.address?.state} -{" "}
                          {order.address?.zipcode}
                        </p>
                        <p className="text-gray-500 mt-2 text-[11px]">
                          {order.address?.phone}
                        </p>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div>
                      <h4 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" /> Payment Details
                      </h4>
                      <div className="bg-white p-3 border border-gray-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium text-gray-900">
                            ₹{(order.totalAmount * 0.82).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium text-gray-900">
                            ₹{(order.totalAmount * 0.18).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 mt-3 pt-3">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              Total
                            </span>
                            <span className="font-bold text-gray-900">
                              ₹{order.totalAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Payment Method
                          </p>
                          <p className="text-xs font-medium text-gray-900 mt-1">
                            {order.paymentMethod}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Status: {order.paymentStatus}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* All Items */}
                    <div className="md:col-span-2">
                      <h4 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> Ordered Items
                      </h4>
                      <div className="bg-white border border-gray-200 divide-y divide-gray-200">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 flex items-center gap-3"
                          >
                            <div className="w-12 h-12 border border-gray-200 bg-white overflow-hidden flex-shrink-0">
                              <img
                                src={getProductImage(item)}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/80x80?text=NO+IMAGE";
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  {item.size && (
                                    <span className="text-[10px] text-gray-600 uppercase">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.color && (
                                    <span className="text-[10px] text-gray-600 uppercase">
                                      Color: {item.color}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-600 uppercase">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{item.price?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order ID */}
                    <div className="md:col-span-2">
                      <div className="bg-white p-3 border border-gray-200">
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                          Order ID
                        </p>
                        <p className="text-[11px] font-mono text-gray-700 break-all">
                          {order._id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-[9px] text-gray-400 uppercase tracking-wider">
          Secure Order Repository • v1.0
        </p>
      </div>
    </div>
  );
}

export default AllOrderDetail;
