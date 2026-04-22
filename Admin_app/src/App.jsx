import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import Logo from "./components/Logo";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import UpdatePassword from "./auth/UpdatePassword";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import axios from "axios";
import { API_URL } from "./utils/constants";
import Loader from "./components/Loader";
import PageNotFound from './Admin/pages/PageNotFound'

import AdminLayout from "./Admin/components/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminProducts from "./Admin/AdminProducts";
import AdminUsers from "./Admin/AdminUsers"
import AdminProfile from "./Admin/AdminProfile"
import AdminDeals from "./Admin/AdminDeals";
import AdminSuspension from "./Admin/AdminSuspension"; // Import new component


import { useEffect } from "react";
import AddCoupon from "./Admin/AddCoupon";
import EditCoupon from "./Admin/EditCoupon";
import AdminCoupon from "./Admin/AdminCoupon";
import AdminSellerApplications from "./Admin/AdminSellerApplications";
import AdminOrders from "./Admin/AdminOrders";
import AdminWallet from "./Admin/AdminWallet";
import SellerPayouts from "./Admin/SellerPayouts";
import AdminRefunds from "./Admin/AdminRefunds";

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
            // If No Refresh Token or Success is False
            throw new Error("Refresh failed");
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
        gutter={10}
        toastOptions={{
          className: "font-body",
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#11182d",
            padding: "14px 20px",
            borderRadius: "14px",
            fontSize: "14px",
            fontWeight: "600",
            border: "1px solid #d9deeb",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-[#f1f4f9] flex flex-col items-center justify-center px-4 font-body">
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_10px_25px_rgba(0,0,0,0.03)] border border-[#e4e8f2] flex flex-col items-center text-center">
                
                {/* Brand Header */}
                <div className="mb-8">
                  <Logo />
                </div>

                {/* Typography matching Login Page */}
                <div className="space-y-2 mb-8">
                  <h1 className="text-[1.3rem] font-semibold text-[#11182d] tracking-tight">
                    Admin Portal
                  </h1>
                  <p className="text-[0.84rem] text-[#6d7892] leading-relaxed">
                    Secure gateway for administrative management. Please authorize to proceed.
                  </p>
                </div>

                {/* Single Login Button matching Login Page style */}
                <div className="w-full">
                  <button 
                    onClick={() => document.getElementById('login_modal')?.showModal()}
                    className="w-full bg-[#0f49d7] text-white font-semibold rounded-[14px] h-11 text-[0.88rem] hover:bg-[#003da3]"
                  >
                    Authorize Access
                  </button>
                </div>

                {/* Footer Subtle Text */}
                <div className="mt-8 pt-6 border-t border-[#e4e8f2] w-full">
                  <p className="text-[0.7rem] uppercase tracking-[0.15em] font-bold text-[#6d7892]/50">
                    Restricted Access Control
                  </p>
                </div>
              </div>
            </div>
          </div>
        } />
        {/* ================= AUTH ROUTES ================= */}

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="coupon/add" element={<AddCoupon />} />
          <Route path="coupon/edit/:couponId" element={<EditCoupon />} />
          <Route path="coupon" element={<AdminCoupon />} />
          <Route path="seller-applications" element={<AdminSellerApplications />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="wallet" element={<AdminWallet />} />
          <Route path="payouts" element={<SellerPayouts />} />
          <Route path="refunds" element={<AdminRefunds />} />
          <Route path="suspension" element={<AdminSuspension />} />
        </Route>

        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/loader" element={<Loader />} />
        {/* Page Not Found */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>

      {/* Global Login Modal - accessible from any page */}
      <Login />
    </BrowserRouter>
  );
}

export default App;
