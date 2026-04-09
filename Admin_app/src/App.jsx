import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import React from "react";

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
        <Route path="/" element={
          <div className="h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">WonderCart Admin Portal</h1>
            <button 
              onClick={() => document.getElementById('login_modal')?.showModal()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Sign In to Continue
            </button>
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
