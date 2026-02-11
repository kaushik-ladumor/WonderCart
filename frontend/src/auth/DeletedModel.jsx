import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Trash2,
  X,
  Package,
  Clock,
  Truck,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { API_URL } from "../utils/constants";

const DeleteModal = ({ isOpen, onClose }) => {
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeOrders, setActiveOrders] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/user/delete-account`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message || "Account deleted successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("Users");
      setAuthUser(null);
      onClose();
      navigate("/");
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        setActiveOrders(true);

        // Extract order status from error message if available
        if (message) {
          let status = "pending";
          if (message.includes("processing")) status = "processing";
          if (message.includes("shipped")) status = "shipped";
          setOrderDetails({ status, message });
        }
      } else {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-600" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "processing":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "shipped":
        return "bg-indigo-50 border-indigo-200 text-indigo-800";
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Your order is pending and waiting for confirmation";
      case "processing":
        return "Your order is being processed and prepared for shipping";
      case "shipped":
        return "Your order has been shipped and is on its way";
      default:
        return "You have active orders that need to be completed";
    }
  };

  const getActionSteps = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return [
          "Wait for order confirmation",
          "Contact support to cancel the order",
          "Or wait for order to be processed",
        ];
      case "processing":
        return [
          "Wait for order to be shipped",
          "Contact seller to check status",
          "Or contact support for assistance",
        ];
      case "shipped":
        return [
          "Wait for delivery completion",
          "Track your shipment",
          "Confirm delivery when received",
        ];
      default:
        return [
          "Complete or cancel all active orders",
          "Contact support for assistance",
          "Try again after orders are completed",
        ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-300 max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Delete Account</h3>
                <p className="text-sm text-gray-500">
                  Permanent action - cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setDeleteConfirm("");
                setActiveOrders(false);
                setOrderDetails(null);
              }}
              className="p-2 hover:bg-gray-100 transition-colors"
              disabled={isDeleting}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {activeOrders ? (
            <div className="space-y-6">
              <div
                className={`border rounded-lg p-4 ${getStatusColor(orderDetails?.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(orderDetails?.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <p className="text-sm font-semibold">
                        Active Orders Found
                      </p>
                    </div>
                    <p className="text-sm">
                      {getStatusText(orderDetails?.status)}
                    </p>

                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-700">
                        What you need to do:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {getActionSteps(orderDetails?.status).map(
                          (step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {step}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">
                    Why can't you delete your account?
                  </p>
                  <ul className="text-xs text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Account deletion is blocked while orders are active to
                        protect both buyers and sellers
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        This ensures order fulfillment and prevents transaction
                        issues
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Once all orders are completed or cancelled, you can
                        delete your account
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveOrders(false);
                    setOrderDetails(null);
                    navigate("/orders");
                  }}
                  className="flex-1 py-3 px-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  View Orders
                </button>
                <button
                  onClick={() => {
                    setActiveOrders(false);
                    setOrderDetails(null);
                    setDeleteConfirm("");
                  }}
                  className="flex-1 py-3 px-4 border border-gray-400 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete your account? This will
                  permanently remove all your data from our servers.
                </p>

                <div className="bg-gray-50 border border-gray-300 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-black">
                        What will be deleted:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1.5">
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>Your
                          reviews and ratings
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>Cart and
                          wishlist items
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>Account
                          details and preferences
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-600 mr-2">•</span>Order
                          history and notifications
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-black">
                  Type <span className="font-bold text-red-600">DELETE</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) =>
                    setDeleteConfirm(e.target.value.toUpperCase())
                  }
                  placeholder="Type DELETE here"
                  className="w-full px-4 py-3 border border-gray-400 bg-white text-black font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={isDeleting}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setDeleteConfirm("");
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 border border-gray-400 text-black font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== "DELETE"}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
