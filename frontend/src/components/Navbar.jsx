import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  Package,
  Settings,
  Bell,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketProvider";
import { API_URL } from "../utils/constants";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { authUser, setAuthUser } = useAuth();
  const socket = useSocket();
  const { cartCount } = useCart();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    setAuthUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [authUser]);

  useEffect(() => {
    if (!socket || !authUser) return;

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

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, authUser]);


  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/order/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        const formatted = data.notifications.map((n) => ({
          id: n._id,
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
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/order/notifications/read-all`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center flex-shrink-0">
            <a
              href="/"
              className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide hover:text-gray-300 transition"
            >
              WonderCart
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {["Shop", "Categories", "Deals", "Contact"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm text-gray-300 hover:text-white transition"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products"
                className="w-48 xl:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {authUser && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-gray-900 rounded-lg transition relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-300 hover:text-white transition" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length > 9
                        ? "9+"
                        : notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-black border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        {notifications.filter((n) => !n.read).length > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-8">
                          <Bell className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500 text-center">
                            No notifications yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            New updates will appear here
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${n.read ? "bg-white" : "bg-blue-50"
                              }`}
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((x) =>
                                  x.id === n.id ? { ...x, read: true } : x,
                                ),
                              )
                            }
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 w-2 h-2 rounded-full ${n.read ? "bg-gray-300" : "bg-blue-500"
                                  }`}
                              />
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                  {n.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <span>{n.time}</span>
                                  {!n.read && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-600 rounded">
                                      New
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <a
              href="/wishlist"
              className="hidden sm:block p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-300 hover:text-white transition" />
            </a>

            <a
              href="/cart"
              className="relative p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-300 hover:text-white transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </a>

            {authUser ? (
              <div className="hidden lg:flex items-center gap-3">
                <a
                  href="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Profile</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() =>
                    document.getElementById("login_modal")?.showModal()
                  }
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  Login
                </button>
                <a
                  href="/signup"
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Sign Up
                </a>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div
            ref={searchRef}
            className="lg:hidden py-3 border-t border-gray-800"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {isMenuOpen && (
          <div ref={menuRef} className="lg:hidden border-t border-gray-800">
            <div className="py-3 space-y-1">
              {["Shop", "Categories", "Deals", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}

              <a
                href="/wishlist"
                className="sm:hidden flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                Wishlist
              </a>

              {authUser ? (
                <>
                  <div className="border-t border-gray-800 my-2"></div>
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </a>
                  <a
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-800 my-2"></div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      document.getElementById("login_modal")?.showModal();
                    }}
                    className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                  >
                    Login
                  </button>
                  <a
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center bg-white text-black px-4 py-2.5 mx-4 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </nav>
  );
}
