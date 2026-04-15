import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import RecommendationPage from "./pages/RecommendationPage";
import OrderHistory from "./pages/OrderHistory";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AdminRegister from "./pages/AdminRegister";
import UserProfile from "./pages/UserProfile";

const AdminLayout = React.lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = React.lazy(() => import("./pages/admin/Orders"));
const AdminSales = React.lazy(() => import("./pages/admin/Sales"));
const AdminInventory = React.lazy(() => import("./pages/admin/Inventory"));
const AdminCustomers = React.lazy(() => import("./pages/admin/Customers"));
const AdminMarketing = React.lazy(() => import("./pages/admin/Marketing"));
const AdminProfile = React.lazy(() => import("./pages/admin/AdminProfile"));

function AppChrome() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/userlogin" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/user/profile" element={<UserProfile />} />

        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="p-6 text-sm text-slate-700/70 dark:text-white/60">Loading admin…</div>}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
                <AdminDashboard />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<div className="p-6">Loading orders...</div>}>
                <AdminOrders />
              </Suspense>
            }
          />
          <Route
            path="sales"
            element={
              <Suspense fallback={<div className="p-6">Loading sales…</div>}>
                <AdminSales />
              </Suspense>
            }
          />
          <Route
            path="inventory"
            element={
              <Suspense fallback={<div className="p-6">Loading inventory…</div>}>
                <AdminInventory />
              </Suspense>
            }
          />
          <Route
            path="customers"
            element={
              <Suspense fallback={<div className="p-6">Loading customers…</div>}>
                <AdminCustomers />
              </Suspense>
            }
          />
          <Route
            path="marketing"
            element={
              <Suspense fallback={<div className="p-6">Loading marketing…</div>}>
                <AdminMarketing />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<div className="p-6">Loading profile…</div>}>
                <AdminProfile />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {

  useEffect(() => {
    document.title = "Dhanika";
  }, []);

  useEffect(() => {
    const apply = () => {
      const isDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      // Only apply system theme if user did not pick explicit theme in localStorage.
      const stored = localStorage.getItem("theme");
      const isExplicit = stored === "light" || stored === "dark";
      if (!isExplicit) {
        document.documentElement.classList.toggle("dark", Boolean(isDark));
      }
    };

    apply();

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mql?.addEventListener) {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
    return undefined;
  }, []);

  return (

    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AppChrome />

    </BrowserRouter>

  );

}

export default App;
