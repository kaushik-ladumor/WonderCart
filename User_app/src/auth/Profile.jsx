import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
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

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuthUser(response.data.user);
      setAddresses(response.data.user.addresses || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_URL}/user/coupons`, {
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
        <div className="mb-5">
          <h1 className="text-[1.5rem] font-semibold tracking-tight sm:text-[1.75rem]">
            My Profile
          </h1>
          <p className="mt-1 text-[0.82rem] text-[#42506d]">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-5">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[#eef2ff] bg-[#f6f8fd]">
                  {authUser?.profile ? (
                    <img
                      src={authUser.profile}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-[#90a0be]" />
                  )}
                </div>
                {authUser?.isVerified && (
                  <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-[#15753a] text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-[1.1rem] font-semibold">{displayName}</h2>
              <p className="mt-1 text-[0.76rem] text-[#42506d]">
                {authUser?.email || "wondercart@example.com"}
              </p>

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

            <div className="mt-5 rounded-[16px] bg-[#eef2ff] p-3.5">
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
          </div>

          <div className="rounded-[18px] border border-[#e1e5f1] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[1.1rem] font-semibold text-[#11182d]">
                  Default Address
                </h2>
                <p className="mt-1 text-[0.82rem] text-[#42506d]">
                  Primary shipping destination
                </p>
              </div>
              {defaultAddress && (
                <span className="rounded-lg bg-[#0f49d7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  Default
                </span>
              )}
            </div>

            {defaultAddress ? (
              <div className="mt-5 space-y-2 text-[#11182d]">
                <p className="text-[0.9rem] font-semibold">{defaultAddress.fullName}</p>
                <div className="space-y-1.5 text-[0.78rem] leading-6 text-[#33415e]">
                  <p>{defaultAddress.street}</p>
                  <p>
                    {defaultAddress.city}, {defaultAddress.state}{" "}
                    {defaultAddress.zipCode}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-[0.78rem]">
                  <Mail className="h-3.5 w-3.5 text-[#6d7892]" />
                  <span>{authUser?.email || "No email available"}</span>
                </p>
                <p className="flex items-center gap-2 text-[0.78rem]">
                  <Phone className="h-3.5 w-3.5 text-[#6d7892]" />
                  <span>{defaultAddress.phone}</span>
                </p>

              </div>
            ) : (
              <div className="mt-5 rounded-[16px] bg-[#f7f8fc] p-4">
                <p className="text-[0.82rem] text-[#42506d]">No address saved yet.</p>
                <button
                  type="button"
                  onClick={() => navigate("/address")}
                  className="mt-2 rounded-xl bg-[#0f49d7] px-3 py-1.5 text-[0.76rem] font-medium text-white"
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
