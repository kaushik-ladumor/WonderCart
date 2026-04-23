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
    { path: "/seller/bank", label: "Bank Account", icon: Landmark },
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
    <div className="absolute right-0 top-[calc(100%+14px)] z-[100] w-[min(92vw,380px)] overflow-hidden rounded-[24px] border border-[#e5e9f5] bg-white shadow-[0_28px_60px_rgba(18,36,84,0.14)]">
      <div className="flex items-center justify-between border-b border-[#eef1f7] px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[#1a2238]">Notifications</h3>
          <p className="mt-0.5 text-xs text-[#75819d]">
            {unreadCount > 0 ? `${unreadCount} new update${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-[#2156d8] transition hover:text-[#173d99]"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-[#7a849b] transition hover:text-[#1a2238]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="custom-scrollbar max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff]">
              <Bell className="h-6 w-6 text-[#6c7896]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#1a2238]">No new notifications</p>
            <p className="mt-1 text-xs text-[#75819d]">Order updates will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`group border-b border-[#f0f2f8] px-5 py-4 last:border-b-0 ${
                notification.read ? "bg-white" : "bg-[#f7f9ff]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                    notification.read ? "bg-[#d4daec]" : "bg-[#2156d8]"
                  }`}
                />
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => markOneRead(notification._id)}
                >
                  <p className="text-sm leading-6 text-[#1a2238]">{notification.message}</p>
                  <p className="mt-1 text-xs text-[#7b859d]">{notification.time}</p>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="rounded-full p-1.5 text-[#9da6bb] opacity-0 transition group-hover:bg-[#eef2ff] group-hover:opacity-100 group-hover:text-[#4e5a77]"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[272px] lg:flex-col lg:border-r lg:border-[#e4e8f5] lg:bg-white lg:px-6 lg:py-6">
        <Link
          to="/seller/dashboard"
          className="flex items-center gap-3 px-2 py-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#e8eeff]">
            <Store className="h-[18px] w-[18px] text-[#2156d8]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c88a3]">
              Seller
            </p>
            <p className="text-[16px] font-semibold leading-none text-[#1a2238]">
              WonderCart
            </p>
            <p className="text-[18px] font-semibold leading-none text-[#2156d8]">
              Hub
            </p>
          </div>
        </Link>

        <div className="mt-7 flex-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#99a3ba]">
            Management
          </p>
          <nav className="mt-4 space-y-1">
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
                  className={`relative flex items-center justify-between rounded-[20px] px-4 py-3 ${
                    isActive
                      ? "bg-[#f7f9ff] text-[#2156d8]"
                      : "text-[#62708c]"
                  } ${isLocked ? "opacity-55" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-[18px] w-[18px]" />
                    <span
                      className={`text-[14px] font-medium ${
                        isActive ? "underline underline-offset-[6px] decoration-2" : ""
                      }`}
                    >
                      {item.label}
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
          <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
        className={`fixed inset-0 z-40 bg-[#121826]/30 lg:hidden ${
          mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[288px] flex-col bg-white px-6 py-6 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/seller/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#e8eeff]">
              <Store className="h-[18px] w-[18px] text-[#2156d8]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7c88a3]">
                Seller
              </p>
              <p className="text-[16px] font-semibold leading-none text-[#1a2238]">WonderCart</p>
              <p className="text-[18px] font-semibold leading-none text-[#2156d8]">Hub</p>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dfe4f4] bg-[#f7f8ff] text-[#1a2238]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-7">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#99a3ba]">
            Management
          </p>
          <nav className="mt-4 space-y-1">
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
                  className={`flex items-center justify-between rounded-[20px] px-4 py-3 ${
                    isActive
                      ? "bg-[#f7f9ff] text-[#2156d8]"
                      : "text-[#62708c]"
                  } ${isLocked ? "opacity-55" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-[18px] w-[18px]" />
                    <span
                      className={`text-[14px] font-medium ${
                        isActive ? "underline underline-offset-[6px] decoration-2" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {isLocked && <Lock className="h-4 w-4 text-[#8f99b1]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-[#edf0f7] pt-4 space-y-3">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#2156d8] py-3.5 text-[14px] font-bold text-white shadow-xl shadow-blue-100 hover:bg-[#1d4ed8] transition-all"
          >
            Withdraw Funds
          </button>


          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#d9e1f2] bg-white px-4 py-3 text-[14px] font-medium text-[#1a2238] hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default SellerNavbar;
