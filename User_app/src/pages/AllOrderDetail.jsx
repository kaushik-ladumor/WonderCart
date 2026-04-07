import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronRight,
  Star
} from "lucide-react";
import Review from "./Review";
import SellerReview from "./SellerReview";

function AllOrderDetail() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();
  const socket = useSocket();
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [selectedSubOrderForReview, setSelectedSubOrderForReview] = useState(null);

  const SellerReviewButton = ({ subOrder }) => {
    if (subOrder.status !== "DELIVERED" || subOrder.isSellerReviewed || subOrder.isSellerReviewSkipped) {
      return null;
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSubOrderForReview(subOrder);
        }}
        className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-sm"
      >
        <Star className="w-3.5 h-3.5 fill-emerald-600" />
        Rate Seller Performance
      </button>
    );
  };

  const PendingReviewsBadge = ({ order }) => {
    const pendingCount = order.subOrders?.filter(s => s.status === "DELIVERED" && !s.isSellerReviewed && !s.isSellerReviewSkipped).length || 0;
    
    if (pendingCount === 0) return null;

    return (
      <button 
        onClick={(e) => { e.stopPropagation(); toggleExpand(order._id); }}
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 group hover:bg-amber-100 transition-all cursor-pointer animate-pulse-slow"
      >
        <Star className="w-3 h-3 fill-amber-700" />
        <span className="text-[9px] font-semibold uppercase tracking-wider">{pendingCount} Review{pendingCount > 1 ? 's' : ''} Pending</span>
      </button>
    );
  };

  const ReviewButton = ({ product, orderItemId, orderStatus }) => {
    const [eligible, setEligible] = useState(false);

    useEffect(() => {
      if (orderStatus !== "DELIVERED") return;
      const check = async () => {
        try {
          const res = await axios.get(
            `${API_URL}/review/check-eligibility?productId=${product?._id || product}&orderItemId=${orderItemId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEligible(res.data.eligible);
        } catch (err) {
          setEligible(false);
        }
      };
      check();
    }, [product, orderItemId, orderStatus, token]);

    if (!eligible) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReviewItem({
            id: product?._id || product,
            name: product?.name || "Product",
            image: getProductImage({ product }),
            orderItemId
          });
          document.getElementById("my_modal_8")?.showModal();
        }}
        className="mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase text-[#004ac6] bg-[#004ac6]/10 px-2 py-1 rounded"
      >
        <Star className="w-3 h-3 fill-[#004ac6]" />
        Write Review
      </button>
    );
  };

  const fetchOrders = async () => {
    try {
      // Only show loader if we don't have orders yet
      if (orders.length === 0) setLoading(true);
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

  useEffect(() => {
    if (!socket || !token) return;

    socket.on("order-status-update", (data) => {
      console.log("📦 Order status update:", data);
      toast.success(data.message);
      fetchOrders();
    });

    return () => socket.off("order-status-update");
  }, [socket, token]);

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getOrderItems = (order) => {
    if (order?.items?.length) return order.items.filter(Boolean);
    if (order?.subOrders?.length) {
      return order.subOrders.flatMap((subOrder) => subOrder?.items || []).filter(Boolean);
    }
    return [];
  };

  const getPrimaryItem = (order) => getOrderItems(order)[0];

  const getOrderItemCount = (order) => getOrderItems(order).length;

  const getProductImage = (item) => {
    if (!item) return "https://via.placeholder.com/400x400?text=NO+IMAGE";
    if (item.image) return item.image;
    if (item.productImg) return item.productImg;
    if (item.product?.image) return item.product.image;
    if (item.product?.images?.[0]) return item.product.images[0];
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

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(normalizedSearch) ||
      (order.orderId || "").toLowerCase().includes(normalizedSearch) ||
      getOrderItems(order).some((item) =>
        (item?.name || "").toLowerCase().includes(normalizedSearch),
      )
    );
  });

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
    <div className="min-h-screen bg-[#f9f9ff] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-[#004ac6] mb-2 block">
              Purchases
            </span>
            <h1 className="font-display text-[1.75rem] font-extrabold text-[#141b2d] tracking-tight">
              Order History
            </h1>
            <p className="font-body text-[#5c6880] text-[0.82rem] mt-2">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} in your account
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c6880] transition-colors group-focus-within:text-[#004ac6]" />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#f0f4ff] rounded-[1.25rem] font-body text-[0.82rem] text-[#141b2d] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/10 focus:border-[#004ac6] transition-all shadow-sm shadow-[#00000005]"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 md:p-24 border border-[#f0f4ff] text-center shadow-sm">
            <div className="w-20 h-20 bg-[#f9f9ff] rounded-[2rem] flex items-center justify-center text-[#e1e8fd] mx-auto mb-6">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="font-display text-[1.2rem] font-semibold text-[#141b2d] mb-2">No orders found</h2>
            <p className="font-body text-[#5c6880] mb-8 max-w-sm mx-auto">
              {searchTerm
                ? "We couldn't find any orders matching your search. Try different keywords."
                : "You haven't placed any orders yet. Start shopping to build your history."}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate('/shop')} className="bg-[#141b2d] text-white font-semibold px-8 py-3.5 rounded-xl hover:scale-105 transition-transform text-[0.82rem] shadow-xl shadow-black/10">
                Explore Shop
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-[2.5rem] border border-[#f0f4ff] shadow-sm overflow-hidden group hover:shadow-md transition-all">

                {/* Order Header Tile */}
                <div className="bg-[#f9f9ff] px-6 py-5 md:px-10 border-b border-[#f0f4ff] flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div>
                      <p className="font-body text-[10px] uppercase font-semibold text-[#5c6880] tracking-widest mb-1">Order Identifier</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#141b2d] font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="font-body text-[10px] uppercase font-semibold text-[#5c6880] tracking-widest mb-1">Date Placed</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#141b2d]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-[10px] uppercase font-semibold text-[#5c6880] tracking-widest mb-1">Total Amount</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#004ac6]">₹{Math.round(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <PendingReviewsBadge order={order} />
                    <StatusBadge status={order.status} />
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-[#f0f4ff] rounded-xl text-[#141b2d] hover:bg-[#141b2d] hover:text-white transition-all shadow-sm"
                    >
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Order View */}
                <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 flex gap-6 md:gap-8 items-start">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#f0f4ff] rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-white shadow-inner">
                      <img
                        src={getProductImage(getPrimaryItem(order))}
                        alt={getPrimaryItem(order)?.name || "Ordered product"}
                        className="w-full h-full object-contain p-4 mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 py-2">
                      <h3 className="font-display text-[1.1rem] font-semibold text-[#141b2d] mb-2 group-hover:text-[#004ac6] transition-colors">
                        {getPrimaryItem(order)?.name || "Ordered item"}
                      </h3>
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-body text-[0.76rem] font-semibold text-[#5c6880] bg-[#f9f9ff] px-3 py-1 rounded-lg border border-[#f0f4ff]">
                          {getOrderItemCount(order)} {getOrderItemCount(order) === 1 ? 'item' : 'items'}
                        </span>
                        {getPrimaryItem(order)?.size && (
                          <span className="font-body text-[0.76rem] text-[#5c6880]">Size: <b className="text-[#141b2d]">{getPrimaryItem(order).size}</b></span>
                        )}
                        {getPrimaryItem(order)?.color && (
                          <span className="font-body text-[0.76rem] text-[#5c6880]">Color: <b className="text-[#141b2d]">{getPrimaryItem(order).color}</b></span>
                        )}
                      </div>
                      <p className="font-body text-[0.76rem] text-[#5c6880] mt-4 leading-relaxed line-clamp-2 md:line-clamp-none">
                        Shipment to <span className="font-semibold text-[#141b2d]">{order.address?.fullName}</span> at <span className="font-semibold text-[#141b2d]">{order.address?.city}</span>. Payment via <span className="font-semibold text-[#141b2d]">{order.paymentMethod}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-[#f0f4ff] pt-6 lg:pt-0 lg:pl-10">
                    <div className="text-left lg:text-right hidden sm:block">
                      <p className="font-body text-[10px] uppercase font-semibold text-[#5c6880] tracking-widest mb-1 text-nowrap">Order Status</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#141b2d] capitalize">{order.status}</p>
                    </div>
                    <button onClick={() => navigate(`/orderConfirm/${order._id}`)} className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#004ac6] border border-[#004ac6]/20 px-6 py-2.5 rounded-xl hover:bg-[#004ac6] hover:text-white transition-all whitespace-nowrap">
                      View details
                    </button>
                  </div>
                </div>

                {/* Expanded Sections */}
                {expandedOrder === order._id && (
                  <div className="px-6 pb-10 md:px-10 lg:pl-10 lg:pr-10 border-t border-[#f0f4ff] bg-[#fcfcff]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">

                      {/* Shipping info */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <MapPin className="w-4 h-4 text-[#004ac6]" />
                          <h4 className="font-body text-[10px] font-semibold text-[#141b2d] uppercase tracking-widest">Delivery Address</h4>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-[#f0f4ff] shadow-sm">
                          <p className="font-body text-[0.82rem] font-semibold text-[#141b2d] mb-2">{order.address?.fullName}</p>
                          <p className="font-body text-[0.76rem] text-[#5c6880] leading-relaxed">
                            {order.address?.street}<br />
                            {order.address?.city}, {order.address?.state} - {order.address?.zipcode}<br />
                            T: {order.address?.phone}
                          </p>
                        </div>
                      </div>

                      {/* Payment info */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <IndianRupee className="w-4 h-4 text-[#004ac6]" />
                          <h4 className="font-body text-[10px] font-semibold text-[#141b2d] uppercase tracking-widest">Payment Breakdown</h4>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-[#f0f4ff] shadow-sm space-y-3">
                          <div className="flex justify-between font-body text-[0.76rem]">
                            <span className="text-[#5c6880]">Subtotal</span>
                            <span className="font-semibold text-[#141b2d]">₹{Math.round(order.totalAmount + (order.couponDiscount || 0)).toLocaleString()}</span>
                          </div>
                          {order.couponCode && (
                            <div className="flex justify-between font-body text-[0.76rem]">
                              <span className="text-emerald-600 font-semibold">Discount ({order.couponCode})</span>
                              <span className="text-emerald-600 font-semibold">-₹{Math.round(order.couponDiscount || 0).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-[#f0f4ff] flex justify-between font-body text-[0.82rem] font-semibold text-[#004ac6]">
                            <span>Grand Total</span>
                            <span>₹{Math.round(order.totalAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                          <Package className="w-4 h-4 text-[#004ac6]" />
                          <h4 className="font-body text-[10px] font-semibold text-[#141b2d] uppercase tracking-widest">Package Contents</h4>
                        </div>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                          {order.subOrders?.map((subOrder, sIdx) => (
                            <div key={sIdx} className="bg-white rounded-2xl border border-[#f0f4ff] shadow-sm overflow-hidden">
                              <div className="bg-[#fcfcff] px-4 py-2 border-b border-[#f0f4ff] flex items-center justify-between">
                                <p className="text-[10px] font-semibold text-[#5c6880] uppercase tracking-wider">
                                  Package {sIdx + 1} &bull; <span className="text-[#004ac6]">{subOrder.seller?.shopName || "Seller"}</span>
                                </p>
                                <StatusBadge status={subOrder.status} />
                              </div>
                              <div className="divide-y divide-[#f0f4ff]">
                                {subOrder.items?.map((item, idx) => (
                                  <div key={idx} className="p-4 flex gap-4 hover:bg-[#f9f9ff] transition-colors group/item">
                                    <div className="w-12 h-12 bg-[#f0f4ff] rounded-lg overflow-hidden flex-shrink-0">
                                      <img src={getProductImage(item)} alt={item?.name || "Ordered product"} className="w-full h-full object-contain p-2" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-body text-[0.76rem] font-semibold text-[#141b2d] line-clamp-1 group-hover/item:text-[#004ac6] transition-colors">{item?.name || "Ordered item"}</p>
                                      <div className="flex justify-between mt-1">
                                        <span className="font-body text-[10px] text-[#5c6880] uppercase tracking-tighter">Qty: {item?.quantity || 0}</span>
                                        <span className="font-body text-[10px] font-semibold text-[#141b2d]">₹{Math.round((item?.price || 0) * (item?.quantity || 0)).toLocaleString()}</span>
                                      </div>
                                      <ReviewButton 
                                        product={item?.product?._id || item?.product} 
                                        orderItemId={item?._id} 
                                        orderStatus={subOrder.status} 
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="px-4 pb-4">
                                <SellerReviewButton subOrder={subOrder} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="mt-16 text-center">
          <p className="font-body text-[0.76rem] text-[#5c6880] mb-4 uppercase tracking-[0.2em]">Need assistance with an order?</p>
          <button onClick={() => navigate('/contact')} className="font-display font-semibold text-[#004ac6] hover:underline flex items-center gap-2 mx-auto justify-center">
            Contact our Concierge
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      {selectedReviewItem && (
        <Review 
          id={selectedReviewItem.id} 
          productName={selectedReviewItem.name} 
          productImage={selectedReviewItem.image}
          orderItemId={selectedReviewItem.orderItemId}
          onSuccess={fetchOrders}
        />
      )}
      {selectedSubOrderForReview && (
        <SellerReview 
          subOrder={selectedSubOrderForReview}
          isOpen={true}
          onClose={() => setSelectedSubOrderForReview(null)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}

export default AllOrderDetail;
