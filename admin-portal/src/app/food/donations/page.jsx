'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Gift, MapPin, Clock, Search } from 'lucide-react';

export default function AdminFoodDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await adminApi.getFoodDonations();
      setDonations(res.donations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = donations.filter(
    (d) =>
      d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Free Food Donation Moderation</h2>
          <p className="text-xs text-gray-500">Live surveillance of surplus meals, freshness deadlines, and claims</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, donor, or area..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading donation batches...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No surplus donations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Surplus Food Title</th>
                  <th className="py-3 px-4">Donor / Institution</th>
                  <th className="py-3 px-4">Remaining Servings</th>
                  <th className="py-3 px-4">Safe Collection Expiry</th>
                  <th className="py-3 px-4">Pickup Location</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{d.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded">
                          {d.dietary}
                        </span>
                        <span className="text-[11px] text-gray-400">{d.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{d.donor_name}</div>
                      <div className="text-[10px] text-gray-400">{d.business_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {d.remaining_servings} / {d.total_servings} servings
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                      <div className="flex items-center gap-1 text-rose-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(d.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">{new Date(d.expires_at).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{d.area}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs">{d.pickup_address}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'RESERVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {d.status}
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
