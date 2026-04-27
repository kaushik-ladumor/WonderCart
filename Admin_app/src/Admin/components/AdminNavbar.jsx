import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { useSocket } from "../../context/SocketProvider";
import { API_URL } from "../../utils/constants";
import axios from "axios";
import {
  LayoutDashboard,
  Package,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Ticket,
  Store,
  Percent,
  ShoppingBag,
  Wallet,
  CreditCard,
  RotateCcw,
  Search,
  ChevronRight,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

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
    if (authUser) {
      fetchNotifications();
    }
  }, [authUser]);

  useEffect(() => {
    if (!socket || !authUser) return;
    const handleNotification = (notification) => {
      setNotifications((prev) => [
        {
          id: notification.orderId || Date.now(),
          message: notification.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
        },
        ...prev,
      ]);
    };
    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket, authUser]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.data.map((n) => ({
          _id: n._id,
          message: n.message,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: n.isRead,
        })));
      }
    } catch (error) {
      console.error("Notifications fetch error:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Mark as read error:", err);
      // Revert if needed (optional for simple read/unread)
    }
  };

  const handleClearAll = async () => {
    const originalNotifications = [...notifications];

    // Optimistic Update
    setNotifications([]);
    toast.success("Notifications cleared");

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/notifications/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Clear all error:", err);
      // Revert on error
      setNotifications(originalNotifications);
      toast.error("Failed to clear notifications");
    }
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { path: "/admin/products", label: "Products", icon: Package },
    { path: "/admin/users", label: "Users", icon: User },
    { path: "/admin/seller-applications", label: "Sellers", icon: Store },
    { path: "/admin/wallet", label: "Treasury", icon: Wallet },
    { path: "/admin/payouts", label: "Settlements", icon: CreditCard },
    { path: "/admin/refunds", label: "Disputes", icon: RotateCcw },
    { path: "/admin/suspension", label: "Suspensions", icon: ShieldCheck },
    { path: "/admin/deals", label: "Deals", icon: Ticket },
    { path: "/admin/moods", label: "Moods", icon: Sparkles },
  ];

  const adminName = authUser?.name || "System Admin";

  const SidebarContent = ({ closeMenu }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-6">
        <Link
          to="/admin/dashboard"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#0f172a] shrink-0">
            <ShieldCheck className="h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <p className="text-[16px] font-semibold leading-none text-[#1a2238]">
              WonderCart
            </p>
            <p className="text-[18px] font-semibold leading-none text-[#2563eb]">
              Admin
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#99a3ba] mb-4">
          Management
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`relative flex items-center justify-between rounded-[20px] px-4 py-3 transition-all ${isActive
                  ? "bg-[#f7f9ff] text-[#2563eb]"
                  : "text-[#62708c] hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-[18px] w-[18px] ${isActive ? "text-[#2563eb]" : "text-[#7c88a3]"}`} />
                  <span
                    className={`text-[14px] font-medium ${isActive ? "underline underline-offset-[6px] decoration-2" : ""
                      }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-[#edf0f7] px-2 pt-6 mt-4 flex flex-col gap-3">
        <Link
          to="/admin/wallet"
          onClick={closeMenu}
          className="w-full bg-[#0f172a] py-3.5 rounded-[18px] flex items-center justify-center gap-2 text-white text-[13px] font-bold shadow-lg shadow-gray-200 hover:bg-black transition-all"
        >
          Platform Treasury
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#d9e1f2] bg-white px-4 py-3 text-[14px] font-medium text-[#1a2238] hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  const notificationPanel = showDropdown && (
    <div className="fixed inset-x-4 top-[80px] sm:absolute sm:inset-auto sm:right-0 sm:top-[calc(100%+14px)] z-[100] sm:w-[380px] overflow-hidden rounded-[24px] border border-[#e5e9f5] bg-white shadow-[0_32px_80px_rgba(18,36,84,0.18)] animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#eef1f7] px-6 py-5 bg-gray-50/50">
        <div>
          <h3 className="text-sm font-bold text-[#1a2238]">Notifications</h3>
          <p className="mt-1 text-[11px] font-medium text-[#75819d]">
            {notifications.filter((n) => !n.read).length} unread alerts
          </p>
        </div>
        <button
          onClick={handleClearAll}
          className="text-[10px] font-bold text-[#2563eb] bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>

      {/* Content Area */}
      <div className="max-h-[min(60vh,420px)] overflow-y-auto scrollbar-hide py-2">
        {notifications.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-gray-50 text-[#94a3b8]">
              <Bell className="h-7 w-7 opacity-40" />
            </div>
            <p className="mt-5 text-[15px] font-bold text-[#1a2238]">No new alerts</p>
            <p className="mt-1.5 text-xs text-[#75819d] px-6">We'll notify you when something important happens on the platform.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f2f8]">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`group px-6 py-5 cursor-pointer transition-all ${n.read ? "bg-white" : "bg-blue-50/20"
                  } hover:bg-gray-50`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative mt-1.5 shrink-0">
                    <div className={`h-2.5 w-2.5 rounded-full ${n.read ? "bg-gray-200" : "bg-[#2563eb]"
                      }`}>
                      {!n.read && <div className="absolute inset-0 rounded-full bg-[#2563eb] animate-ping opacity-40"></div>}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] leading-relaxed ${!n.read ? 'font-bold text-[#1a2238]' : 'font-medium text-[#64748b]'}`}>
                      {n.message}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">{n.time}</p>
                      {!n.read && <span className="text-[9px] font-black text-[#2563eb] uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">New</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-[#eef1f7] p-4 bg-gray-50/30 text-center">
          <button className="text-[11px] font-bold text-[#64748b] hover:text-[#1a2238] transition-colors uppercase tracking-[0.1em]">
            View Historical Activity
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-[#e4e8f5] lg:bg-white lg:px-6 lg:py-8 shadow-sm">
        <SidebarContent closeMenu={() => { }} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#0f172a]/30 backdrop-blur-sm lg:hidden transition-all duration-300 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[60] flex w-[288px] flex-col bg-white lg:hidden shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col p-6 relative">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-2xl border border-[#dfe4f4] bg-white text-[#1a2238] z-[70] hover:bg-gray-50 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="h-full">
            <SidebarContent closeMenu={() => setIsMenuOpen(false)} />
          </div>
        </div>
      </div>

      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-30 lg:left-[280px]">
        <div className="h-[76px] flex items-center justify-between px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-[#e4e8f5]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden h-11 w-11 flex items-center justify-center rounded-2xl border border-[#dfe4f4] bg-white text-[#1a2238] hover:bg-gray-50 transition-all shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center gap-3 relative w-[420px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search platform resources..."
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-medium outline-none transition-all focus:border-[#2563eb] focus:bg-white focus:shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-11 w-11 flex items-center justify-center rounded-2xl border border-[#dfe4f4] bg-white text-[#64748b] hover:bg-[#f8fafc] transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-[#ef4444] border-2 border-white rounded-full"></span>
                )}
              </button>
              {notificationPanel}
            </div>

            <Link to="/admin/profile" className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-[#e2e8f0]">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-[#1a2238] uppercase tracking-tight">{adminName}</p>
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-wider">PLATFORM MASTER</p>
              </div>
              <div className="h-11 w-11 rounded-2xl overflow-hidden border-2 border-[#eef2ff] shadow-sm">
                <img
                  src={`https://ui-avatars.com/api/?name=${adminName}&background=0f172a&color=fff&bold=true`}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminNavbar;
