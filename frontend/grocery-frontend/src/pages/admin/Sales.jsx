import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import DateFilter from "../../components/admin/DateFilter";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import SalesCharts from "../../components/admin/SalesCharts";
import { useAdminData } from "../../hooks/useAdminData";
import { formatINR, formatPercent } from "../../utils/format";

function Card({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-5">
      <div className="text-xs font-extrabold tracking-wide text-slate-700/75 dark:text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
      {subtitle && <div className="mt-2 text-sm text-slate-700/70 dark:text-white/60">{subtitle}</div>}
    </div>
  );
}

export default function Sales() {
  const [filter, setFilter] = useState("month");
  const { loading, error, salesSeries, categoryDistribution, kpis } = useAdminData({ filter });

  const revenue = kpis?.revenue?.value ?? 0;
  const revenueChange = kpis?.revenue?.changePct ?? 0;
  const orders = kpis?.totalOrders?.value ?? 0;
  const ordersChange = kpis?.totalOrders?.changePct ?? 0;

  const growthLabel = useMemo(() => {
    const v = Number(revenueChange ?? 0);
    const up = v >= 0;
    return `${up ? "↑" : "↓"} ${formatPercent(Math.abs(v))} vs previous`;
  }, [revenueChange]);

  if (loading) return <LoaderSkeleton variant="page" />;
  if (error) {
    return (
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-6">
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">Failed to load sales</div>
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
          <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Sales</div>
          <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Your Store Performance • Advanced analytics from real orders
          </div>
        </div>
        <DateFilter value={filter} onChange={setFilter} />
      </div>

      <motion.div
        key={filter}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card title="Revenue summary" value={formatINR(revenue)} subtitle={growthLabel} />
          <Card
            title="Orders"
            value={new Intl.NumberFormat("en-IN").format(orders)}
            subtitle={`${ordersChange >= 0 ? "↑" : "↓"} ${formatPercent(Math.abs(ordersChange))} vs previous`}
          />
          <Card title="Growth" value={`${formatPercent(revenueChange)}`} subtitle="Computed from previous period" />
        </div>

        <SalesCharts series={salesSeries} categoryDistribution={categoryDistribution} />
      </motion.div>
    </div>
  );
}

