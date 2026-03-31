import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function SearchBar({ search, setSearch }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{
        scale: focused ? 1.01 : 1,
      }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      className="relative mb-6"
    >
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={18} className="text-slate-500" />
      </div>

      <input
        type="text"
        placeholder="Search groceries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl
          pl-11 pr-4 py-3 text-sm md:text-[15px] font-medium text-slate-900
          shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
      />

      <div
        className="pointer-events-none absolute -inset-0.5 rounded-3xl opacity-0 hover:opacity-100 transition"
        style={{
          background:
            "linear-gradient(120deg, rgba(16,185,129,0.25), rgba(250,204,21,0.18))",
          filter: "blur(10px)",
        }}
      />
    </motion.div>
  );
}

export default SearchBar;

