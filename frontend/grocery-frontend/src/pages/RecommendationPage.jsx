import React, { useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

function RecommendationPage() {
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);

  // ✅ Backend-compatible dropdown options
  const options = {
    diet: [
      { label: "Weight Loss", value: "weight_loss" },
      { label: "Muscle Gain", value: "muscle_gain" },
      { label: "Balanced Diet", value: "balanced_diet" }
    ],

    budget: [
      { label: "Below ₹500", value: "500" },
      { label: "₹500 - ₹1000", value: "1000" },
      { label: "Above ₹1000", value: "1500" }
    ],

    health: [
      { label: "Diabetes", value: "diabetes" },
      { label: "High BP", value: "high_bp" },
      { label: "Weight Gain", value: "weight_gain" }
    ],

    recipe: [
      { label: "Biryani", value: "biryani" },
      { label: "Sandwich", value: "sandwich" },
      { label: "Omelette", value: "omelette" }
    ],

    purchase: [
      { label: "Milk", value: "milk" },
      { label: "Bread", value: "bread" },
      { label: "Rice", value: "rice" },
      { label: "Chicken", value: "chicken" }
    ]
  };

  // ✅ API call
  const getRecommendation = async () => {
    try {
      let res;

      if (type === "diet") {
        res = await API.get(`/recommend/diet?diet=${value}`);
      }

      if (type === "budget") {
        res = await API.get(`/recommend/budget?budget=${parseInt(value)}`);
      }

      if (type === "health") {
        res = await API.get(`/recommend/health?condition=${value}`);
      }

      if (type === "recipe") {
        res = await API.get(`/recommend/recipe?recipe=${value}`);
      }

      if (type === "purchase") {
        res = await API.get(`/recommend/purchase?product=${value}`);
      }

      setResults(res.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gray-50">

      {/* Header */}
      <h2 className="text-3xl font-bold text-center text-green-600">
        🤖 AI Smart Grocery Dashboard
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">

        <button
          onClick={() => { setType("diet"); setValue(""); setResults([]); }}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-green-100"
        >
          🥗 Diet Plan
        </button>

        <button
          onClick={() => { setType("budget"); setValue(""); setResults([]); }}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-yellow-100"
        >
          💰 Budget Plan
        </button>

        <button
          onClick={() => { setType("health"); setValue(""); setResults([]); }}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-red-100"
        >
          ❤️ Health Food
        </button>

        <button
          onClick={() => { setType("recipe"); setValue(""); setResults([]); }}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-purple-100"
        >
          🍝 Recipe Ingredients
        </button>

        <button
          onClick={() => { setType("purchase"); setValue(""); setResults([]); }}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-blue-100"
        >
          🛒 Smart Purchase
        </button>

      </div>

      {/* Dropdown */}
      {type && (
        <div className="flex justify-center mt-10 gap-3">

          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="p-3 rounded-lg border w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="">Select option</option>

            {options[type].map((opt, index) => (
              <option key={index} value={opt.value}>
                {opt.label}
              </option>
            ))}

          </select>

          <button
            onClick={getRecommendation}
            disabled={!value}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            Get Recommendation
          </button>

        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">

        {results.length === 0 && type && (
          <p className="col-span-full text-center text-gray-500">
            No results yet. Select and click above.
          </p>
        )}

        {results.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md"
          >
            {item}
          </motion.div>
        ))}

      </div>

    </div>
  );
}

export default RecommendationPage;