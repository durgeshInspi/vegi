"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid email address (e.g. name@example.com).",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription failed. Please try again.");
      }

      setStatusMessage({
        type: "success",
        text: data.message || "Thank you! You are now subscribed to fresh harvest alerts.",
      });
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Could not complete subscription. Please try again.",
      });
      toast.error(err.message || "Subscription failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-14 bg-[#1f5623] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Seasonal Harvest Updates</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Stay Updated on Fresh Arrivals & Discounts
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
            Get early morning alerts when exotic greens, organic tomatoes, and seasonal gourds
            arrive fresh from our partner farms.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="pt-2 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Real feedback state */}
            {statusMessage && (
              <div
                className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  statusMessage.type === "success"
                    ? "bg-emerald-900/60 text-emerald-200 border border-emerald-500/40"
                    : "bg-rose-950/70 text-rose-200 border border-rose-500/40"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="text-left">{statusMessage.text}</span>
              </div>
            )}
          </form>

          <p className="text-[11px] text-emerald-200/70">
            We value your privacy. No spam, ever. Unsubscribe anytime with 1 click.
          </p>
        </div>
      </div>
    </section>
  );
}
