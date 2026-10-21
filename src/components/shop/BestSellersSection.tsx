"use client";

import React, { useState } from "react";
import { Vegetable } from "@/types";
import { useCart } from "@/context/CartContext";
import {
  Trophy,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Flame,
} from "lucide-react";

interface BestSellersSectionProps {
  bestSellers: (Vegetable & { salesRank?: number })[];
}

export default function BestSellersSection({ bestSellers }: BestSellersSectionProps) {
  const { addToCart, setQuickViewVeg, cart } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQty = (vegId: string) => quantities[vegId] || 1;

  const setQty = (vegId: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[vegId] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [vegId]: next };
    });
  };

  if (!bestSellers || bestSellers.length === 0) return null;

  return (
    <section id="bestsellers" className="py-16 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-amber-200/80">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Best Sellers
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Our most frequently ordered kitchen staples, determined directly by store order
              volume and daily customer demand.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Ranked Items</span>
          </div>
        </div>

        {/* Best Sellers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((veg, index) => {
            const vegId = veg._id?.toString() || (veg as any).id;
            const inStock = veg.stockQuantity > 0;
            const isLowStock = inStock && veg.stockQuantity <= 15;
            const currentSelectedQty = getQty(vegId);
            const existingInCart = cart.find((i) => i.vegetableId === vegId);

            return (
              <div
                key={vegId}
                className="group relative flex flex-col justify-between bg-[#F7FAF5] rounded-3xl border border-emerald-950/5 hover:border-emerald-300 shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-200 overflow-hidden"
              >
                {/* Ranking Ribbon Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-black shadow-md">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>#{index + 1} Best Seller</span>
                </div>

                {/* Image Container */}
                <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
                  <img
                    src={
                      veg.imageUrl ||
                      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80"
                    }
                    alt={veg.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Quick View Button */}
                  <button
                    type="button"
                    onClick={() => setQuickViewVeg(veg)}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-xl bg-white/95 text-slate-800 shadow-md flex items-center justify-center hover:bg-white"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="uppercase tracking-wider font-semibold text-emerald-800">
                        {veg.categoryName || "Top Pick"}
                      </span>
                      {inStock ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold">Out of Stock</span>
                      )}
                    </div>

                    <h3
                      onClick={() => setQuickViewVeg(veg)}
                      className="font-black text-base text-slate-900 mt-1 cursor-pointer hover:text-[#2E7D32] transition line-clamp-1"
                      title={veg.name}
                    >
                      {veg.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-xl font-black text-slate-900">
                        ₹{veg.sellingPrice}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        / {veg.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Add to Cart */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                    {inStock ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Quantity:
                          </span>
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                            <button
                              type="button"
                              onClick={() => setQty(vegId, -1, veg.stockQuantity)}
                              disabled={currentSelectedQty <= 1}
                              className="w-6 h-6 rounded-md bg-slate-50 shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {currentSelectedQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(vegId, 1, veg.stockQuantity)}
                              disabled={currentSelectedQty >= veg.stockQuantity}
                              className="w-6 h-6 rounded-md bg-slate-50 shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(veg, currentSelectedQty)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white font-bold text-xs shadow-xs hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            {existingInCart
                              ? `Add More (${existingInCart.quantity} in Cart)`
                              : "Add to Cart"}
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
