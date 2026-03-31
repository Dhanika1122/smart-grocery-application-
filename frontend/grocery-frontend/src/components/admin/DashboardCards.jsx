import React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { formatCompactINR, formatINR, formatPercent } from "../../utils/format";

function CardShell({ children }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative rounded-3xl p-[1px] bg-gradient-to-r from-emerald-400/50 via-emerald-200/20 to-amber-200/40"
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(650px circle at 15% 0%, rgba(16,185,129,0.35), transparent 55%), radial-gradient(500px circle at 90% 45%, rgba(250,204,21,0.28), transparent 60%)",
          filter: "blur(18px)",
        }}
      />
      <div className="rounded-[calc(1.5rem-1px)] bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-5">
        {children}
      </div>
    </motion.div>
  );
}

function Trend({ pct }) {
  const v = Number(pct ?? 0);
  const up = v >= 0;
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-extrabold
        ${up ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" : "bg-rose-500/15 text-rose-700 dark:text-rose-200"}`}
    >
      <span>{up ? "↑" : "↓"}</span>
      <span>{formatPercent(Math.abs(v))}</span>
    </div>
  );
}

export default function DashboardCards({ kpis, spark }) {
  const cards = [
    {
      title: "Total Orders",
      value: kpis.totalOrders.value,
      change: kpis.totalOrders.changePct,
      sparkKey: "orders",
      accent: "from-emerald-500/30 to-amber-200/30",
      micro: "Today's Growth",
      format: (v) => new Intl.NumberFormat("en-IN").format(Number(v ?? 0)),
    },
    {
      title: "Revenue",
      value: kpis.revenue.value,
      change: kpis.revenue.changePct,
      sparkKey: "revenue",
      accent: "from-emerald-500/25 to-amber-200/35",
      micro: "Today's Growth",
      format: (v) => formatINR(v),
    },
    {
      title: "Customers",
      value: kpis.customers.value,
      change: kpis.customers.changePct,
      sparkKey: "orders",
      accent: "from-emerald-500/20 to-amber-200/25",
      micro: "",
      format: (v) => new Intl.NumberFormat("en-IN").format(Number(v ?? 0)),
    },
    {
      title: "Products",
      value: kpis.products.value,
      change: kpis.products.changePct,
      sparkKey: "orders",
      accent: "from-emerald-500/20 to-amber-200/25",
      micro: "",
      format: (v) => new Intl.NumberFormat("en-IN").format(Number(v ?? 0)),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <CardShell key={c.title}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold tracking-wide text-slate-700/75 dark:text-white/60">
                  {c.title}
                </div>
                <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {c.title === "Revenue" ? formatINR(c.value) : c.format(c.value)}
                </div>
                <div className="mt-2">
                  <Trend pct={c.change} />
                </div>
                {c.micro ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 22 }}
                    className="mt-2 text-[11px] font-extrabold tracking-wide text-emerald-700/80 dark:text-emerald-300/70"
                  >
                    {c.micro}
                  </motion.div>
                ) : null}
              </div>

              <div className={`rounded-2xl px-3 py-2 bg-gradient-to-br ${c.accent} border border-white/30`}>
                <div className="text-xs font-extrabold text-slate-900/80 dark:text-white/80">
                  {c.title === "Revenue" ? formatCompactINR(c.value) : c.format(c.value)}
                </div>
              </div>
            </div>

            <div className="mt-4 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark}>
                  <defs>
                    <linearGradient id={`g-${c.title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(16,185,129,0.55)" />
                      <stop offset="100%" stopColor="rgba(250,204,21,0.12)" />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={c.sparkKey}
                    stroke="rgba(16,185,129,0.9)"
                    strokeWidth={2}
                    fill={`url(#g-${c.title})`}
                    dot={false}
                    isAnimationActive
                    animationDuration={650}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </CardShell>
      ))}
    </div>
  );
}

