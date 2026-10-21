"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Category } from "@/types";
import {
  Leaf,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Heart,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import PolicyModals from "./PolicyModals";

interface FooterProps {
  categories: Category[];
  onSelectCategory?: (id: string) => void;
}

export default function Footer({ categories, onSelectCategory }: FooterProps) {
  const [modalPolicy, setModalPolicy] = useState<"privacy" | "terms" | "refund" | null>(null);

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    const el = document.getElementById("shop");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <footer id="contact" className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
            {/* Col 1 & 2: Brand & Description */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white p-0.5 shadow-md flex items-center justify-center shrink-0">
                  <img
                    src="/logo.jpg"
                    alt="VegiFresh Market Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white tracking-tight leading-none">
                    VegiFresh<span className="text-emerald-500">.</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest leading-tight mt-0.5">
                    Online Farm Market
                  </span>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Your neighborhood destination for farm-fresh vegetables. Harvested daily, graded for
                premium quality, and delivered straight from organic farms to your kitchen counter.
              </p>

              <div className="flex items-center gap-3 pt-2 text-xs text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Direct Farmer Partnerships • 100% Quality Checked</span>
              </div>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/" className="hover:text-emerald-400 transition">
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link href="#shop" className="hover:text-emerald-400 transition">
                    All Vegetables
                  </Link>
                </li>
                <li>
                  <Link href="#categories" className="hover:text-emerald-400 transition">
                    Browse Categories
                  </Link>
                </li>
                <li>
                  <Link href="#bestsellers" className="hover:text-emerald-400 transition">
                    Best Sellers
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-emerald-400 transition">
                    Why Choose Us
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-400 transition flex items-center gap-1">
                    <span>Store Management Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Vegetable Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Produce Categories
              </h4>
              <ul className="space-y-2.5 text-xs">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat._id.toString()}>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(cat._id.toString())}
                      className="hover:text-emerald-400 transition text-left cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5: Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Contact & Support
              </h4>

              <div className="flex items-start gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  APMC Market Yard, Sector 19, Vashi, Navi Mumbai, MH 400703
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="tel:+919876500001" className="hover:text-white transition">
                  +91 98765 00001
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href="mailto:support@vegifresh.com" className="hover:text-white transition">
                  support@vegifresh.com
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs pt-1 text-slate-400">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mon – Sun: 6:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 VegiFresh Market. All rights reserved.
            </div>

            {/* Legal Links as requested */}
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <button
                type="button"
                onClick={() => setModalPolicy("privacy")}
                className="hover:text-slate-300 transition underline underline-offset-4"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setModalPolicy("terms")}
                className="hover:text-slate-300 transition underline underline-offset-4"
              >
                Terms and Conditions
              </button>
              <button
                type="button"
                onClick={() => setModalPolicy("refund")}
                className="hover:text-slate-300 transition underline underline-offset-4"
              >
                Return & Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      <PolicyModals type={modalPolicy} onClose={() => setModalPolicy(null)} />
    </>
  );
}
