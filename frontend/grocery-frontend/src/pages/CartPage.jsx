import React, { useEffect, useState } from "react";
import API from "../services/api";

function CartPage() {

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [coupon, setCoupon] = useState("");

  // Load cart + products
  useEffect(() => {

    API.get("/cart")
      .then((res) => setCartItems(res.data))
      .catch((err) => console.log(err));

    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));

  }, []);

  // Get product
  const getProduct = (productId) => {
    return products.find(p => p.id === productId);
  };

  // AI suggestions
  const getSuggestions = async (productName) => {
    try {
      const res = await API.get(`/recommend/purchase?product=${productName}`);
      setSuggestions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Run AI suggestions
 useEffect(() => {

  if (cartItems.length === 0) return;
  if (products.length === 0) return;

  const firstItem = cartItems[0];
  const product = products.find(p => p.id === firstItem.productId);

  if (product) {
    getSuggestions(product.name);
  }

}, [cartItems, products]);

  // Remove item
  const removeItem = async (id) => {

    try {

      await API.delete(`/cart/${id}`);

      setCartItems(cartItems.filter(item => item.id !== id));

    } catch (err) {

      console.log(err);

    }

  };

  // Increase quantity
  const increaseQty = async (id) => {

  try {

    const item = cartItems.find(i => i.id === id);

    const newQty = item.quantity + 1;

    await API.put(`/cart/${id}`, {
      quantity: newQty
    });

    setCartItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: newQty } : i
      )
    );

  } catch (err) {
    console.log(err);
  }

};

  // Decrease quantity
  const decreaseQty = async (id) => {

  try {

    const item = cartItems.find(i => i.id === id);

    if (item.quantity <= 1) return;

    const newQty = item.quantity - 1;

    await API.put(`/cart/${id}`, {
      quantity: newQty
    });

    setCartItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, quantity: newQty } : i
      )
    );

  } catch (err) {
    console.log(err);
  }

};

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {

    const product = getProduct(item.productId);

    if (!product) return total;

    return total + (product.price * item.quantity);

  }, 0);

  const delivery = subtotal > 0 ? 40 : 0;
  const discount = coupon === "SAVE10" ? subtotal * 0.1 : 0;

  const total = subtotal + delivery - discount;

  return (

    <div
      className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl
        bg-white/55 backdrop-blur-xl border border-white/60
        shadow-[0_25px_70px_rgba(0,0,0,0.10)] relative overflow-hidden"
    >

      <h1 className="text-3xl font-bold mb-6">
        Your Cart 🛒
      </h1>

      {cartItems.length === 0 && (
        <p className="text-gray-500">Cart is empty</p>
      )}

      {/* CART ITEMS */}

      {cartItems.map((item) => {

        const product = getProduct(item.productId);

        if (!product) return null;

        return (

          <div
            key={item.id}
            className="bg-white/55 backdrop-blur-xl border border-white/60
              rounded-2xl p-4 mb-4 flex justify-between items-center shadow-sm
              hover:shadow-md transition"
          >

            <div className="flex items-center gap-4">

              {/* PRODUCT IMAGE */}

              <img
                src={product.image || "https://via.placeholder.com/100"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

            <div>

              <h3 className="text-lg font-semibold">
                {product.name}
              </h3>

              <p className="text-gray-500">
                  ₹{product.price}
              </p>

                <div className="flex items-center gap-2 mt-2">

                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="px-3 rounded-xl bg-white/60 backdrop-blur-xl border border-white/60
                      hover:border-emerald-300/60 transition"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="px-3 rounded-xl bg-white/60 backdrop-blur-xl border border-white/60
                      hover:border-emerald-300/60 transition"
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

            <div className="text-right">

              <p className="text-green-600 font-bold">
                ₹{product.price * item.quantity}
              </p>

            <button
              onClick={() => removeItem(item.id)}
                className="text-red-500 text-sm mt-2"
            >
              Remove
            </button>

          </div>

          </div>

        );

      })}

      {/* COUPON */}

      <div className="bg-white/55 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm mt-6">

        <h2 className="font-semibold mb-2">
          Add Coupon
        </h2>

        <div className="flex gap-3">

          <input
            type="text"
            placeholder="Enter coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button className="bg-green-500 text-white px-4 rounded">
            Apply
          </button>

        </div>

      </div>

      {/* PRICE SUMMARY */}

      <div className="bg-white/55 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm mt-6">

        <h2 className="text-xl font-semibold mb-3">
          Price Summary
      </h2>

        <div className="flex justify-between mb-1">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between mb-1">
          <span>Delivery</span>
          <span>₹{delivery}</span>
        </div>

        <div className="flex justify-between mb-1">
          <span>Discount</span>
          <span>-₹{discount}</span>
        </div>

        <hr className="my-2"/>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

      </div>

      {/* CHECKOUT */}

      <a href="/checkout">

        <button className="w-full mt-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 text-white py-4 rounded-2xl text-lg shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition">
          Checkout (₹{total})
        </button>

      </a>

      {/* AI SUGGESTIONS */}

      {suggestions.length > 0 && (

        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-4">
            🤖 AI Smart Suggestions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {suggestions.map((item, index) => (

              <div
                key={index}
                className="bg-gray-100 rounded-lg p-3 text-center shadow-sm"
              >
                {item}
              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}

export default CartPage;