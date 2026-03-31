function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function parseOrderCreatedAt(order) {
  // Backend sends LocalDateTime; in JSON it commonly arrives as ISO-like string.
  // new Date("2026-03-31T10:22:30") works in modern browsers.
  if (!order?.createdAt) return null;
  const dt = new Date(order.createdAt);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function getRange(filter) {
  const now = new Date();
  const todayStart = startOfDay(now);

  if (filter === "today") {
    return { from: todayStart, to: endOfDay(now), label: "Today" };
  }

  if (filter === "week") {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to: endOfDay(now), label: "This week" };
  }

  if (filter === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: startOfDay(from), to: endOfDay(now), label: "This month" };
  }

  if (filter === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: startOfDay(from), to: endOfDay(now), label: "This year" };
  }

  return { from: todayStart, to: endOfDay(now), label: "Today" };
}

export function shiftRange(range) {
  const ms = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - ms);
  return { from: prevFrom, to: prevTo };
}

export function inRange(d, range) {
  if (!d) return false;
  return d >= range.from && d <= range.to;
}

export function dayKey(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = `${x.getMonth() + 1}`.padStart(2, "0");
  const dd = `${x.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function daysBetween(from, to) {
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return Math.max(0, Math.round((b - a) / (24 * 60 * 60 * 1000)));
}

