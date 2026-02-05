import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Settings,
  LogOut,
  Calendar,
  Tag,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import UpdatePassword from "../../auth/UpdatePassword";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

const SellerProfile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(true);
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
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:4000/user/profile`, {
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
          navigate("/login");
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
    <div className="min-h-screen bg-gray-50 px-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your profile and account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                Profile Overview
              </h2>

              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                    <img
                      src={profileData.profile}
                      alt={profileData.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {profileData.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {profileData.username || "Seller"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      @{profileData.username?.toLowerCase()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Role</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {profileData.role || "seller"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p
                        className={`text-sm font-medium ${profileData.isVerified ? "text-green-600" : "text-amber-600"}`}
                      >
                        {profileData.isVerified ? "Verified" : "Pending"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Joined</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(profileData.createdAt)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-700" />
                Account Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-gray-700">
                    {profileData.username}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded text-gray-700">
                    {profileData.email}
                  </div>
                  {profileData.isVerified && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Email verified
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Security */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-700" />
                Security
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    document
                      .getElementById("update_password_modal")
                      ?.showModal()
                  }
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        Update Password
                      </p>
                      <p className="text-xs text-gray-500">
                        Change your password
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    ›
                  </span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-400">
                        Two-Factor Auth
                      </p>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700" />
                Account Actions
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/seller/dashboard")}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        Back to Dashboard
                      </p>
                      <p className="text-xs text-gray-500">
                        View store analytics
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600">
                    ›
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded font-medium hover:bg-red-100 transition group"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>

                <button
                  disabled
                  className="w-full py-2.5 bg-gray-50 text-gray-400 border border-gray-200 rounded font-medium cursor-not-allowed"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpdatePassword />
    </div>
  );
};

export default SellerProfile;
