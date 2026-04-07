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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-tonal-md relative animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            onClose();
            setDeleteConfirm("");
            setActiveOrders(false);
            setOrderDetails(null);
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#5c6880] hover:bg-[#f0f4ff] transition-colors z-10"
          disabled={isDeleting}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal header */}
        <div className="px-6 pt-6 pb-0 text-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#ef4444] font-semibold block mb-1">
            DANGER ZONE
          </span>
          <h3 className="font-display text-[1.2rem] font-semibold text-[#141b2d]">
            Delete Account
          </h3>
          <p className="text-[0.76rem] text-[#5c6880] mt-1 mb-5 leading-relaxed px-4">
            This action is irreversible and all your data will be permanently removed.
          </p>
        </div>

        <div className="px-6 pb-6 pt-2">
          {activeOrders ? (
            <div className="space-y-5">
              <div className={`rounded-xl border border-transparent p-4 ${getStatusColor(orderDetails?.status)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getStatusIcon(orderDetails?.status)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                      Active Orders Found
                    </p>
                    <p className="text-[10px] leading-relaxed opacity-90">
                      {getStatusText(orderDetails?.status)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0f4ff] rounded-xl p-4">
                <p className="text-[10px] font-black text-[#141b2d] uppercase tracking-widest mb-3">
                  Next Steps:
                </p>
                <ul className="text-[10px] text-[#5c6880] space-y-2 leading-relaxed">
                  {getActionSteps(orderDetails?.status).map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setActiveOrders(false);
                    setOrderDetails(null);
                    navigate("/orders");
                  }}
                  className="w-full bg-[#141b2d] text-white font-semibold rounded-xl h-12 text-[0.76rem] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-black/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Manage Orders
                </button>
                <button
                  onClick={() => {
                    setActiveOrders(false);
                    setOrderDetails(null);
                    setDeleteConfirm("");
                  }}
                  className="w-full h-10 bg-transparent text-[#5c6880] rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:text-[#141b2d] hover:bg-[#f0f4ff] transition-all"
                >
                  DISMISS
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-[#fff5f5] rounded-xl p-4 border border-[#f0c9c9]/30">
                <p className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest mb-3">
                  Affected Data:
                </p>
                <ul className="text-[10px] text-[#5c6880] space-y-2 leading-relaxed font-medium">
                  {["Reviews & Ratings", "Cart & Wishlist", "Profile & Preferences", "Order History"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-[#5c6880]">
                  Type DELETE to confirm
                </label>
                <div className="bg-[#f0f4ff] rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/10 transition-all border border-transparent focus-within:border-red-500/20">
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                    placeholder="TYPE HERE..."
                    className="bg-transparent w-full text-[0.82rem] text-[#141b2d] outline-none placeholder:text-[#5c6880]/40 font-semibold uppercase tracking-widest"
                    disabled={isDeleting}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== "DELETE"}
                  className="w-full bg-[#ef4444] text-white font-semibold rounded-xl h-12 text-[0.76rem] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-red-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? "PROCESSING..." : "CONFIRM DELETION"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 pb-6 pt-2 border-t border-[#f0f4ff] bg-gray-50/30">
          <div className="flex items-center gap-3 text-[#5c6880]">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#f0f4ff]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
            </div>
            <span className="text-[10px] uppercase tracking-wider font-medium leading-tight">Deleting your account is permanent. This cannot be undone under any circumstances.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
