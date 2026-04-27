import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, Eye, Bike, PackageCheck, AlertCircle } from "lucide-react";
import API from "../../services/api";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import StatusBadge from "../../components/admin/orders/StatusBadge";
import SummaryCard from "../../components/admin/orders/SummaryCard";
import OrderDetailsModal from "../../components/admin/orders/OrderDetailsModal";
import { formatINR } from "../../utils/format";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const outForDelivery = orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    return { total, pending, outForDelivery, delivered };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        if (activeFilter === "ALL") return true;
        return (order.status || "").toUpperCase() === activeFilter;
      })
      .filter((order) => {
        if (!normalizedQuery) return true;
        const name = (order.name || "").toLowerCase();
        const orderId = String(order.orderId || "").toLowerCase();
        return name.includes(normalizedQuery) || orderId.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });
  }, [orders, activeFilter, query]);

  const handleAdvanceStatus = async (order) => {
    const current = (order.status || "PENDING").toUpperCase();
    const nextStatus = current === "PENDING" ? "OUT_FOR_DELIVERY" : current === "OUT_FOR_DELIVERY" ? "DELIVERED" : null;
    if (!nextStatus) return;

    setUpdatingId(order.orderId);
    setError("");
    try {
      const res = await API.put(`/api/orders/${order.orderId}/status`, { status: nextStatus });
      const updated = res.data;
      setOrders((prev) => prev.map((item) => (item.orderId === updated.orderId ? updated : item)));
      if (selectedOrder?.orderId === updated.orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoaderSkeleton variant="page" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Orders
          </div>
          <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Track the full delivery lifecycle and visually verify order status updates.
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/35 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <ArrowUpDown size={16} />
          Latest first
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Orders" value={summary.total} subtitle="All customer orders" accent="from-emerald-400/35 via-emerald-200/20 to-amber-200/30" />
        <SummaryCard title="Pending Orders" value={summary.pending} subtitle="Awaiting dispatch" accent="from-amber-400/35 via-amber-200/20 to-orange-100/35" />
        <SummaryCard title="Out for Delivery" value={summary.outForDelivery} subtitle="Currently on the road" accent="from-sky-400/35 via-cyan-200/20 to-indigo-100/30" />
        <SummaryCard title="Delivered Orders" value={summary.delivered} subtitle="Completed successfully" accent="from-emerald-500/30 via-lime-200/15 to-amber-100/25" />
      </div>

      <div className="rounded-3xl border border-[var(--cardBorder)] bg-[var(--card)] p-4 shadow-[var(--shadow)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-extrabold transition ${
                    active
                      ? "border border-white/35 bg-gradient-to-r from-emerald-400/35 to-amber-200/30 text-slate-900 dark:text-white"
                      : "border border-white/35 bg-white/35 text-slate-700/80 hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-md">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer name or order ID"
              className="w-full rounded-2xl border border-white/35 bg-white/40 py-2.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-500/70 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-5 text-sm font-semibold text-rose-700 shadow-[var(--shadow)] dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-[var(--cardBorder)] bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-xl">
        {filteredOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">No orders found</div>
            <div className="mt-2 text-sm text-slate-700/70 dark:text-white/60">
              Try switching the filter or adjusting your search.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/30 dark:bg-white/5">
                <tr>
                  {["Order ID", "Customer", "Address", "Amount", "Status", "Date", "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700/65 dark:text-white/50"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.orderId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.22, index * 0.02) }}
                    className="border-t border-white/35 transition hover:bg-white/25 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-4 align-top font-extrabold text-slate-900 dark:text-white">#{order.orderId}</td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-extrabold text-slate-900 dark:text-white">{order.name || "Unknown customer"}</div>
                      <div className="mt-1 text-xs text-slate-700/70 dark:text-white/55">{order.phone || "No phone"}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div title={order.address || ""} className="max-w-[240px] truncate font-semibold text-slate-800 dark:text-white/85">
                        {order.address || "No address"}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top font-extrabold text-slate-900 dark:text-white">{formatINR(order.totalAmount)}</td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700/75 dark:text-white/60">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/40 px-3 py-2 font-extrabold text-slate-900 transition hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          <Eye size={15} />
                          View
                        </button>

                        {order.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(order)}
                            disabled={updatingId === order.orderId}
                            className="inline-flex items-center gap-2 rounded-2xl bg-sky-500/90 px-3 py-2 font-extrabold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Bike size={15} />
                            Out for delivery
                          </button>
                        ) : null}

                        {order.status === "OUT_FOR_DELIVERY" ? (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(order)}
                            disabled={updatingId === order.orderId}
                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/90 px-3 py-2 font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <PackageCheck size={15} />
                            Mark delivered
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        formatDate={formatDate}
      />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Unknown date";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dt);
}
