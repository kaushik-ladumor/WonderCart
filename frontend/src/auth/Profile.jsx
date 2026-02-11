import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
  Settings,
  LogOut,
  MapPin,
  Phone,
  Package,
  Key,
  Trash2,
  AlertTriangle,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import UpdatePassword from "./UpdatePassword";
import DeleteModal from "./DeletedModel";
import { API_URL } from "../utils/constants";

const Profile = () => {
  const { authUser, setAuthUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAuthUser(response.data.user);
        setAddresses(response.data.user.addresses || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    };

    fetchProfile();
  }, [setAuthUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const defaultAddress =
    addresses.find((addr) => addr.isDefault) || addresses[0];

  const handleMyOrders = () => {
    navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 mb-6 sm:mb-8">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white ring-offset-4 ring-offset-gray-100 shadow-lg overflow-hidden">
                    {authUser?.profile ? (
                      <img
                        src={authUser.profile}
                        alt={authUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {authUser?.username || "User"}
                    </h2>
                    {authUser?.isVerified && (
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                      <Mail className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <span className="truncate">{authUser?.email || ""}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                      <Shield className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <span className="capitalize">
                        {authUser?.role || "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Joined</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {authUser?.createdAt
                      ? formatDate(authUser.createdAt)
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Role</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {authUser?.role || "User"}
                  </p>
                </div>

                <div className="col-span-2 md:col-span-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Status</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {authUser?.isVerified ? "Verified" : "Active"}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            {defaultAddress && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">
                        Default Address
                      </h2>
                      <p className="text-sm text-gray-500">
                        Your primary delivery address
                      </p>
                    </div>
                  </div>
                  {defaultAddress.isDefault && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Default
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {defaultAddress.fullName}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>{defaultAddress.phone}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-gray-700 text-sm space-y-1">
                      <p className="font-medium">{defaultAddress.street}</p>
                      <p>
                        {defaultAddress.city}, {defaultAddress.state}{" "}
                        {defaultAddress.zipCode}
                      </p>
                      <p>{defaultAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-bold text-gray-900 text-lg">
                  Account Settings
                </h2>
              </div>

              <div className="space-y-4">
                {/* Update Password Button */}
                <button
                  onClick={() =>
                    document
                      .getElementById("update_password_modal")
                      ?.showModal()
                  }
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Update Password
                      </p>
                      <p className="text-xs text-gray-500">
                        Change your account password
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 text-xl font-light">
                    ›
                  </span>
                </button>

                {/* Track Order Button */}
                <button
                  onClick={() => navigate("/track-order")}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Track Order
                      </p>
                      <p className="text-xs text-gray-500">
                        Check your order status
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 text-xl font-light">
                    ›
                  </span>
                </button>

                {/* My Orders Button */}
                <button
                  onClick={handleMyOrders}
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        My Orders
                      </p>
                      <p className="text-xs text-gray-500">
                        View your order history
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 text-xl font-light">
                    ›
                  </span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-red-900">Account Actions</h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-red-600 border-2 border-red-300 rounded-xl font-semibold hover:bg-red-50 hover:border-red-400 transition-all duration-200 active:scale-[0.98]"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      <UpdatePassword />

      {/* Delete Modal Component */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Profile;
