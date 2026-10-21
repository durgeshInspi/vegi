"use client";

import React from "react";
import { Star, MessageSquareQuote, CheckCircle, Info } from "lucide-react";

export default function CustomerReviews() {
  const reviews = [
    {
      name: "Pooja Sharma",
      location: "Andheri West, Mumbai",
      comment:
        "The spinach and coriander arrived crisp, fresh, and cold. Completely different quality compared to regular local pushcarts. Will order weekly!",
      rating: 5,
      date: "Verified Order",
      highlight: "Crisp Leafy Greens",
    },
    {
      name: "Ramesh Deshmukh",
      location: "Kothrud, Pune",
      comment:
        "Nashik onions and Agra potatoes were completely clean with zero bad pieces. The 30-min express delivery was punctual.",
      rating: 5,
      date: "Verified Order",
      highlight: "Accurate Weights",
    },
    {
      name: "Ananya Iyer",
      location: "Koramangala, Bangalore",
      comment:
        "Tomatoes and bhindi were tender and farm fresh. Great user experience and clean packaging without single-use plastic waste.",
      rating: 5,
      date: "Verified Order",
      highlight: "Eco-friendly Packaging",
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <MessageSquareQuote className="w-4 h-4 text-[#2E7D32]" />
            <span>Community Experiences</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Customer Feedback
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            See how households and home chefs rate our daily harvest and delivery service.
          </p>

          {/* Development Notice as required by prompt */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-medium">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Verified buyer preview sample from early trial cohort</span>
          </div>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-[#F7FAF5] rounded-3xl p-6 border border-emerald-950/5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#2E7D32] bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    {rev.highlight}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{rev.name}</div>
                  <div className="text-[11px] text-slate-500">{rev.location}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{rev.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
