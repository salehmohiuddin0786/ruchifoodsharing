'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { HeartHandshake, Gift, MapPin, Search } from 'lucide-react';

export default function DonorsManagementPage() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      const res = await adminApi.getDonors();
      setDonors(res.donors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminApi.toggleUserStatus(userId);
      loadDonors();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = donors.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Food Donor Management</h2>
          <p className="text-xs text-gray-500">Commercial caterers, banquet halls, and surplus food donors</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donors by organization or area..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#174D36]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading food donors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No food donors registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Donor / Organization</th>
                  <th className="py-3 px-4">Address & Area</th>
                  <th className="py-3 px-4">Donation Activity</th>
                  <th className="py-3 px-4">Role Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((donor) => (
                  <tr key={donor.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{donor.name}</div>
                      <div className="text-[11px] text-[#174D36] font-semibold">{donor.business_name || 'Individual Donor'}</div>
                      <div className="text-[10px] text-gray-400">{donor.email} • {donor.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{donor.area || 'Hyderabad'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-xs">{donor.kitchen_address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-purple-700">
                        <Gift className="w-3.5 h-3.5" />
                        <span>{donor.total_donations || 0} batches listed</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        {donor.active_donations || 0} active right now
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {donor.partner_type || 'DONOR'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          donor.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {donor.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(donor.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          donor.status === 'ACTIVE'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {donor.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
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
