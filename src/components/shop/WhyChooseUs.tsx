"use client";

import React from "react";
import { Leaf, BadgePercent, MousePointerClick, Truck, ShieldCheck, HeartHandshake } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Leaf,
      title: "Fresh Quality",
      description:
        "Harvested at dawn from certified organic partner farms. Cleaned with pure water and delivered crisp to preserve natural nutrients and flavor.",
      highlight: "100% Farm Fresh",
    },
    {
      icon: BadgePercent,
      title: "Affordable Prices",
      description:
        "Direct sourcing from farmers cuts out distributor markups and APMC middleman commissions, keeping daily prices fair and transparent.",
      highlight: "No Middleman Markup",
    },
    {
      icon: MousePointerClick,
      title: "Easy Online Ordering",
      description:
        "Seamless browsing, flexible per-kg or bundle quantities, real-time inventory counts, and instant checkout in less than 60 seconds.",
      highlight: "1-Click Cart Checkout",
    },
    {
      icon: Truck,
      title: "Convenient Home Delivery",
      description:
        "Express 30-minute doorstep drops and scheduled morning delivery slots right to your kitchen counter with temperature-controlled transit.",
      highlight: "Punctual Delivery Slots",
    },
  ];

  return (
    <section id="about" className="py-16 bg-[#F7FAF5] border-y border-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-2">
            <HeartHandshake className="w-4 h-4" />
            <span>Our Commitment to You</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Choose VegiFresh?
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            We bridge the gap between conscientious local farmers and health-conscious households,
            ensuring everyday vegetable freshness you can trust.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white p-7 rounded-3xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon */}
                  <div className="w-13 h-13 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-5 group-hover:bg-[#2E7D32] group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {feature.highlight}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-black text-slate-900 mt-3 mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle indicator bar */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-[#2E7D32]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Guaranteed Standards</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
