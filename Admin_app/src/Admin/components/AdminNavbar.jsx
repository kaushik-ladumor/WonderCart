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
  Ticket,
  Store,
  Percent,
  ShoppingBag,
  Wallet,
  CreditCard,
  RotateCcw,
  Search,
  ChevronRight
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
    fetchNotifications();
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
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/order/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications.map((n) => ({
          id: n._id,
          message: n.message,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: n.isRead,
        })));
      }
    } catch (error) { console.error(error); }
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
    { path: "/admin/deals", label: "Deals", icon: Percent },
  ];

  const adminName = authUser?.name || "System Admin";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const notificationPanel = showDropdown && (
    <div className="absolute right-0 top-14 w-[380px] bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-[#1e293b]">
       <div className="px-5 py-4 border-b border-[#f1f5f9] flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-widest">Alert Center</h3>
          <span className="text-[10px] font-bold text-[#2563eb]">{notifications.filter(n => !n.read).length} Unread</span>
       </div>
       <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#94a3b8]">No new notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`px-5 py-4 border-b border-[#f1f5f9] last:border-b-0 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                 <p className="text-xs leading-relaxed">{n.message}</p>
                 <p className="text-[10px] text-[#94a3b8] mt-1 font-medium">{n.time}</p>
              </div>
            ))
          )}
       </div>
    </div>
  );

  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-[#e4e8f5] lg:bg-white lg:px-6 lg:py-8">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-[#0f172a] p-2 rounded-xl">
             <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] leading-none mb-1">Governance</p>
             <h2 className="text-lg font-bold text-[#0f172a] leading-none">WonderCart</h2>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                  isActive ? "bg-[#f8fafc] text-[#2563eb]" : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#f1f5f9] space-y-4">
           <Link 
             to="/admin/wallet"
             className="w-full bg-[#2563eb] py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white text-[13px] font-bold shadow-lg shadow-blue-100 hover:bg-[#1d4ed8] transition-all"
           >
              Withdraw Treasury
           </Link>

           <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9]">
              <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-white font-bold">
                 {adminInitial}
              </div>
              <div className="min-w-0">
                 <p className="text-xs font-bold text-[#0f172a] truncate">{adminName}</p>
                 <p className="text-[10px] text-[#94a3b8] font-medium tracking-tight">PLATFORM MASTER</p>
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-[#94a3b8] hover:text-[#ef4444] transition-colors pb-2"
           >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
           </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white z-[60] transform transition-transform duration-300 transform lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         {/* Replicate Sidebar Content here for consistency */}
      </div>

      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-30 lg:left-[280px] bg-white border-b border-[#e4e8f5]">
         <div className="h-[76px] flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-6">
               <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-[#64748b]">
                  <Menu className="w-6 h-6" />
               </button>

               <div className="hidden md:flex items-center gap-3 relative w-96 font-sans">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input 
                    type="text" 
                    placeholder="Search orders, sellers, audit trails..."
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl py-2.5 pl-11 pr-4 text-[13px] outline-none transition-all focus:border-[#2563eb]"
                  />
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setShowDropdown(!showDropdown)} className="p-2 text-[#64748b] hover:bg-[#f8fafc] rounded-full relative">
                     <Bell className="w-5 h-5" />
                     {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#ef4444] border-2 border-white rounded-full"></span>
                     )}
                  </button>
                  {notificationPanel}
               </div>

               <Link to="/admin/profile" className="flex items-center gap-3 pl-6 border-l border-[#e2e8f0]">
                  <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-[#0f172a] uppercase tracking-tight">Admin Portal</p>
                     <p className="text-[10px] font-bold text-[#94a3b8]">VERSION 4.2.0-STABLE</p>
                  </div>
                  <div className="w-10 h-10 bg-[#eef2ff] rounded-xl flex items-center justify-center font-black text-[#2563eb]">
                     {adminInitial}
                  </div>
               </Link>
            </div>
         </div>
      </header>

      {/* Padding for Main Content */}
      <div className="lg:pl-[280px] pt-[76px]">
        {/* Child components render here via Outlet or similar */}
      </div>
    </>
  );
};

export default AdminNavbar;
