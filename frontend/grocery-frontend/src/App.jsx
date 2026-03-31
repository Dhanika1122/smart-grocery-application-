import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import RecommendationPage from "./pages/RecommendationPage";
import AdminDashboard from "./pages/AdminDashboard";
import OrderHistory from "./pages/OrderHistory";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AdminRegister from "./pages/AdminRegister";

function App() {

  useEffect(() => {
    const apply = () => {
      const isDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", Boolean(isDark));
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

      <Navbar />

      <Routes>

        <Route path="/" element={<ProductPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/checkout" element={<CheckoutPage />} />

        <Route path="/recommend" element={<RecommendationPage />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/orders" element={<OrderHistory />} />

        <Route path="/login" element={<AdminLogin />} />

        <Route path="/userlogin" element={<UserLogin/>}/>
        
<Route path="/register" element={<UserRegister/>}/>

<Route path="/admin-register" element={<AdminRegister />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;