"use client";

import React from "react";
import { Category } from "@/types";
import { Sparkles, Layers, ArrowRight } from "lucide-react";

interface CategorySectionProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function CategorySection({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySectionProps) {
  // Curated category visual metadata with photography
  const categoryCards = [
    {
      id: "all",
      name: "All Vegetables",
      subhead: "Complete Fresh Catalog",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
      badge: "Full Selection",
    },
    {
      id: categories.find((c) => c.slug === "leafy-greens")?._id.toString() || "leafy",
      name: "Leafy Vegetables",
      subhead: "Palak, Methi, Coriander",
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
      badge: "Crisp & Green",
    },
    {
      id: categories.find((c) => c.slug === "root-vegetables")?._id.toString() || "root",
      name: "Root Vegetables",
      subhead: "Potato, Carrot, Beetroot",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
      badge: "Kitchen Staples",
    },
    {
      id: categories.find((c) => c.slug === "solanaceae")?._id.toString() || "solanaceae",
      name: "Fresh Tomatoes & Peppers",
      subhead: "Juicy Hybrid Tomatoes, Capsicum",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
      badge: "Farm Harvested",
    },
    {
      id: categories.find((c) => c.slug === "alliums-aromatics")?._id.toString() || "alliums",
      name: "Onions & Aromatics",
      subhead: "Nashik Onion, Garlic, Ginger",
      image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80",
      badge: "Daily Essentials",
    },
    {
      id: categories.find((c) => c.slug === "gourds-cucumbers" || c.slug === "beans-pods")?._id.toString() || "seasonal",
      name: "Seasonal Gourds & Pods",
      subhead: "Fresh Lauki, Kheera, Bhindi",
      image: "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400&q=80",
      badge: "Hydrating & Crisp",
    },
  ];

  const handleCardClick = (id: string) => {
    onSelectCategory(id);
    const shopEl = document.getElementById("shop");
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="categories" className="py-16 bg-[#F7FAF5] border-y border-emerald-950/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>Farm Fresh Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Pick directly from our specialized harvest sections. Sourced at peak ripeness for
              maximum nutrition and taste.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleCardClick("all")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2E7D32] hover:text-[#256629] transition self-start md:self-auto group"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categoryCards.map((card) => {
            const isActive = selectedCategoryId === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                className={`group relative text-left rounded-2xl overflow-hidden p-3.5 sm:p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 sm:h-56 ${
                  isActive
                    ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-xl shadow-[#2E7D32]/25 scale-[1.02]"
                    : "bg-white hover:bg-emerald-50/40 text-slate-900 border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Image Container with zoom */}
                <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 mb-3 shrink-0">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <span
                    className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                      isActive
                        ? "bg-amber-400 text-slate-950"
                        : "bg-black/60 text-white"
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Card Title & Description */}
                <div>
                  <h3
                    className={`font-black text-xs sm:text-sm tracking-tight line-clamp-1 leading-snug ${
                      isActive ? "text-white" : "text-slate-900 group-hover:text-[#2E7D32]"
                    }`}
                  >
                    {card.name}
                  </h3>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isActive ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    {card.subhead}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
