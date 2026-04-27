import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/dhanika-logo.png";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Megaphone,
  Moon,
  Sun,
  Users,
  UserCircle2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/sales", label: "Sales", icon: LineChart },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { to: "/admin/profile", label: "Profile", icon: UserCircle2 },
];

function Glass({ className = "", children }) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Sidebar({ theme, setTheme }) {
  const [collapsed, setCollapsed] = useState(false);

  const isDark = theme === "dark";
  const ThemeIcon = isDark ? Sun : Moon;
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  const width = useMemo(() => (collapsed ? "w-[78px]" : "w-[280px]"), [collapsed]);

  return (
    <aside className={`hidden md:flex flex-col ${width} transition-[width] duration-300`}>
      <Glass className="rounded-3xl p-4 h-[calc(100vh-24px)] sticky top-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-white/30 flex items-center justify-center overflow-hidden p-1">
              <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            {!collapsed && (
              <div className="leading-tight min-w-0">
                <div className="font-extrabold tracking-tight text-slate-900 dark:text-white">Dhanika</div>
                <div className="text-xs text-slate-600/80 dark:text-white/60">Admin Analytics</div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-2xl p-2 text-slate-700/80 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Collapse sidebar"
          >
            <CollapseIcon size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition
                  ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700/80 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActive"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/35 via-emerald-200/20 to-amber-200/30 border border-white/35 dark:border-white/10"
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      />
                    )}
                    <span className="relative z-10 h-9 w-9 rounded-2xl bg-white/45 dark:bg-white/5 border border-white/40 dark:border-white/10 flex items-center justify-center">
                      <Icon size={18} className="text-emerald-700 dark:text-emerald-300" />
                    </span>
                    {!collapsed && (
                      <span className="relative z-10 font-semibold text-sm">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-auto pt-4">
          <div className="h-px bg-white/40 dark:bg-white/10 mb-4" />
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-full rounded-2xl px-3 py-2.5 bg-white/45 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition flex items-center gap-3"
          >
            <span className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-white/10 to-amber-200/25 border border-white/30 flex items-center justify-center">
              <ThemeIcon size={18} className="text-slate-900 dark:text-white" />
            </span>
            {!collapsed && (
              <div className="text-left">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {isDark ? "Light mode" : "Dark mode"}
                </div>
                <div className="text-xs text-slate-600/80 dark:text-white/60">Smooth theme</div>
              </div>
            )}
          </button>
        </div>
      </Glass>
    </aside>
  );
}

