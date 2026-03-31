import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

function ProductCard({ product, addToCart }) {
  const [adding, setAdding] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group relative rounded-3xl p-[1px] bg-gradient-to-r from-emerald-400/90 via-emerald-200/55 to-amber-200/85"
    >
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-white/75 backdrop-blur-xl shadow-sm p-5 text-center">
        <motion.div
          whileHover={{ filter: "saturate(1.2)", y: -2 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-2xl bg-white/80 shadow-sm flex items-center justify-center"
        >
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </motion.div>

        <h3 className="text-[15px] md:text-[16px] font-semibold text-slate-900">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{product.category}</p>

        <div className="mt-3">
          <p className="text-lg font-extrabold text-emerald-700">
            ₹{product.price}
          </p>
        </div>

        <motion.button
          onClick={onAdd}
          whileTap={{ scale: 0.98 }}
          className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition"
          disabled={adding}
        >
          <ShoppingCart size={16} />
          {adding ? "Adding..." : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ProductCard;