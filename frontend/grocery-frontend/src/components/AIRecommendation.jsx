import React, { useState } from "react";
import API from "../services/api";

function AIRecommendation() {

  const [type, setType] = useState("diet");
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  const getRecommendation = async () => {

    try {

      let url = "";

      if (type === "diet") {
        url = `/recommend/diet?diet=${input}`;
      }

      if (type === "budget") {
        url = `/recommend/budget?budget=${input}`;
      }

      if (type === "health") {
        url = `/recommend/health?condition=${input}`;
      }

      if (type === "recipe") {
        url = `/recommend/recipe?recipe=${input}`;
      }

      const res = await API.get(url);

      setResults(res.data);

    } catch (err) {
      console.log(err);
    }

  };

  return (

    <div className="bg-white shadow-lg rounded-xl p-8 mt-12 max-w-3xl mx-auto">

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🤖 AI Smart Recommendations
      </h2>

      {/* Input Section */}

      <div className="flex flex-col md:flex-row gap-4">

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="diet">Diet</option>
          <option value="budget">Budget</option>
          <option value="health">Health</option>
          <option value="recipe">Recipe</option>
        </select>

        <input
          type="text"
          placeholder="Enter value (ex: weight_loss, 500, diabetes, biryani)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
        />

        <button
          onClick={getRecommendation}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Get Recommendation
        </button>

      </div>

      {/* Results */}

      <div className="mt-6">

        {results.length === 0 && (
          <p className="text-gray-400">
            No recommendations yet
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {results.map((item, index) => (

            <div
              key={index}
              className="bg-green-50 border border-green-200 rounded-lg p-3 text-center font-medium"
            >
              {item}
            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default AIRecommendation;