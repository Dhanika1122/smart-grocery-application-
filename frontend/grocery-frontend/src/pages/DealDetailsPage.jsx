import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import { ShoppingCart, ArrowLeft, Tag, Calendar } from "lucide-react";

export default function DealDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    API.get(`/api/deals/${id}`)
      .then((res) => {
        setDeal(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || "This deal is unavailable, inactive, or has expired.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async (productId) => {
    try {
      setAddingId(productId);
      await API.post("/cart", {
        productId: productId,
        quantity: 1,
      });
      toast.success("Added to cart 🛒");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add product to cart. Please log in.");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-48 rounded-3xl bg-gray-200 animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 p-10 shadow-lg space-y-4">
          <Tag size={48} className="mx-auto text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-800">Deal Unavailable</h1>
          <p className="text-slate-600">{error || "The requested deal could not be found."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
          >
            <ArrowLeft size={18} /> Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const products = deal.products || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition"
        >
          <ArrowLeft size={16} /> Back to Homepage
        </button>
      </div>

      {/* Deal Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-white p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wide">
            <Tag size={14} /> {deal.discountPercentage}% OFF Deal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {deal.title}
          </h1>
          {deal.description && (
            <p className="text-emerald-50 text-base sm:text-lg">
              {deal.description}
            </p>
          )}

          {(deal.startDate || deal.endDate) && (
            <div className="flex items-center gap-2 text-xs text-emerald-100 pt-1">
              <Calendar size={14} />
              <span>
                Offer valid {deal.startDate ? `from ${new Date(deal.startDate).toLocaleDateString()}` : ""}{" "}
                {deal.endDate ? `until ${new Date(deal.endDate).toLocaleDateString()}` : ""}
              </span>
            </div>
          )}
        </div>

        {deal.image && (
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 shrink-0">
            <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Products in this deal ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 p-8 text-center text-slate-500">
            No products assigned to this deal currently. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-3xl p-[1px] min-w-0 bg-gradient-to-r from-emerald-400/90 via-emerald-200/55 to-amber-200/85 hover:scale-[1.02] transition duration-200"
              >
                <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-white/80 backdrop-blur-xl shadow-sm p-5 text-center flex flex-col justify-between">
                  <div>
                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                      {deal.discountPercentage}% OFF
                    </div>

                    {/* Image */}
                    <div className="mx-auto mb-3 h-28 w-28 overflow-hidden rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <img
                        src={product.image || "https://via.placeholder.com/140"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                  </div>

                  {/* Pricing & Cart Button */}
                  <div className="mt-4 pt-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs line-through text-slate-400">
                        ₹{product.originalPrice}
                      </span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        ₹{product.offerPrice}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingId === product.id}
                      className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-2xl px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-md hover:shadow-lg transition"
                    >
                      <ShoppingCart size={14} />
                      {addingId === product.id ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
