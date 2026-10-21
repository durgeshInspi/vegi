"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  X,
  Trash2,
  CheckCircle2,
  Boxes,
  Loader2,
  Building2,
} from "lucide-react";
import { Purchase, Supplier, Vegetable, UnitType } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface NewPurchaseRow {
  vegetableId: string;
  quantity: number;
  purchasePrice: number;
  unit: UnitType;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // New Purchase form
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState<NewPurchaseRow[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [transportCharges, setTransportCharges] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/purchases");
      const data = await res.json();
      if (data.items) {
        setPurchases(data.items);
      }
    } catch {
      toast.error("Failed to load purchases");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
    // Load suppliers and vegetables for the form
    fetch("/api/suppliers")
      .then((r) => r.json())
      .then((d) => d.suppliers && setSuppliers(d.suppliers));

    fetch("/api/vegetables?limit=100")
      .then((r) => r.json())
      .then((d) => d.items && setVegetables(d.items));
  }, [fetchPurchases]);

  const handleOpenAdd = () => {
    if (suppliers.length === 0 || vegetables.length === 0) {
      toast.warning("Please ensure suppliers and vegetables exist first.");
      return;
    }
    setSupplierId(suppliers[0]?._id?.toString() || "");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setRows([
      {
        vegetableId: vegetables[0]?._id?.toString() || "",
        quantity: 50,
        purchasePrice: vegetables[0]?.purchasePrice || 20,
        unit: vegetables[0]?.unit || "kg",
      },
    ]);
    setDiscount(0);
    setTransportCharges(0);
    setAmountPaid(0);
    setPaymentMethod("UPI");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleAddRow = () => {
    const firstVeg = vegetables[0];
    setRows([
      ...rows,
      {
        vegetableId: firstVeg?._id?.toString() || "",
        quantity: 20,
        purchasePrice: firstVeg?.purchasePrice || 20,
        unit: firstVeg?.unit || "kg",
      },
    ]);
  };

  const handleRowChange = (index: number, field: keyof NewPurchaseRow, value: any) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i === index) {
          const updated = { ...r, [field]: value };
          if (field === "vegetableId") {
            const veg = vegetables.find((v) => v._id.toString() === value);
            if (veg) {
              updated.unit = veg.unit;
              updated.purchasePrice = veg.purchasePrice;
            }
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Computations
  const subtotal = rows.reduce((acc, r) => acc + (Number(r.quantity) || 0) * (Number(r.purchasePrice) || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(discount) || 0) + (Number(transportCharges) || 0));

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      toast.error("Please add at least one produce item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId,
        purchaseDate,
        items: rows,
        discount: Number(discount) || 0,
        transportCharges: Number(transportCharges) || 0,
        amountPaid: Number(amountPaid) || 0,
        paymentMethod,
        notes,
      };

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record purchase");

      toast.success(`Purchase ${data.purchase.invoiceNumber} recorded! Stock added.`);
      setIsAddModalOpen(false);
      fetchPurchases();
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
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Purchase Inward & Wholesale Receiving</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record bulk purchases from farmers and APMC wholesalers. Automatically increases stock.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/30 transition hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Purchase</span>
          </button>
        </div>

        {/* Purchases Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Fetching purchase invoices...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No inward purchases recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Supplier (Farmer/Mandi)</th>
                    <th className="py-3 px-3">Items Received</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Paid</th>
                    <th className="py-3 px-3">Balance Due</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((p) => (
                    <tr key={p._id.toString()} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.invoiceNumber}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(p.purchaseDate)}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{p.supplierName}</td>
                      <td className="py-3 px-3 text-slate-500">{p.items.length} items</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(p.totalAmount)}</td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">{formatCurrency(p.amountPaid)}</td>
                      <td className="py-3 px-3 text-rose-600 font-bold">{formatCurrency(p.balanceDue)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.paymentStatus === "PARTIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPurchase(p)}
                          title="View Inward Bill"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Purchase Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Record Inward Vegetable Purchase</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s._id.toString()} value={s._id.toString()}>
                        {s.name} ({s.type}) — Due: ₹{s.currentBalance}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 text-xs">Produce Items Received</span>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {rows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex-1 min-w-[140px]">
                      <select
                        value={row.vegetableId}
                        onChange={(e) => handleRowChange(idx, "vegetableId", e.target.value)}
                        className="w-full p-1 border border-slate-200 rounded text-xs"
                      >
                        {vegetables.map((v) => (
                          <option key={v._id.toString()} value={v._id.toString()}>
                            {v.name} ({v.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        className="w-full p-1 border border-slate-200 rounded text-xs font-bold"
                      />
                    </div>

                    <span className="text-[11px] text-slate-500 w-10">{row.unit}</span>

                    <div className="w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={row.purchasePrice}
                        onChange={(e) => handleRowChange(idx, "purchasePrice", parseFloat(e.target.value) || 0)}
                        placeholder="Cost/unit"
                        className="w-full p-1 border border-slate-200 rounded text-xs font-bold text-slate-800"
                      />
                    </div>

                    <span className="w-20 text-right font-bold text-slate-900 text-xs">
                      {formatCurrency(row.quantity * row.purchasePrice)}
                    </span>

                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Adjustments & Totals */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mandi Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transport / Freight (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={transportCharges}
                    onChange={(e) => setTransportCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Bill Amount</label>
                  <div className="px-3 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-sm">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              </div>

              {/* Payment Settlement */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid Now (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Remaining Due:{" "}
                    <strong className="text-rose-600">{formatCurrency(Math.max(0, totalAmount - amountPaid))}</strong>
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank RTGS / NEFT</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / APMC Mandi Memo #</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Morning tempo batch from Nashik APMC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Receiving Stock..." : "Confirm Inward Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Inward Bill Receipt */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Inward Purchase Memo</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Memo</span>
                </button>
                <button onClick={() => setSelectedPurchase(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="font-mono text-[11px] space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
              <div className="border-b border-slate-200 pb-2">
                <div className="flex justify-between">
                  <span className="font-bold">Memo #:</span>
                  <span className="font-bold text-slate-900">{selectedPurchase.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplier:</span>
                  <span className="font-semibold">{selectedPurchase.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDate(selectedPurchase.purchaseDate)}</span>
                </div>
              </div>

              <div className="space-y-1 py-1 border-b border-slate-200">
                <div className="flex justify-between font-bold text-[10px] text-slate-500">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                {selectedPurchase.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <span>{item.vegetableName}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.quantity} {item.unit} @ ₹{item.purchasePrice}
                      </span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 pt-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedPurchase.subtotal)}</span>
                </div>
                {selectedPurchase.transportCharges > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Freight/Transport:</span>
                    <span>+{formatCurrency(selectedPurchase.transportCharges)}</span>
                  </div>
                )}
                {selectedPurchase.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedPurchase.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL BILL:</span>
                  <span>{formatCurrency(selectedPurchase.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedPurchase.amountPaid)}</span>
                </div>
                {selectedPurchase.balanceDue > 0 && (
                  <div className="flex justify-between text-[11px] text-rose-600 font-bold">
                    <span>Supplier Balance Due:</span>
                    <span>{formatCurrency(selectedPurchase.balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
