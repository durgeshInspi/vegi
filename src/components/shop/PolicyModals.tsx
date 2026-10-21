"use client";

import React from "react";
import { X, ShieldCheck, FileText, RotateCcw } from "lucide-react";

interface PolicyModalProps {
  type: "privacy" | "terms" | "refund" | null;
  onClose: () => void;
}

export default function PolicyModals({ type, onClose }: PolicyModalProps) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F7FAF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              {type === "privacy" && <ShieldCheck className="w-5 h-5" />}
              {type === "terms" && <FileText className="w-5 h-5" />}
              {type === "refund" && <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {type === "privacy" && "Privacy Policy"}
                {type === "terms" && "Terms & Conditions"}
                {type === "refund" && "Return & Refund Policy"}
              </h3>
              <p className="text-xs text-slate-500">VegiFresh Market Customer Guarantee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === "privacy" && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Customer Information We Collect</h4>
              <p>
                When placing an order with VegiFresh Market, we collect your name, delivery address,
                and contact phone number to dispatch fresh produce to your doorstep and provide live
                SMS/call delivery updates.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. How Your Data Is Protected</h4>
              <p>
                We do not sell, rent, or trade your contact information to any third-party marketing
                networks. Your phone and delivery addresses are utilized exclusively by our delivery
                fleet to fulfill your daily vegetable orders.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Security</h4>
              <p>
                All session tokens and ordering data are encrypted via industry-standard SSL and
                authenticated JSON Web Tokens (HS256).
              </p>
            </>
          )}

          {type === "terms" && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">1. Order Placement & Weights</h4>
              <p>
                Fresh agricultural produce can experience slight natural weight variances (±3% to
                5%) due to moisture evaporation during transit. Our packing stations weigh produce at
                or above nominal requested quantities to protect buyers.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Delivery Time Slots</h4>
              <p>
                We strive for 30-minute express doorstep drops in supported zones (Mumbai, Pune,
                Bangalore). Delays caused by severe weather or traffic will be proactively communicated
                to the recipient.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Payment Terms</h4>
              <p>
                We accept Cash on Delivery (COD) and instant UPI on doorstep inspection. Please inspect
                your fresh package upon handover before making payment.
              </p>
            </>
          )}

          {type === "refund" && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">
                1. 100% Doorstep Quality Guarantee
              </h4>
              <p>
                Freshness is our highest priority. If any leafy bundle, potato, tomato, or gourd does
                not meet your quality standards upon delivery, notify the delivery partner immediately
                during doorstep inspection.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Instant Refund or Replacement</h4>
              <p>
                We offer a zero-questions-asked immediate deduction from your bill on COD orders, or an
                instant replacement on the next morning delivery dispatch.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Customer Support Helpdesk</h4>
              <p>
                Reach out to our customer care team at <strong>+91 98765 00001</strong> or email{" "}
                <strong>support@vegifresh.com</strong> within 6 hours of delivery.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
