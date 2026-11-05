'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { ShoppingBag, Search, Clock, CreditCard } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await adminApi.getOrders();
      setOrders(res.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.dish_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.cook_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Platform Pre-Orders Ledger</h2>
          <p className="text-xs text-gray-500">Live order fulfillment tracking, customer details, and payment reconciliation</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, dish, customer..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No pre-orders recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Dish Ordered</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Cook</th>
                  <th className="py-3 px-4">Plates & Total</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-gray-800 text-[11px]">{ord.id}</div>
                      <div className="text-[10px] text-gray-400">{new Date(ord.created_at).toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{ord.dish_name}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{ord.customer_name}</div>
                      <div className="text-[10px] text-gray-400">{ord.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">{ord.cook_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      <div>₹{ord.total_amount}</div>
                      <div className="text-[11px] text-gray-500 font-normal">{ord.plate_quantity} plate(s)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-700">
                        {ord.fulfillment_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'PREPARING'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'READY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'COLLECTED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ord.status}
                      </span>
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
