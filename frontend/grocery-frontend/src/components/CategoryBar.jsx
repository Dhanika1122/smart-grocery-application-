import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, FolderTree } from "lucide-react";
import API from "../services/api";

const categoryIconMap = {
  All: "🟢",
  Fruits: "🍎",
  Vegetables: "🥦",
  Dairy: "🥛",
  Bakery: "🥐",
  Meat: "🍗",
  Drinks: "🥤",
  Beverages: "🥤",
  Organic: "🍃",
  Snacks: "🍿",
};

function CategoryBar({ setCategory }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const [categories, setCategories] = useState([{ name: "All", icon: "🟢" }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/api/categories")
      .then((res) => {
        const activeCats = res.data || [];
        const formatted = [
          { name: "All", icon: "🟢" },
          ...activeCats.map((cat) => ({
            id: cat.id,
            name: cat.name,
            image: cat.image,
            icon: categoryIconMap[cat.name] || "🛒",
          })),
        ];
        setCategories(formatted);
      })
      .catch((err) => {
        console.error("Failed to load categories", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (cat) => {
    const catName = typeof cat === "object" ? cat.name : cat;
    setActive(catName);
    if (typeof setCategory === "function") {
      setCategory(catName);
    }
  };

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Shop by Category
        </h2>
        <button
          onClick={() => navigate("/categories")}
          className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
        >
          View all categories <ChevronRight size={16} />
        </button>
      </div>

      {/* Categories Row */}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="min-w-[130px] h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id || index}
              onClick={() => handleClick(cat.name)}
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`min-w-[130px] cursor-pointer rounded-2xl p-4 transition-all
                ${
                  active === cat.name
                    ? "bg-white dark:bg-white/10 shadow-xl border border-gray-200 dark:border-white/20"
                    : "bg-gray-50 dark:bg-white/5 hover:bg-white border border-transparent"
                }`}
            >
              {/* Icon / Image Circle */}
              <div
                className={`w-14 h-14 mx-auto flex items-center justify-center rounded-full text-2xl overflow-hidden
                  ${
                    active === cat.name
                      ? "bg-green-100 dark:bg-emerald-900/40"
                      : "bg-gray-100 dark:bg-white/10"
                  }`}
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  cat.icon || <FolderTree size={24} className="text-emerald-600" />
                )}
              </div>

              {/* Text */}
              <div className="mt-3 text-center text-sm font-medium text-gray-700 dark:text-white flex items-center justify-center gap-1">
                <span className="truncate">{cat.name}</span>
                <ChevronRight size={14} className="text-gray-400 shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryBar;