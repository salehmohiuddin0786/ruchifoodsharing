'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  User,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function AdminCurryRiceOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminApi.getCurryRiceOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch platform marketplace orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'ALL' && ord.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ord.order_number.toLowerCase().includes(q) ||
        ord.customer_name?.toLowerCase().includes(q) ||
        ord.cook_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">PENDING</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">ACCEPTED</span>;
      case 'PREPARING':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">PREPARING</span>;
      case 'READY_FOR_PICKUP':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">READY FOR PICKUP</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-bold rounded">COMPLETED</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Palette 1 (#06141B, #11212D, #253745) */}
      <div className="bg-gradient-to-r from-[#06141B] via-[#11212D] to-[#253745] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#4A5C6A]/50 rounded-lg text-[#CCD0CF]">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight">Marketplace Customer Orders</h1>
          </div>
          <p className="text-xs text-[#9BA8AB] max-w-xl">
            Live monitoring of all Curry & Rice sales, fulfillment methods, instant vs advance preparation, and seller SLA adherence.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#CCD0CF] hover:text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 self-start md:self-auto border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="font-bold text-gray-700">Status:</span>
          {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#253745] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, cook..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#253745]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            All Platform Orders ({filteredOrders.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">No orders match your filter criteria.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="p-5 hover:bg-gray-50/50 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-gray-900">{ord.order_number}</span>
                    {getStatusBadge(ord.status)}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ord.order_type === 'INSTANT' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {ord.order_type === 'INSTANT' ? '⚡ Instant' : '⏰ Advance'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-black text-gray-900">₹{parseFloat(ord.total_amount).toFixed(2)}</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(ord.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Customer</span>
                    <span className="font-bold text-gray-900">{ord.customer_name}</span>
                    <span className="block text-[10px] text-gray-500">{ord.customer_phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Home Cook Seller</span>
                    <span className="font-bold text-gray-900">{ord.cook_name}</span>
                    <span className="block text-[10px] text-gray-500">{ord.business_name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Fulfillment</span>
                    <span className="font-bold text-gray-900">
                      {ord.fulfillment_type === 'DELIVERY' ? 'Doorstep Delivery (+₹35)' : 'Self-Pickup'}
                    </span>
                    <span className="block text-[10px] text-gray-500 truncate">
                      {ord.delivery_address || 'Kitchen Collection'}
                    </span>
                  </div>
                </div>

                {/* Line items pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ord.items?.map((it) => (
                    <span
                      key={it.id}
                      className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] text-gray-700"
                    >
                      {it.quantity}× {it.item_name} ({it.serving_size}) = ₹{parseFloat(it.total_price).toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
