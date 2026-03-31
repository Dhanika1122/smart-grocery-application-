import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

function OrderHistory() {

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {

    API.get("/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));

    API.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));

  }, []);

  const getProduct = (productId) => {
    return products.find(p => p.id === productId);
  };

  return (

    <div className="px-4 sm:px-6 lg:px-10 py-10">

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-extrabold mb-6"
      >
        My Orders 📦
      </motion.h1>

      {orders.map(order => {

        const product = getProduct(order.productId);

        if(!product) return null;

        return (

          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white/55 backdrop-blur-xl border border-white/60 shadow-sm rounded-2xl p-4 mb-4"
          >

            <h3 className="text-lg font-semibold">
              {product.name}
            </h3>

            <p className="text-gray-500">
              Quantity: {order.quantity}
            </p>

            <p className="text-gray-500">
              Price: ₹{order.totalPrice}
            </p>

            <p className="mt-2 font-bold text-blue-600">
              Status: {order.status}
            </p>

          </motion.div>

        );

      })}

    </div>

  );

}

export default OrderHistory;