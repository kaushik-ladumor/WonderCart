import {
  Bell,
  Heart,
  Home,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import { API_URL } from "../utils/constants";

const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/shop" },
  { label: "New Arrivals", to: "/shop" },
];

const mobileTabs = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/shop", icon: Search },
  { label: "Cart", to: "/cart", icon: ShoppingBag },
  { label: "Profile", to: "/profile", icon: User },
];

const isPathActive = (pathname, target) => {
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { authUser, setAuthUser } = useAuth();
  const { cartCount } = useCart();
  const socket = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

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

    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setAuthUser(null);
    setIsMenuOpen(false);
    setShowDropdown(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
    setShowNotifications(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/order/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const formatted = (data.notifications || []).map((item) => ({
            id: item._id,
            message: item.message,
            time: new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: item.isRead,
          }));
          setNotifications(formatted);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [authUser]);

  useEffect(() => {
    if (!socket || !authUser) return undefined;

    const handleNotification = (notification) => {
      setNotifications((prev) => [
        {
          id: notification.orderId || Date.now(),
          message: notification.message,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          read: false,
        },
        ...prev,
      ]);
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket, authUser]);

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/order/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const clearAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/order/notifications/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/order/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const userName = authUser?.username || authUser?.name || "My Account";
  const userEmail = authUser?.email || "WonderCart member";

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#e4e8f2] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-[1.75rem] font-semibold tracking-tight text-[#0f49d7]"
            >
              WonderCart
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium ${
                    isPathActive(location.pathname, link.to)
                      ? "text-[#0f49d7]"
                      : "text-[#42506d]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8">
            <div className="flex w-full max-w-md items-center gap-2 rounded-[16px] border border-[#e3e7f3] bg-[#eef2ff] px-4 py-2.5">
              <Search className="h-4 w-4 text-[#6d7892]" />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full bg-transparent text-sm text-[#11182d] outline-none placeholder:text-[#7c88a2]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <div className="relative hidden lg:block" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative rounded-xl p-2 text-[#25324d]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#0f49d7]" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-3 w-[320px] overflow-hidden rounded-[18px] border border-[#e2e7f2] bg-white shadow-[0_18px_40px_rgba(17,24,45,0.08)]">
                    <div className="flex items-center justify-between border-b border-[#edf1f8] px-4 py-3">
                      <p className="text-sm font-semibold text-[#11182d]">
                        Notifications
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-medium">
                        <button
                          onClick={markAllRead}
                          className="text-[#0f49d7]"
                        >
                          Mark all read
                        </button>
                        <button onClick={clearAll} className="text-[#cf2b2b]">
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-[#6a7690]">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 border-b border-[#f4f6fb] px-4 py-3 last:border-b-0"
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 rounded-full ${
                                item.read ? "bg-[#d9deeb]" : "bg-[#0f49d7]"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-6 text-[#11182d]">
                                {item.message}
                              </p>
                              <p className="mt-1 text-[11px] text-[#7c88a2]">
                                {item.time}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNotification(item.id)}
                              className="rounded-lg p-1 text-[#7c88a2]"
                              aria-label="Delete notification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/wishlist"
              className="hidden rounded-xl p-2 text-[#25324d] lg:block"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              className="relative hidden rounded-xl p-2 text-[#25324d] lg:block"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0f49d7] px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {authUser ? (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="overflow-hidden rounded-xl"
                  aria-label="Profile menu"
                >
                  {authUser.profile ? (
                    <img
                      src={authUser.profile}
                      alt={userName}
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef2ff] text-[#0f49d7]">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-3 w-60 rounded-[18px] border border-[#e2e7f2] bg-white p-2 shadow-[0_18px_40px_rgba(17,24,45,0.08)]">
                    <div className="border-b border-[#edf1f8] px-3 py-3">
                      <p className="text-sm font-semibold text-[#11182d]">
                        {userName}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6d7892]">
                        {userEmail}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#25324d]"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#25324d]"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                    </div>
                    <div className="border-t border-[#edf1f8] pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#cf2b2b]"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => document.getElementById("login_modal")?.showModal()}
                className="hidden rounded-xl bg-[#0f49d7] px-4 py-2.5 text-sm font-medium text-white lg:block"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="rounded-xl p-2 text-[#25324d] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden">
          <div
            ref={menuRef}
            className="flex h-full flex-col bg-white"
          >
            <div className="flex items-center justify-between border-b border-[#e4e8f2] px-5 py-4">
              <Link
                to="/"
                className="text-[1.55rem] font-semibold tracking-tight text-[#0f49d7]"
              >
                WonderCart
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl p-2 text-[#5c6880]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-[#edf1f8] px-5 py-4">
              <div className="flex items-center gap-2 rounded-[16px] border border-[#e3e7f3] bg-[#eef2ff] px-4 py-3">
                <Search className="h-4 w-4 text-[#6d7892]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-[#11182d] outline-none placeholder:text-[#7c88a2]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`block rounded-2xl px-4 py-3 text-base font-medium ${
                      isPathActive(location.pathname, link.to)
                        ? "bg-[#eef2ff] text-[#0f49d7]"
                        : "text-[#25324d]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-[#e3e7f3] bg-[#f7f8fc] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/wishlist"
                    className="rounded-2xl bg-white px-4 py-4 text-sm font-medium text-[#25324d]"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/cart"
                    className="rounded-2xl bg-white px-4 py-4 text-sm font-medium text-[#25324d]"
                  >
                    Bag ({cartCount})
                  </Link>
                  {authUser ? (
                    <>
                      <Link
                        to="/profile"
                        className="rounded-2xl bg-white px-4 py-4 text-sm font-medium text-[#25324d]"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="rounded-2xl bg-white px-4 py-4 text-left text-sm font-medium text-[#cf2b2b]"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        document.getElementById("login_modal")?.showModal();
                        setIsMenuOpen(false);
                      }}
                      className="col-span-2 rounded-2xl bg-[#0f49d7] px-4 py-4 text-sm font-medium text-white"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-[#dde3f0] bg-white px-3 py-2 shadow-[0_18px_40px_rgba(17,24,45,0.12)] lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isPathActive(location.pathname, tab.to);

            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.label === "Profile" && !authUser) {
                    document.getElementById("login_modal")?.showModal();
                    return;
                  }
                  navigate(tab.to);
                }}
                className={`flex flex-col items-center gap-1 rounded-[20px] px-2 py-2 ${
                  active ? "bg-[#eef2ff] text-[#0f49d7]" : "text-[#6d7892]"
                }`}
              >
                <div className="relative">
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label === "Cart" && cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0f49d7] px-1 text-[10px] font-semibold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
