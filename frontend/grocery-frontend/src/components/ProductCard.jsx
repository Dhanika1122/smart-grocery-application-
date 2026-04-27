import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

function ProductCard({ product, addToCart, highlight }) {
  const [adding, setAdding] = useState(false);
  const cardRef = useRef(null);

  const imageSrc = useMemo(() => {
    return product.image || "https://via.placeholder.com/140";
  }, [product.image]);

  const onAdd = async () => {
    try {
      setAdding(true);
      await addToCart(product.id);
    } finally {
      setAdding(false);
    }
  };

  // 🔥 Auto scroll + highlight
  useEffect(() => {
    if (highlight) {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlight]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: highlight ? 1.05 : 1,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`group relative rounded-3xl p-[1px] 
        ${highlight
          ? "bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-200 shadow-xl"
          : "bg-gradient-to-r from-emerald-400/90 via-emerald-200/55 to-amber-200/85"
        }`}
    >
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-white/75 backdrop-blur-xl shadow-sm p-5 text-center">
        
        {/* IMAGE */}
        <motion.div
          whileHover={{ filter: "saturate(1.2)", y: -2 }}
          className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-2xl bg-white/80 shadow-sm flex items-center justify-center"
        >
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* NAME */}
        <h3 className="text-[15px] md:text-[16px] font-semibold text-slate-900">
          {product.name}
        </h3>

        {/* CATEGORY */}
        <p className="text-xs text-slate-500 mt-1">
          {product.category}
        </p>

        {/* PRICE */}
        <div className="mt-3">
          <p className="text-lg font-extrabold text-emerald-700">
            ₹{product.price}
          </p>
        </div>

        {/* BUTTON */}
        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.98 }}
          disabled={adding}
          className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-md hover:shadow-lg transition"
        >
          <ShoppingCart size={16} />
          {adding ? "Adding..." : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ProductCard;