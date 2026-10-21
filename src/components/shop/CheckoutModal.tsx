"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  Receipt,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    subtotal,
    deliveryFee,
    grandTotal,
    location,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("Immediate Express (Within 30 Mins)");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMessage("Please enter your delivery street address.");
      return;
    }
    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          deliveryCity: location.city,
          deliveryPincode: location.pincode,
          paymentMethod,
          items: cart.map((item) => ({
            vegetableId: item.vegetableId,
            quantity: item.quantity,
            unit: item.unit,
          })),
          notes: `${deliverySlot} | ${notes.trim()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order placement failed. Please verify stock.");
      }

      // Success
      setConfirmedOrder(data.sale);
      clearCart();
      toast.success("Order placed successfully! Fresh produce is being packed.");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while placing your order.");
      toast.error(err.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F7FAF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {confirmedOrder ? "Order Confirmation" : "Complete Your Order"}
              </h3>
              <p className="text-xs text-slate-500">
                {confirmedOrder
                  ? "Thank you for shopping with VegiFresh!"
                  : "Safe doorstep delivery with farm freshness guarantee"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {confirmedOrder ? (
            /* Order Success Receipt */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Order Successfully Placed
                </span>
                <h4 className="text-2xl font-black text-slate-900 mt-2">
                  Invoice #{confirmedOrder.invoiceNumber}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Estimated Arrival: <strong>Within 30–40 Minutes</strong>
                </p>
              </div>

              {/* Order breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-3">
                <div className="flex justify-between text-slate-600 font-semibold border-b border-slate-200 pb-2">
                  <span>Customer Name</span>
                  <span className="font-bold text-slate-900">{confirmedOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold border-b border-slate-200 pb-2">
                  <span>Contact Phone</span>
                  <span className="font-bold text-slate-900">{confirmedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold border-b border-slate-200 pb-2">
                  <span>Payment Mode</span>
                  <span className="font-bold text-emerald-700">
                    {confirmedOrder.paymentMethod === "CASH" ? "Cash on Delivery" : "UPI on Handover"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold pt-1">
                  <span className="text-sm font-bold text-slate-900">Total Payable</span>
                  <span className="text-base font-black text-[#2E7D32]">
                    ₹{confirmedOrder.totalAmount}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 text-left flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Our delivery executive will call your phone prior to arrival. You can inspect all
                  vegetables at your doorstep before completing payment.
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#256629] text-white font-bold rounded-2xl shadow-md transition"
              >
                Back to Farm Market
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarti Mehta"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={14}
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doorstep Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat/House number, building name, street, nearby landmark..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>
                    Selected Zone: <strong>{location.area}, {location.city} ({location.pincode})</strong>
                  </span>
                </div>
              </div>

              {/* Delivery Slot */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Time Slot
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                >
                  <option value="Immediate Express (Within 30 Mins)">
                    ⚡ Express Delivery (Within 30–40 Mins)
                  </option>
                  <option value="Morning Slot (7:00 AM – 9:00 AM)">
                    🌅 Morning Harvest Slot (7:00 AM – 9:00 AM)
                  </option>
                  <option value="Evening Slot (5:00 PM – 7:30 PM)">
                    🌆 Evening Fresh Slot (5:00 PM – 7:30 PM)
                  </option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition text-left ${
                      paymentMethod === "CASH"
                        ? "border-[#2E7D32] bg-[#2E7D32]/5 text-[#2E7D32]"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#2E7D32]" />
                    <div>
                      <div>Cash on Delivery</div>
                      <div className="text-[10px] text-slate-400 font-normal">Pay upon receipt</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition text-left ${
                      paymentMethod === "UPI"
                        ? "border-[#2E7D32] bg-[#2E7D32]/5 text-[#2E7D32]"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#2E7D32]" />
                    <div>
                      <div>UPI on Handover</div>
                      <div className="text-[10px] text-slate-400 font-normal">GPay / PhonePe / Paytm</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security guard, or call upon reaching gate"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              {/* Pricing Overview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Basket Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-[#2E7D32]">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
                  <span>Total Amount Payable</span>
                  <span className="text-[#2E7D32] text-base">₹{grandTotal}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2E7D32] hover:bg-[#256629] text-white font-black text-sm shadow-lg shadow-[#2E7D32]/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order & Allocating Stock...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Confirm Order • ₹{grandTotal}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
