import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CreditCard,
  LogIn,
  Home,
  ChevronRight,
} from "lucide-react";

const OrderConfirmationPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "₹0";
    const num = parseFloat(price);
    if (isNaN(num)) return "₹0";

    const formatted = num.toFixed(2);
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `₹${parts.join(".")}`;
  };

  const getDeliveryDate = () => {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 4);
    return delivery.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get product image from variant
  const getProductImage = (item) => {
    // Check if image is directly saved with order
    if (item.image) {
      return item.image;
    }

    // Check populated product variants
    if (item.product && item.product.variants) {
      // If color is specified, find matching variant
      if (item.color) {
        const matchingVariant = item.product.variants.find(
          (v) => v.color && v.color.toLowerCase() === item.color.toLowerCase(),
        );
        if (
          matchingVariant &&
          matchingVariant.images &&
          matchingVariant.images.length > 0
        ) {
          return matchingVariant.images[0];
        }
      }

      // If no matching variant or color not specified, use first variant
      if (item.product.variants.length > 0) {
        const firstVariant = item.product.variants[0];
        if (firstVariant.images && firstVariant.images.length > 0) {
          return firstVariant.images[0];
        }
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError("Please login to view order details");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/order/id/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            setError("Session expired. Please login again.");
            return;
          } else if (response.status === 404) {
            setError("Order not found");
          } else {
            throw new Error(`Failed to load order`);
          }
        } else {
          const data = await response.json();

          if (data.success && data.order) {
            const transformedOrder = {
              ...data.order,
              items:
                data.order.items?.map((item) => ({
                  ...item,
                  product: item.product
                    ? {
                        ...item.product,
                        variants: item.product.variants || [],
                        images: item.product.images || [],
                      }
                    : null,
                })) || [],
            };

            setOrder(transformedOrder);
          } else {
            setError(data.message || "Failed to load order details");
          }
        }
      } catch (err) {
        console.error("Fetch order error:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {error.includes("Session expired")
              ? "Session Expired"
              : "Order Not Found"}
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            {error || "We couldn't find your order details."}
          </p>
          <div className="flex flex-col gap-2">
            {error.includes("Session expired") ? (
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login Again
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Continue Shopping
              </button>
            )}
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-5">
          <button onClick={() => navigate("/")} className="hover:text-black">
            Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/orders")}
            className="hover:text-black"
          >
            Orders
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-medium">Order #{id?.slice(-6)}</span>
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-black to-gray-900 rounded-lg p-4 text-white mb-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <CheckCircle className="w-5 h-5" />
                <h1 className="text-xl font-bold">Order Confirmed</h1>
              </div>
              <p className="text-gray-300 text-xs">
                Thank you for your purchase. We'll notify you when your order
                ships.
              </p>
            </div>
            <div className="bg-white/10 rounded px-3 py-2 min-w-[140px]">
              <div className="text-center">
                <div className="text-lg font-bold mb-0.5">
                  {formatPrice(order.totalAmount)}
                </div>
                <div className="text-xs text-gray-300">Total Amount</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Order Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Order Items
                  </h2>
                  <p className="text-gray-600 text-xs">
                    {order.items?.length || 0} items in your order
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items?.map((item, index) => {
                  const productName =
                    item.product?.name || item.name || "Product";
                  const productPrice = item.price || 0;
                  const productImage = getProductImage(item);

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">
                              {productName}
                            </h3>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {item.color && (
                                <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                  {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              Qty:{" "}
                              <span className="font-semibold">
                                {item.quantity || 1}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 text-xs">
                              {formatPrice(productPrice * (item.quantity || 1))}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatPrice(productPrice)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Order Total
                    </h3>
                    <p className="text-gray-600 text-xs">
                      Including all charges
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-50 rounded flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Delivery Status
                  </h2>
                  <p className="text-gray-600 text-xs">
                    Estimated delivery: {getDeliveryDate()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-xs">
                      Order Confirmed
                    </h4>
                    <p className="text-gray-600 text-xs">
                      Your order has been received
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-xs">
                      Processing
                    </h4>
                    <p className="text-gray-600 text-xs">
                      Preparing your order for shipment
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-xs">
                      Shipped
                    </h4>
                    <p className="text-gray-600 text-xs">
                      On the way to your location
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Order Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-purple-50 rounded flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Order Information
                  </h2>
                  <p className="text-gray-600 text-xs">Important details</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Order Number</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {order._id?.slice(-8)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Order Date</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Payment Method</p>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                    <p className="font-medium text-gray-900 text-xs">
                      {order.paymentMethod || "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Payment Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Order Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status?.toUpperCase() || "PROCESSING"}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-50 rounded flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Shipping Address
                  </h2>
                  <p className="text-gray-600 text-xs">Delivery location</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="font-medium text-gray-900 text-xs mb-0.5">
                    {order.address?.fullName || "Customer"}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {order.address?.street || "Address not specified"}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {order.address?.city}, {order.address?.state}{" "}
                    {order.address?.zipcode}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-gray-600 text-xs">
                    {order.address?.phone || "Phone not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 text-xs mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 text-xs mb-3">
                Our support team is available to assist you.
              </p>
              <div className="space-y-1.5">
                <a
                  href="mailto:wondercarthelp@gmail.com"
                  className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-xs"
                >
                  <Mail className="w-3 h-3" />
                  wondercarthelp@gmail.com
                </a>
                <a
                  href="tel:+917226987466"
                  className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors text-xs"
                >
                  <Phone className="w-3 h-3" />
                  +91 7226987466
                </a>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
