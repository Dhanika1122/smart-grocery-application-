import React, { useEffect, useState } from "react";
import API from "../services/api";

function CheckoutPage() {

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {

      const cartRes = await API.get("/cart");
      const productRes = await API.get("/products");

      setCartItems(cartRes.data);
      setProducts(productRes.data);

      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getProduct = (productId) => {
    return products.find((p) => p.id === productId);
  };

  const totalPrice = cartItems.reduce((total, item) => {

    const product = getProduct(item.productId);

    if (!product) return total;

    return total + product.price * item.quantity;

  }, 0);

  const placeOrder = async () => {

    try {

      for (let item of cartItems) {

        const product = getProduct(item.productId);

        if (!product) continue;

        await API.post("/orders", {
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: product.price * item.quantity
        });

      }

      alert("Order Placed Successfully 🎉");

      // Clear cart UI
      setCartItems([]);

    } catch (error) {
      console.log(error);
    }

  };

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading checkout...</h2>
      </div>
    );
  }

  return (

    <div style={{ padding: "30px" }}>

      <h1>Checkout 🧾</h1>

      {cartItems.length === 0 ? (

        <p>Your cart is empty</p>

      ) : (

        cartItems.map((item) => {

          const product = getProduct(item.productId);

          if (!product) return null;

          return (

            <div
              key={item.id}
              style={{
                border: "1px solid #eee",
                padding: "15px",
                margin: "10px 0",
                borderRadius: "8px",
                background: "#fafafa"
              }}
            >

              <h3>{product.name}</h3>

              <p>Price: ₹{product.price}</p>

              <p>Quantity: {item.quantity}</p>

              <p>Total: ₹{product.price * item.quantity}</p>

            </div>

          );

        })

      )}

      <h2>Total Amount: ₹{totalPrice}</h2>

      {cartItems.length > 0 && (

        <button
          onClick={placeOrder}
          style={{
            padding: "12px 20px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
            fontSize: "16px"
          }}
        >
          Place Order
        </button>

      )}

    </div>

  );

}

export default CheckoutPage;