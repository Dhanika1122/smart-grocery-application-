import React, { useEffect, useState } from "react";
import API from "../services/api";

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

    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        My Orders 📦
      </h1>

      {orders.map(order => {

        const product = getProduct(order.productId);

        if(!product) return null;

        return (

          <div
            key={order.id}
            className="bg-white shadow-md rounded-lg p-4 mb-4"
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

          </div>

        );

      })}

    </div>

  );

}

export default OrderHistory;