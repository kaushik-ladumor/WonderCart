import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

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

function App() {
  const { authUser } = useAuth();

  return (
    <BrowserRouter>
      {/* Toast Notification */}
      <Toaster position="top-right" reverseOrder={false} />

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
          <Route path="/AllOrder" element={<AllOrder />} />
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
