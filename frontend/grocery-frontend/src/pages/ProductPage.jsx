import React, { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import HeroBanner from "../components/HeroBanner";
import SearchBar from "../components/SearchBar";
import CategoryBar from "../components/CategoryBar";
import AIRecommendation from "../components/AIRecommendation";
import RecommendedProducts from "../components/RecommendedProducts";
import PromoSection from "../components/PromoSection";

function ProductPage() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (productId) => {

    try {

      await API.post("/cart", {
        productId: productId,
        quantity: 1
      });

      alert("Added to cart 🛒");

    } catch (error) {
      console.log(error);
    }

  };

  // Filter products
  const filteredProducts = products.filter((product) => {

    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "All" || product.category === category;

    return matchSearch && matchCategory;

  });

  return (

    <div className="px-4 sm:px-6 lg:px-10 py-8">

      {/* Hero Banner */}
      <HeroBanner />

      {/* Search */}
      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      {/* Categories */}
      <CategoryBar
        setCategory={setCategory}
      />

<PromoSection />

      {/* Recommended Products */}
      <RecommendedProducts />

      {/* AI Recommendation */}
      <AIRecommendation />

      <h1 style={{ marginTop: "30px" }}>
        Products
      </h1>

      {/* Product Grid */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white/55 backdrop-blur-xl border border-white/60 p-5 shadow-sm animate-pulse"
            >
              <div className="mx-auto h-24 w-24 rounded-2xl bg-slate-200" />
              <div className="mt-4 h-3 w-3/4 bg-slate-200 rounded" />
              <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded" />
              <div className="mt-4 h-10 w-full bg-slate-200 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      )}

    </div>

  );

}

export default ProductPage;