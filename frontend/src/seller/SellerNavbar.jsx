import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { motion } from "framer-motion";

const SellerNavbar = () => {
  const { setAuthUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/seller/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/seller/products", label: "Products", icon: Package },
    { path: "/seller/orders", label: "Orders", icon: ShoppingCart },
    { path: "/seller/earnings", label: "Earnings", icon: DollarSign },
    { path: "/seller/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    setAuthUser(null);
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop & Tablet Navbar - Top with Underline */}
      <nav className="hidden md:block fixed top-0 inset-x-0 z-50">
        <div className="backdrop-blur-md bg-white/80 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/seller/dashboard" className="flex items-center gap-4">
                <div className="p-2.5 bg-black rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">SellerHub</h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              </Link>

              {/* Navigation with Underline Indicator */}
              <div className="relative flex items-center gap-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <Icon
                        className={`w-4.5 h-4.5 ${
                          isActive ? "text-black" : "text-gray-600"
                        }`}
                      />
                      <span
                        className={isActive ? "text-black" : "text-gray-600"}
                      >
                        {item.label}
                      </span>

                      {/* Underline Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="desktop-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    3
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Bottom Navigation with Underline Glow */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <div className="backdrop-blur-xl bg-white/95 border-t border-gray-200 shadow-2xl">
          <div className="flex items-center justify-around py-4 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center gap-1.5 py-2 px-4"
                >
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? "text-black" : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active Underline with Glow */}
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="mobile-underline"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                      <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 rounded-full blur-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Floating Actions on Mobile */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-4">
          <button className="relative p-3.5 bg-white rounded-2xl shadow-2xl ring-4 ring-white/50">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="p-3.5 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl shadow-2xl ring-4 ring-white/50"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Safe Padding for Content */}
      <div className="pt-20 md:pt-20" /> {/* Top padding */}
      <div className="pb-28 md:pb-0" /> {/* Bottom padding only mobile */}
    </>
  );
};

export default SellerNavbar;
