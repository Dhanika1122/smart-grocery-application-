import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-extrabold mb-6"
      >
        My Orders
      </motion.h1>

      {orders.map((order) => (
        <motion.div
          key={order.orderId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white/55 backdrop-blur-xl border border-white/60 shadow-sm rounded-2xl p-4 mb-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
              <p className="text-gray-500">Total: Rs.{order.totalAmount}</p>
            </div>
            <p className="mt-1 font-bold text-blue-600">Status: {order.status}</p>
          </div>

          <div className="mt-4 space-y-3">
            {(order.products || []).map((product) => (
              <div key={`${order.orderId}-${product.productId}`} className="flex items-center gap-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-200" />
                )}
                <div>
                  <h4 className="font-medium text-slate-900">{product.name}</h4>
                  <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                  <p className="text-sm text-gray-500">Price: Rs.{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default OrderHistory;
