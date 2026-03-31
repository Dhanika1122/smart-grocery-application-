import React from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { formatCompactINR, formatINR } from "../../utils/format";

function Card({ title, subtitle, children }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</div>
          {subtitle && <div className="text-xs text-slate-700/70 dark:text-white/60 mt-1">{subtitle}</div>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

const PIE = ["#34d399", "#22c55e", "#a7f3d0", "#fde68a", "#fbbf24", "#10b981", "#86efac"];

export default function SalesCharts({ series, categoryDistribution }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card title="Revenue trend" subtitle="Based on your real orders in selected range">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid stroke="rgba(255,255,255,0.20)" strokeDasharray="6 6" />
              <XAxis dataKey="day" tick={{ fill: "rgba(15,23,42,0.55)" }} />
              <YAxis tick={{ fill: "rgba(15,23,42,0.55)" }} tickFormatter={(v) => formatCompactINR(v)} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                isAnimationActive
                animationDuration={750}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Orders bar" subtitle="Orders grouped by day">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid stroke="rgba(255,255,255,0.20)" strokeDasharray="6 6" />
              <XAxis dataKey="day" tick={{ fill: "rgba(15,23,42,0.55)" }} />
              <YAxis tick={{ fill: "rgba(15,23,42,0.55)" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" name="Orders" fill="rgba(250,204,21,0.85)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Category distribution" subtitle="Revenue share by category (selected range)">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(v) => formatINR(v)} />
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                isAnimationActive
                animationDuration={800}
              >
                {categoryDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Insights" subtitle="Quick read">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10">
            <div className="text-xs font-extrabold text-slate-700/75 dark:text-white/60">Days tracked</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{series.length}</div>
          </div>
          <div className="rounded-2xl p-4 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10">
            <div className="text-xs font-extrabold text-slate-700/75 dark:text-white/60">Categories</div>
            <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
              {categoryDistribution.length}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

