'use client';

import React, { useState, useEffect } from 'react';
import { partnerApi } from '@/lib/api';
import { Truck, CheckCircle2, MapPin, Clock, Users } from 'lucide-react';

export default function CollectionManagementPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnerApi.getDonationClaims().then((res) => {
      setClaims(res.claims || []);
      setLoading(false);
    });
  }, []);

  const completed = claims.filter((c) => c.status === 'COLLECTED');
  const pending = claims.filter((c) => c.status === 'CLAIMED');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Food Collection Operations</h2>
        <p className="text-xs text-gray-500">Coordinate on-site pickup and handovers for free food sharing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase">Awaiting Pickup</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{pending.length} claims</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase">Handed Over / Collected</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completed.length} claims</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#174D36]" />
          Active Collection Window
        </h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading collection operations...</div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No scheduled collections today.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {claims.map((c) => (
              <div key={c.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">{c.donation_title}</p>
                  <p className="text-xs text-gray-600">
                    Claimant: <span className="font-semibold text-gray-800">{c.claimant_name}</span> ({c.claimant_phone})
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Quantity: {c.servings} portion(s)</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    c.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
