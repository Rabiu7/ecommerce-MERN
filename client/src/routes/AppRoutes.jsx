import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout/MainLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "./ProtectedAdminRoute/ProtectedAdminRoute";

import AdminProducts from "../pages/AdminProducts/AdminProducts";
import AdminCategories from "../pages/AdminCategories/AdminCategories";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Orders from "../pages/Orders/Orders";
import Profile from "../pages/Profile/Profile";
import EditProfile from "../pages/EditProfile/EditProfile";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Payment from "../pages/Payment/Payment";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import OrderDetails from "../pages/OrderDetails/OrderDetails";

import AdminLogin from "../pages/AdminLogin/AdminLogin";
import Admin from "../pages/Admin/Admin";
import AdminOrders from "../pages/AdminOrders/AdminOrders";
import AdminCustomers from "../pages/AdminCustomers/AdminCustomers";
import AdminReviews from "../pages/AdminReviews/AdminReviews";

import HelpCenter from "../pages/HelpCenter/HelpCenter";
import ShippingPolicy from "../pages/ShippingPolicy/ShippingPolicy";
import ReturnsRefunds from "../pages/ReturnsRefunds/ReturnsRefunds";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";

import NotFound from "../pages/NotFound/NotFound";

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          CUSTOMER / STORE ROUTES
      ===================================================== */}

      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected Customer Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        {/* CUSTOMER SERVICE */}
        <Route path="/help" element={<HelpCenter />} />{" "}
        <Route path="/shipping-policy" element={<ShippingPolicy />} />{" "}
        <Route path="/returns-refunds" element={<ReturnsRefunds />} />{" "}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>

      {/* =====================================================
          ADMIN LOGIN
      ===================================================== */}

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* =====================================================
          ADMIN PANEL
          IMPORTANT:
          This is OUTSIDE MainLayout.
          Therefore Navbar/Footer will NOT appear.
      ===================================================== */}

      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          {/* Admin Dashboard */}
          <Route path="/admin" element={<Admin />} />

          {/* Products */}
          <Route path="/admin/products" element={<AdminProducts />} />

          {/* Categories - add when ready */}
          <Route path="/admin/categories" element={<AdminCategories />} />

          {/* Orders */}
          <Route path="/admin/orders" element={<AdminOrders />} />

          {/* Users - add later */}
          <Route path="/admin/customers" element={<AdminCustomers />} />

          {/* Reviews - add later */}
          <Route path="/admin/reviews" element={<AdminReviews />} />
        </Route>
      </Route>

      {/* =====================================================
          404
      ===================================================== */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
