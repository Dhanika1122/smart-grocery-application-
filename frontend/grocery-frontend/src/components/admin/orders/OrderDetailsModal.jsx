import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatINR } from "../../../utils/format";

export default function OrderDetailsModal({ order, open, onClose, formatDate }) {
  return (
    <AnimatePresence>
      {open && order ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-4xl rounded-3xl border border-white/20 bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-700/60 dark:text-white/50">
                  Order Details
                </div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Order #{order.orderId}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm text-slate-700/70 dark:text-white/60">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/20 bg-white/35 px-3 py-2 text-slate-700 transition hover:bg-white/55 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_1.3fr]">
              <div className="rounded-3xl border border-white/20 bg-white/35 p-5 dark:bg-white/5">
                <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-700/65 dark:text-white/50">
                  Customer Info
                </div>
                <div className="mt-4 space-y-4 text-sm">
                  <InfoRow label="Name" value={order.name || "Unknown"} />
                  <InfoRow label="Email" value={order.customerEmail || "Not available"} />
                  <InfoRow label="Phone" value={order.phone || "Not available"} />
                  <InfoRow label="Address" value={order.address || "Not available"} multiline />
                </div>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/35 p-5 dark:bg-white/5">
                <div className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-700/65 dark:text-white/50">
                  Order Items
                </div>
                <div className="mt-4 space-y-3">
                  {(order.products || []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center text-sm text-slate-700/65 dark:text-white/55">
                      No items available for this order.
                    </div>
                  ) : (
                    (order.products || []).map((item) => (
                      <div
                        key={`${order.orderId}-${item.productId}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/45 px-4 py-3 dark:bg-white/5"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-extrabold text-slate-900 dark:text-white">{item.name}</div>
                          <div className="mt-1 text-xs text-slate-700/65 dark:text-white/55">
                            Qty {item.quantity} • {formatINR(item.price)} each
                          </div>
                        </div>
                        <div className="text-right font-extrabold text-slate-900 dark:text-white">
                          {formatINR(Number(item.price || 0) * Number(item.quantity || 0))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/15 bg-gradient-to-r from-emerald-400/15 to-amber-200/10 px-4 py-4">
                  <div className="text-sm font-bold text-slate-700/75 dark:text-white/65">Total Price</div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">{formatINR(order.totalAmount)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function InfoRow({ label, value, multiline = false }) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700/55 dark:text-white/45">
        {label}
      </div>
      <div className={`mt-1 font-semibold text-slate-900 dark:text-white ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </div>
    </div>
  );
}
