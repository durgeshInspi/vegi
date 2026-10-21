"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Receipt,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Printer,
  X,
  Loader2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Sale } from "@/types";
import { toast } from "sonner";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchInvoice, setSearchInvoice] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Sale for viewing/printing/cancelling
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchInvoice.trim()) params.append("searchInvoice", searchInvoice.trim());
      if (paymentStatus !== "ALL") params.append("paymentStatus", paymentStatus);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/sales?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setSales(data.items);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch {
      toast.error("Failed to load sales invoices");
    } finally {
      setIsLoading(false);
    }
  }, [searchInvoice, paymentStatus, page]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleCancelSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/sales/${selectedSale._id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel sale");

      toast.success(`Sale ${selectedSale.invoiceNumber} cancelled & stock restored!`);
      setIsCancelModalOpen(false);
      setSelectedSale(null);
      fetchSales();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Sales Ledger & Invoices</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable records of completed customer sales, payment breakdown, and cancellations.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice number (e.g. SALE-2026-000001)..."
              value={searchInvoice}
              onChange={(e) => {
                setSearchInvoice(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="UNPAID">UNPAID (Credit)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Fetching sales records...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No sales transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Items Count</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((sale) => (
                    <tr key={sale._id.toString()} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{sale.invoiceNumber}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDateTime(sale.createdAt)}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{sale.customerName}</td>
                      <td className="py-3 px-3 text-slate-500">{sale.items.length} produce items</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(sale.totalAmount)}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            sale.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : sale.paymentStatus === "PARTIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            sale.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            title="View / Print Receipt"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {sale.status !== "CANCELLED" && (
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setCancelReason("");
                                setIsCancelModalOpen(true);
                              }}
                              title="Cancel & Restore Stock"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* View Bill Receipt Modal */}
      {selectedSale && !isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Receipt Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="print-receipt-container font-mono text-[11px] space-y-2 p-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">VegiFresh Market</h3>
                <p className="text-[10px] text-slate-500">Mandi Fresh Wholesale & Retail</p>
                <p className="text-[10px] text-slate-500">GST: 07AAAAA0000A1Z5</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-1.5">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">{selectedSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDateTime(selectedSale.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{selectedSale.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{selectedSale.cashierName}</span>
                </div>
              </div>

              <div className="space-y-1 py-1 border-b border-dashed border-slate-300">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div>
                      <span className="font-semibold">{item.vegetableName}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {item.quantity} {item.unit} @ ₹{item.sellingPrice}
                      </span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>NET TOTAL:</span>
                  <span>{formatCurrency(selectedSale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Paid ({selectedSale.paymentMethod}):</span>
                  <span>{formatCurrency(selectedSale.amountPaid)}</span>
                </div>
                {selectedSale.balanceDue > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-rose-600">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(selectedSale.balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Sale Modal */}
      {isCancelModalOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Cancel Sale Invoice: {selectedSale.invoiceNumber}</span>
              </h2>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSale} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Cancelling this invoice will automatically:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 text-[11px]">
                <li>Replenish vegetable inventory for all {selectedSale.items.length} items.</li>
                <li>Record sales-return stock movement audit records.</li>
                {selectedSale.balanceDue > 0 && <li>Reverse customer outstanding credit ledger balance.</li>}
              </ul>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Cancellation *</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer returned items / entered wrong tender"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !cancelReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isProcessing ? "Processing Return..." : "Confirm Return & Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
