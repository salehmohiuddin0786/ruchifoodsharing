'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { DIETARY_OPTIONS, FOOD_CATEGORIES } from '@/lib/constants';
import { Search, Heart, Sparkles, Navigation, ShieldCheck } from 'lucide-react';

export default function HeroBanner({
  onOpenCreatePreOrder,
  onOpenCreateDonation,
  onOpenSafety,
}) {
  const {
    selectedNeighborhood,
    radiusFilter,
    setRadiusFilter,
    dietaryFilter,
    setDietaryFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    currentUser,
  } = useApp();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#174D36] via-[#1A573D] to-[#206648] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#235F45]">
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-[#65A878] opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-[#F5A623] opacity-10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#0F3826] border border-[#2B7554] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#A3E5B5]">
              <Sparkles size={14} className="text-[#F5A623]" />
              <span>Hyper-local Food Platform in {selectedNeighborhood.name}, Hyderabad</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#FFF9EE] leading-tight">
              Share Surplus Food. <br />
              <span className="text-[#F5A623]">Pre-Order Homemade Meals.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#D4EDE0] max-w-2xl leading-relaxed">
              RUCHI uniquely unites two community pillars: <strong>Free Food Sharing</strong> to eliminate
              edible surplus waste, and <strong>Home Cook Pre-Orders</strong> where nearby cooks prepare planned
              dishes with a strict 4-customer booking ceiling and 30-minute advance order cutoff.
            </p>

            {/* Quick Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenCreatePreOrder}
                className="bg-[#F5A623] hover:bg-[#DE9319] text-black px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
              >
                <span>👩‍🍳 Post Home-Cooked Dish</span>
              </button>
              <button
                onClick={onOpenCreateDonation}
                className="bg-[#65A878] hover:bg-[#4E8D60] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
              >
                <span>💚 Donate Surplus Food (₹0)</span>
              </button>
              <button
                onClick={onOpenSafety}
                className="bg-transparent hover:bg-[#0F3826] border border-[#A3E5B5]/40 text-[#FFF9EE] px-4 py-3 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <ShieldCheck size={16} className="text-[#65A878]" />
                <span>4-Customer Rule & Safety</span>
              </button>
            </div>
          </div>

          {/* Quick Highlight Box (The Two Rules) */}
          <div className="lg:col-span-4 bg-[#0F3826]/80 backdrop-blur-md rounded-2xl p-5 border border-[#2B7554] space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5A623] flex items-center gap-1.5">
              <span>⚡</span> Core Server-Enforced Rules
            </h3>
            
            <div className="bg-[#174D36] p-3 rounded-xl border border-[#235F45] text-xs space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#F5A623] text-black flex items-center justify-center font-black text-[10px]">
                  4
                </span>
                <span>Four-Customer Order Ceiling</span>
              </div>
              <p className="text-[#A3E5B5] text-[11px] leading-snug">
                Each cook post permits at most 4 distinct customer bookings. Multiple plates allowed per customer up to available stock.
              </p>
            </div>

            <div className="bg-[#174D36] p-3 rounded-xl border border-[#235F45] text-xs space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#65A878] text-white flex items-center justify-center font-black text-[10px]">
                  30m
                </span>
                <span>Automatic 30-Min Cutoff</span>
              </div>
              <p className="text-[#A3E5B5] text-[11px] leading-snug">
                Orders close strictly 30 minutes before planned cooking time. Enforced on server time (IST).
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 bg-white text-gray-800 rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes (e.g. Biryani, Pappu, Haleem, Rotis)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#174D36]"
              />
            </div>

            {/* Distance Radius Selector */}
            <div className="md:col-span-4 flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 font-semibold pl-2 flex items-center gap-1">
                <Navigation size={13} className="text-[#174D36]" /> Radius:
              </span>
              {[2, 5, 10].map((radius) => (
                <button
                  key={radius}
                  onClick={() => setRadiusFilter(radius)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    radiusFilter === radius
                      ? 'bg-[#174D36] text-white shadow'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>

            {/* Dietary Filter */}
            <div className="md:col-span-3">
              <select
                value={dietaryFilter}
                onChange={(e) => setDietaryFilter(e.target.value)}
                className="w-full py-2.5 px-3 bg-gray-50 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 outline-none focus:ring-2 focus:ring-[#174D36]"
              >
                {DIETARY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-gray-100 mt-3 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
              Categories:
            </span>
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
                  categoryFilter === cat
                    ? 'bg-[#174D36] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
