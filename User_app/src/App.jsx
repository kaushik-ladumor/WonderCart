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
import AddressPage from "./pages/Address";
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


import Loader from "./components/Loader";
import Category from "./pages/Category";
import Shop from "./pages/Shop";
import TrackOrder from "./pages/TrackOrder";
import VisualSearch from "./pages/VisualSearch";

import MyCoupons from "./pages/MyCoupons";
import MyReviews from "./pages/MyReviews";
import TopSellers from "./pages/TopSellers";
import Deals from "./pages/Deals";


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
            "bg-white text-gray-900 border border-gray-100 shadow-xl rounded-2xl px-4 py-3 min-w-[280px] font-body",
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            padding: "12px 16px",
            color: "#1a1a1a",
            fontFamily: "Poppins, sans-serif",
            fontSize: "12px",
            lineHeight: "18px",
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


        {/* ================= MAIN USER ROUTES ================= */}
        {/* Navbar and Footer shared layout */}
        <Route
          element={
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<AllOrder />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/top-sellers" element={<TopSellers />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/orderConfirm/:id" element={<OrderConform />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsRefunds />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/address" element={<AddressPage />} />
          <Route path="/my-coupons" element={<MyCoupons />} />
          <Route path="/my-reviews" element={<MyReviews />} />
          <Route path="/visual-search" element={<VisualSearch />} />
          <Route path="/loader" element={<Loader />} />
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
