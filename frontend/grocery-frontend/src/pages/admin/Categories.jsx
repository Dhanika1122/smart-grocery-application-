import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import LoaderSkeleton from "../../components/admin/LoaderSkeleton";
import { Plus, Edit2, Trash2, Upload, Power, X, FolderTree, Package } from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    active: true,
    displayOrder: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/api/admin/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      image: "",
      active: true,
      displayOrder: categories.length + 1,
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      image: cat.image || "",
      active: cat.active,
      displayOrder: cat.displayOrder || 0,
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

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      displayOrder: Number(formData.displayOrder),
    };

    try {
      setSavingForm(true);
      if (editingCategory) {
        await API.put(`/api/admin/categories/${editingCategory.id}`, payload);
        toast.success("Category updated successfully");
      } else {
        await API.post("/api/admin/categories", payload);
        toast.success("Category created successfully");
      }
      setShowFormModal(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSavingForm(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (cat) => {
    try {
      await API.put(`/api/admin/categories/${cat.id}/status?active=${!cat.active}`);
      toast.success(`Category '${cat.name}' ${!cat.active ? "activated" : "deactivated"}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // Delete Category (Safe)
  const handleDeleteCategory = async (cat) => {
    if (cat.productCount > 0) {
      toast.warning(`Cannot delete '${cat.name}' because ${cat.productCount} product(s) are assigned to it. Reassign products or deactivate the category.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category '${cat.name}'?`)) return;

    try {
      await API.delete(`/api/admin/categories/${cat.id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  if (loading) return <LoaderSkeleton variant="page" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Category Management
          </h1>
          <p className="mt-1 text-sm text-slate-700/70 dark:text-white/60">
            Create, edit, and organize product categories displayed on the customer website.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-md hover:shadow-lg transition"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.length === 0 ? (
          <div className="col-span-full rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] p-8 text-center text-slate-500">
            No categories found. Click "Add Category" to create your first category.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] backdrop-blur-xl shadow-[var(--shadow)] p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-12 h-12 object-cover rounded-2xl border border-white/20 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
                        <FolderTree size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.active
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {cat.active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Order: {cat.displayOrder}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(cat)}
                    title={cat.active ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-xl border transition shrink-0 ${
                      cat.active
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                        : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                    }`}
                  >
                    <Power size={16} />
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Package size={14} /> Assigned Products:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.productCount} items
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vegetables, Dairy, Bakery"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl px-4 py-2.5 text-sm bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category Image
                </label>
                <div className="flex items-center gap-3">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-400">
                      <FolderTree size={20} />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Image URL or upload file"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 rounded-2xl px-3 py-2 text-xs bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCategoryCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="activeCategoryCheck" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Active (visible in customer Shop by Category)
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
                  {savingForm ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
