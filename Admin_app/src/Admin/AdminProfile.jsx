import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  LogOut,
  Mail,
  Shield,
  Trash2,
  User,
  Plus,
  Key,
  Settings,
  LayoutDashboard,
  Users
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import UpdatePassword from "../auth/UpdatePassword";
import DeleteModal from "../auth/DeletedModel";
import Loader from "../components/Loader";
import { API_URL } from "../utils/constants";

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "N/A";

const AdminProfile = () => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.user;
      setAuthUser(user);
      setEditForm({
        username: user.username || "",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setAuthUser(null);
        navigate("/");
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [setAuthUser, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("username", editForm.username);
      if (selectedFile) {
        formData.append("profile", selectedFile);
      }

      const res = await axios.put(`${API_URL}/user/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      if (res.data.success) {
        setAuthUser(res.data.user);
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/user/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch (error) {
      console.error("Logout API failed", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("Users");
    setAuthUser(null);
    navigate("/");
  };

  if (loading) return <Loader />;

  const displayName = authUser?.username || authUser?.name || "System Admin";

  const infoTiles = [
    {
      title: "Joined Date",
      value: formatDate(authUser?.createdAt),
      icon: Calendar,
      valueColor: "text-[#11182d]",
    },
    {
      title: "Account Role",
      value: authUser?.role
        ? authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1)
        : "Admin",
      icon: Shield,
      valueColor: "text-[#11182d]",
    },
    {
      title: "Verification Status",
      value: authUser?.isVerified ? "Verified Profile" : "Email Not Verified",
      icon: CheckCircle2,
      valueColor: authUser?.isVerified ? "text-[#15753a]" : "text-[#c0392b]",
    },
  ];

  const settingsItems = [
    {
      title: "Update Password",
      description: "Ensure your account is secure",
      icon: Key,
      action: () => document.getElementById("update_password_modal")?.showModal(),
    },
    {
      title: "Platform Dashboard",
      description: "View platform analytics",
      icon: LayoutDashboard,
      action: () => navigate("/admin/dashboard"),
    },
    {
      title: "User Management",
      description: "Manage system users",
      icon: Users,
      action: () => navigate("/admin/users"),
    },
  ];

  return (
    <div className="bg-[#f6f7fb] text-[#11182d] font-poppins pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">
              Admin Profile
            </h1>
            <p className="mt-1 text-[0.85rem] text-[#64748b]">
              Manage your administrative identity and preferences
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-[#e2e8f0] px-5 py-2.5 text-[0.82rem] font-semibold text-[#11182d] transition-all hover:bg-[#f8fafc] hover:border-[#cbd5e1] active:scale-[0.98] shadow-sm"
            >
              <User className="w-4 h-4 mr-2 text-[#0f49d7]" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="relative group shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#f1f5f9] bg-[#f8fafc] relative shadow-inner">
                {previewUrl || authUser?.profile ? (
                  <img
                    src={previewUrl || authUser?.profile}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-[#94a3b8]" />
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                        toast.success("Photo selected. Save to confirm.");
                      }}
                    />
                  </label>
                )}
              </div>
              {authUser?.isVerified && (
                <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#10b981] text-white shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="w-full space-y-4 max-w-md">
                  <div className="text-left">
                    <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1.5 ml-1">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                      <input
                        type="text"
                        placeholder="Username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] pl-10 pr-4 py-3 text-[0.88rem] font-medium outline-none focus:border-[#0f49d7] focus:ring-4 focus:ring-blue-500/5 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setPreviewUrl(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1 rounded-[14px] border border-[#e2e8f0] py-3 text-[0.82rem] font-bold text-[#475569] hover:bg-[#f8fafc] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 rounded-[14px] bg-[#0f49d7] py-3 text-[0.82rem] font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#0838a7] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-2">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-[1.5rem] font-bold text-[#11182d]">{displayName}</h2>
                    <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0f49d7]">
                      Platform Master
                    </span>
                  </div>
                  <p className="mt-1 text-[0.88rem] font-medium text-[#64748b] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {authUser?.email || "admin@wondercart.com"}
                  </p>
                  <p className="mt-2 text-[0.82rem] font-medium text-[#64748b]">
                    Full access to platform administration, user management, and order oversight.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {infoTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.title}
                className="rounded-[16px] border border-[#e1e5f1] bg-[#eef2ff] px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#0f49d7]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#5d6a84]">
                      {tile.title}
                    </p>
                    <p className={`mt-1.5 text-[0.9rem] font-semibold ${tile.valueColor}`}>
                      {tile.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section>
            <div className="mb-3">
              <h2 className="text-[1.1rem] font-semibold text-[#11182d]">
                Administrative Actions
              </h2>
              <div className="mt-2 h-1 w-10 rounded-full bg-[#0f49d7]" />
            </div>

            <div className="overflow-hidden rounded-[18px] border border-[#e1e5f1] bg-white">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.action}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${index !== settingsItems.length - 1
                        ? "border-b border-[#edf1f8]"
                        : ""
                      }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] text-[#0f49d7]">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.9rem] font-semibold text-[#11182d]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[0.76rem] text-[#5d6a84]">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-[1.1rem] text-[#b0b8cb]">›</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-[1.1rem] font-semibold text-[#11182d]">
                Account Actions
              </h2>
              <div className="mt-2 h-1 w-10 rounded-full bg-[#d12828]" />
            </div>

            <div className="rounded-[18px] border border-[#f0c9c9] bg-white p-4">
              <p className="text-[0.76rem] leading-5 text-[#42506d]">
                Danger zone: actions here cannot be undone. Please proceed with
                caution.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] bg-[#1f2940] text-[0.8rem] font-semibold text-white transition-all hover:bg-black"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout Session
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] border border-[#d12828] bg-white text-[0.8rem] font-semibold text-[#d12828] transition-all hover:bg-red-50"
              >
                <Trash2 className="h-4.5 w-4.5" />
                Delete Account
              </button>

              <button
                type="button"
                disabled
                className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] bg-[#edf1f7] text-[0.8rem] font-semibold text-[#b2bccf]"
              >
                <Shield className="h-4.5 w-4.5" />
                Advanced Recovery (Locked)
              </button>
            </div>
          </section>
        </div>
      </div>

      <UpdatePassword />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminProfile;
