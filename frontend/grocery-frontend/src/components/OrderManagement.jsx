import React, { useEffect, useState } from "react";
import API from "../services/api";

function OrderManagement() {

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [filter, setFilter] = useState("today");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [filter, selectedDate]);

  // ✅ Fetch all products and map by ID
  const fetchProducts = async () => {
    const res = await API.get("/products");

    const map = {};
    res.data.forEach(p => {
      map[p.id] = p;
    });

    setProducts(map);
  };

  // ✅ Fetch orders
  const fetchOrders = async () => {
    const res = await API.get("/orders");

    let filtered = res.data;

    const today = new Date();

    if (filter === "today") {
      filtered = res.data.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
    }

    if (filter === "date" && selectedDate) {
      filtered = res.data.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
        return orderDate === selectedDate;
      });
    }

    if (filter === "week") {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - 7);

      filtered = res.data.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= weekStart && orderDate <= today;
      });
    }

    setOrders(filtered);
  };

  // ✅ Update status
  const updateStatus = async (id, status) => {
    await API.put(`/orders/${id}/status?status=${status}`);
    fetchOrders();
  };

  return (

    <div style={{ marginTop: "40px" }}>

      <h2>Customer Orders 📦</h2>

      {/* 🔽 FILTER OPTIONS */}
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>

        <button onClick={() => setFilter("today")}>
          Today
        </button>

        <button onClick={() => setFilter("week")} style={{ marginLeft: "10px" }}>
          Week
        </button>

        <button onClick={() => setFilter("date")} style={{ marginLeft: "10px" }}>
          Select Date
        </button>

        {filter === "date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        )}

      </div>

      {/* ❌ NO ORDERS MESSAGE */}
      {orders.length === 0 && (
        <p style={{ color: "red" }}>
          Sorry, no orders found for selected filter
        </p>
      )}

      {/* ✅ TABLE */}
      {orders.length > 0 && (
      <table style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
      }}>

        <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "10px" }}>Order ID</th>
              <th style={{ padding: "10px" }}>Product</th>
              <th style={{ padding: "10px" }}>Quantity</th>
              <th style={{ padding: "10px" }}>Total</th>
              <th style={{ padding: "10px" }}>Status</th>
              <th style={{ padding: "10px" }}>Update</th>
          </tr>
        </thead>

        <tbody>

            {orders.map((o) => {

              const product = products[o.productId];

              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #eee" }}>

                  <td style={{ padding: "10px" }}>{o.id}</td>

                  {/* ✅ PRODUCT IMAGE */}
                  <td style={{ padding: "10px" }}>
                    {product ? (
                      <img
                        src={product.image}
                        alt=""
                        style={{ width: "50px", height: "50px", borderRadius: "6px" }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>

                  <td style={{ padding: "10px" }}>{o.quantity}</td>
                  <td style={{ padding: "10px" }}>₹{o.totalPrice}</td>
                  <td style={{ padding: "10px" }}>{o.status}</td>

                  <td style={{ padding: "10px" }}>

                <button
                      onClick={() => updateStatus(o.id, "Packed")}
                style={{
                        background: "#f59e0b",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        marginRight: "5px"
                }}
                >
                Packed
                </button>

                <button
                      onClick={() => updateStatus(o.id, "Delivered")}
                style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "6px"
                }}
                >
                Delivered
                </button>

              </td>

            </tr>
              );
            })}

        </tbody>

      </table>
      )}

    </div>

  );
}

export default OrderManagement;