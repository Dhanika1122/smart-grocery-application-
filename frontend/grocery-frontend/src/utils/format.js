export function formatINR(value) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatCompactINR(value) {
  const n = Number(value ?? 0);
  const v = Number.isFinite(n) ? n : 0;
  // Use compact for small labels, keep INR symbol.
  const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(v);
  return `₹${compact}`;
}

export function formatPercent(value) {
  const n = Number(value ?? 0);
  const v = Number.isFinite(n) ? n : 0;
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

