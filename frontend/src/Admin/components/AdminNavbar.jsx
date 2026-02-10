import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const AdminNavbar = () => {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

 const handleLogout = () => {
   localStorage.removeItem("token");
   setAuthUser(null);
   navigate("/");
 };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/admin/dashboard"
              className="text-xl font-bold text-black hover:text-gray-800"
            >
              ADMIN
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              to="/admin/dashboard"
              className={`text-sm font-medium ${
                location.pathname === "/admin/dashboard"
                  ? "text-black underline underline-offset-4"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className={`text-sm font-medium ${
                location.pathname === "/admin/products"
                  ? "text-black underline underline-offset-4"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Products
            </Link>

            <Link
              to="/admin/profile"
              className={`text-sm font-medium ${
                location.pathname === "/admin/profile"
                  ? "text-black underline underline-offset-4"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-black hover:underline underline-offset-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
