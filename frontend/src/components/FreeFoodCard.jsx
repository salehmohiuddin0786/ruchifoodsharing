'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, Clock, MapPin, AlertCircle, Shield, Flag } from 'lucide-react';

export default function FreeFoodCard({ post, onReserve, onReport }) {
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      const expires = new Date(post.expires_at || post.expiresAtIso);
      const diffMs = expires.getTime() - now.getTime();

      if (diffMs <= 0 || post.status === 'expired') {
        setIsExpired(true);
        setTimeLeftStr('Collection Window Closed');
      } else {
        setIsExpired(false);
        const mins = Math.floor(diffMs / 60000);
        const hours = Math.floor(mins / 60);
        const remMins = mins % 60;
        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${remMins}m left to collect`);
        } else {
          setTimeLeftStr(`${mins}m left to collect`);
        }
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 15000);
    return () => clearInterval(interval);
  }, [post]);

  const remaining = post.remaining_servings !== undefined ? post.remaining_servings : post.total_servings;
  const isAvailable = post.status === 'available' && remaining > 0 && !isExpired;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#E8F5EC] flex flex-col justify-between">
      {/* Food Photo & Status Badges */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        <img
          src={post.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Free Food Badge */}
        <div className="absolute top-3 left-3 bg-[#174D36] text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-[#65A878]">
          <HeartHandshake size={14} className="text-[#65A878]" />
          <span>FREE SURPLUS SHARE (₹0)</span>
        </div>

        {/* Safe Collection Deadline Countdown */}
        <div
          className={`absolute bottom-0 inset-x-0 py-1.5 px-3 text-xs font-bold flex items-center justify-between text-white ${
            isExpired ? 'bg-gray-800/90' : 'bg-[#0F3826]/90 backdrop-blur-sm'
          }`}
        >
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-[#F5A623]" />
            <span>Safe Expiry: {new Date(post.expires_at || post.expiresAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
          <span className="text-[11px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-[#A3E5B5]">
            {timeLeftStr}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Donor Info & Category */}
          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">{post.donor_name}</span>
              <span className="text-gray-400">•</span>
              <span className="capitalize text-emerald-800 font-medium">
                {post.donor_type || 'Surplus Donor'}
              </span>
            </div>
            <button
              onClick={() => onReport('donation', post.id, post.title)}
              className="text-gray-400 hover:text-red-500 transition"
              title="Report issue with listing"
            >
              <Flag size={13} />
            </button>
          </div>

          {/* Title & Description */}
          <div className="mt-3">
            <h3 className="text-base font-extrabold text-gray-900 leading-snug">
              {post.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {post.description}
            </p>
          </div>

          {/* Available Servings Meter */}
          <div className="mt-4 bg-[#E8F5EC] p-3 rounded-2xl border border-[#65A878]/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#174D36]">
              <span>Surplus Portions Available:</span>
              <span className="text-sm">{remaining} of {post.total_servings} servings left</span>
            </div>
            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#65A878]/20">
              <div
                className="bg-[#174D36] h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (remaining / (post.total_servings || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Food Safety & Storage Details */}
          <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
            <div className="flex items-start gap-1.5">
              <Shield size={13} className="text-[#174D36] shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">
                <strong>Handling:</strong> {post.storage_instructions || 'Consume promptly or refrigerate upon collection.'}
              </span>
            </div>
            {post.allergens && (
              <div className="flex items-start gap-1.5 text-amber-800 text-[11px]">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>Allergens: {post.allergens}</span>
              </div>
            )}
          </div>

          {/* Pickup Address */}
          <div className="mt-2.5 text-xs text-gray-500 flex items-center gap-1.5">
            <MapPin size={13} className="text-[#65A878] shrink-0" />
            <span className="truncate">{post.pickup_address || `${post.area}, Hyderabad`}</span>
          </div>
        </div>

        {/* Reservation CTA Button */}
        <div className="pt-2">
          {isAvailable ? (
            <button
              onClick={() => onReserve(post)}
              className="w-full py-3 rounded-xl bg-[#65A878] hover:bg-[#4E8D60] text-white font-bold text-sm shadow-md hover:shadow-lg transition transform active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Reserve Free Food</span>
              <span className="text-xs text-white/80 font-normal">(Zero Charge ₹0)</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
            >
              {isExpired ? 'Collection Window Expired' : 'All Portions Claimed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
