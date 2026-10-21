"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Carrot,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit,
  Archive,
  ArrowUpDown,
  Boxes,
  CheckCircle2,
  X,
  Loader2,
  PackagePlus,
  RotateCcw,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Vegetable, Category, UnitType } from "@/types";
import { toast } from "sonner";

export default function VegetablesPage() {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [currentVeg, setCurrentVeg] = useState<Vegetable | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unit: "kg" as UnitType,
    stockQuantity: 0,
    minimumStock: 10,
    purchasePrice: 0,
    sellingPrice: 0,
    imageUrl: "",
  });

  const [adjustData, setAdjustData] = useState({
    quantity: 0,
    reason: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const fetchVegetables = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("query", searchQuery.trim());
      if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/vegetables?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setVegetables(data.items);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch {
      toast.error("Failed to load vegetables");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, page]);

  useEffect(() => {
    fetchVegetables();
  }, [fetchVegetables]);

  useEffect(() => {
    // Load categories for dropdown
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      });
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      sku: `VEG-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: categories[0]?._id?.toString() || "",
      unit: "kg",
      stockQuantity: 50,
      minimumStock: 15,
      purchasePrice: 20,
      sellingPrice: 30,
      imageUrl: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (veg: Vegetable) => {
    setCurrentVeg(veg);
    setFormData({
      name: veg.name,
      sku: veg.sku,
      categoryId: veg.categoryId?.toString() || "",
      unit: veg.unit,
      stockQuantity: veg.stockQuantity,
      minimumStock: veg.minimumStock,
      purchasePrice: veg.purchasePrice,
      sellingPrice: veg.sellingPrice,
      imageUrl: veg.imageUrl || "",
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAdjust = (veg: Vegetable) => {
    setCurrentVeg(veg);
    setAdjustData({ quantity: 0, reason: "Physical stock audit count" });
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/vegetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create vegetable");

      toast.success(`Vegetable "${formData.name}" added successfully`);
      setIsAddModalOpen(false);
      fetchVegetables();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVeg) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/vegetables/${currentVeg._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update vegetable");

      toast.success("Vegetable updated successfully");
      setIsEditModalOpen(false);
      fetchVegetables();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVeg) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vegetableId: currentVeg._id,
          quantity: adjustData.quantity,
          reason: adjustData.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock");

      toast.success(`Stock adjusted! New stock: ${data.newStock} ${currentVeg.unit}`);
      setIsAdjustModalOpen(false);
      fetchVegetables();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"? It will be marked inactive.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/vegetables/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive vegetable");
      toast.success(`Vegetable "${name}" archived`);
      fetchVegetables();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Carrot className="w-5 h-5 text-emerald-600" />
              <span>Vegetable Catalog & Pricing</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage retail prices, wholesale costs, stock thresholds, and units.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/30 transition hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vegetable</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vegetable name or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id.toString()} value={c._id.toString()}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Stock Statuses</option>
              <option value="active">Active Only</option>
              <option value="low_stock">⚠️ Low Stock Alerts</option>
              <option value="out_of_stock">❌ Out of Stock</option>
              <option value="inactive">Archived / Inactive</option>
            </select>
          </div>
        </div>

        {/* Vegetables Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Fetching vegetables from database...</p>
            </div>
          ) : vegetables.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No vegetables match your criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Vegetable</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Purchase Cost</th>
                    <th className="py-3 px-3">Selling Price</th>
                    <th className="py-3 px-3">Profit Margin</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vegetables.map((veg) => {
                    const isLowStock = veg.stockQuantity <= veg.minimumStock && veg.stockQuantity > 0;
                    const isOutOfStock = veg.stockQuantity <= 0;
                    const margin =
                      veg.sellingPrice > 0
                        ? Math.round(((veg.sellingPrice - veg.purchasePrice) / veg.sellingPrice) * 100)
                        : 0;

                    return (
                      <tr key={veg._id.toString()} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={veg.imageUrl || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&q=80"}
                              alt={veg.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{veg.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">Unit: per {veg.unit}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 font-semibold">{veg.sku}</td>

                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {veg.categoryName || "General"}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span
                              className={`${
                                isOutOfStock
                                  ? "text-rose-600"
                                  : isLowStock
                                  ? "text-amber-600"
                                  : "text-slate-800"
                              }`}
                            >
                              {veg.stockQuantity} {veg.unit}
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                                Low
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded font-bold">
                                Out
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">Min: {veg.minimumStock} {veg.unit}</span>
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-600">
                          {formatCurrency(veg.purchasePrice)}
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900">
                          {formatCurrency(veg.sellingPrice)}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              margin > 25
                                ? "bg-emerald-100 text-emerald-800"
                                : margin > 10
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            +{margin}%
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              veg.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {veg.isActive ? "Active" : "Archived"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAdjust(veg)}
                              title="Quick Stock Adjustment"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(veg)}
                              title="Edit Vegetable"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {veg.isActive && (
                              <button
                                onClick={() => handleArchive(veg._id.toString(), veg.name)}
                                title="Archive"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Vegetable Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {isAddModalOpen ? "Add New Vegetable Produce" : `Edit ${formData.name}`}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vegetable Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Fresh Red Hybrid Tomato"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Item Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. VEG-TOM-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id.toString()} value={c._id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Type *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gram">gram</option>
                    <option value="piece">piece</option>
                    <option value="bunch">bunch</option>
                    <option value="crate">crate</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wholesale Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {isAddModalOpen && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Initial Opening Stock</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min. Stock Alert Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : isAddModalOpen ? "Save Vegetable" : "Update Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {isAdjustModalOpen && currentVeg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Adjust Stock: {currentVeg.name}</h2>
                <p className="text-[11px] text-slate-500">
                  Current Stock: <span className="font-bold text-slate-800">{currentVeg.stockQuantity} {currentVeg.unit}</span>
                </p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Delta (+ to add, - to subtract)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 5 or -2.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  New resulting stock:{" "}
                  <strong className="text-emerald-700">
                    {Math.max(0, currentVeg.stockQuantity + adjustData.quantity)} {currentVeg.unit}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Audit Adjustment *</label>
                <input
                  type="text"
                  required
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Physical inventory count correction"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || adjustData.quantity === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? "Adjusting..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
