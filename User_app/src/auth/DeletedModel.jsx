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
  ShieldAlert
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
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "processing":
        return <Package className="w-4 h-4 text-[#0f49d7]" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 border-amber-100 text-amber-900";
      case "processing":
        return "bg-[#f8f9fb] border-[#eef2ff] text-[#0f49d7]";
      case "shipped":
        return "bg-emerald-50 border-emerald-100 text-emerald-900";
      default:
        return "bg-amber-50 border-amber-100 text-amber-900";
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
        return ["Wait for confirmation", "Contact support", "Wait for processing"];
      case "processing":
        return ["Wait for shipment", "Contact seller", "Check status later"];
      case "shipped":
        return ["Wait for delivery", "Track shipment", "Confirm completion"];
      default:
        return ["Clear all orders", "Contact support", "Try again later"];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#11182d]/20 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-sm mx-auto shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <button
          onClick={() => {
            onClose();
            setDeleteConfirm("");
            setActiveOrders(false);
            setOrderDetails(null);
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6d7892] hover:bg-[#f8f9fb] transition-colors z-10"
          disabled={isDeleting}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-7 pt-7 pb-0 text-center">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#d12828] font-bold block mb-1">
            DANGER ZONE
          </span>
          <h3 className="font-display text-[1.25rem] font-semibold text-[#11182d]">
            Delete Account
          </h3>
          <p className="text-[0.76rem] text-[#6d7892] mt-1 mb-5 leading-relaxed font-medium px-4">
            This action is irreversible and all your data will be permanently removed.
          </p>
        </div>

        <div className="px-7 pb-7 pt-2 overflow-y-auto">
          {activeOrders ? (
            <div className="space-y-5">
              <div className={`rounded-xl border border-transparent p-4 ${getStatusColor(orderDetails?.status)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {getStatusIcon(orderDetails?.status)}
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1">
                      Orders Pending
                    </p>
                    <p className="text-[9px] leading-relaxed font-medium opacity-80">
                      {getStatusText(orderDetails?.status)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f8f9fb] rounded-xl p-4 border border-[#f1f4f9]">
                <p className="text-[9px] font-bold text-[#11182d] uppercase tracking-widest mb-3">
                  NEXT STEPS:
                </p>
                <ul className="text-[10px] text-[#6d7892] space-y-2.5 leading-relaxed font-medium">
                  {getActionSteps(orderDetails?.status).map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-left">
                      <CheckCircle className="w-3 h-3 text-[#15753a] mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    setActiveOrders(false);
                    setOrderDetails(null);
                    navigate("/orders");
                  }}
                  className="w-full bg-[#11182d] text-white font-bold rounded-xl h-12 text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
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
                  className="w-full h-10 bg-transparent text-[#6d7892] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-[#11182d] transition-all"
                >
                  DISMISS
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-[#fff5f5] rounded-xl p-4 border border-[#f0c9c9]/30">
                <p className="text-[9px] font-bold text-[#d12828] uppercase tracking-widest mb-3">
                  AFFECTED DATA:
                </p>
                <ul className="text-[10px] text-[#6d7892] space-y-2.5 leading-relaxed font-bold">
                  {["Reviews & Ratings", "Cart & Wishlist", "Profile & Preferences", "Order History"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#d12828]" />
                      {item.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#6d7892] mb-1 block">
                  Confirmation Required
                </label>
                <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#d12828]/10 transition-all border border-[#f1f4f9] focus-within:border-[#d12828]">
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                    placeholder="TYPE 'DELETE' TO CONFIRM"
                    className="bg-transparent w-full text-[0.82rem] text-[#11182d] outline-none placeholder:text-[#6d7892]/30 font-bold uppercase tracking-widest"
                    disabled={isDeleting}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== "DELETE"}
                  className="w-full bg-[#d12828] text-white font-bold rounded-xl h-12 text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? "PROCESSING..." : "CONFIRM DELETION"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-7 py-5 bg-[#f8f9fb] border-t border-[#e1e5f1]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-[#eef2ff] flex-shrink-0 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-[#d12828]" />
            </div>
            <span className="text-[9px] font-bold text-[#6d7892] uppercase tracking-tight flex-1 leading-[1.3] pt-0.5 text-left">Deleting your account is permanent. This cannot be undone under any circumstances.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
