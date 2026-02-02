import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import UpdatePassword from "./UpdatePassword";

const Profile = () => {
  const { authUser, setAuthUser } = useAuth();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:4000/user/profile", {
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
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    setAuthUser(null);
    window.location.href = "/";
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-4 sm:mb-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-white shadow-md overflow-hidden bg-white">
                    {authUser?.profile ? (
                      <img
                        src={authUser.profile}
                        alt={authUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {authUser?.username || "User"}
                    </h2>
                    {authUser?.isVerified && (
                      <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base mb-1">
                    <Mail className="w-4 h-4" />
                    <span>{authUser?.email || ""}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">
                      {authUser?.role || "User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Joined</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {authUser?.createdAt
                      ? formatDate(authUser.createdAt)
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Role</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {authUser?.role || "User"}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium">Status</p>
                  </div>
                  <p className="text-sm font-medium text-green-700">
                    {authUser?.isVerified ? "Verified" : "Active"}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            {defaultAddress && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-700" />
                    <h2 className="font-bold text-gray-900">Default Address</h2>
                  </div>
                  {defaultAddress.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {defaultAddress.fullName}
                    </p>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <Phone className="w-3 h-3" />
                      <span>{defaultAddress.phone}</span>
                    </div>
                  </div>

                  <div className="text-gray-600 text-sm">
                    <p>{defaultAddress.street}</p>
                    <p>
                      {defaultAddress.city}, {defaultAddress.state}{" "}
                      {defaultAddress.zipCode}
                    </p>
                    <p>{defaultAddress.country}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-4 sm:space-y-5">
            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Settings className="w-5 h-5 text-gray-700" />
                <h2 className="font-bold text-gray-900">Account Settings</h2>
              </div>

              <div className="space-y-3">
                {/* Update Password Button */}
                <button
                  onClick={() =>
                    document
                      .getElementById("update_password_modal")
                      ?.showModal()
                  }
                  className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        Update Password
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Change your account password
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    ›
                  </span>
                </button>

                {/* My Orders Button */}
                <button className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        My Orders
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        View your order history
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    ›
                  </span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-xl p-4 sm:p-5 shadow-sm">
              <h2 className="font-bold text-red-900 mb-4">Account Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  Log Out
                </button>

                <button className="w-full py-3 bg-white text-red-600 border border-red-300 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm sm:text-base">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      <UpdatePassword />
    </div>
  );
};

export default Profile;
