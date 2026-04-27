import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import API from "../services/api";
import { dayKey, getRange, inRange, parseOrderCreatedAt, shiftRange } from "../utils/date";

function safeNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function sum(arr, pick) {
  return arr.reduce((acc, v) => acc + safeNum(pick(v)), 0);
}

export function useAdminData({ filter }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const aliveRef = useRef(true);

  const fetchAll = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [o, p, u] = await Promise.all([API.get("/api/orders"), API.get("/products"), API.get("/users")]);
      if (!aliveRef.current) return;
      setOrders(Array.isArray(o.data) ? o.data : []);
      setProducts(Array.isArray(p.data) ? p.data : []);
      setUsers(Array.isArray(u.data) ? u.data : []);
    } catch (e) {
      if (!aliveRef.current) return;
      setError(e);
    } finally {
      if (!aliveRef.current) return;
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;

    fetchAll({ showLoading: true });
    const id = window.setInterval(() => {
      fetchAll({ showLoading: false });
    }, 20000);

    return () => {
      aliveRef.current = false;
      window.clearInterval(id);
    };
  }, []);

  const refresh = useCallback(() => {
    fetchAll({ showLoading: false });
  }, [fetchAll]);

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const range = useMemo(() => getRange(filter), [filter]);
  const prevRange = useMemo(() => shiftRange(range), [range]);

  const ordersWithDate = useMemo(() => {
    return orders
      .map((o) => ({ ...o, __dt: parseOrderCreatedAt(o) }))
      .filter((o) => o.__dt);
  }, [orders]);

  const currentOrders = useMemo(() => ordersWithDate.filter((o) => inRange(o.__dt, range)), [ordersWithDate, range]);
  const previousOrders = useMemo(
    () => ordersWithDate.filter((o) => inRange(o.__dt, prevRange)),
    [ordersWithDate, prevRange]
  );

  const kpis = useMemo(() => {
    const totalOrders = currentOrders.length;
    const revenue = sum(currentOrders, (o) => o.totalAmount);
    const prevOrders = previousOrders.length;
    const prevRevenue = sum(previousOrders, (o) => o.totalAmount);

    const ordersChange = prevOrders ? ((totalOrders - prevOrders) / prevOrders) * 100 : totalOrders ? 100 : 0;
    const revenueChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : revenue ? 100 : 0;

    const customers = users.length;
    const productsCount = products.length;

    // simple trend for customers/products (no historical): 0%
    return {
      totalOrders: { value: totalOrders, changePct: ordersChange },
      revenue: { value: revenue, changePct: revenueChange },
      customers: { value: customers, changePct: 0 },
      products: { value: productsCount, changePct: 0 },
    };
  }, [currentOrders, previousOrders, products.length, users.length]);

  const spark = useMemo(() => {
    // last 7 days revenue + orders, based on ALL orders (not only current range)
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    const rows = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      const key = dayKey(d);
      rows.push({ day: key, revenue: 0, orders: 0 });
    }

    const idx = new Map(rows.map((r, i) => [r.day, i]));
    for (const o of ordersWithDate) {
      const key = dayKey(o.__dt);
      const i = idx.get(key);
      if (i == null) continue;
      rows[i].orders += 1;
      rows[i].revenue += safeNum(o.totalAmount);
    }
    return rows;
  }, [ordersWithDate]);

  const salesSeries = useMemo(() => {
    // Series for active range grouped by day
    const bucket = new Map();
    for (const o of currentOrders) {
      const key = dayKey(o.__dt);
      const cur = bucket.get(key) ?? { day: key, revenue: 0, orders: 0 };
      cur.orders += 1;
      cur.revenue += safeNum(o.totalAmount);
      bucket.set(key, cur);
    }
    return Array.from(bucket.values()).sort((a, b) => (a.day < b.day ? -1 : 1));
  }, [currentOrders]);

  const categoryDistribution = useMemo(() => {
    // Pie: revenue by product category (current range)
    const bucket = new Map();
    for (const o of currentOrders) {
      for (const item of o.products || []) {
        const p = productById.get(item.productId);
        const cat = (p?.category || "Other").trim() || "Other";
        bucket.set(cat, (bucket.get(cat) ?? 0) + safeNum(item.price) * safeNum(item.quantity));
      }
    }
    return Array.from(bucket.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentOrders, productById]);

  const inventory = useMemo(() => {
    return products.map((p) => ({
      ...p,
      __stock: safeNum(p.stock),
      __price: safeNum(p.price),
    }));
  }, [products]);

  const customerStats = useMemo(() => {
    // Per-user totals based on admin-visible orders.
    const bucket = new Map();
    for (const o of ordersWithDate) {
      const uid = o.userId;
      if (uid == null) continue;
      const cur = bucket.get(uid) ?? { userId: uid, orders: 0, spending: 0 };
      cur.orders += 1;
      cur.spending += safeNum(o.totalAmount);
      bucket.set(uid, cur);
    }
    const enriched = users.map((u) => {
      const stat = bucket.get(u.id) ?? { orders: 0, spending: 0 };
      return { ...u, totalOrders: stat.orders, totalSpending: stat.spending };
    });
    // Also include users that exist only in orders but not in /users (rare)
    for (const [uid, stat] of bucket.entries()) {
      if (enriched.some((x) => x.id === uid)) continue;
      enriched.push({ id: uid, name: `User #${uid}`, email: "", totalOrders: stat.orders, totalSpending: stat.spending });
    }
    return enriched.sort((a, b) => b.totalSpending - a.totalSpending);
  }, [ordersWithDate, users]);

  const topProducts = useMemo(() => {
    // Best sellers by revenue & units (current range)
    const bucket = new Map();
    for (const o of currentOrders) {
      for (const item of o.products || []) {
        const cur = bucket.get(item.productId) ?? { productId: item.productId, units: 0, revenue: 0 };
        cur.units += safeNum(item.quantity);
        cur.revenue += safeNum(item.price) * safeNum(item.quantity);
        bucket.set(item.productId, cur);
      }
    }
    return Array.from(bucket.values())
      .map((x) => ({ ...x, product: productById.get(x.productId) }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [currentOrders, productById]);

  const marketing = useMemo(() => {
    // Real metrics we can compute without extra backend endpoints
    const delivered = currentOrders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    const outForDelivery = currentOrders.filter((o) => (o.status || "").toLowerCase() === "out_for_delivery").length;
    const cancelled = currentOrders.filter((o) => (o.status || "").toLowerCase() === "cancelled").length;
    const pending = currentOrders.filter((o) => (o.status || "").toLowerCase() === "pending").length;

    const orderStatus = [
      { name: "Delivered", value: delivered },
      { name: "Out for delivery", value: outForDelivery },
      { name: "Cancelled", value: cancelled },
      { name: "Pending", value: pending },
    ].filter((x) => x.value > 0);

    return { orderStatus };
  }, [currentOrders]);

  return {
    loading,
    error,
    orders,
    products,
    users,
    refresh,
    range,
    kpis,
    spark,
    salesSeries,
    categoryDistribution,
    inventory,
    customerStats,
    topProducts,
    marketing,
  };
}

