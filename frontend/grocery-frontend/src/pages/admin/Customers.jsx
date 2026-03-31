import React, { useMemo, useState } from "react";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import Table from "../../components/admin/Table";
import { useAdminData } from "../../hooks/useAdminData";
import { formatINR } from "../../utils/format";

export default function Customers() {
  const { loading, error, customerStats } = useAdminData({ filter: "month" });
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customerStats;
    return customerStats.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [customerStats, query]);

  const columns = useMemo(
    () => [
      { key: "id", header: "ID", render: (u) => <span className="font-extrabold">#{u.id}</span> },
      { key: "name", header: "Name", render: (u) => <span className="font-extrabold">{u.name || "—"}</span> },
      { key: "email", header: "Email", render: (u) => <span className="text-slate-700/80 dark:text-white/70">{u.email || "—"}</span> },
      {
        key: "totalOrders",
        header: "Total orders",
        render: (u) => new Intl.NumberFormat("en-IN").format(Number(u.totalOrders ?? 0)),
      },
      { key: "totalSpending", header: "Total spending", render: (u) => <span className="font-extrabold">{formatINR(u.totalSpending)}</span> },
    ],
    []
  );

  if (loading) return <LoaderSkeleton variant="page" />;
  if (error) {
    return (
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-6">
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">Failed to load customers</div>
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
          <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Customers
          </div>
          <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Spending is computed from orders visible to this admin (tenant-safe).
          </div>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name/email…"
          className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-600/60 dark:placeholder:text-white/40"
        />
      </div>

      <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
    </div>
  );
}

