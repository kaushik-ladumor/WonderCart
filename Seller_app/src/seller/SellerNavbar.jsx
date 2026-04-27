import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  DollarSign,
  Lock,
  LogOut,
  Menu,
  Package,
  Percent,
  Search,
  ShoppingCart,
  Store,
  User,
  X,
  Wallet,
  Landmark,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useSocket } from "../context/SocketProvider";
import { API_URL } from "../utils/constants";
import axios from "axios";
import toast from "react-hot-toast";

const SellerNavbar = () => {
  const { authUser, setAuthUser } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileStatus, setProfileStatus] = useState("email_pending");
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  const fetchProfileStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_URL}/seller/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProfileStatus(res.data.profile.profileStatus);
      }
    } catch (err) {
      console.error("Failed to fetch profile status in navbar");
    }
  };

  const isProfileActive = profileStatus === "active";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const sellerName = useMemo(() => {
    const rawName =
      authUser?.username ||
      authUser?.name ||
      authUser?.fullName ||
      authUser?.displayName ||
      authUser?.email?.split("@")[0];

    return rawName || "Seller";
  }, [authUser]);

  const sellerEmail = authUser?.email || "seller@wondercart.com";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  const navItems = [
    { path: "/seller/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/seller/products", label: "Products", icon: Package },
    { path: "/seller/orders", label: "Orders", icon: ShoppingCart },
    { path: "/seller/earnings", label: "Earnings", icon: DollarSign },
    { path: "/seller/wallet", label: "My Wallet", icon: Wallet },
    { path: "/seller/deals", label: "My Deals", icon: Percent },
    { path: "/seller/deals/create", label: "New Campaign", icon: Plus },
    { path: "/seller/reviews", label: "Feedback", icon: MessageSquare },
    { path: "/seller/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    setAuthUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      const newNotification = {
        id: notification._id || notification.orderId || Date.now(),
        message: notification.message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      };

      // Show toast message
      toast.info(newNotification.message, {
        icon: '🔔',
        style: {
          borderRadius: '16px',
        }
      });

      setNotifications((prev) => {
        // prevent duplicate notification
        if (prev.some((n) => n.id === newNotification.id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        const formatted = data.data.map((n) => ({
          _id: n._id,
          message: n.message,
          time: new Date(n.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: n.isRead,
        }));
        setNotifications(formatted);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllRead = async () => {
    // We'll just mark them locally for speed or handle bulk on backend if needed
    // Our backend doesn't have a bulk read yet, so we'll do individual or add it
    const token = localStorage.getItem("token");
    if (!token) return;

    // For now, let's just mark locally and then mark each in background or add bulk route
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Marked all as read");
  };

  const markOneRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const clearAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications([]);
      toast.success("Notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const deleteNotification = async (id) => {
    // Fallback to mark as read or just filter out if we don't have a specific delete
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleNavClick = (event, isLocked, onSuccess) => {
    if (isLocked) {
      event.preventDefault();
      toast.error("Complete your profile to unlock this feature");
      return;
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  const notificationPanel = showDropdown ? (
    <div className="absolute right-[-70px] sm:right-0 top-[calc(100%+12px)] z-[100] w-[280px] sm:w-[340px] overflow-hidden rounded-[24px] border border-[#e2e7f2] bg-white shadow-[0_18px_40px_rgba(17,24,45,0.12)]">
      <div className="flex items-center justify-between border-b border-[#edf1f8] px-5 py-4">
        <h3 className="text-[0.88rem] font-bold text-[#11182d]">Notifications</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="text-[0.74rem] font-bold text-[#0f49d7] hover:underline"
          >
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="text-[0.74rem] font-bold text-[#cf2b2b] hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center text-[0.82rem] text-[#6a7690]">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`group flex items-start gap-3 border-b border-[#f4f6fb] px-5 py-4 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50/50 ${
                notification.read ? "bg-white" : "bg-[#f8faff]"
              }`}
              onClick={() => markOneRead(notification._id)}
            >
              <span
                className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                  notification.read ? "bg-[#d9deeb]" : "bg-[#0f49d7]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-[0.82rem] leading-6 ${notification.read ? 'text-[#6a7690]' : 'text-[#11182d] font-medium'}`}>
                  {notification.message}
                </p>
                <p className="mt-1 text-[10px] text-[#7c88a2]">
                  {notification.time}
                </p>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  deleteNotification(notification._id);
                }}
                className="rounded-lg p-1.5 text-[#7c88a2] opacity-0 transition group-hover:bg-gray-100 group-hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[272px] lg:flex-col lg:border-r lg:border-[#e4e8f5] lg:bg-white lg:px-4 lg:pb-6 lg:pt-0">
        <Link
          to="/seller/dashboard"
          className="flex items-center justify-start pt-2 pb-6 group"
        >
          <img 
            src="/WonderCart Logo.png" 
            alt="WonderCart" 
            className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              const isLocked =
                !isProfileActive &&
                item.path !== "/seller/dashboard" &&
                item.path !== "/seller/profile";

              return (
                <Link
                  key={item.path}
                  to={isLocked ? "#" : item.path}
                  onClick={(event) => handleNavClick(event, isLocked)}
                  className={`relative flex items-center justify-between rounded-[20px] px-4 py-3 transition-colors ${isActive
                      ? "text-[#2156d8]"
                      : "text-[#62708c] hover:text-[#2156d8]"
                    } ${isLocked ? "opacity-55" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-[18px] w-[18px]" />
                    <span
                      className={`text-[14px] font-medium relative group ${
                        isActive ? "text-[#2156d8] font-bold" : ""
                      }`}
                    >
                      {item.label}
                      <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                    </span>
                  </div>
                  {isLocked ? <Lock className="h-4 w-4 text-[#8f99b1]" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#edf0f7] px-2 pt-4">

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#d9e1f2] bg-white px-4 py-3 text-[14px] font-medium text-[#1a2238]"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 lg:left-[272px]">
        <div className="border-b border-[#e4e8f5] bg-white">
          <div className="flex h-[64px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dfe4f4] bg-white text-[#1a2238] transition hover:bg-[#f7f9ff] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="relative p-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-full transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-[#ef4444] border-2 border-white">
                    </span>
                  )}
                </button>
                {notificationPanel}
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-[#e2e8f0]">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-[#1a2238] uppercase tracking-tight">{sellerName}</p>
                  <p className="text-[10px] font-medium text-[#94a3b8]">MERCHANT #{authUser?._id?.substring(0, 6).toUpperCase()}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-sm font-semibold text-[#2156d8] overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${sellerName}&background=0f172a&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[#121826]/30 lg:hidden ${mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity ${
          mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(85%,340px)] flex-col bg-white transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e4e8f2] px-5 py-4">
            <Link
              to="/seller/dashboard"
              className="flex items-center justify-start group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img 
                src="/WonderCart Logo.png" 
                alt="WonderCart" 
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5c6880] hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 scrollbar-hide">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                const isLocked =
                  !isProfileActive &&
                  item.path !== "/seller/dashboard" &&
                  item.path !== "/seller/profile";

                return (
                  <Link
                    key={item.path}
                    to={isLocked ? "#" : item.path}
                    onClick={(event) =>
                      handleNavClick(event, isLocked, () => setMobileMenuOpen(false))
                    }
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[0.88rem] font-medium transition-all ${
                      isActive
                        ? "text-[#2156d8]"
                        : "text-[#25324d] hover:text-[#2156d8]"
                    } ${isLocked ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`h-[18px] w-[18px] ${isActive ? "text-[#2156d8]" : "text-[#6d7892]"}`} />
                      <span className={isActive ? "font-bold" : ""}>
                        {item.label}
                      </span>
                    </div>
                    {isLocked && <Lock className="h-4 w-4 text-[#8f99b1]" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="mt-auto border-t border-[#f1f5fb] px-5 py-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-[16px] border border-[#e2e7f2] bg-white py-4 text-[0.88rem] font-bold text-[#cf2b2b] hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerNavbar;
