import React from "react";
import { Link } from "react-router-dom";

function Navbar() {

  return (

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 40px",
      background: "#27ae60",
      color: "white"
    }}>

      {/* Logo */}

      <h2>FreshKart 🛒</h2>


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

      </div>

    </div>

  );

}

export default Navbar;