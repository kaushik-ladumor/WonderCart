import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import UpdatePassword from "./UpdatePassword";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { authUser, setAuthUser } = useAuth();

  const [username, setUsername] = useState(authUser?.username || "");
  const [profile, setProfile] = useState(authUser?.profile || "");
  const [role, setRole] = useState(authUser?.role || "");

 useEffect(() => {
   const token = localStorage.getItem("token");
   if (!token) return;

   const fetchProfile = async () => {
     try {
       const token = localStorage.getItem("token");
       const response = await axios.get(
         `http://localhost:4000/user/profile`,
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         },
       );

       setUsername(response.data.user.username);
       setProfile(response.data.user.profile);
       setRole(response.data.user.role);
       setAuthUser(response.data.user);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden mb-5">
          <div className="h-32 bg-gradient-to-r from-black via-gray-800 to-black relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30"></div>
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                  {profile ? (
                    <img
                      src={profile}
                      alt={username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-black">{username}</h1>
                {authUser?.isVerified && (
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Joined</p>
                </div>
                <p className="text-sm font-bold text-black">
                  {authUser?.createdAt
                    ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Role</p>
                </div>
                <p className="text-sm font-bold text-black">{role}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Status</p>
                </div>
                <p className="text-sm font-bold text-green-600">
                  {authUser?.isVerified ? "Verified" : "Active"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-black mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium text-sm">
                      @{username}
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-7 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-all text-sm ${
                        isEditing ? "bg-white" : "bg-gray-50"
                      }`}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-black mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authUser?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm"
                  />
                  {/* <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Verified on{" "}
                    {authUser?.createdAt
                      ? new Date(authUser.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "N/A"}
                  </p> */}
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-black mb-1.5">
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter profile picture URL"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Settings
              </h2>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                      <Shield className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <a
                      className="font-semibold text-black text-sm"
                      onClick={() =>
                        document.getElementById("my_modal_7")?.showModal()
                      }
                    >
                      Update Password
                    </a>
                    <UpdatePassword />
                  </div>
                  <span className="text-gray-400">›</span>
                </button>

                <button className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black transition-colors">
                      <Settings className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-semibold text-black text-sm">
                      My Orders
                    </span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-red-900 mb-3">
                Danger Zone
              </h2>

              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>

                <button className="w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all text-sm">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
