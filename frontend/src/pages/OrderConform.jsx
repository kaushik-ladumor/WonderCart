// OrderConfirmationPage.jsx - Fixed version
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
        // Use the correct endpoint: /order/id/:orderId (not /order/:id)
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
            console.log("Order data:", data.order);
            console.log("First item:", data.order.items?.[0]);
            console.log(
              "First item product variants:",
              data.order.items?.[0]?.product?.variants,
            );

            // Transform order items to ensure product data is accessible
            const transformedOrder = {
              ...data.order,
              items:
                data.order.items?.map((item) => ({
                  ...item,
                  // Ensure product data is properly structured
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-black mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {error.includes("Session expired")
              ? "Session Expired"
              : "Order Not Found"}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {error || "We couldn't find your order details."}
          </p>
          <div className="flex flex-col gap-3">
            {error.includes("Session expired") ? (
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login Again
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Continue Shopping
              </button>
            )}
            <button
              onClick={() => navigate("/orders")}
              className="px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-black rounded-lg p-5 text-white mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-bold">Order Confirmed</h1>
              </div>
              <p className="text-gray-300 text-sm">
                Thank you for your purchase. We'll notify you when your order
                ships.
              </p>
            </div>
            <div className="bg-white/10 rounded px-4 py-3 min-w-[160px]">
              <div className="text-center">
                <div className="text-xl font-bold mb-1">
                  {formatPrice(order.totalAmount)}
                </div>
                <div className="text-xs text-gray-300">Total Amount</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order Items
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {order.items?.length || 0} items in your order
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const productName =
                    item.product?.name || item.name || "Product";
                  const productPrice = item.price || 0;
                  const productImage = getProductImage(item);

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                              {productName}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.color && (
                                <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                                  {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
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
                            <div className="font-semibold text-gray-900 text-sm">
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

              <div className="mt-6 pt-5 border-t border-gray-200">
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
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Delivery Status
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Estimated delivery: {getDeliveryDate()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Order Confirmed
                    </h4>
                    <p className="text-gray-600 text-xs">
                      Your order has been received
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Processing
                    </h4>
                    <p className="text-gray-600 text-xs">
                      Preparing your order for shipment
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
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

          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-purple-50 rounded flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order Information
                  </h2>
                  <p className="text-gray-600 text-sm">Important details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Order Number</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {order._id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Order Date</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-gray-900 text-sm">
                      {order.paymentMethod || "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Payment Status</p>
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
                  <p className="text-xs text-gray-600 mb-1">Order Status</p>
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

            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Shipping Address
                  </h2>
                  <p className="text-gray-600 text-sm">Delivery location</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm mb-1">
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

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600 text-xs">
                    {order.address?.phone || "Phone not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">
                Need Help?
              </h3>
              <p className="text-gray-600 text-xs mb-4">
                Our support team is available to assist you.
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:wondercarthelp@gmail.com"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-xs"
                >
                  <Mail className="w-3 h-3" />
                  wondercarthelp@gmail.com
                </a>
                <a
                  href="tel:+917226987466"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-xs"
                >
                  <Phone className="w-3 h-3" />
                  +91 7226987466
                </a>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
