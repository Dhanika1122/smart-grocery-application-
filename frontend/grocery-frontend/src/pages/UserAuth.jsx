import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function UserAuth({ initialMode = "login" }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const isLogin = mode === "login";

  useEffect(() => {
    // If already logged in, redirect to profile.
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    const adminRaw = localStorage.getItem("admin");

    // Prevent stale/partial auth state after refresh:
    if (token && !userRaw) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return;
    }

    if (token && userRaw) {
      if (adminRaw) {
        navigate("/admin/dashboard");
        return;
      }
      navigate("/user/profile");
    }
  }, [navigate]);

  const title = useMemo(() => {
    return isLogin ? "User Login" : "Create Account";
  }, [isLogin]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        alert("Please enter email and password");
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !address.trim()) {
        alert("Please fill name, email, password, phone, and address");
        return;
      }
      if (age.trim()) {
        const n = Number(age);
        if (!Number.isFinite(n) || n < 1 || n > 130) {
          alert("Please enter a valid age (1–130) or leave it blank");
          return;
        }
      }
    }

    try {
      const endpoint = isLogin ? "/userauth/login" : "/userauth/register";
      const payload = isLogin
        ? { email: email, password: password }
        : {
            name: name.trim(),
            email: email.trim(),
            password: password,
            phone: phone.trim(),
            address: address.trim(),
            ...(age.trim() ? { age: Number(age) } : {}),
            ...(gender.trim() ? { gender: gender.trim() } : {}),
          };

      const res = await API.post(endpoint, payload);

      console.log("User auth response:", res.data);
      console.log("User token:", res.data?.token);

      if (isLogin) {
  if (res.data?.status === "success") {
    if (res.data?.token) localStorage.setItem("token", res.data.token);
    if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));

    // ✅ FIX: delay navigation
    setTimeout(() => {
      navigate("/user/profile");
    }, 100);

    return;
  }
}
      // Register endpoint returns the created user object (not {status:'success'})
      alert("Account Created ✅");
      setMode("login");
      navigate("/userlogin");
    } catch (error) {
      console.error("User auth error:", error);
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Server error"
      );
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
      const res = await API.post("/userauth/forgot-password", {
        email: forgotEmail,
        newPassword: forgotNewPassword,
      });
      console.log("User forgot password response:", res.data);
      alert(res.data?.status === "success" ? "Password updated. Please login." : "Failed");
      setShowForgot(false);
      setForgotNewPassword("");
    } catch (error) {
      console.error("User forgot password error:", error);
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
        background:
          "linear-gradient(120deg, rgba(22,163,74,0.18), rgba(16,185,129,0.10), rgba(59,130,246,0.10))",
      }}
    >
      <div
        style={{
          width: 440,
          maxWidth: "100%",
          background: "white",
          padding: 30,
          borderRadius: 16,
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          transform: "translateY(0)",
          transition: "transform 220ms ease, box-shadow 220ms ease",
        }}
      >
        <div
          style={{
            marginBottom: 18,
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: isLogin ? "#16a34a" : "white",
              color: isLogin ? "white" : "#111827",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: !isLogin ? "#16a34a" : "white",
              color: !isLogin ? "white" : "#111827",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
          >
            Register
          </button>
        </div>

        <h2 style={{ margin: "0 0 14px 0", textAlign: "center", color: "#16a34a" }}>
          {title}
        </h2>

        <form
          onSubmit={onSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {!isLogin && (
            <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#111827" }}>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter name"
                style={{
                  padding: "12px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </label>
          )}

          {!isLogin && (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#111827" }}>Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="Mobile number"
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
                <span style={{ fontSize: 14, color: "#111827" }}>Address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, pincode"
                  rows={3}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: 14, color: "#111827" }}>Age (optional)</span>
                  <input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    type="number"
                    min={1}
                    max={130}
                    placeholder="—"
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
                  <span style={{ fontSize: 14, color: "#111827" }}>Gender (optional)</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      outline: "none",
                      fontSize: 14,
                      background: "white",
                    }}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>
            </>
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
                transition: "border-color 180ms ease",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              marginTop: 4,
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "12px 16px",
              fontWeight: 800,
              cursor: "pointer",
              fontSize: 15,
              transition: "transform 120ms ease",
            }}
          >
            {isLogin ? "Login" : "Create Account"}
          </button>

          {isLogin && (
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
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
            Tip: try both tabs to login/register.
          </div>
        </form>

        {showForgot && (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(22,163,74,0.25)",
              background: "rgba(22,163,74,0.06)",
              animation: "fadeInUp 220ms ease both",
            }}
          >
            <style>
              {`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
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
      </div>
    </div>
  );
}

export default UserAuth;

