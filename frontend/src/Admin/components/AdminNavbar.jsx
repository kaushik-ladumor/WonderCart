import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useSocket } from "../../context/SocketProvider";
import { API_URL } from "../../utils/constants";
import {
  LayoutDashboard,
  Package,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
} from "lucide-react";

const AdminNavbar = () => {
  const { authUser, setAuthUser } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    navigate("/");
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

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/order/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
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

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/users", label: "Users", icon: User },
    { path: "/admin/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/admin/dashboard"
              className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide hover:text-gray-300 transition flex items-center gap-2"
            >
              <div className="p-1.5 bg-white rounded-lg">
                <ShieldCheck className="w-4 h-4 text-black" />
              </div>
              <span>Admin Hub</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm flex items-center gap-2 transition-colors ${isActive ? "text-white font-bold underline underline-offset-8 decoration-2" : "text-gray-300 hover:text-white"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-900 rounded-lg transition-all duration-300 relative group"
                aria-label="Notifications"
              >
                <Bell className={`w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 ${notifications.some(n => !n.read) ? 'animate-[pulse_2s_infinite]' : ''}`} />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-black">
                    {notifications.filter((n) => !n.read).length > 9
                      ? "9+"
                      : notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="fixed sm:absolute top-16 sm:top-auto left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:mt-4 w-auto sm:w-[380px] bg-white/95 backdrop-blur-xl text-black border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  {/* Arrow Pointer - Hidden on Mobile */}
                  <div className="hidden sm:block absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-gray-100 transform rotate-45" />

                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/60 relative z-10">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        Notifications
                      </h3>
                      {notifications.some(n => !n.read) && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                            {notifications.filter(n => !n.read).length} New
                          </span>
                        </div>
                      )}
                    </div>
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

                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-12">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          No alerts!
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Everything is running smoothly.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`group relative px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-all duration-200 ${n.read ? "bg-white" : "bg-blue-50/30"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-transparent" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                }`}
                            />
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                // Simple mark read for UI
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                              }}
                            >
                              <p className={`text-sm leading-relaxed ${n.read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                                {n.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                                  {n.time}
                                </span>
                                {!n.read && (
                                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                )}
                                {!n.read && (
                                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-md transition-all duration-200 text-gray-400 hover:text-gray-600"
                              aria-label="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-3 border-l border-gray-800 pl-4">
              <button
                onClick={handleLogout}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Sidebar Content */}
      <div
        className={`fixed top-0 left-0 w-[280px] h-full bg-white z-[60] transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full text-black">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-black text-white">
            <span className="text-xl font-bold tracking-tight">Admin Hub</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-gray-900 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 bg-white">
            <div className="px-4 mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Management</p>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
