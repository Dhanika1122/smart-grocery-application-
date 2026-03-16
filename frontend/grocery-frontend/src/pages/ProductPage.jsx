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

  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
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

    <div style={{ padding: "30px" }}>

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
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px",
        marginTop: "20px"
      }}>

        {filteredProducts.map((product) => (

          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />

        ))}

      </div>

    </div>

  );

}

export default ProductPage;