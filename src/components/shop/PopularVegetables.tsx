"use client";

import React, { useState, useMemo } from "react";
import { Vegetable, Category } from "@/types";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Leaf,
} from "lucide-react";

interface PopularVegetablesProps {
  vegetables: Vegetable[];
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
}

export default function PopularVegetables({
  vegetables,
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchQueryChange,
}: PopularVegetablesProps) {
  const { addToCart, setQuickViewVeg, cart } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [visibleCount, setVisibleCount] = useState<number>(8);

  const getQty = (vegId: string) => quantities[vegId] || 1;

  const setQty = (vegId: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[vegId] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [vegId]: next };
    });
  };

  // Filter and sort items
  const filteredVegetables = useMemo(() => {
    let result = [...vegetables];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.sku.toLowerCase().includes(q) ||
          (v.categoryName && v.categoryName.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (selectedCategoryId !== "all") {
      result = result.filter((v) => {
        const catIdStr = v.categoryId?.toString();
        // Match exact category ID or match category slug
        if (catIdStr === selectedCategoryId) return true;
        const cat = categories.find((c) => c._id.toString() === selectedCategoryId);
        if (cat && v.categoryName?.toLowerCase() === cat.name?.toLowerCase()) return true;
        return false;
      });
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [vegetables, categories, selectedCategoryId, searchQuery, sortBy]);

  const displayedVegetables = filteredVegetables.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVegetables.length;

  return (
    <section id="shop" className="py-16 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-2">
              <Leaf className="w-4 h-4" />
              <span>Farm Fresh Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Popular Vegetables
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Freshly harvested daily stock with transparent per-unit pricing. Delivered directly
              from our organic partner farms.
            </p>
          </div>

          {/* Sort & Quick Filter Bar */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="sort-select" className="sr-only">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Harvest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategoryId === "all"
                ? "bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/25"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Vegetables ({vegetables.length})
          </button>
          {categories.map((cat) => {
            const id = cat._id.toString();
            const isActive = selectedCategoryId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectCategory(id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? "bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/25"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Active Search Filter Badge */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <span>
              Showing results matching: <strong className="text-slate-900">&quot;{searchQuery}&quot;</strong> ({filteredVegetables.length} items found)
            </span>
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              className="text-[#2E7D32] font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredVegetables.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-50 border border-slate-200/80 p-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No vegetables found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              We couldn&apos;t find any vegetables matching your filters. Try clearing your search or
              selecting another category.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchQueryChange("");
                onSelectCategory("all");
              }}
              className="mt-4 px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#256629] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedVegetables.map((veg) => {
              const vegId = veg._id?.toString() || (veg as any).id;
              const inStock = veg.stockQuantity > 0;
              const isLowStock = inStock && veg.stockQuantity <= 15;
              const currentSelectedQty = getQty(vegId);
              const existingInCart = cart.find((i) => i.vegetableId === vegId);

              return (
                <div
                  key={vegId}
                  className="group relative flex flex-col justify-between bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-200 overflow-hidden"
                >
                  {/* Top Image & Floating Status */}
                  <div className="relative w-full aspect-4/3 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={
                        veg.imageUrl ||
                        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80"
                      }
                      alt={veg.name}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {inStock ? (
                        isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Only {veg.stockQuantity}{" "}
                            {veg.unit} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white shadow-xs backdrop-blur-xs">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-xs">
                          <XCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Quick View Button */}
                    <button
                      type="button"
                      onClick={() => setQuickViewVeg(veg)}
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center"
                      title="Quick View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="uppercase tracking-wider font-semibold text-emerald-700">
                          {veg.categoryName || "Farm Produce"}
                        </span>
                        <span>{veg.stockQuantity} {veg.unit} avail</span>
                      </div>

                      {/* Vegetable Name */}
                      <h3
                        onClick={() => setQuickViewVeg(veg)}
                        className="font-black text-base text-slate-900 mt-1 cursor-pointer hover:text-[#2E7D32] transition line-clamp-1"
                        title={veg.name}
                      >
                        {veg.name}
                      </h3>

                      {/* Price Display */}
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xl font-black text-slate-900">
                          ₹{veg.sellingPrice}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          / {veg.unit}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Add to Cart */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      {inStock ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                              Qty ({veg.unit}):
                            </span>
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                              <button
                                type="button"
                                onClick={() => setQty(vegId, -1, veg.stockQuantity)}
                                disabled={currentSelectedQty <= 1}
                                className="w-6 h-6 rounded-md bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
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
                                className="w-6 h-6 rounded-md bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition"
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
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
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
        )}

        {/* View All / Expand Button */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-[#2E7D32] text-slate-900 hover:text-white font-bold text-xs sm:text-sm border-2 border-[#2E7D32] transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              View More Vegetables ({filteredVegetables.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
