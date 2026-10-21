"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Users,
  Plus,
  Phone,
  MapPin,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { Customer, PaymentMethod } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    creditLimit: 5000,
  });

  // Collect form
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>("CASH");
  const [collectNotes, setCollectNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      creditLimit: 5000,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenCollect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCollectAmount(customer.outstandingBalance > 0 ? customer.outstandingBalance : 0);
    setCollectMethod("CASH");
    setCollectNotes("");
    setIsCollectModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create customer");

      toast.success(`Customer "${formData.name}" profile created`);
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (collectAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer._id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: collectAmount,
          paymentMethod: collectMethod,
          notes: collectNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment recording failed");

      toast.success(
        `Collected ${formatCurrency(collectAmount)} from ${selectedCustomer.name}! Credit balance updated.`
      );
      setIsCollectModalOpen(false);
      fetchCustomers();
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
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Customer Accounts & Credit Ledgers</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain regular retail customer accounts, credit limits, and collect payments.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/30 transition hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer Account</span>
          </button>
        </div>

        {/* Customer Accounts Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Fetching customer accounts...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No customers registered</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Address</th>
                    <th className="py-3 px-3">Credit Limit</th>
                    <th className="py-3 px-3">Outstanding Credit Balance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c._id.toString()} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name}</p>
                            {c.isWalkIn && (
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                Default Walk-In
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{c.phone}</td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{c.address || "—"}</td>
                      <td className="py-3 px-3 text-slate-600">{formatCurrency(c.creditLimit)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold text-sm ${
                            c.outstandingBalance > 0 ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          {formatCurrency(c.outstandingBalance)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!c.isWalkIn && (
                          <button
                            onClick={() => handleOpenCollect(c)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                          >
                            Collect Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add Customer Account</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Hotel Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hotel Green Leaf / Sharma Family"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Address / Colony</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Flat 402, Royal Palms / Sector 14"
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
                  {isSubmitting ? "Creating..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Customer Payment Modal */}
      {isCollectModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Collect Credit Due</h2>
                <p className="text-[11px] text-slate-500">
                  {selectedCustomer.name} • Total Outstanding:{" "}
                  <strong className="text-amber-700">{formatCurrency(selectedCustomer.outstandingBalance)}</strong>
                </p>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Collected (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Receipt Remarks</label>
                <input
                  type="text"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="e.g. Settle monthly restaurant vegetable bill"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || collectAmount <= 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Confirm Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
