import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { Tag } from "lucide-react";

function PromoSection() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = ["bg-emerald-100/80 dark:bg-emerald-950/40", "bg-sky-100/80 dark:bg-sky-950/40", "bg-amber-100/80 dark:bg-amber-950/40", "bg-rose-100/80 dark:bg-rose-950/40"];

  useEffect(() => {
    setLoading(true);
    API.get("/api/deals")
      .then((res) => {
        setDeals(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load active weekly deals", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-6 mt-10">
        <h2 className="text-2xl font-bold mb-6">🔥 Weekly Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return null; // Gracefully hide section if no active deals exist
  }

  return (
    <div className="px-6 mt-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        🔥 Weekly Deals & Offers
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deals.map((deal, index) => {
          const colorClass = colors[index % colors.length];

          return (
            <div
              key={deal.id}
              className={`${colorClass} rounded-2xl p-6 shadow hover:shadow-lg transition flex flex-col justify-between relative overflow-hidden border border-slate-200/50 dark:border-white/10`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white mb-2 shadow-sm">
                    <Tag size={12} /> {deal.discountPercentage}% OFF
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                    {deal.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {deal.description || "Fresh farm produce at discounted prices!"}
                  </p>
                </div>

                {deal.image && (
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-16 h-16 object-cover rounded-xl border border-white/40 shadow-sm shrink-0"
                  />
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">
                  {deal.productCount || 0} products
                </span>
                <Link
                  to={`/deals/${deal.id}`}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PromoSection;