"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Boxes,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Search,
  Loader2,
  PackagePlus,
  AlertTriangle,
  X,
} from "lucide-react";
import { StockMovement, StockMovementType, Vegetable } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function InventoryLedgerPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedMovement, setSelectedMovement] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedVegId, setSelectedVegId] = useState("");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMovement !== "ALL") params.append("movementType", selectedMovement);
      params.append("page", page.toString());
      params.append("limit", "25");

      const res = await fetch(`/api/inventory/movements?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setMovements(data.items);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch {
      toast.error("Failed to load stock movements");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMovement, page]);

  useEffect(() => {
    fetchMovements();
    fetch("/api/vegetables?limit=100")
      .then((r) => r.json())
      .then((d) => d.items && setVegetables(d.items));
  }, [fetchMovements]);

  const handleOpenAdjust = () => {
    if (vegetables.length > 0) {
      setSelectedVegId(vegetables[0]._id.toString());
    }
    setAdjustQty(0);
    setAdjustReason("Periodic shelf count audit");
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVegId || adjustQty === 0) {
      toast.error("Please specify a non-zero quantity delta");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vegetableId: selectedVegId,
          quantity: adjustQty,
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Adjustment failed");

      toast.success(`Inventory updated! New stock is ${data.newStock}`);
      setIsAdjustModalOpen(false);
      fetchMovements();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-600" />
              <span>Inventory Stock Ledger & Movement Audit</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete audit trail of every vegetable stock increment, decrement, sale, purchase inward, and wastage.
            </p>
          </div>

          <button
            onClick={handleOpenAdjust}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/30 transition hover:scale-[1.01]"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Manual Stock Adjustment</span>
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter By Movement Type:</span>
            <select
              value={selectedMovement}
              onChange={(e) => {
                setSelectedMovement(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Movements</option>
              <option value="PURCHASE_RECEIPT">PURCHASE_RECEIPT (Inward Wholesale)</option>
              <option value="SALE">SALE (Counter Outward)</option>
              <option value="WASTAGE">WASTAGE (Spoiled / Damaged)</option>
              <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT (Audits)</option>
              <option value="OPENING">OPENING (Initial Inventory)</option>
              <option value="SALES_RETURN">SALES_RETURN (Cancellations)</option>
            </select>
          </div>

          <button
            onClick={() => fetchMovements()}
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            title="Refresh Ledger"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Movements Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Loading stock ledger movements...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No stock movements found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-3">Vegetable</th>
                    <th className="py-3 px-3">Movement Type</th>
                    <th className="py-3 px-3">Quantity Delta</th>
                    <th className="py-3 px-3">Ref Invoice</th>
                    <th className="py-3 px-3">Reason / Description</th>
                    <th className="py-3 px-4 text-right">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m._id.toString()} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 text-slate-500 font-mono">{formatDateTime(m.createdAt)}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{m.vegetableName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              m.movementType === "PURCHASE_RECEIPT"
                                ? "bg-emerald-100 text-emerald-800"
                                : m.movementType === "SALE"
                                ? "bg-blue-100 text-blue-800"
                                : m.movementType === "WASTAGE"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {m.movementType}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span
                            className={`flex items-center gap-1 ${
                              isPositive ? "text-emerald-700" : "text-rose-600"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span>
                              {isPositive ? `+${m.quantity}` : m.quantity} {m.unit}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 font-medium">
                          {m.referenceInvoice || "—"}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-sm truncate">{m.reason}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{m.userName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

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

      {/* Manual Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Record Stock Adjustment</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Vegetable *</label>
                <select
                  value={selectedVegId}
                  onChange={(e) => setSelectedVegId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {vegetables.map((v) => (
                    <option key={v._id.toString()} value={v._id.toString()}>
                      {v.name} (Stock: {v.stockQuantity} {v.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity Delta (+ to increase, - to decrease) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5 or -10"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical inventory count correction"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || adjustQty === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Commit Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
