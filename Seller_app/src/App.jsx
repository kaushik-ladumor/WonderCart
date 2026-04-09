import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

import { Toaster } from "react-hot-toast";

import { useAuth } from "./context/AuthProvider";
import axios from "axios";
import { API_URL } from "./utils/constants";

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
import SellerWallet from "./seller/SellerWallet";
import SellerBank from "./seller/SellerBank";
import SellerCreateDeal from "./seller/deals/SellerCreateDeal";

import { useEffect } from "react";
import SellerLandingPage from "./seller/LandingPage";

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
        <Route path="/" element={<SellerLandingPage />} />
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
          <Route path="wallet" element={<SellerWallet />} />
          <Route path="bank" element={<SellerBank />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="deals/create" element={<SellerCreateDeal />} />
          <Route path="profile" element={<SellerProfile />} />
        </Route>
      </Routes>

      {/* Global Login Modal - accessible from any page */}
      <Login />
    </BrowserRouter>
  );
}

export default App;
