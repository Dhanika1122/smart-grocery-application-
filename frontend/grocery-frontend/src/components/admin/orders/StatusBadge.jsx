import React from "react";

const STATUS_STYLES = {
  PENDING: "bg-amber-400/15 text-amber-700 dark:text-amber-200 border-amber-400/30",
  OUT_FOR_DELIVERY: "bg-sky-500/15 text-sky-700 dark:text-sky-200 border-sky-400/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-400/30",
  CANCELLED: "bg-rose-500/15 text-rose-700 dark:text-rose-200 border-rose-400/30",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function StatusBadge({ status }) {
  const normalized = (status || "PENDING").toUpperCase();
  const tone = STATUS_STYLES[normalized] || STATUS_STYLES.PENDING;
  const label = STATUS_LABELS[normalized] || STATUS_LABELS.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold tracking-wide ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
