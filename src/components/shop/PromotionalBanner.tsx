"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Copy, Check, Percent } from "lucide-react";
import { toast } from "sonner";

export interface PromotionalBannerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  code?: string;
  buttonText?: string;
}

export default function PromotionalBanner({
  title = "Freshness for Every Kitchen",
  subtitle = "Discover seasonal vegetables and make every meal healthier. Harvested daily from certified organic farms and delivered crisp to your home.",
  badge = "Seasonal Kitchen Offer",
  code = "VEGI15",
  buttonText = "Shop Seasonal Harvest",
}: PromotionalBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Coupon "${code}" copied to clipboard! Flat 15% off.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToShop = () => {
    const el = document.getElementById("shop");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-[#1f5623] to-[#2E7D32] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-emerald-900/40">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{badge}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {title}
              </h2>

              <p className="text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              {/* Coupon Box */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-mono font-bold cursor-pointer transition select-none group"
                  title="Click to copy promo code"
                >
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span className="text-white">Use Code:</span>
                  <span className="text-amber-400 tracking-wider text-sm">{code}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-300 group-hover:text-white" />
                  )}
                </div>

                <span className="text-xs text-emerald-200">
                  Flat 15% OFF on orders over ₹299
                </span>
              </div>
            </div>

            {/* Right CTA */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3">
              <button
                type="button"
                onClick={scrollToShop}
                className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-950/20 flex items-center justify-center gap-2 text-sm sm:text-base transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-emerald-200/80">
                ✓ No minimum delivery hassle • 30-min express
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
