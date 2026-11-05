'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';
import { useCart } from '@/context/CartContext';
import {
  Heart,
  UtensilsCrossed,
  ShieldCheck,
  MapPin,
  Star,
  ArrowRight,
  ShoppingCart,
  Trash2,
  Sparkles,
  Check,
} from 'lucide-react';

export default function FavouriteCooksAndMealsPage() {
  const { user } = useAuth();
  const { favourites, removeFavourite, favouriteCount } = useFavourites();
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    addToCart(item, 1);
    setToastMessage(`Added ${item.food_name || item.name} to cart!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleRemove = (e, itemId, itemName) => {
    e.stopPropagation();
    removeFavourite(itemId);
    setToastMessage(`Removed ${itemName || 'item'} from Favourites`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-28 md:pb-16 relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                My Favourite Meals & Chefs
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Your hand-picked favorite homemade dishes, meals, and neighborhood cooks
            </p>
          </div>

          <div className="self-start sm:self-auto px-4 py-2 bg-[#1C2541] border border-white/10 rounded-xl text-xs font-bold text-[#F4D6B0] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{favouriteCount} Saved</span>
          </div>
        </div>

        <div className="rounded-3xl bg-[#1C2541]/85 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
          {favourites.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
              </div>
              <h4 className="font-bold text-white text-base">No favourites saved yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Tap the heart icon on any homemade meal or dish while browsing to save it here for fast re-ordering.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg hover:scale-105 transition"
                >
                  <span>Explore Dishes Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6">
              {favourites.map((fav) => (
                <div
                  key={fav.id}
                  className="p-4 bg-[#0B132B]/80 rounded-2xl border border-white/10 hover:border-[#D97706]/40 flex gap-4 items-center justify-between transition group shadow-md"
                >
                  {/* Circular Image */}
                  <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex-shrink-0 overflow-hidden shadow-md">
                    <img
                      src={
                        fav.image_url ||
                        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={fav.food_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-black text-sm text-white truncate group-hover:text-[#F4D6B0] transition">
                      {fav.food_name}
                    </h4>
                    <p className="text-[11px] text-slate-300 truncate font-medium">
                      Cook: {fav.partner_name || 'Verified Chef'}
                    </p>

                    <div className="flex items-center space-x-2 text-xs pt-0.5">
                      <span className="font-black text-[#F4D6B0] text-sm">
                        ₹{fav.price}
                      </span>
                      <span className="text-slate-500">•</span>
                      <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-400">
                        <Star className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                        <span>{fav.rating || '4.9'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, fav.id, fav.food_name)}
                      title="Remove from favourites"
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl transition"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, fav)}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-[10px] font-black uppercase tracking-wider rounded-xl shadow flex items-center gap-1 active:scale-95 transition"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
