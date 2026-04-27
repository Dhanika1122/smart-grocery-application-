import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = API.defaults.baseURL || "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function HeroBanner({ scrollToProducts }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const avatarSrc = resolveImageUrl(user?.profileImage);

  return (
    <div className="relative mb-10">

      {/* 🌈 BACKGROUND LAYERS */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-white/30 to-yellow-200/30 backdrop-blur-xl"></div>

      {/* Glow Effects */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-400/30 blur-[100px] rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-yellow-300/30 blur-[100px] rounded-full"></div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-6 md:p-12 shadow-2xl border border-white/30 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">

          {/* 🔥 LEFT SIDE */}
          <div className="max-w-xl">

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block px-4 py-1 text-xs font-semibold bg-white/60 backdrop-blur rounded-full text-emerald-700 shadow"
            >
              ⚡ Fresh & Fast Delivery
            </motion.span>

            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight text-slate-900">
              Fresh groceries,
              <br />
              <span className="text-emerald-600">ultra-fast delivery</span>
            </h1>

            <p className="mt-4 text-slate-600 text-lg">
              Order fruits, vegetables & daily essentials with lightning-fast delivery at your doorstep.
            </p>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToProducts}
              className="mt-6 px-7 py-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-2"
            >
              Shop Now
              <span>→</span>
            </motion.button>

            {/* FEATURES */}
            <div className="flex gap-6 mt-6 text-sm text-slate-600 flex-wrap">
              <div className="flex items-center gap-2">🚚 10-30 mins</div>
              <div className="flex items-center gap-2">🌱 Fresh Quality</div>
              <div className="flex items-center gap-2">💰 Best Prices</div>
            </div>
          </div>

          {/* 🖼 RIGHT SIDE */}
          <div className="relative flex items-center justify-center">

            {/* Floating Circle */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute w-56 h-56 bg-emerald-200/40 rounded-full blur-2xl"
            ></motion.div>

            {/* USER IMAGE (UNCHANGED FORMAT) */}
            <div className="relative z-10 w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <span className="text-4xl font-bold text-emerald-700">
                    {(user?.name || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Glow behind avatar */}
            <div className="absolute w-64 h-64 bg-emerald-400/30 blur-3xl rounded-full -z-10"></div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default HeroBanner;