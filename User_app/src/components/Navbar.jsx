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
  Star,
  Tag,
  Store,
  ShoppingBasket,
  Briefcase,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import { API_URL } from "../utils/constants";
import Logo from "./Logo";

const navLinks = [
  { label: "Shop", to: "/shop", icon: ShoppingBasket },
  { label: "Top Sellers", to: "/top-sellers", icon: Star },
  { label: "Deals", to: "/deals", icon: Tag },
  {
    label: "Become a Seller",
    to: "https://wondercart-seller.netlify.app",
    external: true,
    icon: Briefcase,
  },
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
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
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
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const formatted = (data.data || []).map((item) => ({
            _id: item._id,
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
      // Show real-time toast
      if (notification.type?.includes('ORDER')) {
        toast.success(notification.message, { icon: '📦' });
      } else {
        toast(notification.message, { icon: '🔔' });
      }

      setNotifications((prev) => [
        {
          _id: notification._id || Date.now().toString(),
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

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, authUser]);

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      toast.success("Read all");
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const clearAll = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      toast.success("Cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleMarkOneRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      toast.success("Removed");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const userName = authUser?.username || authUser?.name || "My Account";
  const userEmail = authUser?.email || "WonderCart member";

  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(globalSearchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#e4e8f2] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 pl-2 pr-4 sm:pl-3 sm:pr-6 lg:pl-4 lg:pr-8">
          <div className="flex items-center gap-8 flex-1 lg:flex-none">
            <Logo size="h-14" className={isMobileSearchExpanded ? 'hidden sm:flex max-w-[200px] opacity-100' : 'max-w-[200px] opacity-100 transition-all duration-300'} />

            {/* Mobile Expanded Search */}
            {isMobileSearchExpanded && (
              <div className="flex md:hidden flex-1 w-full animate-in fade-in zoom-in-95 duration-200">
                <form onSubmit={handleGlobalSearch} className="flex h-10 w-full items-center gap-2 rounded-[20px] border border-[#e4e8f2] bg-[#f8f9fc] px-4 focus-within:ring-2 focus-within:ring-[#0f49d7]/10 focus-within:bg-white focus-within:border-[#c5d0e6] transition-all">
                  <Search className="h-4.5 w-4.5 text-[#6d7892] shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full bg-transparent text-[0.85rem] text-[#11182d] outline-none placeholder:text-[#94a3b8]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileSearchExpanded(false);
                      setGlobalSearchQuery("");
                    }}
                    className="p-1 rounded-full text-[#6d7892] hover:bg-[#e4e8f2] transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.82rem] font-medium text-[#42506d] hover:text-[#0f49d7] transition-colors nav-link-underline"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`text-[0.82rem] font-medium nav-link-underline ${isPathActive(location.pathname, link.to)
                      ? "text-[#0f49d7] nav-link-underline-active"
                      : "text-[#42506d]"
                      }`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8 max-w-2xl mx-auto">
            <form onSubmit={handleGlobalSearch} className="flex w-full items-center gap-3 rounded-[24px] border border-[#f1f5fb] bg-[#f1f5fb] px-5 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#0f49d7]/10 focus-within:bg-white group">
              <button type="submit" aria-label="Search">
                <Search className="h-4.5 w-4.5 text-[#6d7892]" />
              </button>
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full bg-transparent text-[0.82rem] text-[#11182d] outline-none font-medium placeholder:text-[#94a3b8]"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative rounded-xl p-2 text-[#25324d] hover:bg-[#f8f9fc] transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#0f49d7]" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-[-80px] sm:right-0 top-full mt-3 w-[280px] sm:w-[320px] overflow-hidden rounded-[18px] border border-[#e2e7f2] bg-white shadow-[0_18px_40px_rgba(17,24,45,0.08)]">
                    <div className="flex items-center justify-between border-b border-[#edf1f8] px-4 py-3">
                      <p className="text-[0.82rem] font-semibold text-[#11182d]">
                        Notifications
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-medium">
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

                    <div className="max-h-80 overflow-y-auto scrollbar-hide">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-[0.82rem] text-[#6a7690]">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => handleMarkOneRead(item._id)}
                            className="flex items-start gap-3 border-b border-[#f4f6fb] px-4 py-3 last:border-b-0 cursor-pointer hover:bg-gray-50/50"
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 rounded-full ${item.read ? "bg-[#d9deeb]" : "bg-[#0f49d7]"
                                }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`text-[0.82rem] leading-6 ${item.read ? 'text-[#6a7690]' : 'text-[#11182d] font-medium'}`}>
                                {item.message}
                              </p>
                              <p className="mt-1 text-[10px] text-[#7c88a2]">
                                {item.time}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(item._id);
                              }}
                              className="rounded-lg p-1 text-[#7c88a2] hover:bg-gray-100"
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
                <span 
                  key={cartCount}
                  className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0f49d7] px-1 text-[10px] font-semibold text-white animate-pop shadow-sm"
                >
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
                      <p className="text-[0.82rem] font-semibold text-[#11182d]">
                        {userName}
                      </p>
                      <p className="mt-1 text-[0.74rem] text-[#6d7892]">
                        {userEmail}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] text-[#25324d]"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] text-[#25324d]"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        My Orders
                      </Link>
                    </div>
                    <div className="border-t border-[#edf1f8] pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium text-[#cf2b2b]"
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
                onClick={() =>
                  document.getElementById("login_modal")?.showModal()
                }
                className="hidden rounded-xl bg-[#0f49d7] px-4 py-2.5 text-[0.82rem] font-medium text-white lg:block"
              >
                Sign In
              </button>
            )}

            {/* Mobile Collapsed Search Icon (Moved to Right Side) */}
            {!isMobileSearchExpanded && (
              <button
                onClick={() => setIsMobileSearchExpanded(true)}
                className="rounded-xl p-2 text-[#25324d] md:hidden hover:bg-[#f8f9fc] transition-colors"
                aria-label="Expand mobile search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="rounded-xl p-2 text-[#25324d] lg:hidden hover:bg-[#f8f9fc] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar background overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[70] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex h-full flex-col bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e4e8f2] px-5 py-2.5">
            <Logo size="h-14" className="max-w-[180px]" />
            <button
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl p-2 text-[#5c6880] hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return link.external ? (
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl px-4 py-3 text-[0.88rem] font-medium text-[#25324d] hover:bg-[#eef2ff] hover:text-[#0f49d7] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#6d7892]" /> {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-[0.88rem] font-medium ${isPathActive(location.pathname, link.to)
                      ? "bg-[#eef2ff] text-[#0f49d7]"
                      : "text-[#25324d]"
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isPathActive(location.pathname, link.to) ? 'text-[#0f49d7]' : 'text-[#6d7892]'}`} /> {link.label}
                  </Link>
                );
              })}
              
              <div className="pt-2 mt-2 border-t border-[#f1f5fb]">
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-2xl px-4 py-3 text-[0.88rem] font-medium text-[#25324d]">
                  <Heart className="w-4 h-4 text-[#6d7892]" /> Wishlist
                </Link>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 rounded-2xl px-4 py-3 text-[0.88rem] font-medium text-[#25324d]">
                  <ShoppingBag className="w-4 h-4 text-[#6d7892]" /> Bag
                  {cartCount > 0 && <span className="ml-auto flex items-center justify-center bg-[#0f49d7] text-white text-[10px] min-w-[20px] h-5 rounded-full font-bold px-1.5">{cartCount}</span>}
                </Link>
              </div>
            </div>

          </div>

          <div className="pt-2 pb-6 px-5 mt-auto bg-white border-t border-[#f1f5fb]">
            <div className="flex flex-col gap-1 mt-4">

              {authUser ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.88rem] font-semibold text-[#11182d] hover:bg-[#f8f9fc] transition-colors">
                    <div className="flex items-center gap-3"><User className="w-4.5 h-4.5 text-[#6d7892]" /> Profile</div>
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.88rem] font-semibold text-[#d12828] hover:bg-red-50 transition-colors">
                    <div className="flex items-center gap-3"><LogOut className="w-4.5 h-4.5 opacity-80" /> Logout</div>
                  </button>
                </>
              ) : (
                <div className="mt-4 pt-4 border-t border-[#f1f5fb]">
                  <button
                    onClick={() => {
                      document.getElementById("login_modal")?.showModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-[16px] bg-[#0f49d7] px-4 py-4 text-[0.88rem] font-semibold text-white hover:bg-[#003da3] transition-colors"
                  >
                    <User className="w-4 h-4" /> Sign In securely
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
