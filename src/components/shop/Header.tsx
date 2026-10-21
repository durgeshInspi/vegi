"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { UserSession } from "@/types";
import {
  ShoppingBag,
  MapPin,
  Search,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Phone,
  LayoutDashboard,
  LogOut,
  Leaf,
} from "lucide-react";

interface HeaderProps {
  currentUser: UserSession | null;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ currentUser, onSearch, searchQuery = "" }: HeaderProps) {
  const { totalItemsCount, setIsCartOpen, location, setIsLocationOpen } = useCart();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBadgeAnimate, setCartBadgeAnimate] = useState(false);

  // Trigger bounce animation when item count changes
  useEffect(() => {
    if (totalItemsCount > 0) {
      setCartBadgeAnimate(true);
      const timer = setTimeout(() => setCartBadgeAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItemsCount]);

  // Sync prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Scroll effect for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(localSearch);
    }
    // Smooth scroll to vegetables section
    const el = document.getElementById("shop");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-[#1f5623] text-emerald-100 text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" /> Farm Fresh Guarantee
            </span>
            <span className="hidden sm:inline text-emerald-200">
              Harvested at 5:00 AM • Free delivery on orders above ₹199
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:+919876500001"
              className="hidden md:flex items-center gap-1.5 text-emerald-200 hover:text-white transition"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Need help? +91 98765 00001</span>
            </a>
            <span className="text-emerald-300/60 hidden md:inline">|</span>
            <span className="text-emerald-200 font-medium">Daily 6 AM – 9 PM</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100"
            : "bg-white border-b border-slate-200/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3 md:gap-6">
            {/* 1. Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white border border-emerald-100 shadow-md shadow-[#2E7D32]/15 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/logo.jpg"
                  alt="VegiFresh Market Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-[#2E7D32] transition-colors">
                  VegiFresh<span className="text-[#2E7D32]">.</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#2E7D32] uppercase tracking-widest leading-tight mt-0.5">
                  Organic Market
                </span>
              </div>
            </Link>

            {/* 2. Delivery Location Selector */}
            <button
              type="button"
              onClick={() => setIsLocationOpen(true)}
              className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 text-left transition group max-w-[210px]"
              title="Click to change delivery location"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  Deliver to
                </div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  {location.area}, {location.city}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2E7D32] transition shrink-0" />
            </button>

            {/* 3. Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-lg hidden md:block relative"
            >
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for fresh vegetables..."
                  className="w-full pl-11 pr-20 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-full border border-slate-200 focus:border-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 transition shadow-inner"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-14 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-full transition"
                >
                  Find
                </button>
              </div>
            </form>

            {/* 4. Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <Link href="/" className="text-[#2E7D32] hover:text-[#256629] transition">
                Home
              </Link>
              <Link href="#shop" className="hover:text-[#2E7D32] transition">
                Shop
              </Link>
              <Link href="#categories" className="hover:text-[#2E7D32] transition">
                Categories
              </Link>
              <Link href="#bestsellers" className="hover:text-[#2E7D32] transition">
                Best Sellers
              </Link>
              <Link href="#about" className="hover:text-[#2E7D32] transition">
                About Us
              </Link>
              <Link href="#contact" className="hover:text-[#2E7D32] transition">
                Contact
              </Link>
            </nav>

            {/* 5. Right Action Buttons: User Account & Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Account / Login Button */}
              {currentUser ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#2E7D32]" />
                  <span className="hidden sm:inline">{currentUser.name.split(" ")[0]}</span>
                  <span className="sm:hidden">Dash</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2E7D32] text-xs sm:text-sm font-bold border border-emerald-200/80 transition"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Shopping Cart Button with live count */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl shadow-md shadow-[#2E7D32]/25 font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                aria-label="View shopping cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  {totalItemsCount > 0 && (
                    <span
                      className={`absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs transition-transform ${
                        cartBadgeAnimate ? "scale-125 bg-amber-400" : "scale-100"
                      }`}
                    >
                      {totalItemsCount > 99 ? "99+" : totalItemsCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search fresh vegetables..."
                className="w-full pl-10 pr-16 py-2 text-xs bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-[#2E7D32] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#2E7D32] text-white text-[11px] font-bold rounded-lg"
              >
                Find
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Location Selector */}
            <button
              onClick={() => {
                setIsLocationOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
                <span className="font-semibold text-slate-800">
                  Deliver to: {location.area}, {location.city} ({location.pincode})
                </span>
              </div>
              <span className="text-[#2E7D32] font-bold">Change</span>
            </button>

            {/* Nav Links */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-emerald-50 text-[#2E7D32]"
              >
                Home
              </Link>
              <Link
                href="#shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50"
              >
                Shop Vegetables
              </Link>
              <Link
                href="#categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50"
              >
                Categories
              </Link>
              <Link
                href="#bestsellers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50"
              >
                Best Sellers
              </Link>
              <Link
                href="#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50"
              >
                About Us
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg hover:bg-slate-50"
              >
                Contact
              </Link>
            </div>

            {/* Auth Link in Mobile */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {currentUser ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>Go to Management Dashboard ({currentUser.name})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In / My Account</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
