import React from "react";
import { motion } from "framer-motion";

function SearchBar({ search, setSearch }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex justify-center"
    >
      <div
        className="flex items-center gap-2 px-4 py-2
        w-full max-w-md   /* 👈 controls width */
        rounded-full      /* 👈 pill shape */
        bg-white/70 backdrop-blur-lg
        border border-white/80
        shadow-md
        focus-within:shadow-lg
        transition"
      >
        {/* 🔍 Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          type="text"
          placeholder="Search groceries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none
          text-sm text-slate-800 placeholder:text-slate-400"
        />

        {/* ❌ Clear */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-red-500"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default SearchBar;