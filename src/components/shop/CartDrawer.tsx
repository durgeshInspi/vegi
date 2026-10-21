"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Sparkles,
  MapPin,
} from "lucide-react";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    subtotal,
    deliveryFee,
    amountNeededForFreeDelivery,
    grandTotal,
    setIsCheckoutOpen,
    location,
    setIsLocationOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F7FAF5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Your Vegetable Basket</h3>
                <p className="text-xs text-slate-500">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Location Banner */}
          <div className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900">
              <MapPin className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
              <span className="truncate">
                Deliver to: <strong>{location.area}, {location.city}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLocationOpen(true)}
              className="text-[#2E7D32] font-bold text-[11px] hover:underline shrink-0"
            >
              Change
            </button>
          </div>

          {/* Free Delivery Goal Banner */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-700">
            {amountNeededForFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Add ₹{amountNeededForFreeDelivery} more for <strong>FREE Delivery</strong></span>
                  <span className="font-bold text-slate-900">₹{subtotal} / ₹199</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2E7D32] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / 199) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>You unlocked <strong>FREE 30-min express delivery!</strong></span>
              </div>
            )}
          </div>

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Your basket is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Discover farm-fresh leafy vegetables, root crops, and tomatoes straight from our
                  partner growers.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.vegetableId}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-200 transition bg-white shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&q=80"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                    <div className="text-[11px] text-slate-500">
                      ₹{item.sellingPrice} / {item.unit}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.vegetableId, item.quantity - 1)}
                          className="w-5 h-5 rounded-md bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.vegetableId, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          className="w-5 h-5 rounded-md bg-white shadow-2xs flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.unit}</span>
                    </div>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right flex flex-col justify-between items-end h-16 py-0.5">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.vegetableId)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs font-black text-slate-900">
                      ₹{Math.round(item.quantity * item.sellingPrice)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-[#F7FAF5] space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-[#2E7D32]">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-[#2E7D32] text-base">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2E7D32] hover:bg-[#256629] text-white font-black text-sm shadow-lg shadow-[#2E7D32]/25 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="hover:text-rose-600 transition"
                >
                  Clear all items
                </button>
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#2E7D32]" />
                  <span>Cash on Delivery / UPI Available</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
