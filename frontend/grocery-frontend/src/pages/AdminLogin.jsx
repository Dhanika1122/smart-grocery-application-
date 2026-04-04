import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminRaw = localStorage.getItem("admin");

    // Prevent redirect loops:
    // - AdminDashboard redirects to /login if admin is missing
    // - AdminLogin redirects to /admin if token exists
    // If token exists but admin doesn't, clear token and stay on /login.
    if (token && !adminRaw) {
      localStorage.removeItem("token");
      return;
    }

    if (token && adminRaw) {
      navigate("/admin/profile");
    }
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email: email,
        password: password,
      });

      console.log("Admin login response:", res.data);
      console.log("Admin token:", res.data?.token);

      if (res.data?.status === "success") {
        const token = res.data?.token;
        const admin = res.data?.admin;

        if (!token) {
          alert("Login successful but token was not returned by server.");
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("admin", JSON.stringify(admin));

        navigate("/admin/profile");
        return;
      }

      alert("Login failed");
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.status ||
        error?.message ||
        "Server error";

      alert(message);
    }
  };

  const submitForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotNewPassword.trim()) {
      alert("Please enter email and new password");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", {
        email: forgotEmail,
        newPassword: forgotNewPassword,
      });
      console.log("Forgot password response:", res.data);
      alert(res.data?.status === "success" ? "Password updated. Please login." : "Failed");
      setShowForgot(false);
      setForgotNewPassword("");
    } catch (error) {
      console.error("Forgot password error:", error);
      alert(error?.response?.data?.message || "Server error");
    } finally {
      setForgotLoading(false);
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
        onSubmit={onSubmit}
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
          Admin Login
        </h2>

        {showForgot && (
          <style>
            {`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 14, color: "#111827" }}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter password"
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
          Login
        </button>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#16a34a",
              cursor: "pointer",
              fontWeight: 700,
              marginTop: 6,
              textDecoration: "underline",
            }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin-register")}
          style={{
            marginTop: 2,
            background: "transparent",
            color: "#16a34a",
            border: "1px solid rgba(22,163,74,0.35)",
            borderRadius: 10,
            padding: "10px 16px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          New Admin? Register
        </button>

        {showForgot && (
          <div
            style={{
              marginTop: 6,
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(22,163,74,0.25)",
              background: "rgba(22,163,74,0.06)",
              animation: "fadeInUp 220ms ease both",
            }}
          >
            <form onSubmit={submitForgotPassword}>
              <h3 style={{ margin: "0 0 10px 0", color: "#16a34a" }}>Reset Password</h3>

              <label style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: "#111827" }}>Email</span>
                <input
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: 14,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: "#111827" }}>New Password</span>
                <input
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  type="password"
                  placeholder="Enter new password"
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: 14,
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    flex: 1,
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontWeight: 800,
                    cursor: forgotLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {forgotLoading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotEmail("");
                    setForgotNewPassword("");
                  }}
                  style={{
                    background: "transparent",
                    color: "#111827",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </form>
    </div>
  );
}

export default AdminLogin;

