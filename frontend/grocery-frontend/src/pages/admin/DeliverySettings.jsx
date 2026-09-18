import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, DollarSign, CheckCircle, AlertCircle, Save, RefreshCw } from "lucide-react";
import API from "../../services/api";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";

export default function DeliverySettings() {
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [freeDeliveryMinimum, setFreeDeliveryMinimum] = useState(500);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/admin/delivery-settings");
      if (res.data) {
        setDeliveryFee(res.data.deliveryFee ?? 40);
        setFreeDeliveryMinimum(res.data.freeDeliveryMinimum ?? 500);
      }
    } catch (err) {
      console.error("Failed to load delivery settings:", err);
      setError("Failed to load delivery settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const feeNum = Number(deliveryFee);
    const minNum = Number(freeDeliveryMinimum);

    if (isNaN(feeNum) || feeNum < 0) {
      setError("Delivery Fee must be a valid number greater than or equal to 0.");
      return;
    }

    if (isNaN(minNum) || minNum < 0) {
      setError("Free Delivery Minimum must be a valid number greater than or equal to 0.");
      return;
    }

    setSaving(true);
    try {
      const res = await API.put("/api/admin/delivery-settings", {
        deliveryFee: feeNum,
        freeDeliveryMinimum: minNum,
      });

      if (res.data) {
        setDeliveryFee(res.data.deliveryFee);
        setFreeDeliveryMinimum(res.data.freeDeliveryMinimum);
        setSuccessMessage("Delivery settings updated successfully.");
      }
    } catch (err) {
      console.error("Failed to save delivery settings:", err);
      setError(err?.response?.data?.message || "Failed to update delivery settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoaderSkeleton variant="page" />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            <Truck size={16} />
            <span>Store Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Delivery Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Configure store-wide delivery charges and the minimum order threshold for free delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/35 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-white/55 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <RefreshCw size={16} />
          Reload Settings
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-rose-300/40 bg-rose-500/10 p-4 text-sm font-semibold text-rose-700 shadow-sm dark:text-rose-200 flex items-center gap-2"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 shadow-sm dark:text-emerald-200 flex items-center gap-2"
        >
          <CheckCircle size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Currently Saved Settings Summary Cards */}
        <div className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-white/50">
            Current Delivery Fee
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{deliveryFee}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Charged when an order does not qualify for free delivery.
          </p>
        </div>

        <div className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-white/50">
            Free Delivery Above
          </div>
          <div className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
            ₹{freeDeliveryMinimum}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Orders with a subtotal of ₹{freeDeliveryMinimum} or more get FREE delivery.
          </p>
        </div>

        <div className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 p-6 shadow-sm backdrop-blur-xl flex flex-col justify-center">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-white/50">
            Active Rule Preview
          </div>
          <div className="mt-2 text-sm font-bold text-slate-800 dark:text-white/90 leading-relaxed">
            Subtotal &lt; ₹{freeDeliveryMinimum} ➔ Fee: <span className="text-rose-600 dark:text-rose-400">₹{deliveryFee}</span>
            <br />
            Subtotal ≥ ₹{freeDeliveryMinimum} ➔ Fee: <span className="text-emerald-600 dark:text-emerald-400">FREE (₹0)</span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="rounded-3xl border border-white/35 bg-white/40 dark:bg-white/5 p-6 md:p-8 shadow-sm backdrop-blur-xl space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Modify Delivery Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Fee Input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-white/70">
              Delivery Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                required
                placeholder="40"
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/5 py-3 pl-8 pr-4 text-base font-bold text-slate-900 dark:text-white outline-none transition focus:border-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This amount is charged on orders below the free delivery minimum threshold.
            </p>
          </div>

          {/* Free Delivery Minimum Input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-white/70">
              Free Delivery Minimum Order Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={freeDeliveryMinimum}
                onChange={(e) => setFreeDeliveryMinimum(e.target.value)}
                required
                placeholder="500"
                className="w-full rounded-2xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/5 py-3 pl-8 pr-4 text-base font-bold text-slate-900 dark:text-white outline-none transition focus:border-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Orders with a subtotal equal to or exceeding this amount receive free delivery.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            <Save size={18} />
            {saving ? "Saving Settings..." : "Save Delivery Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
