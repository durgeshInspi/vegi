"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Printer,
  RotateCw,
  Loader2,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    setIsForbidden(false);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/reports/financial?${params.toString()}`);
      if (res.status === 403) {
        setIsForbidden(true);
        return;
      }
      const data = await res.json();
      if (data.report) {
        setReportData(data.report);
      }
    } catch {
      toast.error("Failed to generate financial report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Financial Profit & Loss Statement (P&L)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited retail revenue, COGS based on weighted purchase cost, operating overheads, and net operating profit.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Financial Statement</span>
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">From Date:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">To Date:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={fetchReport}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition"
            >
              Filter Statement
            </button>

            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setTimeout(fetchReport, 50);
                }}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                Reset Dates
              </button>
            )}
          </div>

          <div className="text-slate-400 text-[11px] font-medium">
            Timezone: <strong className="text-slate-700">Asia/Kolkata (IST)</strong>
          </div>
        </div>

        {/* P&L Statement */}
        {isForbidden ? (
          <div className="bg-white rounded-2xl border border-amber-200/80 p-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Admin Privileges Required</h3>
            <p className="text-xs text-slate-500 max-w-md">
              Detailed financial statements, margin analyses, and Profit &amp; Loss reports are restricted to Store Owners and Administrators.
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs">Computing accounting aggregations...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Metric Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Sales Revenue
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(reportData.totalRevenue)}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Gross counter sales</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cost of Goods Sold (COGS)
                </span>
                <p className="text-2xl font-bold text-slate-700 mt-1">
                  {formatCurrency(reportData.totalCOGS)}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Cost basis of produce sold</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gross Profit
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-bold text-emerald-700">
                    {formatCurrency(reportData.grossProfit)}
                  </p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {reportData.grossProfitMargin}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Revenue minus COGS</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Net Operating Profit
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${reportData.netOperatingProfit >= 0 ? "text-emerald-800" : "text-rose-600"}`}>
                    {formatCurrency(reportData.netOperatingProfit)}
                  </p>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    reportData.netOperatingProfit >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {reportData.netProfitMargin}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">After overheads & spoilage</span>
              </div>
            </div>

            {/* Detailed Statement Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Vegetable Shop Income & Operating Expense Breakdown
              </h2>

              <div className="space-y-3 text-xs">
                {/* 1. Revenue */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">1. Gross Counter Sales Revenue</span>
                    <p className="text-slate-500 text-[11px]">Total billing proceeds from walk-in & credit sales</p>
                  </div>
                  <span className="font-bold text-slate-900 text-base">{formatCurrency(reportData.totalRevenue)}</span>
                </div>

                {/* 2. COGS */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100 pl-4 text-slate-700">
                  <div>
                    <span className="font-semibold text-rose-700">Less: Cost of Goods Sold (COGS)</span>
                    <p className="text-slate-400 text-[11px]">Cost basis of vegetable produce rung up at register</p>
                  </div>
                  <span className="font-bold text-rose-700">- {formatCurrency(reportData.totalCOGS)}</span>
                </div>

                {/* 3. Gross Profit Subtotal */}
                <div className="flex items-center justify-between py-2.5 px-3 bg-emerald-50/70 rounded-xl font-bold text-emerald-900">
                  <span>GROSS OPERATING PROFIT (Margin: {reportData.grossProfitMargin}%)</span>
                  <span className="text-base">{formatCurrency(reportData.grossProfit)}</span>
                </div>

                {/* 4. Operating Expenses */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100 pl-4 text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-800">Less: Shop Overheads & Operating Expenses</span>
                    <p className="text-slate-400 text-[11px]">Premises rent, electricity cooling, transport, employee daily wages, bags</p>
                  </div>
                  <span className="font-bold text-rose-700">- {formatCurrency(reportData.totalExpenses)}</span>
                </div>

                {/* 5. Wastage Loss */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100 pl-4 text-slate-700">
                  <div>
                    <span className="font-semibold text-rose-700">Less: Produce Spoilage & Wastage Loss</span>
                    <p className="text-slate-400 text-[11px]">Cost basis of rotten, wilted, crushed, or damaged unsold produce</p>
                  </div>
                  <span className="font-bold text-rose-700">- {formatCurrency(reportData.totalWastageLoss)}</span>
                </div>

                {/* 6. Net Operating Profit */}
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl font-bold text-sm border ${
                  reportData.netOperatingProfit >= 0
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : "bg-rose-600 text-white border-rose-500 shadow-sm"
                }`}>
                  <div>
                    <span>ESTIMATED NET OPERATING PROFIT</span>
                    <span className="text-[11px] block font-normal opacity-90">
                      Net Profit Margin: {reportData.netProfitMargin}%
                    </span>
                  </div>
                  <span className="text-xl font-mono">{formatCurrency(reportData.netOperatingProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
