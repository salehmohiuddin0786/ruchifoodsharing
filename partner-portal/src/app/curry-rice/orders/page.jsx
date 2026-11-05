'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { curryRiceApi } from '@/lib/api';
import {
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User,
  MapPin,
  AlertCircle,
  ChefHat,
  PackageCheck,
  CheckCheck,
} from 'lucide-react';

export default function PartnerCurryRiceOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await curryRiceApi.getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch incoming orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    if (newStatus === 'REJECTED') {
      const inputReason = prompt('Enter a brief reason for rejecting this order (e.g. Out of ingredients, Kitchen closed):', 'Kitchen at capacity');
      if (inputReason === null) return; // User cancelled prompt
      reason = inputReason || 'Cook unavailable';
    }

    try {
      setActionLoading(orderId);
      setError('');
      await curryRiceApi.updateOrderStatus(orderId, newStatus, reason);
      setSuccessMsg(`Order updated to: ${newStatus.replace(/_/g, ' ')}`);
      await fetchOrders();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg">🟡 PENDING ACCEPTANCE</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg">🔵 ORDER ACCEPTED</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-black rounded-lg animate-pulse">🔥 PREPARING IN KITCHEN</span>;
      case 'READY_FOR_PICKUP':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">📦 READY FOR PICKUP</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-[10px] font-black rounded-lg">✅ COMPLETED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-black rounded-lg">❌ REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/curry-rice" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Curry & Rice Orders & Kitchen Prep</h1>
            <p className="text-xs text-gray-500">Accept, prepare, and notify customers when meals are packed and ready</p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold rounded-xl flex items-center space-x-1.5 text-gray-700 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'PENDING', label: 'Pending Action' },
          { id: 'ACCEPTED', label: 'Accepted' },
          { id: 'PREPARING', label: 'In Preparation' },
          { id: 'READY_FOR_PICKUP', label: 'Ready for Collection' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filter === tab.id
                ? 'bg-[#1E3A2E] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-3" />
          <p className="text-xs text-gray-500 font-semibold">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 p-8 space-y-3">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No orders in this category</p>
          <p className="text-xs text-gray-400">Incoming customer orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isActing = actionLoading === ord.id;

            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5 hover:border-gray-300 transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-black text-gray-900">{ord.order_number}</span>
                      {getStatusBadge(ord.status)}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ord.order_type === 'INSTANT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.order_type === 'INSTANT' ? '⚡ Instant Order' : '⏰ Advance Order'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Placed on: {new Date(ord.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="text-right sm:text-right">
                    <span className="text-lg font-black text-[#1E3A2E]">₹{parseFloat(ord.total_amount).toFixed(2)}</span>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      {ord.fulfillment_type === 'DELIVERY' ? '🛵 Home Delivery' : '🥡 Self-Pickup'}
                    </p>
                  </div>
                </div>

                {/* Customer & Fulfillment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-gray-900 font-bold">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{ord.customer_name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${ord.customer_phone}`} className="hover:underline text-blue-600">
                        {ord.customer_phone || 'No phone provided'}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-gray-700 font-medium">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {ord.fulfillment_type === 'DELIVERY'
                          ? `Delivery Address: ${ord.delivery_address || 'Address on file'}`
                          : 'Self-Pickup at Your Kitchen'}
                      </span>
                    </div>
                    {ord.customer_note && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        💬 Note: "{ord.customer_note}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Items:</p>
                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-white">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900">{item.item_name}</span>
                          <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                            <span className="bg-gray-100 px-1.5 py-0.2 rounded font-medium">{item.item_category}</span>
                            <span>•</span>
                            <span>{item.serving_size}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-gray-800">
                            {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}
                          </span>
                          <span className="block text-gray-900 font-black">
                            = ₹{parseFloat(item.total_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons depending on current state */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2.5">
                  {ord.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(ord.id, 'REJECTED')}
                        className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Order</span>
                      </button>

                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'ACCEPTED' && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cooking / Preparation</span>
                    </button>
                  )}

                  {ord.status === 'PREPARING' && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleUpdateStatus(ord.id, 'READY_FOR_PICKUP')}
                      className="px-5 py-2 bg-[#1E3A2E] hover:bg-[#0F1F17] text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
                    >
                      <PackageCheck className="w-4 h-4 text-emerald-400" />
                      <span>Mark Ready for Pickup / Delivery</span>
                    </button>
                  )}

                  {ord.status === 'READY_FOR_PICKUP' && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center space-x-1.5"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark Completed (Handed Over)</span>
                    </button>
                  )}

                  {ord.status === 'COMPLETED' && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                      <CheckCheck className="w-4 h-4" />
                      <span>Completed & Settled</span>
                    </span>
                  )}

                  {ord.status === 'REJECTED' && (
                    <span className="text-xs font-semibold text-red-600 flex items-center space-x-1">
                      <XCircle className="w-4 h-4" />
                      <span>Rejected: {ord.rejection_reason || 'Out of stock'}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
