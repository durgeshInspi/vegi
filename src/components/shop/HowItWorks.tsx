"use client";

import React from "react";
import { Search, ShoppingCart, Truck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Browse Fresh Vegetables",
      description:
        "Explore farm-harvested categories, seasonal nightshades, and daily staples with real-time stock and prices.",
    },
    {
      step: "02",
      icon: ShoppingCart,
      title: "Add Items to Cart",
      description:
        "Select your preferred quantities in kg, bundles, or pieces with transparent live pricing and zero hidden fees.",
    },
    {
      step: "03",
      icon: Truck,
      title: "Doorstep Delivery",
      description:
        "Confirm your delivery address and receive crisp, fresh vegetables within 30 minutes or at your chosen time slot.",
    },
  ];

  return (
    <section className="py-16 bg-[#F7FAF5] border-t border-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] bg-emerald-100/70 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            How It Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Getting farm-fresh produce to your kitchen table has never been easier.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col items-center text-center group"
              >
                {/* Step Pill */}
                <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[11px] font-black tracking-wider">
                  STEP {item.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center my-4 group-hover:bg-[#2E7D32] group-hover:text-white transition duration-300 group-hover:scale-110">
                  <Icon className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
