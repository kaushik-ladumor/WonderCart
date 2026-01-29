import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  Settings,
  LogOut,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import UpdatePassword from "../../auth/UpdatePassword";
import { useNavigate } from "react-router-dom";

const SellerProfile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState(authUser?.username || "");
  const [profile, setProfile] = useState(authUser?.profile || "");
  const [role, setRole] = useState(authUser?.role || "");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:4000/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data?.user);

        if (response.data?.user) {
          const user = response.data.user;
          setUsername(user.username);
          setProfile(
            user.profile ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          );
          setRole(user.role);
          setAuthUser(user);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error.response?.data?.message || "Failed to load profile");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-gray-800 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-2">
        <div className="mb-6">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              View your account information
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-4">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                {profile ? (
                  <img
                    src={
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-gray-900">
                  {username || "Seller"}
                </h1>
                {authUser?.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                @{username?.toLowerCase()}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900">
                    {role?.charAt(0)?.toUpperCase() + role?.slice(1) ||
                      "Seller"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p
                    className={`text-sm font-medium ${
                      authUser?.isVerified
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {authUser?.isVerified ? "Verified" : "Active"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm font-medium text-gray-900">
                    {authUser?.createdAt
                      ? new Date(authUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                    placeholder="Your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authUser?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                  />
                  {authUser?.isVerified && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Email verified
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={profile}
                    disabled
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Profile picture URL
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Account Settings
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    document.getElementById("my_modal_7")?.showModal()
                  }
                  className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-50 transition text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Update Password
                    </span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-red-900 mb-3">
                Danger Zone
              </h2>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-white text-red-600 border border-red-300 rounded font-medium hover:bg-red-50 transition text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>

                <button
                  disabled
                  className="w-full py-2 bg-red-600 text-white rounded font-medium opacity-50 cursor-not-allowed text-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Modal */}
      <UpdatePassword />
    </div>
  );
};

export default SellerProfile;
