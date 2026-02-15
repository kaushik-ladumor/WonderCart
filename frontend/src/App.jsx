import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import About from './pages/AboutPage'
import Login from "./auth/Login";
import Home from "./pages/Home";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import UpdatePassword from "./auth/UpdatePassword";
import Profile from "./auth/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetails";
import OrderConform from "./pages/OrderConform";
import AllOrder from "./pages/AllOrderDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageNotFound from "./pages/PageNotFound";
import WishlistPage from "./pages/WishlistPage";
import AddressPage from "./pages/AddAddressModal";
import { Toaster } from "react-hot-toast";
import ContactUs from "./Compony/ContactUs";
import FAQ from "./Compony/FAQ";
import ReturnsRefunds from "./Compony/ReturnsRefunds";
import PrivacyPolicy from "./Compony/PrivacyPolicy";
import ShippingPolicy from "./Compony/ShippingPolicy";
import { useAuth } from "./context/AuthProvider";
import axios from "axios";
import { API_URL } from "./utils/constants";
import TermsOfService from "./pages/TermsOfService";

import SellerLayout from "./seller/SellerLayout";
import SellerDashboard from "./seller/dashboard/SellerDashboard";
import SellerProducts from "./seller/products/SellerProducts";
import AddProduct from "./seller/products/AddProduct";
import ProductDetails from "./seller/products/ProductDetails";
import EditProduct from "./seller/products/EditProduct";
import SellerOrders from "./seller/orders/SellerOrders";
import OrderDetails from "./seller/orders/OrderDetails";
import SellerProfile from "./seller/dashboard/SellerProfile";
import SellerEarnings from "./seller/SellerEarnings";

import Loader from "./components/Loader";
import Category from "./pages/Category";
import Shop from "./pages/Shop";
import TrackOrder from "./pages/TrackOrder";

import AdminLayout from "./Admin/components/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminProducts from "./Admin/AdminProducts";
import AdminUsers from "./Admin/AdminUsers"
import AdminProfile from "./Admin/AdminProfile"

import { useEffect } from "react";

function App() {
  const { authUser, setToken, setAuthUser } = useAuth();

  useEffect(() => {
    // Request Interceptor
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const res = await axios.create().post(`${API_URL}/user/refresh-token`, {
                token: refreshToken,
              });
              if (res.data.success) {
                const newToken = res.data.accessToken;
                localStorage.setItem("token", newToken);
                setToken(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            }
          } catch (err) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("Users");
            setToken(null);
            setAuthUser(null);
            window.location.href = "/";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [setToken, setAuthUser]);

  return (
    <BrowserRouter>
      {/* Toast Notification */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className:
            "bg-white text-gray-900 border border-gray-100 shadow-xl rounded-2xl px-6 py-4 min-w-[320px]",
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            padding: "16px 24px",
            color: "#1a1a1a",
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "16px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
          success: {
            iconTheme: {
              primary: "#000",
              secondary: "#fff",
            },
            style: {
              borderLeft: "4px solid #10b981",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              borderLeft: "4px solid #ef4444",
            },
          },
          loading: {
            style: {
              borderLeft: "4px solid #3b82f6",
            },
          },
        }}
      />

      <Routes>
        {/* ================= AUTH ROUTES ================= */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= SELLER ROUTES (ROLE PROTECTED) ================= */}
        <Route
          path="/seller"
          element={
            authUser && authUser.role === "seller" ? (
              <SellerLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="earnings" element={<SellerEarnings />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>

        {/* ================= ADMIN ROUTES (ROLE PROTECTED) ================= */}
        <Route
          path="/admin"
          element={
            authUser && authUser.role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* ================= MAIN USER ROUTES ================= */}
        {/* Navbar and Footer shared layout */}
        <Route
          element={
            <>
              <Navbar />
              <Outlet />
              <Footer />
            </>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<AllOrder />} />
          <Route path="/orderConfirm/:id" element={<OrderConform />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsRefunds />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/loader" element={<Loader />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Page Not Found */}
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>

      {/* Global Login Modal - accessible from any page */}
      <Login />
    </BrowserRouter>
  );
}

export default App;
