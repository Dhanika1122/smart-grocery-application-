import React, { useState } from "react";
import { motion } from "framer-motion";
import DateFilter from "../../components/admin/DateFilter";
import DashboardCards from "../../components/admin/DashboardCards";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import SalesCharts from "../../components/admin/SalesCharts";
import { useAdminData } from "../../hooks/useAdminData";

export default function Dashboard() {
  const [filter, setFilter] = useState("week");
  const { loading, error, range, kpis, spark, salesSeries, categoryDistribution } = useAdminData({ filter });

  if (loading) return <LoaderSkeleton variant="page" />;
  if (error) {
    return (
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-6">
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">Failed to load analytics</div>
        <div className="mt-2 text-sm text-slate-700/70 dark:text-white/60">
          {error?.response?.data?.message || error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Dashboard
          </motion.div>
          <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Your Store Performance • Real-time view for{" "}
            <span className="font-extrabold">{range.label}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
          <DateFilter value={filter} onChange={setFilter} />
          <div className="hidden sm:flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Today's Growth</span>
          </div>
        </div>
      </div>

      <DashboardCards kpis={kpis} spark={spark} />

      <SalesCharts series={salesSeries} categoryDistribution={categoryDistribution} />
    </div>
  );
}

