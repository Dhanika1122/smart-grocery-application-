import React, { useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

function RecommendationPage() {
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);

  const getRecommendation = async () => {
    try {
      let res;

      if (type === "diet") {
        res = await API.get(`/recommend/diet?diet=${value}`);
      }

      if (type === "budget") {
        res = await API.get(`/recommend/budget?budget=${value}`);
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
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10">

      {/* Header */}
      <h2 className="text-3xl font-bold text-center text-green-600">
        🤖 AI Smart Grocery Dashboard
      </h2>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10 justify-center">

        <button
          onClick={() => setType("diet")}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-green-100 transition"
        >
          🥗 Diet Plan
        </button>

        <button
          onClick={() => setType("budget")}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-yellow-100 transition"
        >
          💰 Budget Plan
        </button>

        <button
          onClick={() => setType("health")}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-red-100 transition"
        >
          ❤️ Health Food
        </button>

        <button
          onClick={() => setType("recipe")}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-purple-100 transition"
        >
          🍝 Recipe Ingredients
        </button>

        <button
          onClick={() => setType("purchase")}
          className="bg-white shadow-md p-5 rounded-xl hover:bg-blue-100 transition"
        >
          🛒 Smart Purchase
        </button>

      </div>

      {/* Input Section */}
      {type && (
        <div className="flex justify-center mt-10 gap-3">

          <input
            placeholder="Enter value..."
            onChange={(e) => setValue(e.target.value)}
            className="p-3 rounded-lg border w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <button
            onClick={getRecommendation}
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600"
          >
            Get Recommendation
          </button>

        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">

        {results.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.02 }}
            className="bg-white/55 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            {item}
          </motion.div>
        ))}

      </div>

    </div>
  );
}

export default RecommendationPage;