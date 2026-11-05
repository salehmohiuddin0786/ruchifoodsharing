'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { partnerApi } from '@/lib/api';
import { Gift, PlusCircle, Clock, MapPin, Users } from 'lucide-react';

export default function FoodDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await partnerApi.getDonations();
      setDonations(res.donations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Surplus Food Donations</h2>
          <p className="text-xs text-gray-500">Prevent food waste by sharing clean banquet and surplus meals with neighbors</p>
        </div>

        <Link
          href="/donations/new"
          className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Food Donation</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading donations...</div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No food donations listed yet</h4>
            <p className="text-xs text-gray-500 mt-1">Have prepared surplus food? Donate it safely to the community.</p>
            <Link
              href="/donations/new"
              className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
            >
              List Free Food Now &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {donations.map((d) => (
              <div key={d.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/70">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-100 text-purple-900">
                      {d.dietary}
                    </span>
                    <span className="text-xs text-gray-400">{d.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'RESERVED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900">{d.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{d.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                    <span className="font-bold text-purple-900">
                      {d.remaining_servings} / {d.total_servings} servings left
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Must collect before: {new Date(d.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(d.expires_at).toLocaleDateString()})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {d.area}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href="/donations/claims"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
                  >
                    View Claims ({d.claim_count || 0})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
