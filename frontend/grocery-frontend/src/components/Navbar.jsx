import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/dhanika-logo.png";

function Navbar() {
  const [showLogout, setShowLogout] = useState(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    const user = localStorage.getItem("user");

    return Boolean(token && (admin || user));
  });

  const [showCustomerProfile, setShowCustomerProfile] = useState(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    const user = localStorage.getItem("user");
    return Boolean(token && user && !admin);
  });

  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    const user = localStorage.getItem("user");

    // If token exists but neither admin nor user exists, treat it as stale.
    if (token && !admin && !user) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      localStorage.removeItem("user");
      setShowLogout(false);
      setShowCustomerProfile(false);
      return;
    }

    setShowLogout(Boolean(token && (admin || user)));
    setShowCustomerProfile(Boolean(token && user && !admin));
  };

  useEffect(() => {
    syncAuthState();

    const onStorage = () => syncAuthState();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    setShowLogout(false);
    setShowCustomerProfile(false);

    const path = window.location.pathname || "";
    if (path.startsWith("/admin")) {
      window.location.href = "/login";
      return;
    }
    window.location.href = "/userlogin";
  };

  return (

    <div
      className="sticky top-0 z-50 backdrop-blur-xl
        bg-gradient-to-r from-emerald-700/55 via-emerald-600/35 to-amber-300/25
        border-b border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 40px",
        color: "white"
      }}
    >

      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          color: "white",
        }}
      >
       <div style={{ height: "60px", display: "flex", alignItems: "center" }}>
  <img
    src={logo}
    alt="Dhanika"
    style={{
      height: "250%",
      width: "auto",
      objectFit: "contain"
    }}
  />
</div>
        <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 1000, letterSpacing: "-0.02em", color: "black" }}>
          Dhanika
        </h2>
      </Link>


      {/* Navigation Links */}

      <div style={{ display: "flex", gap: "20px" }}>

        <Link to="/" style={{color:"white",textDecoration:"none"}}>
          Home
        </Link>

        <Link to="/recommend" style={{color:"white",textDecoration:"none"}}>
          AI Recommend
        </Link>

        <Link to="/cart" style={{color:"white",textDecoration:"none"}}>
          Cart
        </Link>

        <Link to="/orders" className="text-white">
Orders
</Link>

<Link to="/userlogin" style={{color:"white",textDecoration:"none"}}>
Login
</Link>

<Link to="/register" style={{color:"white",textDecoration:"none"}}>
Register
</Link>

        {showCustomerProfile && (
          <Link to="/user/profile" style={{ color: "white", textDecoration: "none", fontWeight: 800 }}>
            Profile
          </Link>
        )}

        {showLogout && (
          <button
            onClick={logout}
            style={{
              background: "rgba(255,255,255,0.18)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.35)",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        )}

      </div>

    </div>

  );

}

export default Navbar;