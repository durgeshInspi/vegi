"use client";

import React, { useState } from "react";
import { useCart, DeliveryLocation } from "@/context/CartContext";
import { MapPin, X, Check, Navigation, Search } from "lucide-react";

const POPULAR_LOCATIONS: DeliveryLocation[] = [
  { city: "Mumbai", area: "Andheri West", pincode: "400053" },
  { city: "Mumbai", area: "Bandra West", pincode: "400050" },
  { city: "Mumbai", area: "Powai", pincode: "400076" },
  { city: "Navi Mumbai", area: "Vashi APMC", pincode: "400703" },
  { city: "Bangalore", area: "Koramangala", pincode: "560034" },
  { city: "Bangalore", area: "Indiranagar", pincode: "560038" },
  { city: "Delhi", area: "Connaught Place", pincode: "110001" },
  { city: "Pune", area: "Kothrud", pincode: "411038" },
];

export default function LocationModal() {
  const { isLocationOpen, setIsLocationOpen, location, setLocation } = useCart();
  const [customPincode, setCustomPincode] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [customCity, setCustomCity] = useState("Mumbai");

  if (!isLocationOpen) return null;

  const handleSelect = (loc: DeliveryLocation) => {
    setLocation(loc);
    setIsLocationOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPincode.trim()) return;

    setLocation({
      city: customCity,
      area: customArea.trim() || `${customCity} Central`,
      pincode: customPincode.trim(),
    });
    setIsLocationOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F7FAF5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Delivery Location</h3>
              <p className="text-xs text-slate-500">Fast 30-minute delivery to your kitchen</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Custom Pincode Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Enter Pin Code / Area
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 400053 or Bandra"
                value={customPincode}
                onChange={(e) => setCustomPincode(e.target.value)}
                maxLength={10}
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] transition"
              />
              <button
                type="submit"
                disabled={!customPincode.trim()}
                className="px-4 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Quick Popular Delivery Zones */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Popular Delivery Hubs</span>
              <span className="text-[11px] text-[#2E7D32] font-medium flex items-center gap-1">
                <Navigation className="w-3 h-3" /> 30-min express
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {POPULAR_LOCATIONS.map((loc) => {
                const isSelected =
                  location.pincode === loc.pincode && location.area === loc.area;
                return (
                  <button
                    key={`${loc.city}-${loc.pincode}-${loc.area}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? "border-[#2E7D32] bg-[#2E7D32]/5 text-[#2E7D32] font-semibold"
                        : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{loc.area}</div>
                      <div className="text-[11px] text-slate-500">
                        {loc.city} — {loc.pincode}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Pin Banner */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Currently Delivering to:</span>
          <span className="font-bold text-slate-900">
            {location.area}, {location.city} ({location.pincode})
          </span>
        </div>
      </div>
    </div>
  );
}
