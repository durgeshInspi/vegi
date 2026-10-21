"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Carrot,
  Tags,
  Boxes,
  Truck,
  Receipt,
  Building2,
  Users,
  Trash2,
  ReceiptText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Store,
  Clock,
} from "lucide-react";
import { UserSession } from "@/types";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "POS Billing", href: "/sales/pos", icon: ShoppingCart, highlight: true },
  { label: "Vegetables", href: "/vegetables", icon: Carrot },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Inventory Ledger", href: "/inventory", icon: Boxes },
  { label: "Purchases", href: "/purchases", icon: Truck },
  { label: "Sales Invoices", href: "/sales", icon: Receipt },
  { label: "Suppliers", href: "/suppliers", icon: Building2 },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Wastage", href: "/wastage", icon: Trash2 },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Reports & P&L", href: "/reports", icon: BarChart3, adminOnly: true },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  useEffect(() => {
    // Fetch logged in user
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login");
      });

    // Update live clock
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100/70 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="no-print hidden md:flex md:w-64 flex-col bg-slate-900 text-slate-200 border-r border-slate-800 shadow-xl">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/logo.jpg"
              alt="VegiFresh Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">VegiFresh</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ERP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Vegetable Mandi Manager</p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all mb-2 shadow-sm ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-1 ring-emerald-400"
                      : "bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Fast POS
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 font-semibold shadow-inner"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || "Loading..."}</p>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono font-semibold uppercase ${
                    user?.role === "ADMIN" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {user?.role || "USER"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="no-print h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentDateTime || "Loading time..."}</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-semibold">IST (Asia/Kolkata)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sales/pos"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Launch POS Billing</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="no-print fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80%] bg-slate-900 text-slate-200 flex flex-col h-full shadow-2xl z-10">
              <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-base">VegiFresh</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive
                          ? "bg-emerald-600 text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 bg-rose-500/10 rounded-lg text-sm font-semibold hover:bg-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
