'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
  Utensils,
  AlertTriangle,
  Flag,
} from 'lucide-react';

export default function PreOrderCard({ post, onSelectPost, onReport }) {
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isCutoff, setIsCutoff] = useState(false);

  // Live countdown timer to the automatic 30-minute cutoff
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date(post.order_closes_at || post.orderClosesAtIso);
      const diffMs = cutoff.getTime() - now.getTime();

      if (diffMs <= 0 || post.status === 'closed' || post.status === 'sold_out') {
        setIsCutoff(true);
        setTimeLeftStr('Cutoff Reached');
      } else {
        setIsCutoff(false);
        const diffMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${mins}m left to order`);
        } else {
          setTimeLeftStr(`${mins}m left to order`);
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 10000);
    return () => clearInterval(timer);
  }, [post]);

  const activeBookings = post.active_customer_bookings_count || 0;
  const remainingPlates = post.remaining_plates !== undefined ? post.remaining_plates : post.total_plates;
  const isFourCustomerCeilingReached = activeBookings >= 4;
  const isSoldOut = post.status === 'sold_out' || remainingPlates <= 0 || isFourCustomerCeilingReached;
  const isOrderDisabled = isCutoff || isSoldOut || post.status !== 'active';

  const cookingStartTime = new Date(post.cooking_starts_at || post.cookingStartsAtIso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const orderCloseTime = new Date(post.order_closes_at || post.orderClosesAtIso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between">
      {/* Top Image & Visual Badges */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={post.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={post.dish_name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Paid Pre-Order Badge */}
        <div className="absolute top-3 left-3 bg-[#F5A623] text-black text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
          <Utensils size={13} />
          <span>HOME COOK PRE-ORDER</span>
        </div>

        {/* Dietary Tag */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
          {post.dietary === 'veg' ? (
            <span className="text-green-700">🟢 Pure Veg</span>
          ) : (
            <span className="text-red-700">🔴 Non-Veg</span>
          )}
        </div>

        {/* 30-Minute Cutoff Countdown Banner */}
        <div
          className={`absolute bottom-0 inset-x-0 py-1.5 px-3 text-xs font-bold flex items-center justify-between text-white ${
            isCutoff || post.status === 'closed'
              ? 'bg-red-700/90'
              : 'bg-[#174D36]/90 backdrop-blur-sm'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#F5A623]" />
            <span>Cutoff: {orderCloseTime} (30m prior)</span>
          </span>
          <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded-full font-mono">
            {timeLeftStr}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Cook Profile & FSSAI Verification */}
          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <img
                src={post.cook_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'}
                alt={post.cook_name}
                className="w-6 h-6 rounded-full object-cover border border-[#65A878]"
              />
              <span className="font-semibold text-gray-800">{post.cook_name}</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                <ShieldCheck size={11} /> FSSAI
              </span>
            </div>
            <button
              onClick={() => onReport('preorder', post.id, post.dish_name)}
              className="text-gray-400 hover:text-red-500 transition"
              title="Report food listing"
            >
              <Flag size={13} />
            </button>
          </div>

          {/* Dish Name & Description */}
          <div className="mt-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                {post.dish_name}
              </h3>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-[#174D36]">₹{post.price_per_plate}</span>
                <span className="text-[11px] text-gray-500 block">/ plate</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {post.description}
            </p>
          </div>

          {/* Critical Rule 1: Four-Customer Slot Meter */}
          <div className="mt-4 bg-[#FFF9EE] p-3 rounded-2xl border border-[#F5A623]/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <Users size={14} className="text-[#F5A623]" />
                <span>Customer Bookings:</span>
              </span>
              <span className="font-bold text-[#174D36]">
                {activeBookings} of 4 slots filled
              </span>
            </div>

            {/* Visual 4-slot dots */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((slotIdx) => (
                <div
                  key={slotIdx}
                  className={`h-2 rounded-full transition-colors ${
                    slotIdx < activeBookings
                      ? 'bg-[#F5A623]'
                      : 'bg-gray-200'
                  }`}
                  title={`Slot ${slotIdx + 1} of 4`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
              <span>
                Plate Stock: <strong>{remainingPlates} / {post.total_plates} left</strong>
              </span>
              <span className="text-[#174D36] font-semibold">
                Cooking at {cookingStartTime}
              </span>
            </div>
          </div>

          {/* Location & Delivery Info */}
          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{post.area}, Hyderabad</span>
              {post.distanceKm !== undefined && (
                <span className="bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                  {post.distanceKm} km
                </span>
              )}
            </div>
            {post.delivery_available && (
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Truck size={13} />
                <span>Home Delivery Available (+₹{post.delivery_fee})</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking CTA Button */}
        <div className="pt-2">
          {isSoldOut ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
            >
              {isFourCustomerCeilingReached
                ? 'Fully Booked (4 Customer Slots Full)'
                : 'Sold Out'}
            </button>
          ) : isCutoff ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-1"
            >
              <AlertTriangle size={14} />
              <span>Orders Closed (30m Cutoff Passed)</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectPost(post)}
              className="w-full py-3 rounded-xl bg-[#174D36] hover:bg-[#0F3826] text-white font-bold text-sm shadow-md hover:shadow-lg transition transform active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Pre-Order Plate</span>
              <span className="text-xs text-[#A3E5B5] font-normal">
                (₹{post.price_per_plate})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
