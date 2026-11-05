'use client';

import React from 'react';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';
import { X, ExternalLink, Bell, Utensils, Gift, Sparkles } from 'lucide-react';

export default function NotificationToast() {
  const { inAppToast, setInAppToast } = useNotifications();

  if (!inAppToast) return null;

  const getIcon = () => {
    switch (inAppToast.type) {
      case 'NEW_DISH':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'NEW_PREORDER':
        return <Bell className="w-5 h-5 text-emerald-400" />;
      case 'FREE_FOOD':
        return <Gift className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#F4D6B0]" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-slideDown shadow-2xl">
      <div className="rounded-2xl bg-[#16203A] border border-white/15 p-4 shadow-2xl backdrop-blur-2xl flex items-start space-x-3.5 relative overflow-hidden">
        {/* Category Accent Line */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
            inAppToast.type === 'NEW_DISH'
              ? 'bg-amber-500'
              : inAppToast.type === 'NEW_PREORDER'
              ? 'bg-emerald-500'
              : inAppToast.type === 'FREE_FOOD'
              ? 'bg-rose-500'
              : 'bg-[#D97706]'
          }`}
        />

        {/* Thumbnail or Category Icon */}
        <div className="w-11 h-11 rounded-xl bg-[#0B132B] border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
          {inAppToast.imageUrl ? (
            <img
              src={inAppToast.imageUrl}
              alt={inAppToast.title}
              className="w-full h-full object-cover"
            />
          ) : (
            getIcon()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                inAppToast.type === 'NEW_DISH'
                  ? 'bg-amber-500/10 text-amber-400'
                  : inAppToast.type === 'NEW_PREORDER'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : inAppToast.type === 'FREE_FOOD'
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {inAppToast.type === 'NEW_DISH'
                ? 'New Dish'
                : inAppToast.type === 'NEW_PREORDER'
                ? 'Pre-Order'
                : inAppToast.type === 'FREE_FOOD'
                ? 'Free Food'
                : 'Alert'}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
            {inAppToast.title}
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
            {inAppToast.message}
          </p>

          {inAppToast.targetUrl && (
            <Link
              href={inAppToast.targetUrl}
              onClick={() => setInAppToast(null)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F4D6B0] hover:text-white mt-2 transition"
            >
              <span>View details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setInAppToast(null)}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
