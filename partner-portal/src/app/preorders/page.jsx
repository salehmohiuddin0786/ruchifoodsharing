'use client';

import React, { useState, useEffect } from 'react';
import { partnerApi } from '@/lib/api';
import { ShoppingBag, Clock, User, Phone, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PartnerPreordersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await partnerApi.getPreorders();
      setOrders(res.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await partnerApi.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Manage Customer Pre-Orders</h2>
        <p className="text-xs text-gray-500">Track home cooked meal bookings, preparation milestones, and customer pickups</p>
      </div>

      {/* 4-Customer Slot Enforcement Explainer Banner */}
      <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-900">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">4-Customer Quality Guarantee Active</p>
          <p className="text-gray-600 text-[11px] mt-0.5">
            The RUCHI platform restricts each dish batch to a maximum of 4 distinct customer bookings. This preserves traditional home cooking taste, hygiene, and timely delivery.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading incoming orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No pre-orders yet</h4>
            <p className="text-xs text-gray-500 mt-1">When neighbors book portions of your dishes, they will appear here in real time.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/70">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-gray-500">{ord.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'PREPARING'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Fulfillment: <span className="font-semibold text-gray-700">{ord.fulfillment_type}</span>
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900">{ord.dish_name}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1 font-semibold text-gray-800">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ord.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ord.customer_phone}</span>
                    </div>
                    <span className="font-bold text-[#174D36]">
                      {ord.plate_quantity} plate(s) • Total: ₹{ord.total_amount}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Cooking Starts: {new Date(ord.cooking_starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span>Pre-Order Window Closed: {new Date(ord.order_closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {ord.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      Start Cooking
                    </button>
                  )}
                  {ord.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'READY')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      Mark Food Ready
                    </button>
                  )}
                  {ord.status === 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'COLLECTED')}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-bold transition"
                    >
                      Confirm Handed Over
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
