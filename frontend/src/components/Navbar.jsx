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
  Home,
} from "lucide-react";
import { useState } from "react";
import Login from "../auth/Login";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { authUser, setAuthUser } = useAuth();
  const { cartCount } = useCart(); 

  const handleLogout = () => {
    localStorage.removeItem("Users");
    localStorage.removeItem("token"); 
    setAuthUser(null);
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-200"
            >
              WonderCart
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {/* <a
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-900"
            >
              Home
            </a> */}
            <a
              href="/shop"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-900"
            >
              Shop
            </a>
            <a
              href="/categories"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-900"
            >
              Categories
            </a>
            <a
              href="/deals"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-900"
            >
              Deals
            </a>
            <a
              href="/contact"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-900"
            >
              Contact
            </a>
          </div>

          {/* Right Side - Search, Icons, Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 px-4 py-2 pl-10 bg-gray-900 text-white text-sm border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-500 transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            {/* Icons */}
            <a
              href="/wishlist"
              className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-900"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </a>
            <a
              href="/cart"
              className="text-gray-300 hover:text-white transition-colors duration-200 relative p-2 rounded-lg hover:bg-gray-900"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>

            {/* Auth Section */}
            {authUser ? (
              <div className="flex items-center space-x-3">
                <a
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-900"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">Profile</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  className="text-white hover:text-gray-300 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-900"
                  onClick={() =>
                    document.getElementById("login_modal")?.showModal()
                  }
                >
                  Login
                </button>
                <a
                  href="/signup"
                  className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>

          {/* Mobile Icons + Menu Button */}
          <div className="flex lg:hidden items-center space-x-3 ml-auto">
            <a
              href="/wishlist"
              className="text-gray-300 hover:text-white transition p-2"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </a>
            <a
              href="/cart"
              className="text-gray-300 hover:text-white transition relative p-2"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* ✅ Display actual cart count in mobile */}
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-white text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-gray-800">
            {/* Search Bar - Mobile */}
            <div className="relative mb-4 mt-2">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 bg-gray-900 text-white text-sm border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            {/* User Info - Mobile */}
            {authUser && (
              <div className="flex items-center space-x-3 mb-4 px-4 py-3 bg-white text-black rounded-lg">
                <User className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {authUser.username || authUser.email}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {authUser.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links - Mobile */}
            <div className="flex flex-col space-y-1 mb-4">
              <a
                href="/"
                className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a
                href="/shop"
                className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                Shop
              </a>
              <a
                href="/categories"
                className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                Categories
              </a>
              <a
                href="/deals"
                className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                Deals
              </a>
              <a
                href="/contact"
                className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                Contact
              </a>

              {/* Profile Links - Mobile (when logged in) */}
              {authUser && (
                <>
                  <div className="border-t border-gray-800 my-2"></div>
                  <a
                    href="/profile"
                    className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </a>
                  <a
                    href="/orders"
                    className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>My Orders</span>
                  </a>
                  <a
                    href="/settings"
                    className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-4 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </>
              )}
            </div>

            {/* Auth Buttons - Mobile */}
            {authUser ? (
              <div className="flex flex-col space-y-2 px-2">
                <a
                  href="/profile"
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white hover:bg-gray-800 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-white text-black hover:bg-gray-200 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-2">
                <button
                  className="w-full text-white hover:bg-gray-900 transition border border-gray-700 rounded-lg py-2.5 text-sm font-medium"
                  onClick={() =>
                    document.getElementById("login_modal")?.showModal()
                  }
                >
                  Login
                </button>
                <a
                  href="/signup"
                  className="w-full bg-white text-black hover:bg-gray-200 py-2.5 rounded-lg font-semibold transition-all duration-200 text-center text-sm"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <Login />
    </nav>
  );
}
