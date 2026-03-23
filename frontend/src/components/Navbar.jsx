import {
  ShoppingCart,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartContext";
import { useSocket } from "../context/SocketProvider";
import { API_URL } from "../utils/constants";
import axios from "axios";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authUser, setAuthUser } = useAuth();
  const socket = useSocket();
  const { cartCount } = useCart();
  const menuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setAuthUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
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
      const res = await fetch(`${API_URL}/order/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.notifications.map((n) => ({
          id: n._id,
          message: n.message,
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const deleteNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#f0f4ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              <span className="font-display font-bold text-xl text-[#141b2d] tracking-tight">
                WonderCart
              </span>
            </a>
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8 gap-8">
            {["Shop", "Categories", "Deals", "New Arrivals"].map((item) => {
              const href = `/${item.toLowerCase().replace(" ", "-")}`;
              const isActive = window.location.pathname === href;
              return (
                <a
                  key={item}
                  href={href}
                  className={`font-body text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                    isActive 
                      ? "text-[#004ac6] font-bold" 
                      : "text-[#5c6880] hover:text-[#141b2d] font-medium"
                  }`}
                >
                  {item}
                </a>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-[#f0f4ff] rounded-full px-3.5 py-1.5 gap-2 transition-all focus-within:ring-2 focus-within:ring-[#004ac6]/20 focus-within:bg-white border border-transparent focus-within:border-[#004ac6]/20 w-48 xl:w-56">
              <Search className="w-3.5 h-3.5 text-[#5c6880]" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs text-[#141b2d] w-full font-body placeholder:text-[#5c6880]/60"
              />
            </div>

            {/* Mobile Search Button */}
            <button className="md:hidden p-2 rounded-full hover:bg-[#f0f4ff] transition-colors text-[#141b2d]">
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            {authUser && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-[#f0f4ff] transition-all text-[#141b2d] active:scale-90"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#004ac6] rounded-full ring-2 ring-white" />
                  )}
                </button>
                
                {/* Notification dropdown panel */}
                <div className={`absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-tonal-md z-[9999] overflow-hidden transition-all duration-300 ${showNotifications ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                  <div className="px-5 py-4 border-b border-[#f0f4ff] flex items-center justify-between bg-white">
                    <h3 className="font-display font-bold text-[#141b2d] text-sm tracking-tight">Notifications</h3>
                    <div className="flex gap-4">
                       <button onClick={markAllRead} className="text-[10px] text-[#004ac6] font-bold uppercase tracking-widest hover:underline">Mark all read</button>
                       <button onClick={clearAll} className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline">Clear</button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto bg-white custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                         <p className="text-xs text-[#5c6880] font-body">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="px-5 py-4 hover:bg-[#f9f9ff] flex items-start gap-3 relative group transition-colors">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-transparent' : 'bg-[#004ac6]'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#141b2d] font-medium leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-[#5c6880] mt-1 font-body uppercase tracking-wider">{n.time}</p>
                          </div>
                          <button onClick={() => deleteNotification(n.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#5c6880] hover:text-red-500 transition-all">
                             <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Wishlist */}
            <a href="/wishlist" className="p-2 rounded-full hover:bg-[#f0f4ff] transition-all text-[#141b2d] active:scale-90">
              <Heart className="w-5 h-5" />
            </a>

            {/* Cart with Badge */}
            <a href="/cart" className="relative p-2 rounded-full hover:bg-[#f0f4ff] transition-all text-[#141b2d] active:scale-90">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#004ac6] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </a>

            {/* User Profile */}
            {authUser ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 rounded-xl ring-2 ring-transparent hover:ring-[#004ac6]/10 overflow-hidden transition-all active:scale-95"
                >
                  {authUser.avatar ? (
                    <img src={authUser.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#f0f4ff] flex items-center justify-center">
                      <User className="w-4 h-4 text-[#004ac6]" />
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-3 w-60 bg-white rounded-2xl shadow-tonal-md py-2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-5 py-3 border-b border-[#f0f4ff] mb-2">
                      <p className="text-xs font-bold text-[#141b2d] font-display tracking-tight">{authUser.name}</p>
                      <p className="text-[10px] text-[#5c6880] font-body truncate mt-0.5">{authUser.email}</p>
                    </div>
                    <a href="/profile" className="flex items-center gap-3 px-5 py-2.5 text-xs text-[#5c6880] hover:text-[#141b2d] hover:bg-[#f0f4ff] transition-colors font-medium">
                      <User className="w-4 h-4" /> Profile Details
                    </a>
                    <a href="/my-orders" className="flex items-center gap-3 px-5 py-2.5 text-xs text-[#5c6880] hover:text-[#141b2d] hover:bg-[#f0f4ff] transition-colors font-medium">
                      <ShoppingBag className="w-4 h-4" /> Order History
                    </a>
                    <div className="h-px bg-[#f0f4ff] my-2 mx-5" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs text-red-500 font-bold hover:bg-red-50/50 transition-colors">
                      <LogOut className="w-4 h-4" /> Secure Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => document.getElementById("login_modal")?.showModal()}
                className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-[11px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-[#f0f4ff] transition-colors text-[#141b2d] active:scale-95"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] bg-black/10 backdrop-blur-sm lg:hidden transition-opacity duration-500 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[70] lg:hidden transform transition-transform duration-500 ease-out-expo ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-[#f0f4ff]">
            <span className="font-display font-bold text-lg text-[#141b2d] tracking-tight">WonderCart</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#5c6880] hover:bg-[#f0f4ff] rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-2">
            {["Shop", "Categories", "Deals", "New Arrivals"].map((item) => (
              <a 
                key={item} 
                href={`/${item.toLowerCase().replace(" ", "-")}`} 
                onClick={() => setIsMenuOpen(false)} 
                className="font-body text-sm font-semibold text-[#141b2d] px-4 py-3 rounded-2xl hover:bg-[#f0f4ff] transition-all active:scale-95"
              >
                {item}
              </a>
            ))}
            <div className="h-px bg-[#f0f4ff] my-4 mx-2" />
            <a href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 font-body text-sm text-[#5c6880] px-4 py-3 rounded-2xl hover:bg-[#f0f4ff] transition-all">
              <Heart className="w-5 h-5" /> Wishlist
            </a>
            <a href="/cart" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 font-body text-sm text-[#5c6880] px-4 py-3 rounded-2xl hover:bg-[#f0f4ff] transition-all">
              <ShoppingBag className="w-5 h-5" /> Shopping Bag ({cartCount})
            </a>
            {authUser ? (
              <button 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                className="flex items-center gap-4 font-body text-sm text-red-500 font-bold px-4 py-3 rounded-2xl hover:bg-red-50/50 transition-all mt-4"
              >
                <LogOut className="w-5 h-5" /> Secure Logout
              </button>
            ) : (
                <button
                    onClick={() => { document.getElementById("login_modal")?.showModal(); setIsMenuOpen(false); }}
                    className="w-full bg-[#141b2d] text-white font-bold py-4 rounded-2xl text-sm uppercase tracking-widest mt-4"
                >
                    Sign In
                </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


