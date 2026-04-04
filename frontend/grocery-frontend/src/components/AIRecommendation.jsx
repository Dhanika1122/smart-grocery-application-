import React, { useMemo, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

function AIRecommendation() {

  const [type, setType] = useState("smart_diet");
  const [input, setInput] = useState("");
  const [dietType, setDietType] = useState("weight_loss");
  const [members, setMembers] = useState(1);
  const [budget, setBudget] = useState(800);

  const [results, setResults] = useState([]); // legacy plain text
  const [structured, setStructured] = useState(null); // /recommend/smart-diet-structured
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const normalizeDietType = (v) => {
    const s = (v || "").trim().toLowerCase();
    if (!s) return "weight_loss";
    if (s.startsWith("we")) return "weight_loss";
    if (s.startsWith("mu")) return "muscle_gain";
    if (s.startsWith("ba")) return "balanced_diet";
    return s;
  };

  const addToCart = async (productId) => {
    try {
      await API.post("/cart", { productId, quantity: 1 });
      alert("Added to cart 🛒");
    } catch (e) {
      alert(e?.response?.data?.message || "Please login to add items to cart");
    }
  };

  const getRecommendation = async () => {

    try {
      setError("");
      setLoading(true);
      setStructured(null);
      setResults([]);

      let url = "";

      if (type === "smart_diet") {
        const merged = `diet=${normalizeDietType(dietType)}; members=${members}; budget=${budget}; notes=${input}`;
        url = `/recommend/smart-diet-structured?input=${encodeURIComponent(merged)}`;
      } else if (type === "diet") {
        url = `/recommend/diet?diet=${encodeURIComponent(input)}`;
      } else if (type === "budget") {
        url = `/recommend/budget?budget=${encodeURIComponent(input)}`;
      } else if (type === "health") {
        url = `/recommend/health?condition=${encodeURIComponent(input)}`;
      } else if (type === "recipe") {
        url = `/recommend/recipe?recipe=${encodeURIComponent(input)}`;
      }

      const res = await API.get(url);

      if (type === "smart_diet") {
        setStructured(res.data);
      } else {
        setResults(res.data);
      }

    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="mt-12 max-w-5xl mx-auto rounded-3xl p-[1px] bg-gradient-to-r from-emerald-400/50 via-emerald-200/20 to-amber-200/40">
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.10)] rounded-[calc(1.5rem-1px)] p-6 md:p-8">

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            🤖 AI Smart Recommendations
          </h2>
          <p className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            {greeting}! Your AI results are filtered to show only products that exist in your database.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/45 dark:bg-white/5 border border-white/50 dark:border-white/10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-extrabold text-slate-700/80 dark:text-white/60">Live AI</span>
        </div>
      </div>

      {/* Input Section */}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="md:col-span-3 rounded-2xl px-4 py-3 bg-white/55 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm text-sm font-extrabold text-slate-900 dark:text-white"
        >
          <option value="smart_diet">Smart Diet Plan (DB only)</option>
          <option value="diet">Diet</option>
          <option value="budget">Budget</option>
          <option value="health">Health</option>
          <option value="recipe">Recipe</option>
        </select>

        {type === "smart_diet" ? (
          <>
            <input
              type="text"
              placeholder='Diet type (autocomplete: "we" → weight_loss)'
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="md:col-span-3 rounded-2xl px-4 py-3 bg-white/55 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm text-sm font-semibold text-slate-900 dark:text-white"
            />
            <input
              type="number"
              min={1}
              max={20}
              value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="md:col-span-2 rounded-2xl px-4 py-3 bg-white/55 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm text-sm font-semibold text-slate-900 dark:text-white"
              placeholder="Members"
            />
            <div className="md:col-span-2 rounded-2xl px-4 py-3 bg-white/55 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700/75 dark:text-white/60">
                <span>Budget</span>
                <span>₹{budget}</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
            <input
              type="text"
              placeholder="Notes (optional): vegetarian, diabetic-friendly..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="md:col-span-12 rounded-2xl px-4 py-3 bg-white/55 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm text-sm font-semibold text-slate-900 dark:text-white"
            />
          </>
        ) : (
          <input
            type="text"
            placeholder="Enter value (ex: weight_loss, 500, diabetes, biryani)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="md:col-span-7 rounded-2xl px-4 py-3 bg-white/55 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm text-sm font-semibold text-slate-900 dark:text-white"
          />
        )}

        <button
          onClick={getRecommendation}
          disabled={loading}
          className="md:col-span-2 rounded-2xl px-5 py-3 font-extrabold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Thinking..." : "Generate"}
        </button>

      </div>

      {/* Results */}

      <div className="mt-6">

        {error && (
          <div className="rounded-2xl px-4 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-200 font-extrabold text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 flex items-center gap-3 text-slate-700/70 dark:text-white/60">
            <span className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-sm font-extrabold">Generating your plan…</span>
          </div>
        )}

        {type === "smart_diet" && structured && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {["breakfast", "lunch", "dinner"].map((k) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-white/55 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 p-5 shadow-sm"
                >
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">{k}</div>
                  <div className="mt-3 space-y-2">
                    {(structured?.meals?.[k] || []).map((m, idx) => (
                      <div key={idx} className="text-sm text-slate-700/80 dark:text-white/70">
                        - {m}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-3xl bg-white/55 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">Available products (DB only)</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Total: ₹{Math.round(structured.totalPrice || 0)}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(structured.products || []).map((p) => (
                  <ProductCard key={p.id} product={p} addToCart={addToCart} />
                ))}
              </div>

              {(structured.unavailableItems || []).length > 0 && (
                <div className="mt-5 rounded-2xl px-4 py-3 bg-amber-500/10 border border-amber-500/20">
                  <div className="text-sm font-extrabold text-amber-800 dark:text-amber-200">
                    AI suggested some items not in DB (ignored)
                  </div>
                  <div className="mt-2 text-sm text-amber-800/80 dark:text-amber-200/80">
                    {structured.unavailableItems.join(", ")}
                  </div>
                </div>
              )}

              {(structured.fallbackProducts || []).length > 0 && (
                <div className="mt-5">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">Fallback suggestions</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {structured.fallbackProducts.map((p) => (
                      <ProductCard key={`fb-${p.id}`} product={p} addToCart={addToCart} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {type !== "smart_diet" && (
          <>
            {results.length === 0 && !loading && !error && (
              <p className="text-slate-500 dark:text-white/50 font-semibold">No recommendations yet</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  className="bg-white/55 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl p-3 text-center font-extrabold text-slate-800 dark:text-white"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </>
        )}

        </div>

      </div>

    </div>

  );

}

export default AIRecommendation;