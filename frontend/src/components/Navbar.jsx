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
  const { authUser, setAuthUser } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem("Users");
    localStorage.removeItem("token");
    setAuthUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-bold tracking-wide hover:text-gray-300 transition"
        >
          WonderCart
        </a>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
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
        <div className="hidden lg:flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products"
              className="w-64 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Wishlist */}
          <a href="/wishlist" className="p-2 hover:bg-gray-900 rounded-lg">
            <Heart className="w-5 h-5" />
          </a>

          {/* Cart */}
          <a href="/cart" className="relative p-2 hover:bg-gray-900 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>

          {/* Auth */}
          {authUser ? (
            <div className="flex items-center gap-3">
              <a
                href="/profile"
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Profile</span>
              </a>
              <button
                onClick={handleLogout}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  document.getElementById("login_modal")?.showModal()
                }
                className="text-sm text-gray-300 hover:text-white"
              >
                Login
              </button>
              <a
                href="/signup"
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
              >
                Sign Up
              </a>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-3">
          <a href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-800 px-4 py-4 space-y-2">
          <a href="/" className="flex items-center gap-2 text-gray-300">
            <Home className="w-4 h-4" /> Home
          </a>
          <a href="/shop" className="text-gray-300">
            Shop
          </a>
          <a href="/categories" className="text-gray-300">
            Categories
          </a>
          <a href="/deals" className="text-gray-300">
            Deals
          </a>
          <a href="/contact" className="text-gray-300">
            Contact
          </a>

          {authUser && (
            <>
              <div className="border-t border-gray-800 my-2"></div>
              <a
                href="/orders"
                className="flex items-center gap-2 text-gray-300"
              >
                <Package className="w-4 h-4" /> My Orders
              </a>
              <a
                href="/settings"
                className="flex items-center gap-2 text-gray-300"
              >
                <Settings className="w-4 h-4" /> Settings
              </a>
              <button
                onClick={handleLogout}
                className="w-full bg-white text-black py-2 rounded-lg font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      <Login />
    </nav>
  );
}
