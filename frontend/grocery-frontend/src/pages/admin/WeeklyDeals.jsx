import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import { Plus, Edit2, Trash2, Package, Upload, Check, X, Search, Power } from "lucide-react";

export default function WeeklyDeals() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeProductDeal, setActiveProductDeal] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    discountPercentage: 10,
    startDate: "",
    endDate: "",
    active: true,
    displayOrder: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  // Product Selection State
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [savingProducts, setSavingProducts] = useState(false);

  // Fetch Deals & Products
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dealsRes, prodRes] = await Promise.all([
        API.get("/api/admin/deals"),
        API.get("/products"),
      ]);
      setDeals(dealsRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDeal(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      discountPercentage: 10,
      startDate: "",
      endDate: "",
      active: true,
      displayOrder: 0,
    });
    setShowFormModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || "",
      description: deal.description || "",
      image: deal.image || "",
      discountPercentage: deal.discountPercentage || 0,
      startDate: deal.startDate ? deal.startDate.substring(0, 16) : "",
      endDate: deal.endDate ? deal.endDate.substring(0, 16) : "",
      active: deal.active,
      displayOrder: deal.displayOrder || 0,
    });
    setShowFormModal(true);
  };

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setUploadingImage(true);
      const res = await API.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.secure_url) {
        setFormData((prev) => ({ ...prev, image: res.data.secure_url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Image upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Deal Form
  const handleSaveDeal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      ...formData,
      discountPercentage: Number(formData.discountPercentage),
      displayOrder: Number(formData.displayOrder),
      startDate: formData.startDate ? formData.startDate : null,
      endDate: formData.endDate ? formData.endDate : null,
    };

    try {
      setSavingForm(true);
      if (editingDeal) {
        await API.put(`/api/admin/deals/${editingDeal.id}`, payload);
        toast.success("Deal updated successfully");
      } else {
        await API.post("/api/admin/deals", payload);
        toast.success("Deal created successfully");
      }
      setShowFormModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save deal");
    } finally {
      setSavingForm(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (deal) => {
    try {
      await API.put(`/api/admin/deals/${deal.id}/status?active=${!deal.active}`);
      toast.success(`Deal ${!deal.active ? "activated" : "deactivated"}`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update deal status");
    }
  };

  // Delete Deal
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      await API.delete(`/api/admin/deals/${dealId}`);
      toast.success("Deal deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete deal");
    }
  };

  // Manage Products Modal
  const handleOpenManageProducts = (deal) => {
    setActiveProductDeal(deal);
    const assignedIds = (deal.products || []).map((p) => p.id);
    setSelectedProductIds(assignedIds);
    setSearchProductQuery("");
    setShowProductModal(true);
  };

  const handleToggleProductSelection = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveAssignedProducts = async () => {
    if (!activeProductDeal) return;
    try {
      setSavingProducts(true);
      // We send the full selected array to add/update
      await API.post(`/api/admin/deals/${activeProductDeal.id}/products`, {
        productIds: selectedProductIds,
      });

      // If any existing product was un-selected, we remove them individually or sync
      const currentAssigned = (activeProductDeal.products || []).map((p) => p.id);
      const toRemove = currentAssigned.filter((id) => !selectedProductIds.includes(id));
      for (const removeId of toRemove) {
        await API.delete(`/api/admin/deals/${activeProductDeal.id}/products/${removeId}`);
      }

      toast.success("Products updated for deal");
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update assigned products");
    } finally {
      setSavingProducts(false);
    }
  };

  const filteredProductsList = useMemo(() => {
    if (!searchProductQuery) return products;
    const q = searchProductQuery.toLowerCase();
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [products, searchProductQuery]);

  if (loading) return <LoaderSkeleton variant="page" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Weekly Deals & Offers
          </h1>
          <p className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Create, manage, and assign products to homepage promotional deals.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-md hover:shadow-lg transition"
        >
          <Plus size={18} /> Create New Deal
        </button>
      </div>

      {error && (
        <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Deals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {deals.length === 0 ? (
          <div className="col-span-full rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] p-8 text-center text-slate-500">
            No deals found. Click "Create New Deal" to add your first promotion.
          </div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={deal.title}
                        className="w-14 h-14 object-cover rounded-2xl border border-white/20"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-xl">
                        {deal.discountPercentage}%
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {deal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            deal.active
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {deal.active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {deal.discountPercentage}% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(deal)}
                    title={deal.active ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-xl border transition ${
                      deal.active
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                    }`}
                  >
                    <Power size={16} />
                  </button>
                </div>

                {deal.description && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {deal.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-white/10 text-xs space-y-1 text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Assigned Products:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {deal.productCount || 0} items
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Display Order:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {deal.displayOrder}
                    </span>
                  </div>
                  {deal.startDate && (
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span>{new Date(deal.startDate).toLocaleString()}</span>
                    </div>
                  )}
                  {deal.endDate && (
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span>{new Date(deal.endDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => handleOpenManageProducts(deal)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition"
                >
                  <Package size={14} /> Products
                </button>
                <button
                  onClick={() => handleOpenEdit(deal)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteDeal(deal.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingDeal ? "Edit Weekly Deal" : "Create New Weekly Deal"}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% OFF Vegetables"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Fresh farm vegetables delivered fast"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deal Banner Image
                </label>
                <div className="flex items-center gap-3">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="Image URL or upload file"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 rounded-2xl px-4 py-2 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
                    <Upload size={14} />
                    {uploadingImage ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    className="w-full rounded-2xl px-4 py-2.5 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full rounded-2xl px-4 py-2.5 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-2xl px-3 py-2 text-xs bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-2xl px-3 py-2 text-xs bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="activeCheck" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Active (visible on website if within valid date range)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-500/20 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingForm}
                  className="px-5 py-2 rounded-2xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  {savingForm ? "Saving..." : "Save Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE PRODUCTS MODAL */}
      {showProductModal && activeProductDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] p-6 shadow-2xl space-y-4 my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Manage Products: {activeProductDeal.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Select existing products from catalogue to include in this deal ({selectedProductIds.length} selected).
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                className="w-full rounded-2xl pl-9 pr-4 py-2 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
              />
            </div>

            {/* Product list with check boxes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredProductsList.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-500">
                  No products found.
                </div>
              ) : (
                filteredProductsList.map((product) => {
                  const isChecked = selectedProductIds.includes(product.id);
                  const offerPrice = Math.max(
                    0,
                    Math.round(product.price * (1 - activeProductDeal.discountPercentage / 100) * 100) / 100
                  );

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleToggleProductSelection(product.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/40"
                          : "bg-white/30 dark:bg-white/5 border-white/20 hover:bg-white/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-400"
                          }`}
                        >
                          {isChecked && <Check size={14} />}
                        </div>
                        <img
                          src={product.image || "https://via.placeholder.com/50"}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xl"
                        />
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {product.category} • Stock: {product.stock}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs line-through text-slate-400">₹{product.price}</div>
                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          Offer: ₹{offerPrice}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-500/20 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignedProducts}
                disabled={savingProducts}
                className="px-5 py-2 rounded-2xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                {savingProducts ? "Saving..." : "Save Assigned Products"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
