"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Boxes,
  ArrowUpRight,
  RotateCw,
  ShoppingCart,
  ReceiptText,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DashboardMetrics } from "@/modules/reports/report.service";
import { toast } from "sonner";

interface DashboardClientProps {
  initialData: DashboardMetrics;
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardMetrics>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/reports/dashboard");
      const json = await res.json();
      if (json.metrics) {
        setData(json.metrics);
        toast.success("Dashboard metrics refreshed");
      }
    } catch {
      toast.error("Failed to refresh metrics");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shop Operations Overview</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Live Mandi Data
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial performance, inventory movements, and retail billing analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/sales/pos"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition hover:scale-[1.01]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Open POS Counter</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.todaySales)}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Revenue captured</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Gross Profit</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(data.todayGrossProfit)}</div>
          <p className="text-[11px] text-slate-400 mt-2">Sales minus inventory COGS</p>
        </div>

        {/* Est. Net Operating Profit */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Net Operating Profit</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition ${
              data.todayNetProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${data.todayNetProfit >= 0 ? "text-slate-900" : "text-rose-600"}`}>
            {formatCurrency(data.todayNetProfit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">After today&apos;s expenses & wastage</p>
        </div>

        {/* Inventory Cost Valuation */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Valuation</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(data.inventoryValuationCost)}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-semibold text-slate-500">Stock cost on floor</span>
            {data.lowStockCount > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                {data.lowStockCount} Low
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Operational Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Today Purchases</span>
          <p className="text-base font-bold text-slate-800 mt-0.5">{formatCurrency(data.todayPurchases)}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Today Expenses</span>
          <p className="text-base font-bold text-slate-800 mt-0.5">{formatCurrency(data.todayExpenses)}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Wastage Loss</span>
          <p className="text-base font-bold text-rose-600 mt-0.5">{formatCurrency(data.totalWastageValue)}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Customer Credit (Due)</span>
          <p className="text-base font-bold text-amber-700 mt-0.5">{formatCurrency(data.totalReceivables)}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Supplier Payable</span>
          <p className="text-base font-bold text-indigo-700 mt-0.5">{formatCurrency(data.totalPayables)}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400">Stock Alerts</span>
          <p className="text-base font-bold text-slate-800 mt-0.5">
            <span className="text-amber-600">{data.lowStockCount} Low</span> /{" "}
            <span className="text-rose-600">{data.outOfStockCount} Out</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Expense 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">7-Day Sales vs Purchases & Expenses</h2>
              <p className="text-[11px] text-slate-500">Daily business cash-flow & revenue in ₹</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sales
              </span>
              <span className="flex items-center gap-1.5 text-blue-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Purchases
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTrend}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#purchaseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Sales by Payment Mode</h2>
          <p className="text-[11px] text-slate-500 mb-4">Distribution across Cash, UPI, Card & Credit</p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.paymentBreakdown}
                  dataKey="amount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {data.paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-auto pt-2 border-t border-slate-100">
            {data.paymentBreakdown.map((item, idx) => (
              <div key={item.method} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  ></span>
                  <span className="font-medium text-slate-700">{item.method}</span>
                  <span className="text-[10px] text-slate-400">({item.count} bills)</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Lists: Best-Selling & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Vegetables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Best-Selling Produce</h2>
              <p className="text-[11px] text-slate-500">Ranked by quantities sold to customers</p>
            </div>
            <Link href="/vegetables" className="text-xs text-emerald-600 font-semibold hover:underline">
              View Catalog →
            </Link>
          </div>

          <div className="space-y-3">
            {data.topSellingVegetables.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No sales recorded yet.</p>
            ) : (
              data.topSellingVegetables.map((item, idx) => (
                <div
                  key={item.vegetableName}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-800">{item.vegetableName}</h3>
                      <p className="text-[11px] text-slate-500">
                        Total Volume: {item.totalQuantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-700">{formatCurrency(item.totalRevenue)}</p>
                    <span className="text-[10px] text-slate-400">Revenue</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Sales Bills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Customer Bills</h2>
              <p className="text-[11px] text-slate-500">Latest completed counter sales</p>
            </div>
            <Link href="/sales" className="text-xs text-emerald-600 font-semibold hover:underline">
              All Sales History →
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentSales.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No bills generated yet.</p>
            ) : (
              data.recentSales.map((sale) => (
                <div
                  key={sale._id.toString()}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{sale.invoiceNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {sale.customerName} • {formatDateTime(sale.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(sale.totalAmount)}</p>
                    <span className={`text-[10px] font-semibold ${
                      sale.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {sale.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
