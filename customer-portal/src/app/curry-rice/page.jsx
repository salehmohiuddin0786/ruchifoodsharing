'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { curryRiceCustomerApi } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import {
  UtensilsCrossed,
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Filter,
  CookingPot,
  Flame,
  LayoutGrid,
} from 'lucide-react';

export default function CurryRiceMarketplacePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [dietary, setDietary] = useState('ALL');
  const [orderType, setOrderType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const { addToCart, cartCount, subtotal } = useCart();
  const [itemQuantities, setItemQuantities] = useState({});

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (category !== 'ALL') params.category = category;
      if (dietary !== 'ALL') params.dietary = dietary;
      if (orderType !== 'ALL') params.orderType = orderType;
      if (search) params.search = search;

      const data = await curryRiceCustomerApi.getItems(params);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load curry and rice items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, dietary, orderType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleQtyChange = (itemId, delta, maxStock) => {
    const current = itemQuantities[itemId] || 1;
    const next = Math.max(1, Math.min(maxStock, current + delta));
    setItemQuantities((prev) => ({ ...prev, [itemId]: next }));
  };

  const handleAddToCart = (item) => {
    const qty = itemQuantities[item.id] || 1;
    const err = addToCart(item, qty);
    if (err) {
      setError(err);
      setTimeout(() => setError(''), 4000);
    } else {
      setToastMsg(`Added ${qty}× "${item.name}" to your cart!`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const categoryPills = [
    { id: 'ALL', label: 'All Dishes', icon: LayoutGrid },
    { id: 'CURRY', label: 'Curry', icon: CookingPot },
    { id: 'RICE', label: 'Rice', icon: Flame },
    { id: 'CURRY_RICE', label: 'Curry + Rice', icon: Sparkles },
    { id: 'DAILY_MEAL', label: 'Daily Meals', icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-6 px-4 sm:px-6 lg:px-8 space-y-6 pb-28 md:pb-16 relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl bg-[#1C2541]/95 border border-[#D97706]/50 shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
          <span className="text-xs sm:text-sm font-bold text-white">{toastMsg}</span>
        </div>
      )}

      {/* Hero Banner with Palette 2 styling */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1C2541]/90 via-[#1C2541]/75 to-[#0B132B]/90 border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#3A506B]/40 border border-white/10 text-[#F4D6B0] text-[11px] font-bold rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Curry & Rice Marketplace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Homestyle Curries, Rice Pots & Daily Meals
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            Freshly prepared by verified neighborhood home cooks in local kitchens. Order instant hot bowls or schedule advance daily tiffins.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Dal, Gutti Vankaya, Bagara Rice..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#D97706]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-xs font-black rounded-2xl transition shadow hover:scale-105 active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categoryPills.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black shadow-lg shadow-amber-500/25 scale-[1.03]'
                  : 'bg-[#1C2541]/70 hover:bg-[#3A506B]/50 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#F4D6B0]'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dietary & Fulfillment Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#1C2541]/50 border border-white/5 backdrop-blur-md text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-400">Dietary:</span>
          {['ALL', 'VEG', 'NON_VEG'].map((diet) => (
            <button
              key={diet}
              onClick={() => setDietary(diet)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                dietary === diet
                  ? 'bg-[#D97706] text-black'
                  : 'bg-[#0B132B]/60 text-slate-300 hover:bg-white/5'
              }`}
            >
              {diet === 'ALL' ? 'All Dietary' : diet}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-400">Fulfillment:</span>
          {[
            { id: 'ALL', label: 'All Modes' },
            { id: 'INSTANT', label: '⚡ Instant' },
            { id: 'ADVANCE', label: '⏰ Advance' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setOrderType(mode.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                orderType === mode.id
                  ? 'bg-[#5BC0DE] text-black font-black'
                  : 'bg-[#0B132B]/60 text-slate-300 hover:bg-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <div className="text-center py-20 bg-[#1C2541]/40 rounded-3xl border border-white/5">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-[#D97706] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold">Fetching freshly listed curries and rice...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-[#1C2541]/40 rounded-3xl border border-dashed border-white/10 p-8 space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Food Items Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your dietary or fulfillment filters to see all available homestyle food in your area.
          </p>
          <button
            onClick={() => {
              setCategory('ALL');
              setDietary('ALL');
              setOrderType('ALL');
              setSearch('');
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const isSoldOut = item.is_sold_out || item.stock_quantity === 0;
            const currentQty = itemQuantities[item.id] || 1;

            return (
              <div
                key={item.id}
                className={`bg-[#1C2541]/75 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 backdrop-blur-xl ${
                  isSoldOut ? 'opacity-60' : 'hover:border-[#D97706]/40 hover:-translate-y-1'
                }`}
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-[#0B132B] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800';
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-[#0B132B]/85 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-wider border border-white/10">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                        item.dietary === 'VEG'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.dietary}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black rounded-lg shadow ${
                        item.order_type === 'INSTANT'
                          ? 'bg-emerald-500 text-black'
                          : item.order_type === 'ADVANCE'
                          ? 'bg-[#5BC0DE] text-black'
                          : 'bg-[#D97706] text-black'
                      }`}
                    >
                      {item.order_type === 'INSTANT'
                        ? '⚡ Instant'
                        : item.order_type === 'ADVANCE'
                        ? '⏰ Advance'
                        : '⚡/⏰ Dual'}
                    </span>
                  </div>

                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-4 py-1.5 bg-rose-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg">
                        SOLD OUT TODAY
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/curry-rice/${item.id}`} className="hover:underline">
                        <h3 className="font-bold text-white text-sm leading-snug line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <span className="text-base font-black text-[#F4D6B0] flex-shrink-0">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                      <span className="px-2 py-0.5 bg-[#0B132B]/70 border border-white/5 rounded-md font-medium text-[#F4D6B0]">
                        📦 {item.serving_size}
                      </span>
                      <span className="px-2 py-0.5 bg-[#0B132B]/70 border border-white/5 rounded-md font-medium">
                        ⏱️ {item.prep_time_minutes}m prep
                      </span>
                      <span className="px-2 py-0.5 bg-[#0B132B]/70 border border-white/5 rounded-md font-medium flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.area}</span>
                      </span>
                    </div>

                    {/* Cook Info */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#D97706] text-black text-[10px] font-bold flex items-center justify-center">
                          {item.cook_name?.charAt(0) || 'C'}
                        </div>
                        <span className="font-medium text-slate-200 truncate max-w-[130px]">
                          {item.cook_name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400">
                        {item.stock_quantity > 0 ? `${item.stock_quantity} left` : '0 left'}
                      </span>
                    </div>
                  </div>

                  {/* Actions / Add to Cart */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-1 bg-[#0B132B]/80 p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        disabled={isSoldOut || currentQty <= 1}
                        onClick={() => handleQtyChange(item.id, -1, item.stock_quantity)}
                        className="w-7 h-7 rounded-lg bg-[#1C2541] hover:bg-[#3A506B] font-bold text-white flex items-center justify-center text-xs transition disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-7 text-center font-black text-xs text-white">
                        {currentQty}
                      </span>

                      <button
                        type="button"
                        disabled={isSoldOut || currentQty >= item.stock_quantity}
                        onClick={() => handleQtyChange(item.id, +1, item.stock_quantity)}
                        className="w-7 h-7 rounded-lg bg-[#1C2541] hover:bg-[#3A506B] font-bold text-white flex items-center justify-center text-xs transition disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => handleAddToCart(item)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 shadow ${
                        isSoldOut
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-[#0B132B]/95 text-white rounded-3xl p-4 shadow-2xl border border-white/10 backdrop-blur-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black flex items-center justify-center font-black text-sm shadow">
              {cartCount}
            </div>
            <div>
              <p className="text-xs font-bold text-[#F4D6B0]">Your Food Cart</p>
              <p className="text-sm font-black text-white">Subtotal: ₹{subtotal.toFixed(2)}</p>
            </div>
          </div>

          <Link
            href="/cart"
            className="px-5 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-xs font-black rounded-2xl transition shadow-lg flex items-center space-x-1.5"
          >
            <span>Proceed to Checkout</span>
            <ShoppingCart className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
