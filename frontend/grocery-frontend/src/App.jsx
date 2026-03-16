import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import RecommendationPage from "./pages/RecommendationPage";
import AdminDashboard from "./pages/AdminDashboard";
import OrderHistory from "./pages/OrderHistory";

function App() {

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

      </Routes>

    </BrowserRouter>

  );

}

export default App;