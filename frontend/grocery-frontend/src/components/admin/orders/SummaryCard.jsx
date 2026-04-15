import React from "react";
import { motion } from "framer-motion";

export default function SummaryCard({ title, value, accent, subtitle }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 bg-gradient-to-br ${accent} p-[1px]`}
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-[var(--card)] p-5 backdrop-blur-xl shadow-[var(--shadow)]">
        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-700/65 dark:text-white/55">
          {title}
        </div>
        <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</div>
        <div className="mt-2 text-sm text-slate-700/70 dark:text-white/60">{subtitle}</div>
      </div>
    </motion.div>
  );
}
