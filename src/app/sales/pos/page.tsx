"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  User,
  X,
  AlertCircle,
  Receipt,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Vegetable, Customer, Category, UnitType, Sale } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  vegetableId: string;
  name: string;
  unit: UnitType;
  sellingPrice: number;
  availableStock: number;
  quantity: number;
}

export default function PosBillingPage() {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in");
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "CREDIT">("CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Checkout & Receipt Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data
  const loadData = async () => {
    try {
      const [vegRes, catRes, custRes] = await Promise.all([
        fetch("/api/vegetables?limit=100&status=active"),
        fetch("/api/categories"),
        fetch("/api/customers"),
      ]);
      const vegData = await vegRes.json();
      const catData = await catRes.json();
      const custData = await custRes.json();

      if (vegData.items) setVegetables(vegData.items);
      if (catData.categories) setCategories(catData.categories);
      if (custData.customers) setCustomers(custData.customers);
    } catch {
      toast.error("Failed to load POS data");
    }
  };

  useEffect(() => {
    loadData();
    searchInputRef.current?.focus();
  }, []);

  // Filter vegetables
  const filteredVegetables = vegetables.filter((v) => {
    const matchesCategory =
      selectedCategory === "all" || v.categoryId?.toString() === selectedCategory;
    const matchesQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Cart operations
  const addToCart = (veg: Vegetable) => {
    if (veg.stockQuantity <= 0) {
      toast.error(`"${veg.name}" is currently out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.vegetableId === veg._id.toString());
      if (existing) {
        if (existing.quantity + 1 > veg.stockQuantity) {
          toast.warning(`Cannot add more than available stock (${veg.stockQuantity} ${veg.unit})`);
          return prev;
        }
        return prev.map((item) =>
          item.vegetableId === veg._id.toString()
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            vegetableId: veg._id.toString(),
            name: veg.name,
            unit: veg.unit,
            sellingPrice: veg.sellingPrice,
            availableStock: veg.stockQuantity,
            quantity: 1,
          },
        ];
      }
    });
  };

  const updateQuantity = (vegetableId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.vegetableId === vegetableId) {
            const newQty = Math.round((item.quantity + delta) * 10) / 10;
            if (newQty <= 0) return null;
            if (newQty > item.availableStock) {
              toast.warning(`Max available: ${item.availableStock} ${item.unit}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const setExplicitQuantity = (vegetableId: string, qty: number) => {
    if (qty <= 0) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.vegetableId === vegetableId) {
          if (qty > item.availableStock) {
            toast.warning(`Max available: ${item.availableStock} ${item.unit}`);
            return { ...item, quantity: item.availableStock };
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (vegetableId: string) => {
    setCart((prev) => prev.filter((item) => item.vegetableId !== vegetableId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCashTendered(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const totalAmount = Math.max(0, subtotal - (Number(discount) || 0));
  const changeDue = Math.max(0, cashTendered - totalAmount);

  // Selected customer details
  const selectedCustomer = customers.find((c) => c._id.toString() === selectedCustomerId);

  // Process Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paymentMethod === "CREDIT" && selectedCustomerId === "walk-in") {
      toast.error("Credit sales require a registered customer account!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomerId === "walk-in" ? null : selectedCustomerId,
        customerName: selectedCustomer ? selectedCustomer.name : "Walk-in Customer",
        customerPhone: selectedCustomer?.phone,
        items: cart.map((c) => ({
          vegetableId: c.vegetableId,
          quantity: c.quantity,
          sellingPrice: c.sellingPrice,
          unit: c.unit,
        })),
        discount: Number(discount) || 0,
        amountPaid: paymentMethod === "CREDIT" ? 0 : totalAmount,
        paymentMethod,
        notes: `POS Terminal Sale`,
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout transaction failed");
      }

      toast.success(`Sale completed! Invoice ${data.sale.invoiceNumber}`);
      setCompletedSale(data.sale);
      setIsReceiptOpen(true);
      clearCart();
      loadData(); // refresh remaining stock
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6.5rem)]">
        {/* Left Side: Produce Catalog & Fast Picker */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Search & Category Filter Bar */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Scan barcode or type vegetable name (e.g. Tomato, Palak, Potato)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Category horizontal pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
                  selectedCategory === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Produce ({vegetables.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c._id.toString()}
                  onClick={() => setSelectedCategory(c._id.toString())}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
                    selectedCategory === c._id.toString()
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Produce Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredVegetables.map((veg) => {
                const isOutOfStock = veg.stockQuantity <= 0;
                const inCart = cart.find((i) => i.vegetableId === veg._id.toString());

                return (
                  <button
                    key={veg._id.toString()}
                    onClick={() => addToCart(veg)}
                    disabled={isOutOfStock}
                    className={`relative flex flex-col p-3 rounded-xl border text-left transition group ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                        : inCart
                        ? "bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200/80 hover:border-emerald-400 hover:shadow-sm"
                    }`}
                  >
                    <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={veg.imageUrl || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80"}
                        alt={veg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <span
                        className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isOutOfStock
                            ? "bg-rose-600 text-white"
                            : veg.stockQuantity <= veg.minimumStock
                            ? "bg-amber-500 text-white"
                            : "bg-black/60 text-white backdrop-blur-xs"
                        }`}
                      >
                        {veg.stockQuantity} {veg.unit}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-xs truncate">{veg.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{veg.sku}</p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700">
                        {formatCurrency(veg.sellingPrice)}
                        <span className="text-[10px] font-normal text-slate-400">/{veg.unit}</span>
                      </span>

                      {inCart && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Fast POS Cart & Checkout */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold">Counter Billing Cart</h2>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                {cart.length} items
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2 mb-1.5 text-slate-600 font-semibold">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Ledger</span>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="walk-in">General Walk-in Customer (Cash / Instant)</option>
              {customers
                .filter((c) => !c.isWalkIn)
                .map((c) => (
                  <option key={c._id.toString()} value={c._id.toString()}>
                    {c.name} ({c.phone}) — Due: ₹{c.outstandingBalance}
                  </option>
                ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                <ShoppingCart className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">Cart is empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click vegetables from the catalog to ring up items.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.vegetableId}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-xs truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500">
                      ₹{item.sellingPrice}/{item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.vegetableId, -0.5)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={item.quantity}
                      onChange={(e) => setExplicitQuantity(item.vegetableId, parseFloat(e.target.value) || 1)}
                      className="w-12 text-center text-xs font-bold bg-white border border-slate-200 rounded-md py-0.5"
                    />
                    <button
                      onClick={() => updateQuantity(item.vegetableId, 0.5)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[55px]">
                    <p className="font-bold text-slate-900 text-xs">
                      {formatCurrency(item.quantity * item.sellingPrice)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.vegetableId)}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Financial Totals */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 text-right py-0.5 px-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-emerald-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "CASH", label: "Cash", icon: Banknote },
                  { id: "UPI", label: "UPI", icon: QrCode },
                  { id: "CARD", label: "Card", icon: CreditCard },
                  { id: "CREDIT", label: "Credit", icon: User },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tender & Change Due */}
            {paymentMethod === "CASH" && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">Cash Given (₹)</span>
                  <input
                    type="number"
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 500"
                    className="w-24 block font-bold text-slate-900 py-0.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold">Change to Return</span>
                  <p className="font-bold text-emerald-700 text-sm">{formatCurrency(changeDue)}</p>
                </div>
              </div>
            )}

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing Sale & Deducting Stock...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Sale ({formatCurrency(totalAmount)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {isReceiptOpen && completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            {/* Header with actions */}
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Bill Receipt</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Bill</span>
                </button>
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thermal Print Receipt Container */}
            <div className="print-receipt-container font-mono text-slate-800 text-[11px] space-y-2 p-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">VegiFresh Market</h3>
                <p className="text-[10px] text-slate-500">Direct From Mandi & Local Farms</p>
                <p className="text-[10px] text-slate-500">Main Market Road, Mandi Sector 4</p>
                <p className="text-[10px] text-slate-500">GST: 07AAAAA0000A1Z5 • Mob: +91 98765 00001</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-1.5">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">{completedSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{formatDateTime(completedSale.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{completedSale.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold">{completedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1 py-1 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 pb-0.5">
                  <span>Item (Qty)</span>
                  <span>Total</span>
                </div>
                {completedSale.items.map((item, idx) => (
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

              {/* Summary */}
              <div className="space-y-0.5 text-[11px] pt-1 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(completedSale.subtotal)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatCurrency(completedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>NET TOTAL:</span>
                  <span>{formatCurrency(completedSale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(completedSale.amountPaid)}</span>
                </div>
                {completedSale.balanceDue > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-rose-600">
                    <span>Balance Due (Credit):</span>
                    <span>{formatCurrency(completedSale.balanceDue)}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-500">
                <p>Thank you for choosing fresh produce!</p>
                <p>Please visit again 🌱</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
