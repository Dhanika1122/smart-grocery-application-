import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import { useAdminData } from "../../hooks/useAdminData";
import { formatINR } from "../../utils/format";

const COLORS = ["#34d399", "#fde68a", "#22c55e", "#fbbf24", "#10b981", "#86efac", "#f59e0b"];

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-5">
      <div className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-700/70 dark:text-white/60">{subtitle}</div>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Marketing() {
  const { loading, error, topProducts, marketing } = useAdminData({ filter: "month" });

  if (loading) return <LoaderSkeleton variant="page" />;
  if (error) {
    return (
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-6">
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">Failed to load marketing</div>
        <div className="mt-2 text-sm text-slate-700/70 dark:text-white/60">
          {error?.response?.data?.message || error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  const top = topProducts.slice(0, 6);
  const status = marketing.orderStatus;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Marketing
        </div>
        <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
          Computed from real orders (top products + fulfillment signals).
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Top Picks" subtitle="Ranked by revenue (selected range)">
          <div className="space-y-3">
            {top.length === 0 && (
              <div className="text-sm text-slate-700/70 dark:text-white/60">No sales in this range.</div>
            )}
            {top.map((x) => (
              <div
                key={x.productId}
                className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10"
              >
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 dark:text-white truncate">
                    {x.product?.name || `Product #${x.productId}`}
                  </div>
                  <div className="text-xs text-slate-700/70 dark:text-white/60 truncate">
                    {x.product?.category || "—"} • Units: {new Intl.NumberFormat("en-IN").format(Number(x.units ?? 0))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900 dark:text-white">{formatINR(x.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Conversion / fulfillment signals" subtitle="Order status distribution">
          <div className="h-72">
            {status.length === 0 ? (
              <div className="text-sm text-slate-700/70 dark:text-white/60">No orders in this range.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie data={status} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {status.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

