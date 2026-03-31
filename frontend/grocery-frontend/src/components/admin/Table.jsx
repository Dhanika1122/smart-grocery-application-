import React from "react";
import { motion } from "framer-motion";

export default function Table({ columns, rows, rowKey }) {
  return (
    <div className="rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/30 dark:bg-white/5">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-3 text-left font-extrabold text-slate-800 dark:text-white/90 whitespace-nowrap"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={rowKey(r)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.25, i * 0.02) }}
                className="border-t border-white/40 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/5 transition"
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-slate-800 dark:text-white/85 whitespace-nowrap">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

