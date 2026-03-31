import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");

  const navigate = useNavigate();

  const register = async (e) => {

    if (!name.trim() || !email.trim() || !password.trim() || !shopName.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {

      const res = await API.post("/auth/register", {
        name,
        email,
        password,
        shopName,
      });

      console.log("Admin register response:", res.data);

      alert("Registration Successful ✅");
      navigate("/login");

    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error registering admin"
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        background: "#f3f4f6",
      }}
    >
      <form
        onSubmit={register}
        style={{
          width: 420,
          maxWidth: "100%",
          background: "white",
          padding: 28,
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <h2 style={{ margin: 0, textAlign: "center", color: "#16a34a" }}>
          Admin Register
        </h2>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#111827" }}>Name</span>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#111827" }}>Email</span>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#111827" }}>Password</span>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#111827" }}>Shop Name</span>
          <input
            type="text"
            placeholder="Enter shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            style={{
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              fontSize: 14,
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            marginTop: 6,
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "12px 16px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default AdminRegister;