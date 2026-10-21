"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Thermometer,
} from "lucide-react";

export default function ProductQuickViewModal() {
  const { quickViewVeg, setQuickViewVeg, addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!quickViewVeg) return null;

  const inStock = quickViewVeg.stockQuantity > 0;
  const isLowStock = inStock && quickViewVeg.stockQuantity <= 15;
  const existingInCart = cart.find(
    (item) => item.vegetableId === (quickViewVeg._id?.toString() || quickViewVeg.id)
  );

  const handleAddToCart = () => {
    const success = addToCart(quickViewVeg, quantity);
    if (success) {
      setQuickViewVeg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setQuickViewVeg(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative bg-slate-50 flex items-center justify-center p-6 min-h-[260px] md:min-h-[360px]">
            <img
              src={
                quickViewVeg.imageUrl ||
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80"
              }
              alt={quickViewVeg.name}
              className="max-h-64 w-auto object-contain rounded-2xl shadow-md"
            />
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {inStock ? (
                isLowStock ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950">
                    <AlertTriangle className="w-3.5 h-3.5" /> Only {quickViewVeg.stockQuantity}{" "}
                    {quickViewVeg.unit} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({quickViewVeg.stockQuantity}{" "}
                    {quickViewVeg.unit})
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white">
                  <XCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Right: Details & Action */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {quickViewVeg.categoryName || "Fresh Farm Produce"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                  {quickViewVeg.name}
                </h3>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  SKU: {quickViewVeg.sku || "VEG-CAT-01"}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  ₹{quickViewVeg.sellingPrice}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  / {quickViewVeg.unit}
                </span>
              </div>

              {/* Freshness Information */}
              <div className="p-3.5 rounded-2xl bg-[#F7FAF5] border border-emerald-950/5 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>100% Quality & Freshness Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-slate-400" />
                  <span>Store in cool, dry place. Best consumed within 3–4 days.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Handpicked & sorted under clean hygienic conditions.</span>
                </div>
              </div>

              {existingInCart && (
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Currently in your cart: {existingInCart.quantity} {quickViewVeg.unit}
                </div>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !inStock}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(quickViewVeg.stockQuantity, q + 1)
                      )
                    }
                    disabled={quantity >= quickViewVeg.stockQuantity || !inStock}
                    className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  {quickViewVeg.unit}
                </span>

                <div className="ml-auto text-right">
                  <div className="text-[11px] text-slate-400 font-semibold">Total Price</div>
                  <div className="text-base font-black text-slate-900">
                    ₹{Math.round(quantity * quickViewVeg.sellingPrice)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2E7D32] hover:bg-[#256629] text-white font-bold text-sm shadow-lg shadow-[#2E7D32]/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {inStock
                    ? `Add ${quantity} ${quickViewVeg.unit} to Cart`
                    : "Currently Unavailable"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
