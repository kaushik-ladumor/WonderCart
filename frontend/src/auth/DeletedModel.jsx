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
    <div className="fixed inset-0 bg-[#141b2d]/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] max-w-[420px] w-full shadow-[0_20px_60px_-15px_rgba(20,27,45,0.08)] border border-white/50">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#141b2d]">Delete Account</h3>
                <p className="font-body text-[11px] text-[#5c6880] mt-0.5">
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
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors -mt-1 -mr-1"
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeOrders ? (
            <div className="space-y-6">
              <div
                className={`border rounded-2xl p-4 ${getStatusColor(orderDetails?.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getStatusIcon(orderDetails?.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <p className="text-[13px] font-bold">
                        Active Orders Found
                      </p>
                    </div>
                    <p className="text-xs">
                      {getStatusText(orderDetails?.status)}
                    </p>

                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">
                        What you need to do:
                      </p>
                      <ul className="text-xs space-y-1.5 opacity-90">
                        {getActionSteps(orderDetails?.status).map(
                          (step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              {step}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0f4ff]/50 border border-[#f0f4ff] rounded-2xl p-5">
                <div className="space-y-3">
                  <p className="text-[13px] font-bold text-[#141b2d]">
                    Why can't you delete your account?
                  </p>
                  <ul className="text-[11px] text-[#5c6880] space-y-2.5 leading-relaxed">
                    <li className="flex items-start">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Account deletion is blocked while orders are active to
                        protect both buyers and sellers
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>
                        This ensures order fulfillment and prevents transaction
                        issues
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Once all orders are completed or cancelled, you can
                        delete your account
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveOrders(false);
                    setOrderDetails(null);
                    navigate("/orders");
                  }}
                  className="flex-1 py-3.5 px-4 bg-[#141b2d] text-white font-display font-bold text-xs rounded-xl hover:bg-[#004ac6] transition-colors flex items-center justify-center gap-2 shadow-sm"
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
                  className="flex-1 py-3.5 px-4 border border-gray-200 bg-white text-[#141b2d] font-display font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="font-body text-[13px] text-[#5c6880] leading-relaxed mb-6">
                  Are you sure you want to delete your account? This will
                  permanently remove all your data from our servers.
                </p>

                <div className="bg-[#fff5f5] border border-red-50 rounded-[1rem] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-[14px] h-[14px] rounded-full bg-[#ef4444] flex items-center justify-center text-white">
                      <span className="text-[9px] font-black leading-none">!</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest">
                      What will be deleted:
                    </span>
                  </div>
                  <ul className="text-xs text-[#5c6880] space-y-2.5 font-medium pl-1">
                    <li className="flex items-center">
                      <div className="w-[3px] h-[3px] rounded-full bg-[#ef4444] mr-3" />
                      Your reviews and ratings
                    </li>
                    <li className="flex items-center">
                      <div className="w-[3px] h-[3px] rounded-full bg-[#ef4444] mr-3" />
                      Cart and wishlist items
                    </li>
                    <li className="flex items-center">
                      <div className="w-[3px] h-[3px] rounded-full bg-[#ef4444] mr-3" />
                      Account details and preferences
                    </li>
                    <li className="flex items-center">
                      <div className="w-[3px] h-[3px] rounded-full bg-[#ef4444] mr-3" />
                      Order history and notifications
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[9px] font-bold text-[#5c6880] uppercase tracking-widest">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) =>
                    setDeleteConfirm(e.target.value.toUpperCase())
                  }
                  placeholder="Type DELETE here"
                  className="w-full px-4 py-3.5 bg-[#f0f4ff] border border-transparent rounded-xl text-sm font-medium text-[#141b2d] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]/30 transition-all"
                  disabled={isDeleting}
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    setDeleteConfirm("");
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 px-4 bg-white border border-gray-200 text-[#141b2d] font-display font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== "DELETE"}
                  className="flex-1 py-3.5 px-4 bg-[#ef4444] text-white font-display font-bold text-xs rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
