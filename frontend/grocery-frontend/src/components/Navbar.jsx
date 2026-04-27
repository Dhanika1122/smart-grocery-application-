import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/dhanika-logo.png";

import {
  Home,
  Sparkles,
  ShoppingCart,
  Package,
  User,
  LogOut,
  Search,
} from "lucide-react";

function Navbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    const user = localStorage.getItem("user");
    return Boolean(token && (admin || user));
  });

  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    const user = localStorage.getItem("user");

    if (token && !admin && !user) {
      localStorage.clear();
      setShowLogout(false);
      return;
    }

    setShowLogout(Boolean(token && (admin || user)));
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/userlogin";
  };

  const navItem =
    "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-100 hover:text-green-700 transition";

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200 shadow-sm">

      <div className="flex items-center justify-between px-6 py-3">

        {/* 🔹 LOGO (UNCHANGED) */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-10 object-contain" />
          <span className="text-xl font-bold text-green-700">Dhanika</span>
        </Link>

        {/* 🔍 SEARCH BAR */}
        <div className="hidden md:flex items-center w-[380px]">
          <div className="flex items-center w-full px-4 py-2 rounded-full bg-white shadow border">
            <Search className="w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search for fruits, vegetables, dairy..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);

                clearTimeout(window.searchTimeout);
                window.searchTimeout = setTimeout(() => {
                  navigate(`/?search=${value}`);
                }, 300);
              }}
              className="ml-2 w-full bg-transparent outline-none text-sm"
            />

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  navigate("/");
                }}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 🔹 NAVIGATION */}
        <div className="flex items-center gap-3">

          <Link to="/" className={navItem}>
            <Home size={18} /> Home
          </Link>

          <Link to="/recommend" className={navItem}>
            <Sparkles size={18} /> AI
          </Link>

          <Link to="/cart" className="relative flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-100 hover:text-green-700 transition">
            <ShoppingCart size={18} />
            Cart
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] px-1.5 rounded-full">
              2
            </span>
          </Link>

          <Link to="/orders" className={navItem}>
            <Package size={18} /> Orders
          </Link>

          <Link to="/user/profile" className={navItem}>
            <User size={18} /> Profile
          </Link>

          {!showLogout && (
            <Link to="/userlogin" className={navItem}>
              Login
            </Link>
          )}

          {showLogout && (
            <button onClick={logout} className={navItem}>
              <LogOut size={18} /> Logout
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default Navbar;