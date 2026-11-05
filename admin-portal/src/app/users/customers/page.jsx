'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Users, Search, Ban, CheckCircle, MapPin, ShoppingBag } from 'lucide-react';

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await adminApi.getCustomers();
      setCustomers(res.customers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminApi.toggleUserStatus(userId);
      loadCustomers();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-xs text-gray-500">View and manage registered customers across Hyderabad</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or area..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#174D36]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Delivery Area</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{cust.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">ID: {cust.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-gray-800">{cust.email}</div>
                      <div className="text-gray-400 text-[11px]">{cust.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{cust.area || 'Hyderabad'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs">{cust.default_delivery_address}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{cust.order_count || 0} pre-orders</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(cust.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          cust.status === 'ACTIVE'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {cust.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
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
