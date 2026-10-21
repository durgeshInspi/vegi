"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  ReceiptText,
  Plus,
  Filter,
  CreditCard,
  X,
  Loader2,
  Calendar,
  Wallet,
} from "lucide-react";
import { Expense, ExpenseCategory, PaymentMethod } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCat, setSelectedCat] = useState("ALL");

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCat !== "ALL") params.append("categoryId", selectedCat);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setExpenses(data.items);
      }
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCat]);

  useEffect(() => {
    fetchExpenses();
    fetch("/api/expenses/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) {
          setCategories(d.categories);
          if (d.categories.length > 0) setCategoryId(d.categories[0]._id.toString());
        }
      });
  }, [fetchExpenses]);

  const handleOpenAdd = () => {
    if (categories.length > 0) setCategoryId(categories[0]._id.toString());
    setTitle("");
    setAmount(0);
    setPaymentMethod("UPI");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      toast.error("Please enter a valid title and positive amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          title,
          amount,
          paymentMethod,
          date,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record expense");

      toast.success(`Expense "${title}" of ${formatCurrency(amount)} recorded!`);
      setIsAddModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-emerald-600" />
              <span>Shop Operating Expenses</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record daily and monthly overheads (shop rent, electricity, Mandi freight, employee wages, packaging bags).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <span className="text-slate-500">Total Recorded Overheads: </span>
              <strong className="text-slate-900 font-bold">{formatCurrency(totalExpense)}</strong>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter by Overhead Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Overhead Categories</option>
            {categories.map((c) => (
              <option key={c._id.toString()} value={c._id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Loading expense records...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No expenses recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Title / Expense Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Amount (₹)</th>
                    <th className="py-3 px-3">Payment Method</th>
                    <th className="py-3 px-3">Notes</th>
                    <th className="py-3 px-4 text-right">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e._id.toString()} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 text-slate-500 font-mono">{formatDate(e.date)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{e.title}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {e.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                          {e.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{e.notes || "—"}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{e.recorderName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add Operating Expense</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly shop rent / Tempo diesel & freight"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Overhead Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c._id.toString()} value={c._id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card / NetBanking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Bill Memo</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid to Landlord Mr. Gupta / Electricity bill meter #44"
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
                  disabled={isSubmitting || amount <= 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
