'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { curryRiceCustomerApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  Phone,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';

export default function CurryRiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        setError('');
        const data = await curryRiceCustomerApi.getItemById(itemId);
        setItem(data.item);
      } catch (err) {
        setError(err.message || 'Failed to load dish details.');
      } finally {
        setLoading(false);
      }
    }
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  const handleAddToCart = () => {
    if (!item) return;
    const err = addToCart(item, quantity);
    if (err) {
      setError(err);
      setTimeout(() => setError(''), 4000);
    } else {
      setToastMsg(`Added ${quantity}× "${item.name}" to your cart!`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#D97706] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-gray-500 font-bold">Loading dish details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-200">
          {error || 'Dish not found'}
        </div>
        <Link href="/curry-rice" className="inline-flex items-center space-x-1 text-xs font-bold text-[#1C2541] underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isSoldOut = item.is_sold_out || item.stock_quantity === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toastMsg}</span>
          <Link href="/cart" className="ml-3 underline font-black text-amber-200">
            View Cart ({cartCount})
          </Link>
        </div>
      )}

      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/curry-rice"
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curry & Rice Store</span>
        </Link>

        <Link
          href="/cart"
          className="px-4 py-2 bg-amber-50 text-[#D97706] hover:bg-amber-100 rounded-xl border border-amber-200 text-xs font-black flex items-center space-x-1.5 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Cart ({cartCount})</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2">
        {/* Left: Image Banner */}
        <div className="relative min-h-[340px] md:min-h-full bg-gray-100 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800';
            }}
          />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-black/80 backdrop-blur-md text-white text-xs font-black rounded-xl uppercase tracking-wider">
              {item.category.replace('_', ' ')}
            </span>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-xl ${
                item.dietary === 'VEG'
                  ? 'bg-emerald-600 text-white'
                  : item.dietary === 'NON_VEG'
                  ? 'bg-rose-700 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {item.dietary}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 text-xs font-black rounded-xl shadow ${
                item.order_type === 'INSTANT'
                  ? 'bg-emerald-500 text-white'
                  : item.order_type === 'ADVANCE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {item.order_type === 'INSTANT' ? '⚡ Instant' : item.order_type === 'ADVANCE' ? '⏰ Advance' : '⚡/⏰ Dual Mode'}
            </span>
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-5 py-2 bg-red-600 text-white text-sm font-black rounded-2xl uppercase tracking-wider shadow-xl">
                SOLD OUT TODAY
              </span>
            </div>
          )}
        </div>

        {/* Right: Info & Ordering */}
        <div className="p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-snug">{item.name}</h1>
                <span className="text-2xl font-black text-[#D97706] flex-shrink-0">
                  ₹{parseFloat(item.price).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Serving Size</span>
                <span className="font-bold text-gray-800">{item.serving_size}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Preparation Time</span>
                <span className="font-bold text-gray-800">{item.prep_time_minutes} minutes</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Daily Stock</span>
                <span className="font-bold text-emerald-700">{item.stock_quantity} servings available</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Pickup Window</span>
                <span className="font-bold text-gray-800">{item.pickup_time_window}</span>
              </div>
            </div>

            {/* Cook Profile Card */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center text-sm shadow">
                  {item.cook_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="text-xs font-black text-gray-900">{item.cook_name}</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-gray-500">{item.business_name || 'Home Kitchen'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-gray-600 pt-1 border-t border-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{item.pickup_address || item.area}</span>
              </div>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Select Portions:</span>
              <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  disabled={isSoldOut || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-gray-200 font-black text-gray-800 flex items-center justify-center text-sm transition disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-black text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  disabled={isSoldOut || quantity >= item.stock_quantity}
                  onClick={() => setQuantity((q) => Math.min(item.stock_quantity, q + 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-gray-200 font-black text-gray-800 flex items-center justify-center text-sm transition disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSoldOut}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-black transition flex items-center justify-center space-x-2 shadow-lg ${
                  isSoldOut
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[#D97706] hover:bg-[#B45309] text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {isSoldOut ? 'Sold Out' : `Add ${quantity} to Cart • ₹${(parseFloat(item.price) * quantity).toFixed(2)}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
