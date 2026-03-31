import React from "react";
import { motion } from "framer-motion";

const options = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export default function DateFilter({ value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl p-1 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`relative px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl transition
              ${active ? "text-slate-900 dark:text-white" : "text-slate-700/80 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"}`}
          >
            {active && (
              <motion.div
                layoutId="dateFilterPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/35 via-emerald-200/20 to-amber-200/30 border border-white/40 dark:border-white/10"
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

