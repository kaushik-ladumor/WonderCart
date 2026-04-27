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
  Star,
  FileText
} from "lucide-react";
import Review from "./Review";
import SellerReview from "./SellerReview";
import Loader from "../components/Loader";

function AllOrderDetail() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();
  const socket = useSocket();
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [selectedSubOrderForReview, setSelectedSubOrderForReview] = useState(null);

  const SellerReviewButton = ({ subOrder }) => {
    if (subOrder.status?.toLowerCase() !== "delivered" || subOrder.isSellerReviewed) {
      return null;
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSubOrderForReview(subOrder);
        }}
        className="flex items-center gap-2 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
      >
        <Star className="w-3.5 h-3.5 fill-emerald-600" />
        Rate Seller Performance
      </button>
    );
  };

  const PendingReviewsBadge = ({ order }) => {
    const pendingCount = order.subOrders?.filter(s => s.status === "DELIVERED" && !s.isSellerReviewed).length || 0;

    if (pendingCount === 0) return null;

    const handleBadgeClick = (e) => {
      e.stopPropagation();
      const firstPending = order.subOrders?.find(s => s.status === "delivered" && !s.isSellerReviewed);
      if (firstPending) {
        setSelectedSubOrderForReview(firstPending);
      }
    };

    return (
      <button
        onClick={handleBadgeClick}
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 group hover:bg-amber-100 transition-all cursor-pointer animate-pulse-slow active:scale-95"
      >
        <Star className="w-3 h-3 fill-amber-700" />
        <span className="text-[9px] font-semibold uppercase tracking-wider">{pendingCount} Review{pendingCount > 1 ? 's' : ''} Pending</span>
      </button>
    );
  };

  const ReviewButton = ({ product, orderItemId, orderStatus }) => {
    const [eligible, setEligible] = useState(false);

    useEffect(() => {
      if (orderStatus?.toLowerCase() !== "delivered") return;
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
        }}
        className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-[#0f49d7] bg-[#f8f9fb] px-3 py-1.5 rounded-lg border border-[#eef2ff] hover:bg-[#eef2ff] transition-all"
      >
        <Star className="w-3.5 h-3.5 fill-[#ffb800] text-[#ffb800]" />
        Write Product Review
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
      placed: "bg-blue-50 text-blue-700 border border-blue-100",
      confirmed: "bg-indigo-50 text-indigo-700 border border-indigo-100",
      processing: "bg-amber-50 text-amber-700 border border-amber-100",
      shipped: "bg-purple-50 text-purple-700 border border-purple-100",
      out_for_delivery: "bg-sky-50 text-sky-700 border border-sky-100",
      delivered: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      cancelled: "bg-red-50 text-red-700 border border-red-100",
      return_requested: "bg-orange-50 text-orange-700 border border-orange-100",
      returned: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100",
      refunded: "bg-teal-50 text-teal-700 border border-teal-100",
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

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#f8f9fb] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>

            <h1 className="font-display text-[1.5rem] sm:text-[1.75rem] font-semibold text-[#11182d] leading-none tracking-tight">
              Order History
            </h1>
            <p className="font-body text-[#42506d] text-[0.82rem] mt-2 font-medium">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'record' : 'records'} in your account
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6d7892] transition-colors group-focus-within:text-[#0f49d7]" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#e1e5f1] rounded-[14px] font-body text-[0.82rem] text-[#11182d] focus:outline-none focus:ring-2 focus:ring-[#0f49d7]/10 focus:border-[#0f49d7] transition-all"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[24px] p-16 md:p-24 border border-[#e1e5f1] text-center shadow-sm">
            <div className="w-16 h-16 bg-[#f8f9fb] rounded-[20px] flex items-center justify-center text-[#90a0be] mx-auto mb-6">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="font-display text-[1.1rem] font-semibold text-[#11182d] mb-2">No orders found</h2>
            <p className="font-body text-[#42506d] mb-8 max-w-sm mx-auto text-[0.82rem] font-medium leading-relaxed">
              {searchTerm
                ? "We couldn't find any orders matching your search keywords."
                : "You haven't placed any orders yet. Start shopping to build your history."}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate('/shop')} className="bg-[#11182d] text-white font-semibold px-8 py-3 rounded-xl hover:scale-[1.02] transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-black/10">
                Explore Shop
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-[24px] border border-[#e1e5f1] shadow-sm overflow-hidden group hover:border-[#0f49d7]/20 transition-all">

                {/* Order Header Tile */}
                <div className="bg-white px-6 py-4 md:px-8 border-b border-[#f1f4f9] flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div>
                      <p className="font-body text-[9px] uppercase font-semibold text-[#6d7892] tracking-widest mb-1">Identifier</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#11182d]">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="font-body text-[9px] uppercase font-semibold text-[#6d7892] tracking-widest mb-1">Date</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#11182d]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-[9px] uppercase font-semibold text-[#6d7892] tracking-widest mb-1">Total</p>
                      <p className="font-body text-[0.82rem] font-semibold text-[#0f49d7] italic">₹{Math.round(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    {order.couponDiscount > 0 && (
                      <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        <p className="font-body text-[8px] uppercase font-bold text-emerald-600 tracking-widest leading-none mb-1">Savings</p>
                        <p className="font-body text-[0.72rem] font-bold text-emerald-600 leading-none">₹{Math.round(order.couponDiscount).toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <PendingReviewsBadge order={order} />
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Main Order View */}
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 flex gap-6 md:gap-7 items-start">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f8f9fb] rounded-[18px] overflow-hidden flex-shrink-0 border border-[#eef2ff] p-2">
                      <img
                        src={getProductImage(getPrimaryItem(order))}
                        alt={getPrimaryItem(order)?.name || "Product"}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-[0.88rem] font-semibold text-[#11182d] mb-1.5 truncate group-hover:text-[#0f49d7] transition-colors leading-tight">
                        {getPrimaryItem(order)?.name || "Ordered Product"}
                      </h3>
                      <div className="flex flex-wrap gap-3 items-center mb-3">
                        <span className="font-body text-[10px] font-semibold text-[#0f49d7] bg-[#eef2ff] px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                          {getOrderItemCount(order)} {getOrderItemCount(order) === 1 ? 'item' : 'items'}
                        </span>
                        {getPrimaryItem(order)?.size && (
                          <span className="font-body text-[10px] font-medium text-[#6d7892] uppercase tracking-[0.05em]">Size <b className="text-[#11182d] font-semibold">{getPrimaryItem(order).size}</b></span>
                        )}
                      </div>
                      <p className="font-body text-[0.76rem] text-[#42506d] leading-relaxed font-medium">
                        Dispatched to <span className="text-[#11182d] font-semibold">{order.address?.fullName}</span> in <span className="text-[#11182d] font-semibold">{order.address?.city}</span> via <span className="text-[#0f49d7] font-semibold">{order.paymentMethod}</span>.
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {order.subOrders?.map((sub) => 
                          sub.items?.map((item, idx) => (
                            <ReviewButton 
                              key={item._id || `${sub._id}-${idx}`} 
                              product={item.product || item} 
                              orderItemId={item._id} 
                              orderStatus={sub.status} 
                            />
                          ))
                        )}
                        {order.subOrders?.map((sub, idx) => (
                          <SellerReviewButton key={sub._id || idx} subOrder={sub} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-40 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-[#f1f4f9] pt-6 lg:pt-0 lg:pl-8">
                    <div className="text-left lg:text-right hidden sm:block mb-4">
                      <p className="font-body text-[9px] uppercase font-semibold text-[#6d7892] tracking-[0.12em] mb-1 text-nowrap">State</p>
                      <p className="font-body text-[0.78rem] font-semibold text-[#11182d] capitalize leading-none">{order.status}</p>
                    </div>
                    <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                      {order.status?.toLowerCase() === "delivered" && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orderConfirm/${order._id}?print=true`);
                          }} 
                          className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-xl hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Invoice
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/orderConfirm/${order._id}`)} 
                        className="text-[9px] font-bold uppercase tracking-widest text-[#0f49d7] border border-[#0f49d7]/10 px-5 py-2.5 rounded-xl hover:bg-[#0f49d7] hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>


              </div>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="mt-16 text-center">
          <p className="font-body text-[10px] text-[#6d7892] mb-3 uppercase tracking-[0.2em] font-semibold">Concierge Support</p>
          <button onClick={() => navigate('/contact')} className="font-display font-semibold text-[0.82rem] text-[#0f49d7] hover:underline flex items-center gap-1.5 mx-auto justify-center group">
            Connect with an Agent
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
          isOpen={!!selectedReviewItem}
          onClose={() => setSelectedReviewItem(null)}
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
