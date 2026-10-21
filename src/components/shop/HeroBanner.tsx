"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Clock, Truck, Sparkles, CheckCircle2 } from "lucide-react";

export default function HeroBanner() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Background Hero Image with rich gradient overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=2000&q=85"
          alt="Fresh farm vegetables"
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Farm-to-Kitchen Harvest • Guaranteed Freshness</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Fresh Vegetables,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-300">
                Delivered to Your Doorstep
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Shop farm-fresh vegetables at great prices. Freshness you can trust, delivered with
              care. Sourced daily from verified organic growers across Maharashtra.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => scrollTo("shop")}
                className="px-7 py-3.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollTo("categories")}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base cursor-pointer"
              >
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Explore Vegetables</span>
              </button>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">30-Min Drop</div>
                  <div className="text-[11px] text-slate-400">Express delivery</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">100% Quality</div>
                  <div className="text-[11px] text-slate-400">Zero-touch sort</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Free Delivery</div>
                  <div className="text-[11px] text-slate-400">On orders &gt; ₹199</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Feature Grid / Floating Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              {/* Highlight Card 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Today&apos;s Fresh Harvest
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In Stock
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                        <img
                          src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&q=80"
                          alt="Hybrid Red Tomato"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Hybrid Red Tomatoes</div>
                        <div className="text-[11px] text-slate-400">Crisp & Juicy • Solanaceae</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400">₹35/kg</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                        <img
                          src="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80"
                          alt="Desi Palak"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Desi Palak (Spinach)</div>
                        <div className="text-[11px] text-slate-400">Farm fresh • Leafy Greens</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400">₹20/bunch</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                        <img
                          src="https://images.unsplash.com/photo-1508747703725-719777637510?w=200&q=80"
                          alt="Nashik Red Onion"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Nashik Red Onions</div>
                        <div className="text-[11px] text-slate-400">Aromatic & Sweet • Root</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400">₹38/kg</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => scrollTo("shop")}
                    className="text-xs font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Browse All 15+ Fresh Vegetables</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
