'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { curryRiceApi } from '@/lib/api';
import {
  UtensilsCrossed,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  Clock,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Flame,
} from 'lucide-react';

export default function CurryRiceManagePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await curryRiceApi.getItems();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleSoldOut = async (item) => {
    try {
      const newSoldOut = !item.is_sold_out;
      await curryRiceApi.updateItem(item.id, { isSoldOut: newSoldOut });
      setActionSuccess(`"${item.name}" marked as ${newSoldOut ? 'Sold Out' : 'Available'}.`);
      fetchItems();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update item status.');
    }
  };

  const handleUpdateStock = async (item, delta) => {
    try {
      const newQty = Math.max(0, item.stock_quantity + delta);
      await curryRiceApi.updateItem(item.id, {
        stockQuantity: newQty,
        isSoldOut: newQty === 0 ? true : item.is_sold_out,
      });
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to update stock quantity.');
    }
  };

  const handleDeleteItem = async (itemId, name) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your store?`)) return;
    try {
      await curryRiceApi.deleteItem(itemId);
      setActionSuccess(`"${name}" was removed.`);
      fetchItems();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove item.');
    }
  };

  const filteredItems = items.filter((itm) => {
    if (filter === 'ALL') return true;
    return itm.category === filter;
  });

  const totalCount = items.length;
  const soldOutCount = items.filter((i) => i.is_sold_out || i.stock_quantity === 0).length;
  const inStockCount = totalCount - soldOutCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0F1F17] via-[#1E3A2E] to-[#3E5A3F] p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#6B7F67]/30 rounded-lg text-amber-300">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Curry & Rice Store Manager</h1>
          </div>
          <p className="text-xs text-[#C7CBB8] max-w-xl">
            Sell freshly prepared daily curries, rice, combos, and full daily meals with instant or advance ordering and live inventory controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/curry-rice/orders"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#C7CBB8] hover:text-white text-xs font-bold rounded-2xl transition border border-white/15 flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Manage Orders</span>
          </Link>

          <Link
            href="/curry-rice/new"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0F1F17] text-xs font-black rounded-2xl transition shadow-lg flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Sell New Dish</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Total Store Listings</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1E3A2E]/10 text-[#1E3A2E] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Ready / In Stock</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{inStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Sold Out / Depleted</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{soldOutCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: 'ALL', label: 'All Items' },
          { id: 'CURRY', label: '🍛 Curry Only' },
          { id: 'RICE', label: '🍚 Rice Only' },
          { id: 'CURRY_RICE', label: '🍱 Curry + Rice Combo' },
          { id: 'DAILY_MEALS', label: '🍲 Daily Meals / Thali' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filter === tab.id
                ? 'bg-[#1E3A2E] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-3" />
          <p className="text-xs text-gray-500 font-semibold">Loading your Curry & Rice store inventory...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">No Food Items Listed Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Start selling your specialty curries, rice pots, or home-cooked daily meal thalis to hungry customers nearby.
            </p>
          </div>
          <Link
            href="/curry-rice/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1E3A2E] text-white text-xs font-bold rounded-xl hover:bg-[#0F1F17] transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Your First Dish</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isSoldOut = item.is_sold_out || item.stock_quantity === 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition-all shadow-sm flex flex-col overflow-hidden ${
                  isSoldOut ? 'border-amber-200 bg-amber-50/20 opacity-90' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Image & Header Badges */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800';
                    }}
                  />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
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

                  {/* Order Mode Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg shadow ${
                        item.order_type === 'INSTANT'
                          ? 'bg-emerald-500 text-white'
                          : item.order_type === 'ADVANCE'
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {item.order_type === 'INSTANT' ? '⚡ Instant' : item.order_type === 'ADVANCE' ? '⏰ Advance' : '⚡/⏰ Dual'}
                    </span>
                  </div>

                  {/* Status Overlay if Sold Out */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-4 py-1.5 bg-red-600 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{item.name}</h3>
                      <span className="text-base font-black text-[#1E3A2E] flex-shrink-0">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>

                    <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2 text-[11px] text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">
                        📦 {item.serving_size}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">
                        ⏱️ {item.prep_time_minutes} mins prep
                      </span>
                      {item.is_available_daily === 1 && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold">
                          Daily Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Management & Quick Actions */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">Stock Inventory:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item, -1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="font-black text-gray-900 px-2 min-w-[2rem] text-center">
                          {item.stock_quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item, +5)}
                          className="w-6 h-6 rounded-lg bg-[#1E3A2E] hover:bg-[#0F1F17] font-bold text-white flex items-center justify-center text-xs"
                          title="Add 5 portions"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* Quick Toggle Sold Out & Delete */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSoldOut(item)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                          isSoldOut
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        }`}
                      >
                        {isSoldOut ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark In Stock</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Mark Sold Out</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
