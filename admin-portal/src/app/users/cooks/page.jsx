'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { UtensilsCrossed, CheckCircle2, XCircle, Search, ShieldCheck, MapPin } from 'lucide-react';

export default function CooksManagementPage() {
  const [cooks, setCooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCooks();
  }, []);

  const loadCooks = async () => {
    try {
      const res = await adminApi.getCooks();
      setCooks(res.cooks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (cookId, status) => {
    try {
      await adminApi.verifyCook(cookId, status);
      loadCooks();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminApi.toggleUserStatus(userId);
      loadCooks();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = cooks.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.fssai_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Home Cook Management & FSSAI Verification</h2>
          <p className="text-xs text-gray-500">Audit hygiene standards and certify home kitchens</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by cook name or FSSAI #..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#174D36]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading home cooks...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No cooks registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Home Cook / Kitchen</th>
                  <th className="py-3 px-4">FSSAI License</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Rating & Orders</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cook) => (
                  <tr key={cook.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{cook.name}</div>
                      <div className="text-[11px] text-emerald-800 font-semibold">{cook.business_name}</div>
                      <div className="text-[10px] text-gray-400">{cook.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                        {cook.fssai_number || 'NOT_SUBMITTED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{cook.area}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs">{cook.kitchen_address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-800">⭐ {cook.rating || '5.0'}</div>
                      <div className="text-[11px] text-gray-400">{cook.total_orders_served || 0} completed</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cook.verification_status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cook.verification_status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cook.verification_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {cook.verification_status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerify(cook.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-lg text-xs font-semibold transition"
                        >
                          Approve
                        </button>
                      )}
                      {cook.verification_status === 'VERIFIED' && (
                        <button
                          onClick={() => handleVerify(cook.id, 'PENDING')}
                          className="px-2 py-1 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-medium"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(cook.id)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                      >
                        {cook.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
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
