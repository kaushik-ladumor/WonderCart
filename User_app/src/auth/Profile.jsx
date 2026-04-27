import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Shield,
  Ticket,
  Trash2,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useSocket } from "../context/SocketProvider";
import UpdatePassword from "./UpdatePassword";
import VerifyEmail from "./VerifyEmail";
import DeleteModal from "./DeletedModel";
import WalletModal from "./WalletModal";
import { API_URL } from "../utils/constants";

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "N/A";

const Profile = () => {
  const { authUser, setAuthUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

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
      if (!token) return;
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.user;
      setAuthUser(user);
      setEditForm({
        username: user.username || "",
        email: user.email || "",
      });
      setAddresses(user.addresses || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
    }
  };

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

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_URL}/coupon/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCoupons(response.data.coupons || []);
      } catch (error) {
        console.error("Failed to fetch coupons", error);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchProfile();
    fetchCoupons();
  }, [setAuthUser]);

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleWalletUpdate = (data) => {
      console.log("💰 Wallet Update:", data);
      fetchProfile();
      if (data.message) toast.success(data.message);
    };

    socket.on("wallet-update", handleWalletUpdate);
    return () => socket.off("wallet-update", handleWalletUpdate);
  }, [socket, authUser]);

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

  const defaultAddress = useMemo(
    () => addresses.find((item) => item.isDefault) || addresses[0],
    [addresses],
  );

  const displayName =
    authUser?.username || authUser?.name || "WonderCart User";

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
        : "Customer",
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
      icon: Shield,
      action: () => setShowUpdatePassword(true),
    },
    {
      title: "Track Order",
      description: "View real-time delivery status",
      icon: Truck,
      action: () => navigate("/track-order"),
    },
    {
      title: "My Orders",
      description: "Purchase history and invoices",
      icon: CreditCard,
      action: () => navigate("/my-orders"),
    },
    {
      title: "My Coupons",
      description: loadingCoupons
        ? "Loading rewards"
        : `${coupons.length} reward${coupons.length === 1 ? "" : "s"} available`,
      icon: Ticket,
      action: () => navigate("/my-coupons"),
    },
    {
      title: "My Reviews",
      description: "Manage your product feedback",
      icon: MessageSquare,
      action: () => navigate("/my-reviews"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] py-3 text-[#11182d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[#11182d]">
              My Profile
            </h1>
            <p className="mt-1 text-[0.85rem] text-[#64748b]">
              Manage your identity and account preferences
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[6px] border-[#f1f5f9] bg-[#f8fafc] relative shadow-inner">
                  {previewUrl || authUser?.profile ? (
                    <img
                      src={previewUrl || authUser.profile}
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

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="mt-6 w-full space-y-4">
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
                <div className="mt-5">
                  <h2 className="text-[1.25rem] font-bold text-[#11182d]">{displayName}</h2>
                  <p className="mt-1 text-[0.82rem] font-medium text-[#64748b]">
                    {authUser?.email || "wondercart@example.com"}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-[#eef2ff] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f49d7]">
                  User Role
                </span>
                <button
                  type="button"
                  onClick={() => setShowWalletModal(true)}
                  className="rounded-full border border-[#d8ddea] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#11182d]"
                >
                  Wallet
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="rounded-[16px] bg-[#eef2ff] p-3.5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#0f49d7]">
                    <Wallet className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#6d7892]">
                      Wallet Balance
                    </p>
                    <p className="mt-1.5 text-[1.1rem] font-semibold text-[#11182d]">
                      Rs {Number(authUser?.walletBalance || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] bg-[#f0f9ff] p-3.5 border border-[#e0f2fe]">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white text-[#0369a1]">
                    <Ticket className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#0369a1]">
                      Reward Points
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="mt-1.5 text-[1.1rem] font-semibold text-[#11182d]">
                        {Number(authUser?.rewardPoints || 0).toLocaleString()}
                      </p>
                      <span className="text-[0.7rem] text-[#64748b]">Pts</span>
                    </div>
                    <p className="mt-0.5 text-[0.65rem] text-[#64748b]">
                      1 Point = ₹0.1 reward
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[1.2rem] font-bold text-[#11182d]">
                  Shipping Address
                </h2>
                <p className="mt-1 text-[0.82rem] font-medium text-[#64748b]">
                  Primary delivery destination
                </p>
              </div>
              {defaultAddress && (
                <div className="flex items-center gap-1.5 rounded-full bg-[#f0fdf4] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#15803d] border border-[#dcfce7]">
                  <CheckCircle2 className="w-3 h-3" />
                  Default
                </div>
              )}
            </div>

            {defaultAddress ? (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f49d7]">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[0.95rem] font-bold text-[#11182d]">{defaultAddress.fullName}</p>
                      <p className="text-[0.76rem] font-medium text-[#64748b]">{defaultAddress.addressType || 'Home'}</p>
                   </div>
                </div>
                
                <div className="rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] p-4">
                  <p className="text-[0.85rem] leading-relaxed font-medium text-[#334155]">
                    {defaultAddress.street}, {defaultAddress.city}
                    <br />
                    {defaultAddress.state} - {defaultAddress.zipCode}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                   <div className="flex items-center gap-2.5 rounded-xl border border-[#f1f5f9] bg-white p-2.5">
                      <Mail className="w-4 h-4 text-[#94a3b8]" />
                      <span className="truncate text-[0.76rem] font-semibold text-[#475569]">{authUser?.email}</span>
                   </div>
                   <div className="flex items-center gap-2.5 rounded-xl border border-[#f1f5f9] bg-white p-2.5">
                      <Phone className="w-4 h-4 text-[#94a3b8]" />
                      <span className="text-[0.76rem] font-semibold text-[#475569]">{defaultAddress.phone}</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] p-8 text-center">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                   <MapPin className="w-6 h-6 text-[#94a3b8]" />
                </div>
                <p className="text-[0.85rem] font-semibold text-[#64748b]">No addresses saved</p>
                <button
                  type="button"
                  onClick={() => navigate("/address")}
                  className="mt-4 rounded-xl bg-[#0f49d7] px-5 py-2 text-[0.78rem] font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-[#0838a7] transition-all"
                >
                  Add Address
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
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
                    {tile.title === "Verification Status" && !authUser?.isVerified && (
                      <button
                        type="button"
                        onClick={() => setShowVerifyEmail(true)}
                        className="mt-1.5 text-[0.76rem] font-medium text-[#0f49d7]"
                      >
                        Verify now
                      </button>
                    )}
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
                Account Settings
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
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${index !== settingsItems.length - 1
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
                className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] bg-[#1f2940] text-[0.8rem] font-semibold text-white"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout Session
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-[14px] border border-[#d12828] bg-white text-[0.8rem] font-semibold text-[#d12828]"
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

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-[1.1rem] font-semibold text-[#11182d]">
                Reward Points History
              </h2>
              <div className="mt-2 h-1 w-10 rounded-full bg-[#0369a1]" />
            </div>
          </div>
          
          <div className="overflow-hidden rounded-[18px] border border-[#e1e5f1] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.8rem]">
                <thead className="bg-[#f8f9fd] uppercase tracking-wider text-[#6d7892]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Points</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Expiry</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f8]">
                  {authUser?.pointsHistory && authUser.pointsHistory.length > 0 ? (
                    [...authUser.pointsHistory].reverse().map((entry, idx) => (
                      <tr key={idx} className="hover:bg-[#fbfcfe]">
                        <td className={`px-4 py-3 font-bold ${entry.points > 0 ? 'text-[#15753a]' : 'text-[#c0392b]'}`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </td>
                        <td className="px-4 py-3 text-[#42506d]">{entry.reason}</td>
                        <td className="px-4 py-3 text-[#42506d] whitespace-nowrap">{formatDate(entry.earnedOn)}</td>
                        <td className="px-4 py-3 text-[#42506d] whitespace-nowrap">{formatDate(entry.expiresOn)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                            entry.status === 'active' ? 'bg-[#eef2ff] text-[#0f49d7]' :
                            entry.status === 'used' ? 'bg-[#f0fdf4] text-[#15753a]' :
                            'bg-[#fef2f2] text-[#c0392b]'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-[#6d7892]">
                        No reward points history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <UpdatePassword 
        isOpen={showUpdatePassword} 
        onClose={() => setShowUpdatePassword(false)} 
      />
      <VerifyEmail 
        isOpen={showVerifyEmail} 
        onClose={() => setShowVerifyEmail(false)} 
        email={authUser?.email} 
      />
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onRefresh={fetchProfile}
      />
    </div>
  );
};

export default Profile;
