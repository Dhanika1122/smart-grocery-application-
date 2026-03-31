import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import Table from "../../components/admin/Table";
import { useAdminData } from "../../hooks/useAdminData";
import { formatINR } from "../../utils/format";
import { Trash2, UploadCloud, Plus, RotateCcw, ShieldCheck } from "lucide-react";

function StockPill({ stock }) {
  const n = Number(stock ?? 0);
  const low = n <= 10;
  const mid = n > 10 && n <= 30;
  const cls = low
    ? "bg-rose-500/15 text-rose-700 dark:text-rose-200 border-rose-500/20"
    : mid
      ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/20"
      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 border-emerald-500/20";
  return (
    <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-extrabold border ${cls}`}>
      {n}
      {low && <span className="ml-2">Low</span>}
    </span>
  );
}

export default function Inventory() {
  const { loading, error, inventory, refresh } = useAdminData({ filter: "month" });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("stockAsc");
  const [cat, setCat] = useState("All");
  const [stockEdits, setStockEdits] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [add, setAdd] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    imageFile: null,
    imagePreview: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    return () => {
      if (add.imagePreview) URL.revokeObjectURL(add.imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const s = new Set(inventory.map((p) => (p.category || "Other").trim() || "Other"));
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [inventory]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = inventory;
    if (cat !== "All") arr = arr.filter((p) => ((p.category || "Other").trim() || "Other") === cat);
    if (q) arr = arr.filter((p) => (p.name || "").toLowerCase().includes(q));

    const sorted = [...arr];
    sorted.sort((a, b) => {
      if (sort === "stockAsc") return (a.__stock ?? 0) - (b.__stock ?? 0);
      if (sort === "stockDesc") return (b.__stock ?? 0) - (a.__stock ?? 0);
      if (sort === "priceDesc") return (b.__price ?? 0) - (a.__price ?? 0);
      if (sort === "priceAsc") return (a.__price ?? 0) - (b.__price ?? 0);
      return 0;
    });
    return sorted;
  }, [inventory, query, sort, cat]);

  const lowStockCount = useMemo(() => inventory.filter((p) => Number(p.stock ?? 0) <= 10).length, [inventory]);

  const columns = useMemo(
    () => [
      {
        key: "image",
        header: "Product",
        render: (p) => (
          <div className="flex items-center gap-3 min-w-[220px]">
            <div className="h-10 w-10 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 overflow-hidden">
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img src={p.image || "https://via.placeholder.com/40"} alt="Product image" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-slate-900 dark:text-white truncate">{p.name}</div>
              <div className="text-xs text-slate-700/70 dark:text-white/60 truncate">{p.category}</div>
            </div>
          </div>
        ),
      },
      { key: "price", header: "Price", render: (p) => <span className="font-extrabold">{formatINR(p.price)}</span> },
      {
        key: "stock",
        header: "Stock",
        render: (p) => {
          const currentStock = Number(stockEdits[p.id] ?? p.stock ?? 0);
          return (
            <div className="flex items-center gap-3">
              <StockPill stock={currentStock} />
              <input
                type="number"
                min={0}
                value={currentStock}
                onChange={(e) =>
                  setStockEdits((prev) => ({
                    ...prev,
                    [p.id]: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                className="w-20 rounded-2xl px-3 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-extrabold text-slate-900 dark:text-white"
                aria-label={`Edit stock for ${p.name}`}
              />
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateStock(p.id)}
                disabled={updatingId === p.id}
                className="rounded-2xl px-3 py-2 bg-gradient-to-r from-emerald-500/85 to-amber-300/70 border border-white/25 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-extrabold text-slate-900 dark:text-white"
              >
                {updatingId === p.id ? "Updating…" : "Update"}
              </motion.button>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (p) => (
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => deleteProduct(p.id)}
              disabled={deletingId === p.id}
              className="rounded-2xl px-3 py-2 bg-rose-500/85 border border-white/25 shadow-lg shadow-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-extrabold text-white inline-flex items-center gap-2"
            >
              <Trash2 size={16} />
              {deletingId === p.id ? "Deleting…" : "Delete"}
            </motion.button>
          </div>
        ),
      },
    ],
    [stockEdits, updatingId, deletingId]
  );

  const updateStock = async (id) => {
    try {
      const next = stockEdits[id] ?? inventory.find((p) => p.id === id)?.stock ?? 0;
      const value = Number(next);
      if (!Number.isFinite(value) || value < 0) {
        alert("Invalid stock value");
        return;
      }
      setUpdatingId(id);
      await API.put(`/products/${id}`, { stock: value });
      setStockEdits((prev) => ({ ...prev, [id]: value }));
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (id) => {
    const name = inventory.find((p) => p.id === id)?.name || "this product";
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await API.delete(`/products/${id}`);
      setStockEdits({});
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!add.name.trim() || !add.category.trim()) {
      alert("Please enter product name and category");
      return;
    }
    const priceN = Number(add.price);
    const stockN = Number(add.stock);
    if (!Number.isFinite(priceN) || priceN < 0) {
      alert("Invalid price");
      return;
    }
    if (!Number.isFinite(stockN) || stockN < 0) {
      alert("Invalid stock");
      return;
    }
    if (!add.imageFile) {
      alert("Please choose a product image");
      return;
    }

    try {
      setAdding(true);
      const fd = new FormData();
      fd.append("file", add.imageFile);
      const uploadRes = await API.post("/upload", fd);

      if (uploadRes?.data?.status !== "success") {
        alert(uploadRes?.data?.error || "Upload failed");
        return;
      }

      const imageUrl = uploadRes?.data?.secure_url;
      await API.post("/products", {
        name: add.name.trim(),
        category: add.category.trim(),
        price: priceN,
        stock: stockN,
        image: imageUrl,
      });

      // Cleanup preview and reset form
      if (add.imagePreview) URL.revokeObjectURL(add.imagePreview);
      setAdd({ name: "", category: "", price: "", stock: "", imageFile: null, imagePreview: "" });
      setStockEdits({});
      refresh();
    } catch (e2) {
      alert(e2?.response?.data?.message || e2?.message || "Failed to add product");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoaderSkeleton variant="page" />;
  if (error) {
    return (
      <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-6">
        <div className="text-lg font-extrabold text-slate-900 dark:text-white">Failed to load inventory</div>
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
            Inventory
          </div>
          <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Search, filter and sort your products (admin-isolated).{" "}
            {lowStockCount > 0 && (
              <span className="inline-flex items-center gap-2 ml-2 rounded-2xl px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-200 font-extrabold text-xs">
                <ShieldCheck size={14} />
                Low stock: {lowStockCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-600/60 dark:placeholder:text-white/40"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm text-sm font-extrabold text-slate-900 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm text-sm font-extrabold text-slate-900 dark:text-white"
          >
            <option value="stockAsc">Stock ↑</option>
            <option value="stockDesc">Stock ↓</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Add Product</div>
            <div className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
              Upload image to Cloudinary via `/upload`, then create the product.
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setStockEdits({});
              refresh();
            }}
            className="rounded-2xl px-4 py-2 bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10 text-sm font-extrabold text-slate-900 dark:text-white inline-flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Refresh
          </motion.button>
        </div>

        <form onSubmit={addProduct} className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Name</span>
            <input
              value={add.name}
              onChange={(e) => setAdd((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-semibold text-slate-900 dark:text-white"
              placeholder="Apple / Milk / etc."
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Category</span>
            <input
              value={add.category}
              onChange={(e) => setAdd((prev) => ({ ...prev, category: e.target.value }))}
              className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-semibold text-slate-900 dark:text-white"
              placeholder="Fruits / Dairy / Drinks"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Price (₹)</span>
            <input
              type="number"
              min={0}
              value={add.price}
              onChange={(e) => setAdd((prev) => ({ ...prev, price: e.target.value }))}
              className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-semibold text-slate-900 dark:text-white"
              placeholder="e.g. 49"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Stock</span>
            <input
              type="number"
              min={0}
              value={add.stock}
              onChange={(e) => setAdd((prev) => ({ ...prev, stock: e.target.value }))}
              className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm outline-none text-sm font-semibold text-slate-900 dark:text-white"
              placeholder="e.g. 100"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Image</span>
            <div className="rounded-2xl px-4 py-2 bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <UploadCloud size={16} className="text-emerald-300" />
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">Choose file</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) {
                      if (add.imagePreview) URL.revokeObjectURL(add.imagePreview);
                      setAdd((prev) => ({ ...prev, imageFile: null, imagePreview: "" }));
                      return;
                    }
                    const preview = URL.createObjectURL(f);
                    if (add.imagePreview) URL.revokeObjectURL(add.imagePreview);
                    setAdd((prev) => ({ ...prev, imageFile: f, imagePreview: preview }));
                  }}
                />
              </label>

              {add.imagePreview && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/30">
                    <img src={add.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (add.imagePreview) URL.revokeObjectURL(add.imagePreview);
                      setAdd((prev) => ({ ...prev, imageFile: null, imagePreview: "" }));
                    }}
                    className="text-xs font-extrabold text-rose-500 hover:text-rose-600 dark:hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 xl:col-span-5">
            <motion.button
              type="submit"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={adding}
              className="w-full rounded-3xl px-5 py-3 bg-gradient-to-r from-emerald-500/90 via-emerald-400/60 to-amber-300/80 border border-white/25 shadow-lg shadow-emerald-500/15 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base font-extrabold text-slate-900 dark:text-white inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              {adding ? "Adding..." : "Add Product"}
            </motion.button>
          </div>
        </form>
      </div>

      <Table columns={columns} rows={rows} rowKey={(r) => r.id} />
    </div>
  );
}

