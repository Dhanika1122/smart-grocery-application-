import React from "react";

function ProductCard({ product, addToCart }) {

  return (

    <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-xl transition transform hover:-translate-y-1">

      {/* Product Image */}
      <img
        src="https://via.placeholder.com/140"
        alt={product.name}
        className="w-28 h-28 object-contain mx-auto mb-3"
      />

      {/* Product Name */}
      <h3 className="text-lg font-semibold text-gray-800">
        {product.name}
      </h3>

      {/* Category */}
      <p className="text-sm text-gray-400 mb-1">
        {product.category}
      </p>

      {/* Price */}
      <p className="text-xl font-bold text-green-600 mb-3">
        ₹{product.price}
      </p>

      {/* Add to Cart */}
      <button
        onClick={() => addToCart(product.id)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Add to Cart 🛒
      </button>

    </div>

  );

}

export default ProductCard;