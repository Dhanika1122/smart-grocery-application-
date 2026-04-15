import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const STATUS_OPTIONS = ["PENDING", "DELIVERED", "CANCELLED"];

const badgeStyles = {
  PENDING: {
    icon: "⏳",
    label: "Pending",
    background: "#fef3c7",
    color: "#92400e",
    border: "#f59e0b",
  },
  DELIVERED: {
    icon: "✅",
    label: "Delivered",
    background: "#dcfce7",
    color: "#166534",
    border: "#22c55e",
  },
  CANCELLED: {
    icon: "❌",
    label: "Cancelled",
    background: "#fee2e2",
    color: "#991b1b",
    border: "#ef4444",
  },
};

function StatusBadge({ status }) {
  const config = badgeStyles[status] ?? badgeStyles.PENDING;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 12px",
        borderRadius: "999px",
        background: config.background,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontWeight: 800,
        fontSize: "13px",
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("week");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
      alert(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];
    const today = new Date();

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((order) => (order.status || "").toUpperCase() === statusFilter);
    }

    if (dateFilter === "today") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
    }

    if (dateFilter === "date" && selectedDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === selectedDate;
      });
    }

    if (dateFilter === "week") {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - 7);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= weekStart && orderDate <= today;
      });
    }

    return filtered;
  }, [orders, dateFilter, selectedDate, statusFilter]);

  const updateStatus = async (orderId, nextStatus) => {
    const currentOrder = orders.find((order) => order.orderId === orderId);
    const currentStatus = (currentOrder?.status || "PENDING").toUpperCase();

    if (currentStatus === nextStatus) {
      return;
    }

    if (nextStatus === "CANCELLED") {
      const confirmed = window.confirm("Are you sure you want to mark this order as CANCELLED?");
      if (!confirmed) {
        return;
      }
    }

    setUpdatingOrderId(orderId);
    try {
      const res = await API.put(`/api/orders/${orderId}/status`, { status: nextStatus });
      const updatedOrder = res.data;
      setOrders((prev) =>
        prev.map((order) => (order.orderId === orderId ? updatedOrder : order))
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert(error?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div
      style={{
        marginTop: "40px",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "24px",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Customer Orders</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Review incoming orders, mark completed deliveries, and cancel when needed.
          </p>
        </div>

        <button onClick={fetchOrders} style={primaryButtonStyle}>
          Refresh Orders
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button onClick={() => setDateFilter("all")} style={filterButtonStyle}>All Dates</button>
        <button onClick={() => setDateFilter("today")} style={filterButtonStyle}>Today</button>
        <button onClick={() => setDateFilter("week")} style={filterButtonStyle}>Week</button>
        <button onClick={() => setDateFilter("date")} style={filterButtonStyle}>Select Date</button>

        {dateFilter === "date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={selectStyle}
          />
        )}
      </div>

      {loading && (
        <p style={{ marginTop: "24px", color: "#64748b", fontWeight: 700 }}>Loading orders...</p>
      )}

      {!loading && filteredOrders.length === 0 && (
        <p style={{ marginTop: "24px", color: "#b91c1c", fontWeight: 700 }}>
          No orders found for the selected filters.
        </p>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: "24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "920px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={headerCellStyle}>Order ID</th>
                <th style={headerCellStyle}>User ID</th>
                <th style={headerCellStyle}>Products</th>
                <th style={headerCellStyle}>Total</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={bodyCellStyle}>#{order.orderId}</td>
                  <td style={bodyCellStyle}>{order.userId ?? "-"}</td>
                  <td style={bodyCellStyle}>
                    {(order.products || []).map((product) => (
                      <div
                        key={`${order.orderId}-${product.productId}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "10px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "10px",
                              background: "#e2e8f0",
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{product.name}</div>
                          <div style={{ color: "#64748b", fontSize: "14px" }}>
                            Qty: {product.quantity} | Price: Rs.{product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td style={bodyCellStyle}>Rs.{order.totalAmount}</td>
                  <td style={bodyCellStyle}>
                    <StatusBadge status={(order.status || "PENDING").toUpperCase()} />
                  </td>
                  <td style={bodyCellStyle}>
                    <select
                      value={(order.status || "PENDING").toUpperCase()}
                      onChange={(e) => updateStatus(order.orderId, e.target.value)}
                      disabled={updatingOrderId === order.orderId}
                      style={selectStyle}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {badgeStyles[status].label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const primaryButtonStyle = {
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  borderRadius: "12px",
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

const filterButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  borderRadius: "12px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontWeight: 700,
  minWidth: "150px",
};

const headerCellStyle = {
  padding: "14px 12px",
  textAlign: "left",
  color: "#334155",
  fontWeight: 800,
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const bodyCellStyle = {
  padding: "16px 12px",
  verticalAlign: "top",
  color: "#0f172a",
  fontWeight: 600,
};

export default OrderManagement;
