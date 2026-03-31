import React from "react";
import { motion } from "framer-motion";

function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl p-6 md:p-10 mb-8
        bg-gradient-to-br from-emerald-600/35 via-white/15 to-amber-300/35
        border border-white/80 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,0.10)]"
    >
      <div
        className="absolute inset-0 opacity-85"
        style={{
          background:
            "radial-gradient(900px circle at 20% 0%, rgba(16,185,129,0.28), transparent 45%), radial-gradient(700px circle at 90% 30%, rgba(250,204,21,0.20), transparent 45%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900"
          >
            Fresh groceries, ultra-fast delivery.
          </motion.h1>
          <p className="mt-3 text-slate-700/80 text-sm md:text-base">
            A premium marketplace for fruits, vegetables and essentials — optimized for speed and freshness.
          </p>

          <div className="mt-5 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl px-5 py-3 text-sm font-extrabold text-white
                bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-400
                shadow-lg shadow-emerald-600/20"
              type="button"
              onClick={() => {
                const el = document.querySelector("h1, h2");
                el?.scrollIntoView?.({ behavior: "smooth" });
              }}
            >
              Shop Now
            </motion.button>

            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-2xl px-5 py-3 text-sm font-bold bg-white/70 backdrop-blur border border-white/90 text-slate-800"
            >
              Premium UX
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
          className="h-28 w-28 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-lg flex items-center justify-center"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
            alt="grocery"
            className="h-16 w-16 object-contain"
          />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent" />
    </motion.div>
  );
}

export default HeroBanner;

