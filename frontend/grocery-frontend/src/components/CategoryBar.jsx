import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const categories = [
  { name: "All Categories", icon: "🟢" },
  { name: "Fruits", icon: "🍎" },
  { name: "Vegetables", icon: "🥦" },
  { name: "Dairy", icon: "🥛" },
  { name: "Bakery", icon: "🥐" },
  { name: "Meat", icon: "🍗" },
  { name: "Drinks", icon: "🥤" },
  { name: "Organic", icon: "🍃" },
];

function CategoryBar({ setCategory }) {
  const [active, setActive] = useState("All Categories");

  const handleClick = (cat) => {
    setActive(cat);
    setCategory(cat);
  };

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-lg font-semibold text-gray-800">
          Shop by Category
        </h2>
        <button className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          View all categories <ChevronRight size={16} />
        </button>
      </div>

      {/* Categories Row */}
      <div className="flex gap-4 overflow-x-auto pb-3">
        {categories.map((cat, index) => (
          <motion.div
            key={index}
            onClick={() => handleClick(cat.name)}
            whileHover={{ y: -4, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`min-w-[130px] cursor-pointer rounded-2xl p-4 transition-all
              ${
                active === cat.name
                  ? "bg-white shadow-xl border border-gray-200"
                  : "bg-gray-50 hover:bg-white border border-transparent"
              }`}
          >
            {/* Icon Circle */}
            <div
              className={`w-14 h-14 mx-auto flex items-center justify-center rounded-full text-2xl
                ${
                  active === cat.name
                    ? "bg-green-100"
                    : "bg-gray-100"
                }`}
            >
              {cat.icon}
            </div>

            {/* Text */}
            <div className="mt-3 text-center text-sm font-medium text-gray-700 flex items-center justify-center gap-1">
              {cat.name !== "All Categories" ? cat.name : "All"}
              <ChevronRight size={14} className="text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;