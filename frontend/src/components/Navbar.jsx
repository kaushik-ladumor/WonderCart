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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Login from "../auth/Login";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { authUser, setAuthUser } = useAuth();
  const { cartCount } = useCart();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    setAuthUser(null);
    window.location.href = "/";
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <a
              href="/"
              className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide hover:text-gray-300 transition"
            >
              WonderCart
            </a>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
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

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Desktop Search - Hidden on mobile/tablet */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products"
                className="w-48 xl:w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>

            {/* Mobile/Tablet Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <a
              href="/wishlist"
              className="hidden sm:block p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </a>

            {/* Cart */}
            <a
              href="/cart"
              className="relative p-2 hover:bg-gray-900 rounded-lg transition"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </a>

            {/* Auth - Desktop */}
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

            {/* Mobile Menu Button */}
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

        {/* Mobile/Tablet Search Overlay */}
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

        {/* Mobile/Tablet Menu */}
        {isMenuOpen && (
          <div ref={menuRef} className="lg:hidden border-t border-gray-800">
            <div className="py-3 space-y-1">
              {/* Navigation Links */}
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

              {/* Wishlist in Mobile Menu (only on very small screens) */}
              <a
                href="/wishlist"
                className="sm:hidden flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-900 rounded-lg transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                Wishlist
              </a>

              {/* Auth Links */}
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

      <Login />
    </nav>
  );
}
