import React from "react";
import { motion } from "framer-motion";

const categories = [
  { name: "All", icon: "🛒" },
  { name: "Fruits", icon: "🍎" },
  { name: "Vegetables", icon: "🥦" },
  { name: "Dairy", icon: "🥛" },
  { name: "Bakery", icon: "🍞" },
  { name: "Meat", icon: "🍗" },
  { name: "Drinks", icon: "🥤" },
];

function CategoryBar({ setCategory }) {
  return (
    <div className="mb-7">
      <div className="px-1 mb-3 flex items-end justify-between">
        <div className="text-sm font-semibold text-slate-700">
          Categories
        </div>
        <div className="text-xs text-slate-500">Swipe</div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {categories.map((cat) => (
          <motion.button
            key={cat.name}
            type="button"
            onClick={() => setCategory(cat.name)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="snap-start relative min-w-[110px] px-4 py-3 rounded-2xl
              bg-white/75 backdrop-blur-xl border border-white/80
              shadow-[0_10px_30px_rgba(0,0,0,0.06)]
              hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]
              transition"
          >
            <div className="text-2xl text-center">{cat.icon}</div>
            <div className="mt-2 text-xs font-semibold text-slate-800 text-center">
              {cat.name}
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
                group-hover:opacity-100 transition
                bg-gradient-to-r from-emerald-400/40 via-emerald-200/30 to-amber-200/35"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;

