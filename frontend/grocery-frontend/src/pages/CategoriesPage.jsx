import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FolderTree, Search, ChevronRight, PackageX, RefreshCw, AlertCircle, ShoppingBag } from "lucide-react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

const categoryIconMap = {
  All: "🟢",
  Fruits: "🍎",
  Vegetables: "🥦",
  Dairy: "🥛",
  Bakery: "🥐",
  Meat: "🍗",
  Drinks: "🥤",
  Beverages: "🥤",
  Organic: "🍃",
  Snacks: "🍿",
  "Personal Care": "🧴",
  Household: "🧹",
};

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [productError, setProductError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const urlCategoryParam = searchParams.get("category");

  // Step 1: Fetch active categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoryError("");
    try {
      const res = await API.get("/api/categories");
      const activeCats = Array.isArray(res.data) ? res.data : [];
      setCategories(activeCats);

      if (activeCats.length > 0) {
        // Resolve category from URL param (by ID or Name), or default to first
        let initialCat = null;
        if (urlCategoryParam) {
          initialCat = activeCats.find(
            (c) =>
              String(c.id) === String(urlCategoryParam) ||
              c.name.toLowerCase() === urlCategoryParam.toLowerCase()
          );
        }
        if (!initialCat) {
          initialCat = activeCats[0];
        }
        setSelectedCategory(initialCat);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategoryError("Unable to load categories. Please check your connection and try again.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Step 2: Fetch products when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsForCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchProductsForCategory = async (category) => {
    setLoadingProducts(true);
    setProductError("");
    try {
      // Use categoryId or category name parameter
      const res = await API.get(`/products?categoryId=${category.id}`);
      let fetchedProducts = Array.isArray(res.data) ? res.data : [];
      
      // Fallback client filter if backend returns broader set
      if (fetchedProducts.length > 0 && category.name) {
        const matchesCat = fetchedProducts.every(
          (p) => (p.category || "").toLowerCase() === category.name.toLowerCase()
        );
        if (!matchesCat) {
          fetchedProducts = fetchedProducts.filter(
            (p) => (p.category || "").toLowerCase() === category.name.toLowerCase()
          );
        }
      }

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Failed to fetch products for category:", err);
      // Fallback attempt with category name if categoryId query is unsupported
      try {
        const resFallback = await API.get("/products");
        const allProds = Array.isArray(resFallback.data) ? resFallback.data : [];
        const filtered = allProds.filter(
          (p) => (p.category || "").toLowerCase() === category.name.toLowerCase()
        );
        setProducts(filtered);
      } catch (fallbackErr) {
        console.error("Fallback product fetch failed:", fallbackErr);
        setProductError("Unable to load products for this category. Please try again.");
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle category selection without page reload
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSearchQuery("");
    // Update URL query parameter cleanly while keeping user on /categories
    setSearchParams({ category: category.id }, { replace: true });
  };

  const addToCart = async (productId) => {
    try {
      await API.post("/cart", {
        productId: productId,
        quantity: 1,
      });
      alert("Added to cart 🛒");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error?.response?.data?.message || "Failed to add product to cart");
    }
  };

  // Filter products by optional search query within right side panel
  const displayedProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-4 sm:px-6 lg:px-10 py-8 transition-colors">
      
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            <FolderTree size={16} />
            <span>Category Browser</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore All Categories
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Select a category to view fresh available groceries and add items to your cart instantly.
          </p>
        </div>

        {/* Quick Search within current category */}
        {selectedCategory && (
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              placeholder={`Search in ${selectedCategory.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 py-2.5 pl-10 pr-4 text-sm outline-none shadow-sm transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Loading Skeleton */}
      {loadingCategories ? (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      ) : categoryError ? (
        /* Error State */
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 dark:bg-rose-950/30 dark:border-rose-900/50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
            <AlertCircle size={28} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Unable to load categories</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{categoryError}</p>
          <button
            onClick={fetchCategories}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : categories.length === 0 ? (
        /* Zero Categories Available */
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600">
            <FolderTree size={32} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No categories available</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check back soon for freshly updated grocery categories.</p>
        </div>
      ) : (
        /* Two-Panel Layout */
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* MOBILE: Horizontal Scrollable Bar */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-2 scrollbar-none flex gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const iconEmoji = categoryIconMap[cat.name] || "🛒";

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-bold transition-all shrink-0 border
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-md scale-[1.02]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-white/20 text-base shrink-0">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                    ) : (
                      iconEmoji
                    )}
                  </div>
                  <span>{cat.name}</span>
                  {typeof cat.productCount === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {cat.productCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* DESKTOP: Left Sidebar Panel */}
          <div className="hidden lg:block sticky top-24 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur-xl">
            <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Categories</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                {categories.length} active
              </span>
            </div>

            <div className="mt-2 space-y-1.5 max-h-[calc(100vh-160px)] overflow-y-auto pr-1 scrollbar-thin">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                const iconEmoji = categoryIconMap[cat.name] || "🛒";

                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left flex items-center justify-between rounded-2xl p-3 text-sm font-semibold transition-all border
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white border-transparent shadow-md shadow-emerald-500/20"
                          : "bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center text-lg shrink-0 border
                          ${
                            isSelected
                              ? "bg-white/20 border-white/30 text-white"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300"
                          }`}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          iconEmoji
                        )}
                      </div>
                      <span className="truncate font-bold">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {typeof cat.productCount === "number" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {cat.productCount}
                        </span>
                      )}
                      <ChevronRight
                        size={15}
                        className={`transition-transform ${isSelected ? "text-white opacity-90" : "text-slate-400 opacity-40"}`}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: Products Section */}
          <div className="min-w-0">
            {selectedCategory && (
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 md:p-6 shadow-sm backdrop-blur-xl mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden flex items-center justify-center text-2xl bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">
                    {selectedCategory.image ? (
                      <img src={selectedCategory.image} alt={selectedCategory.name} className="h-full w-full object-cover" />
                    ) : (
                      categoryIconMap[selectedCategory.name] || "🛒"
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {selectedCategory.name}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Showing products available in this category
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
                  <ShoppingBag size={15} />
                  <span>{displayedProducts.length} Products</span>
                </div>
              </div>
            )}

            {/* Product Loading State */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : productError ? (
              /* Product Error State */
              <div className="rounded-3xl border border-rose-200 bg-rose-50/80 dark:bg-rose-950/30 dark:border-rose-900/50 p-8 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600">
                  <AlertCircle size={24} />
                </div>
                <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Unable to load products</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{productError}</p>
                <button
                  onClick={() => fetchProductsForCategory(selectedCategory)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              </div>
            ) : displayedProducts.length === 0 ? (
              /* Empty Category State */
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <PackageX size={32} />
                </div>
                <h3 className="mt-4 text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  No products available in this category yet.
                </h3>
                <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No items matching "${searchQuery}" in ${selectedCategory?.name}.`
                    : "We're restocking fresh items daily. Please select another category above."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      addToCart={addToCart}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
