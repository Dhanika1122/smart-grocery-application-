import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Search, Home } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

function Glass({ className = "", children }) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  const resolvedTheme = useMemo(() => {
    if (theme === "light" || theme === "dark") return theme;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    const token = localStorage.getItem("token");
    if (!admin || !token) navigate("/login");
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen px-3 md:px-4 pb-20 md:pb-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 noise" />
      </div>

      <div className="flex gap-4">
        <Sidebar theme={resolvedTheme} setTheme={setTheme} />

        <div className="flex-1 min-w-0 pt-3">
          <Glass className="rounded-3xl p-3 md:p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="hidden md:flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10">
                  <Search size={16} className="text-slate-700/70 dark:text-white/60" />
                  <input
                    placeholder="Search (inventory/customers)"
                    className="bg-transparent outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-600/60 dark:placeholder:text-white/40 w-[260px]"
                    onChange={() => {}}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/55 dark:hover:bg-white/10 transition text-sm font-extrabold text-slate-900 dark:text-white"
                >
                  <Home size={16} />
                  <span className="hidden sm:inline">Storefront</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-gradient-to-r from-rose-500/85 to-orange-400/80 border border-white/25 shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition text-sm font-extrabold text-white"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </Glass>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
        <Glass className="rounded-3xl px-3 py-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { to: "/admin/dashboard", label: "Home" },
              { to: "/admin/sales", label: "Sales" },
              { to: "/admin/inventory", label: "Stock" },
              { to: "/admin/customers", label: "Users" },
              { to: "/admin/marketing", label: "Market" },
              { to: "/admin/profile", label: "Profile" },
            ].map((x) => {
              const active = location.pathname === x.to;
              return (
                <button
                  key={x.to}
                  type="button"
                  onClick={() => navigate(x.to)}
                  className={`rounded-2xl py-2 text-xs font-extrabold transition
                    ${active ? "bg-gradient-to-r from-emerald-400/35 to-amber-200/30 border border-white/30 text-slate-900 dark:text-white" : "text-slate-700/80 dark:text-white/70 hover:bg-white/30 dark:hover:bg-white/5"}`}
                >
                  {x.label}
                </button>
              );
            })}
          </div>
        </Glass>
      </div>
    </div>
  );
}

