import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import HeroBanner from "../components/HeroBanner";
import CategoryBar from "../components/CategoryBar";
import AIRecommendation from "../components/AIRecommendation";
import RecommendedProducts from "../components/RecommendedProducts";
import PromoSection from "../components/PromoSection";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const categoryRef = useRef(null);

  // ✅ 🔥 ADD THIS (missing earlier)
  const productRef = useRef(null);

  // 🔥 GET SEARCH FROM URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get("search") || "";

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

  // 🔥 FILTER LOGIC
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

      {/* ✅ HERO SCROLL FIX */}
      <HeroBanner
        scrollToProducts={() => {
          productRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />

      {/* Categories */}
      <div ref={categoryRef}>
        <CategoryBar setCategory={setCategory} />
      </div>

      <PromoSection />
      <RecommendedProducts />
      <AIRecommendation />

      {/* ✅ ATTACH REF HERE */}
      <h1 ref={productRef} className="mt-8 text-xl font-bold">
        Products
      </h1>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              highlight={index === 0 && search}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductPage;