'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import {
  UtensilsCrossed,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  ShoppingBag,
  Power,
  ShieldCheck,
} from 'lucide-react';

export default function AdminCurryRicePage() {
  const [items, setItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [itemsRes, analyticsRes] = await Promise.all([
        adminApi.getCurryRiceItems(),
        adminApi.getCurryRiceAnalytics(),
      ]);
      setItems(itemsRes.items || []);
      setAnalytics(analyticsRes.analytics || null);
    } catch (err) {
      setError(err.message || 'Failed to load Curry & Rice marketplace data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await adminApi.updateCurryRiceItemStatus(item.id, newStatus, item.is_sold_out);
      setSuccessMsg(`"${item.name}" status changed to ${newStatus}.`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update item status.');
    }
  };

  const handleToggleSoldOut = async (item) => {
    try {
      const newSoldOut = !item.is_sold_out;
      await adminApi.updateCurryRiceItemStatus(item.id, item.status, newSoldOut);
      setSuccessMsg(`"${item.name}" marked as ${newSoldOut ? 'Sold Out' : 'In Stock'}.`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update stock flag.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.cook_name?.toLowerCase().includes(q) ||
        item.area?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner - Palette 1 (#06141B, #11212D, #253745, #4A5C6A) */}
      <div className="bg-gradient-to-r from-[#06141B] via-[#11212D] to-[#253745] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#4A5C6A]/50 rounded-lg text-[#CCD0CF]">
              <UtensilsCrossed className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Curry & Rice Selling Marketplace Ops</h1>
          </div>
          <p className="text-xs text-[#9BA8AB] max-w-xl">
            Centralized platform oversight: oversee all food categories, seller dishes, inventory levels, pricing, and live customer orders.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#CCD0CF] hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 self-start md:self-auto border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Row */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Active Store Dishes</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{analytics.totalListings}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#253745]/10 text-[#253745] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Total Marketplace Orders</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{analytics.totalOrders}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Gross Sales Volume</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                ₹{parseFloat(analytics.grossRevenue).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Instant vs Advance</p>
              <p className="text-xs font-bold text-gray-800 mt-1">
                {analytics.orderTypeBreakdown?.map((b) => `${b.order_type}: ${b.count}`).join(' | ') || 'None yet'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="font-bold text-gray-700">Category:</span>
          {['ALL', 'CURRY', 'RICE', 'CURRY_RICE', 'DAILY_MEALS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#253745] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish or cook..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#253745]"
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            All Marketplace Food Listings ({filteredItems.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Loading listings...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">No listings match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Dish Info</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Home Cook / Seller</th>
                  <th className="py-3 px-4">Price & Serving</th>
                  <th className="py-3 px-4">Stock & Sold Out</th>
                  <th className="py-3 px-4">Platform Status</th>
                  <th className="py-3 px-4 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800';
                          }}
                        />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              item.dietary === 'VEG'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {item.dietary}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 font-bold text-gray-800 rounded-md text-[10px]">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{item.cook_name}</p>
                      <p className="text-[10px] text-gray-400">{item.area}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-black text-gray-900">₹{parseFloat(item.price).toFixed(2)}</p>
                      <p className="text-[10px] text-gray-500">{item.serving_size}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800">{item.stock_quantity} left</span>
                      {item.is_sold_out === 1 && (
                        <span className="block text-[9px] font-black text-red-600 uppercase">SOLD OUT</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleSoldOut(item)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          item.is_sold_out === 1
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.is_sold_out === 1 ? 'Mark In-Stock' : 'Force Sold-Out'}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                          item.status === 'ACTIVE'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
