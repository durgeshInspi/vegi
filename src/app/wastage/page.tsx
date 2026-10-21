"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Trash2,
  Plus,
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  RotateCw,
} from "lucide-react";
import { Wastage, WastageReason, Vegetable } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function WastagePage() {
  const [wastageList, setWastageList] = useState<Wastage[]>([]);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVegId, setSelectedVegId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<WastageReason>("SPOILED");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchWastage = useCallback(async () => {
    try {
      const res = await fetch("/api/wastage");
      const data = await res.json();
      if (data.items) {
        setWastageList(data.items);
      }
    } catch {
      toast.error("Failed to load wastage records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/wastage").then((r) => r.json()),
      fetch("/api/vegetables?limit=100").then((r) => r.json()),
    ])
      .then(([wastageData, vegData]) => {
        if (!isMounted) return;
        if (wastageData?.items) setWastageList(wastageData.items);
        if (vegData?.items) {
          setVegetables(vegData.items);
          if (vegData.items.length > 0) setSelectedVegId(vegData.items[0]._id.toString());
        }
      })
      .catch(() => {
        if (isMounted) toast.error("Failed to load wastage data");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVeg = vegetables.find((v) => v._id.toString() === selectedVegId);
  const estimatedLoss = selectedVeg ? (Number(quantity) || 0) * selectedVeg.purchasePrice : 0;

  const handleSaveWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVegId || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wastage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vegetableId: selectedVegId,
          quantity,
          reason,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record wastage");

      toast.success(`Recorded ${quantity} ${selectedVeg?.unit} wastage for ${selectedVeg?.name}`);
      setIsModalOpen(false);
      setQuantity(1);
      setNotes("");
      fetchWastage();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalLoss = wastageList.reduce((sum, w) => sum + w.totalLossValue, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Produce Spoilage & Wastage Tracking</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Log damaged, wilted, or unsellable stock. Automatically deducts from inventory and calculates cost loss.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
              <span className="text-slate-500">Cumulative Loss: </span>
              <strong className="text-rose-700 font-bold">{formatCurrency(totalLoss)}</strong>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Spoilage / Wastage</span>
            </button>
          </div>
        </div>

        {/* Wastage Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
              <p className="text-xs">Loading wastage logs...</p>
            </div>
          ) : wastageList.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Trash2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Zero wastage logged</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Vegetable</th>
                    <th className="py-3 px-3">Quantity Lost</th>
                    <th className="py-3 px-3">Cost Basis (per unit)</th>
                    <th className="py-3 px-3">Total Value Loss</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Notes</th>
                    <th className="py-3 px-4 text-right">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wastageList.map((w) => (
                    <tr key={w._id.toString()} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono">{formatDate(w.date)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{w.vegetableName}</td>
                      <td className="py-3 px-3 font-bold text-rose-600">
                        {w.quantity} {w.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatCurrency(w.costBasis)}</td>
                      <td className="py-3 px-3 font-bold text-rose-700">
                        {formatCurrency(w.totalLossValue)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                          {w.reason}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{w.notes || "—"}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{w.recorderName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Wastage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Log Produce Spoilage / Wastage</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWastage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Vegetable Produce *</label>
                <select
                  value={selectedVegId}
                  onChange={(e) => setSelectedVegId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {vegetables.map((v) => (
                    <option key={v._id.toString()} value={v._id.toString()}>
                      {v.name} (Stock: {v.stockQuantity} {v.unit} @ ₹{v.purchasePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Lost *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Unit: {selectedVeg?.unit || "kg"}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calculated Loss (₹)</label>
                  <div className="px-3 py-2 bg-rose-50 text-rose-800 font-bold rounded-xl border border-rose-200 text-xs">
                    {formatCurrency(estimatedLoss)}
                  </div>
                  <span className="text-[10px] text-slate-400">@ Cost ₹{selectedVeg?.purchasePrice}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Spoilage *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WastageReason)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="SPOILED">Spoiled / Overripe / Rotted</option>
                  <option value="DAMAGED">Damaged in Transit / Crushed</option>
                  <option value="QUALITY_LOSS">Quality Loss / Wilted Greens</option>
                  <option value="PEST_DAMAGE">Pest / Insect Damage</option>
                  <option value="EXPIRED">Expired Shelf-Life</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks & Details</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Excessive humidity caused mold on bottom crate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || quantity <= 0}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Logging..." : "Confirm Wastage Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
