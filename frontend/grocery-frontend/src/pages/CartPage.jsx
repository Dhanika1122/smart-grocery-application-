import React, { useEffect, useState } from "react";
import API from "../services/api";

function CartPage() {

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

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

  // Run suggestions automatically
 useEffect(() => {

  if (cartItems.length === 0) return;
  if (products.length === 0) return;

  const firstItem = cartItems[0];

  const product = products.find(p => p.id === firstItem.productId);

  if (product) {
    console.log("Fetching suggestions for:", product.name);
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

  // Total price
  const totalPrice = cartItems.reduce((total, item) => {

    const product = getProduct(item.productId);

    if (!product) return total;

    return total + (product.price * item.quantity);

  }, 0);

  return (

    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Your Cart 🛒
      </h1>

      {cartItems.length === 0 && (
        <p className="text-gray-500">Cart is empty</p>
      )}

      {cartItems.map((item) => {

        const product = getProduct(item.productId);

        if (!product) return null;

        return (

          <div
            key={item.id}
            className="bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center"
          >

            <div>

              <h3 className="text-lg font-semibold">
                {product.name}
              </h3>

              <p className="text-gray-500">
                Price: ₹{product.price}
              </p>

              <p className="text-gray-500">
                Quantity: {item.quantity}
              </p>

              <p className="text-green-600 font-bold">
                Total: ₹{product.price * item.quantity}
              </p>

            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Remove
            </button>

          </div>

        );

      })}

      <h2 className="text-2xl font-bold mt-6">
        Total Price: ₹{totalPrice}
      </h2>

      <a href="/checkout">

        <button className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
          Go To Checkout
        </button>

      </a>


      {/* AI Suggestions */}

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