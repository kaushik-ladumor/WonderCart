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
  Ticket,
  ChevronRight,
  Wallet,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import UpdatePassword from "./UpdatePassword";
import VerifyEmail from "./VerifyEmail";
import DeleteModal from "./DeletedModel";
import WalletModal from "./WalletModal";
import { API_URL } from "../utils/constants";

const Profile = () => {
  const { authUser, setAuthUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoadingCoupons(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/user/coupons`, {
          headers: { Authorization: `Bearer ${token}` }
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${API_URL}/user/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
    navigate("/my-orders");
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-body text-[10px] uppercase tracking-[0.2em] font-bold text-[#004ac6] mb-2 block">
              Dashboard
            </span>
            <h1 className="font-display text-4xl font-extrabold text-[#141b2d] tracking-tight">
              My Profile
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={handleLogout}
              className="bg-white text-[#141b2d] font-bold border border-[#f0f4ff] rounded-xl px-6 py-3 hover:bg-[#f0f4ff] transition-all flex items-center gap-2 text-sm shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-[#f0f4ff] shadow-sm relative overflow-hidden group">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f0f4ff] rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-[#f0f4ff] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                    {authUser?.profile ? (
                      <img src={authUser.profile} alt={authUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-[#004ac6]/30" />
                    )}
                  </div>
                  {authUser?.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-[#004ac6] text-white p-2 rounded-xl shadow-lg border-4 border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-display text-3xl font-bold text-[#141b2d] mb-2">{authUser?.username}</h2>
                  <p className="font-body text-[#5c6880] mb-6">{authUser?.email}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="bg-[#f0f4ff] px-4 py-2 rounded-xl border border-[#e1e8fd]">
                      <p className="font-body text-[10px] uppercase tracking-wider text-[#004ac6] font-bold mb-0.5">Member Since</p>
                      <p className="font-body text-sm font-bold text-[#141b2d]">{authUser?.createdAt ? formatDate(authUser.createdAt) : 'N/A'}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-[#f0f4ff] shadow-sm">
                      <p className="font-body text-[10px] uppercase tracking-wider text-[#5c6880] font-bold mb-0.5">Account Type</p>
                      <p className="font-body text-sm font-bold text-[#141b2d] capitalize">{authUser?.role || 'Customer'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!authUser?.isVerified && (
                <div className="mt-12 p-6 bg-[#fef2f2] rounded-3xl border border-[#fee2e2] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="text-center md:text-left">
                      <p className="font-body text-sm font-bold text-[#141b2d]">Email Unverified</p>
                      <p className="font-body text-xs text-[#5c6880]">Verify your email to unlock all features.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => document.getElementById("verify_email_modal")?.showModal()}
                    className="bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm"
                  >
                    Verify Now
                  </button>
                </div>
              )}
            </div>

            {/* Address & Wallet Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#004ac6]">
                        <Wallet className="w-6 h-6" />
                     </div>
                     <span className="bg-green-100 text-green-700 text-[9px] font-extrabold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-green-200">
                        Active Wallet
                     </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[10px] font-bold text-[#5c6880] uppercase tracking-widest mb-1">Available Funds</h3>
                    <p className="font-display text-4xl font-black text-[#141b2d] tracking-tight italic">
                      ₹{authUser?.walletBalance?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowWalletModal(true)}
                    className="mt-8 bg-[#004ac6] text-white font-bold px-6 py-4 rounded-2xl hover:bg-[#141b2d] transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/10"
                  >
                     Add Money 
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>

               <div className="bg-[#141b2d] rounded-[2rem] p-8 shadow-xl shadow-black/10 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="relative z-10">
                    <Package className="w-10 h-10 text-white mb-6" />
                    <h3 className="font-display text-2xl font-bold text-white mb-2">My Orders</h3>
                    <p className="font-body text-white/60 text-sm">Track your shipments and view past purchases.</p>
                  </div>
                  <button
                    onClick={handleMyOrders}
                    className="relative z-10 mt-8 w-fit bg-white text-[#141b2d] font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform text-sm"
                  >
                    View History
                  </button>
               </div>
            </div>

            {/* Address Row */}
            <div className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-sm">
                {defaultAddress ? (
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center text-[#004ac6]">
                           <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="font-display text-sm font-bold text-[#141b2d]">{defaultAddress.fullName}</p>
                           <p className="font-body text-[#5c6880] text-[11px] leading-relaxed max-w-sm">
                              {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}
                           </p>
                        </div>
                      </div>
                      <button onClick={() => navigate('/address')} className="text-[10px] font-bold uppercase tracking-widest text-[#004ac6] hover:underline whitespace-nowrap">
                        Manage Shipping Addresses
                      </button>
                   </div>
                ) : (
                   <div className="flex flex-col items-center justify-center text-center py-4">
                     <MapPin className="w-12 h-12 text-[#e1e8fd] mb-4" />
                     <p className="font-body text-sm text-[#5c6880]">No address added yet</p>
                     <button onClick={() => navigate('/address')} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#004ac6] hover:underline">
                       Add New Address
                     </button>
                   </div>
                )}
            </div>
          </div>

          {/* Side Menu & Actions */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border border-[#f0f4ff] shadow-sm">
               <h3 className="font-body text-[10px] uppercase tracking-[0.2em] font-bold text-[#5c6880] mb-8">Account Settings</h3>
               
               <div className="space-y-4">
                  {[
                    { id: 'update-pass', icon: Key, title: 'Security', desc: 'Manage your password', action: () => document.getElementById("update_password_modal")?.showModal() },
                    { id: 'track', icon: Truck, title: 'Track Order', desc: 'Real-time shipment tracking', action: () => navigate("/track-order") },
                    { id: 'coupons', icon: Ticket, title: 'My Coupons', desc: `${coupons.length} active offers`, action: () => navigate("/my-coupons") },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#f9f9ff] transition-all border border-transparent hover:border-[#f0f4ff] group text-left"
                    >
                      <div className="w-12 h-12 bg-[#f0f4ff] rounded-xl flex items-center justify-center text-[#004ac6] group-hover:scale-110 transition-transform">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-bold text-[#141b2d]">{item.title}</p>
                        <p className="font-body text-[10px] text-[#5c6880]">{item.desc}</p>
                      </div>
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-red-50 shadow-sm overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h3 className="font-body text-[10px] uppercase tracking-[0.2em] font-bold text-[#5c6880] mb-8 relative z-10">Danger Zone</h3>
               
               <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-bold hover:bg-red-50 transition-all text-sm relative z-10 shadow-sm"
               >
                 <Trash2 className="w-4 h-4" />
                 Permanently Delete Account
               </button>
            </div>
          </div>

        </div>
      </div>

      <UpdatePassword />
      <VerifyEmail modalId="verify_email_modal" email={authUser?.email} />
      <DeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
        onRefresh={fetchProfile}
      />
    </div>
  );
};

export default Profile;
