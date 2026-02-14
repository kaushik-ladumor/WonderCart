import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Settings,
  LogOut,
  Calendar,
  Tag,
  CheckCircle,
  Store,
  Key,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import UpdatePassword from "../../auth/UpdatePassword";
import VerifyEmail from "../../auth/VerifyEmail";
import DeleteModal from '../../auth/DeletedModel'
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { API_URL } from "../../utils/constants";

const SellerProfile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    profile: "",
    role: "",
    createdAt: "",
    isVerified: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          document.getElementById("login_modal")?.showModal();
          return;
        }

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.user) {
          const user = response.data.user;
          setProfileData({
            username: user.username || "",
            email: user.email || "",
            profile:
              user.profile ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            role: user.role || "",
            createdAt: user.createdAt || "",
            isVerified: user.isVerified || false,
          });
          setAuthUser(user);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("Users");
          setAuthUser(null);
          document.getElementById("login_modal")?.showModal();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setAuthUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("Users");
    setAuthUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Seller Profile
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Manage your seller account and settings
              </p>
            </div>
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Store className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                    <img
                      src={profileData.profile}
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {profileData.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full shadow-md">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      @{profileData.username || "Seller"}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {profileData.role || "seller"}
                      </span>
                      {profileData.isVerified && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {formatDate(profileData.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Warning */}
              {!profileData.isVerified && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Email Not Verified</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Verify your email to add products, manage orders, and access all seller features.
                    </p>
                    <button
                      onClick={() => document.getElementById("verify_email_modal")?.showModal()}
                      className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-4 py-2 rounded-md font-medium transition-colors w-fit"
                    >
                      Verify Email Now
                    </button>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Account Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {profileData.role || "seller"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-semibold text-green-600">
                    {profileData.isVerified ? "Verified" : "Pending"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(profileData.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Store Status</p>
                  <p className="text-sm font-semibold text-gray-900">Active</p>
                </div>
              </div>
            </div>

            {/* Account Information Card */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                    @{profileData.username}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                    {profileData.email}
                  </div>
                  {profileData.isVerified && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Email verified
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Security Settings */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("update_password_modal")
                      ?.showModal()
                  }
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        Update Password
                      </p>
                      <p className="text-xs text-gray-500">
                        Change your account password
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 text-xl">
                    ›
                  </span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-400">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Actions
              </h3>

              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-red-600 border-2 border-red-300 rounded-lg font-medium hover:bg-red-50 hover:border-red-400 transition-colors"
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

      {/* Verify Email Modal */}
      <VerifyEmail modalId="verify_email_modal" email={profileData.email} />

      {/* Delete Account Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default SellerProfile;
