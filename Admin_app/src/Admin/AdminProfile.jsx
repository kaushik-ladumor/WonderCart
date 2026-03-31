import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Settings,
  LogOut,
  Calendar,
  CheckCircle,
  Key,
  Trash2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import UpdatePassword from "../auth/UpdatePassword";
import DeleteModal from "../auth/DeletedModel";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

const AdminProfile = () => {
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
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
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
    setAuthUser(null);
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
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow overflow-hidden bg-gray-100">
                      <img
                        src={profileData.profile}
                        alt={profileData.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {profileData.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        @{profileData.username || "Admin"}
                      </h2>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {profileData.role || "admin"}
                      </span>
                      {profileData.isVerified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{profileData.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(profileData.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Account Type</p>
                    <p className="text-sm font-semibold capitalize text-black">
                      {profileData.role}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-semibold text-green-600">
                      {profileData.isVerified ? "Verified" : "Pending"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-semibold text-black">
                      {formatDate(profileData.createdAt)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Last Active</p>
                    <p className="text-sm font-semibold text-black">Now</p>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-medium">
                      @{profileData.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-medium">
                      {profileData.email}
                    </div>
                    {profileData.isVerified && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Email verified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Security
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() =>
                      document
                        .getElementById("update_password_modal")
                        ?.showModal()
                    }
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                      <Key className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-black">
                        Update Password
                      </p>
                      <p className="text-xs text-gray-500">Change password</p>
                    </div>
                  </button>

                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-yellow-800">
                          Security Tip
                        </p>
                        <p className="text-xs text-yellow-700">
                          Update your password regularly
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded font-medium hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-red-600 border border-red-300 rounded font-medium hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <a
                    href="/admin/dashboard"
                    className="block text-sm text-gray-600 hover:text-black py-1"
                  >
                    Dashboard
                  </a>
                  <a
                    href="/admin/settings"
                    className="block text-sm text-gray-600 hover:text-black py-1"
                  >
                    System Settings
                  </a>
                  <a
                    href="/admin/users"
                    className="block text-sm text-gray-600 hover:text-black py-1"
                  >
                    User Management
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdatePassword />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminProfile;
