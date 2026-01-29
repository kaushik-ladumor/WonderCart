import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  User,
  MapPin,
  Truck,
  Lock,
  Shield,
  Package,
  CreditCard,
  Wallet,
  ArrowRight,
  Check,
  Plus,
  Pencil,
  Trash2,
  Star,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Import DaisyUI modal components
import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "0.00";
    return parseFloat(price).toFixed(2);
  };

  const formatPriceDisplay = (price) => {
    const formatted = formatPrice(price);
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    loadOrderItems(token);
    loadAddresses(token);
  }, [navigate]);

  const loadOrderItems = async (token) => {
    try {
      const directOrder = sessionStorage.getItem("directOrder");

      if (directOrder) {
        setOrderItems(JSON.parse(directOrder));
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData = response.data?.cart || response.data;

      if (cartData?.items && cartData.items.length > 0) {
        const items = cartData.items.map((item) => {
          const itemPrice = item.price || 0;
          const originalPrice =
            item.originalPrice || item.product?.price || itemPrice;
          const discount = item.discount || item.product?.discount || 0;

          let finalPrice = itemPrice;
          if (discount > 0 && itemPrice === originalPrice) {
            finalPrice = originalPrice * (1 - discount / 100);
          }

          return {
            productId: item.product?._id || item.productId || item.product,
            productName: item.productName || item.product?.name || "Product",
            productImg:
              item.productImg || item.product?.variants?.[0]?.images?.[0] || "",
            color: item.color || "",
            size: item.size || "",
            price: finalPrice,
            originalPrice: originalPrice,
            discount: discount,
            quantity: item.quantity || 1,
          };
        });
        setOrderItems(items);
      } else {
        toast.error("Your cart is empty");
        navigate("/");
        return;
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load order items");
      setLoading(false);
    }
  };

  const loadAddresses = async (token) => {
    try {
      const res = await axios.get("http://localhost:4000/user/address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses(res.data.addresses || []);

      const defaultAddress = res.data.addresses.find((a) => a.isDefault);
      if (defaultAddress) setSelectedAddressId(defaultAddress._id);
    } catch {
      toast.error("Failed to load addresses");
    }
  };

  const refreshAddresses = async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    await loadAddresses(token);
  };

  const handleSetDefault = async (addressId) => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    try {
      const response = await axios.put(
        `http://localhost:4000/user/address/${addressId}/default`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        toast.success("Default address updated");
        refreshAddresses();
        setSelectedAddressId(addressId);
      }
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken");

      try {
        setDeletingAddressId(addressId);
        const response = await axios.delete(
          `http://localhost:4000/user/address/${addressId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          toast.success("Address deleted successfully");

          if (selectedAddressId === addressId) {
            const remainingAddresses = addresses.filter(
              (a) => a._id !== addressId,
            );
            if (remainingAddresses.length > 0) {
              const newDefault = remainingAddresses.find((a) => a.isDefault);
              setSelectedAddressId(
                newDefault?._id || remainingAddresses[0]._id,
              );
            } else {
              setSelectedAddressId(null);
            }
          }

          refreshAddresses();
        }
      } catch (error) {
        toast.error("Failed to delete address");
      } finally {
        setDeletingAddressId(null);
      }
    }
  };

  const handleEditAddress = (address) => {
    console.log("Editing address:", address._id);
    setEditingAddress(address);
    // Use setTimeout to ensure state updates before opening modal
    setTimeout(() => {
      document.getElementById("edit_address_modal").showModal();
    }, 50);
  };

  const handleAddressSelect = (addressId) => {
    console.log("Selecting address:", addressId);
    setSelectedAddressId(addressId);
  };

  const openAddAddressModal = () => {
    document.getElementById("add_address_modal").showModal();
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select an address");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("No items to order");
      return;
    }

    setSubmitting(true);
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    try {
      const selectedAddress = addresses.find(
        (addr) => addr._id === selectedAddressId,
      );

      const isSingleProduct = orderItems.length === 1;

      let orderData;

      if (isSingleProduct) {
        const item = orderItems[0];
        orderData = {
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
          originalPrice: item.originalPrice,
          discount: item.discount,
          totalAmount: total,
          address: selectedAddress,
          addressId: selectedAddressId,
          paymentMethod: selectedPayment,
        };
      } else {
        orderData = {
          items: orderItems.map((item) => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice,
            discount: item.discount,
            name: item.productName,
            color: item.color,
            size: item.size,
          })),
          totalAmount: total,
          address: selectedAddress,
          addressId: selectedAddressId,
          paymentMethod: selectedPayment,
        };
      }

      const response = await axios.post(
        "http://localhost:4000/order/create",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        const wasDirectOrder = sessionStorage.getItem("directOrder") !== null;

        if (!wasDirectOrder && orderItems.length > 1) {
          await axios.delete("http://localhost:4000/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        sessionStorage.removeItem("directOrder");
        sessionStorage.removeItem("directOrderTotal");

        toast.success("Order placed successfully!");
        navigate(`/orderConfirm/${response.data.order._id}`);
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to place order";
      toast.error(errorMessage);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0,
  );
  const shipping = subtotal > 0 ? (subtotal >= 500 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-black border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingCart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No items to checkout
          </h2>
          <p className="text-gray-600 text-sm mb-6">Add some items first!</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 text-sm mt-1">
            Complete your purchase securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <div className="space-y-5">
              {/* Address Section */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Contact Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      We'll use this to send order updates
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Select Shipping Address
                  </h4>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">
                        No saved addresses found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`p-4 rounded-lg transition-all cursor-pointer ${
                            selectedAddressId === addr._id
                              ? "border-2 border-black bg-gray-50"
                              : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleAddressSelect(addr._id)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Radio button indicator */}
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-1 ${
                                selectedAddressId === addr._id
                                  ? "border-black bg-black"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedAddressId === addr._id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {addr.fullName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {addr.phone}
                                  </p>
                                </div>
                                {addr.isDefault && (
                                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-4">
                                {addr.street}, {addr.city}, {addr.state} -{" "}
                                {addr.zipCode}
                              </p>

                              {/* Edit/Set Default/Delete Buttons */}
                              <div
                                className="flex gap-2 mt-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleEditAddress(addr)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit
                                </button>

                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleSetDefault(addr._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 transition-colors"
                                  >
                                    <Star className="w-3 h-3" />
                                    Set Default
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  disabled={deletingAddressId === addr._id}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingAddressId === addr._id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={openAddAddressModal}
                    className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-black"
                  >
                    <Plus className="w-4 h-4" /> Add new address
                  </button>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border border-gray-200 rounded-lg p-5 bg-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-purple-50 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Payment Method
                    </h3>
                    <p className="text-sm text-gray-600">
                      Choose how you'd like to pay
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedPayment("Razorpay")}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedPayment === "Razorpay"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === "Razorpay"
                            ? "border-black bg-black"
                            : "border-gray-400"
                        }`}
                      >
                        {selectedPayment === "Razorpay" && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          Razorpay
                        </p>
                        <p className="text-gray-600 text-xs">
                          Cards, UPI, Wallets
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPayment("COD")}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedPayment === "COD"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === "COD"
                            ? "border-black bg-black"
                            : "border-gray-400"
                        }`}
                      >
                        {selectedPayment === "COD" && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          Cash on Delivery
                        </p>
                        <p className="text-gray-600 text-xs">
                          Pay when you receive
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-5 bg-white sticky top-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200 max-h-64 overflow-y-auto">
                {orderItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productImg ? (
                          <img
                            src={item.productImg}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.productName}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {item.color && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                              {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                              {item.size}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              ₹{formatPriceDisplay(item.price * item.quantity)}
                            </p>
                            {item.discount > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400 line-through">
                                  ₹
                                  {formatPriceDisplay(
                                    item.originalPrice * item.quantity,
                                  )}
                                </span>
                                <span className="text-xs text-green-600 bg-green-50 px-1 py-0.5 rounded">
                                  {item.discount}% OFF
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ₹{formatPriceDisplay(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${formatPriceDisplay(shipping)}`
                    )}
                  </span>
                </div>
                {subtotal > 0 && subtotal < 500 && (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    Add ₹{formatPriceDisplay(500 - subtotal)} more for free
                    shipping!
                  </div>
                )}
              </div>

              <div className="mb-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Total</p>
                    <p className="text-gray-600 text-xs">
                      Including all charges
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ₹{formatPriceDisplay(total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Selected Address:{" "}
                  <span className="font-medium">
                    {selectedAddressId
                      ? addresses.find((a) => a._id === selectedAddressId)
                          ?.fullName || "None"
                      : "None"}
                  </span>
                </p>
              </div>

              <button
                onClick={placeOrder}
                disabled={submitting || !selectedAddressId}
                className="w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Place Order
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Secure checkout
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DaisyUI Modals */}
      <AddAddressModal onAddressAdded={refreshAddresses} />
      <EditAddressModal
        onAddressUpdated={refreshAddresses}
        address={editingAddress}
      />
    </div>
  );
};

export default Checkout;
