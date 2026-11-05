'use client';

import React, { useState, useEffect } from 'react';
import { partnerApi } from '@/lib/api';
import { FileCheck2, User, Phone, CheckCircle2, MapPin } from 'lucide-react';

export default function DonationClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const res = await partnerApi.getDonationClaims();
      setClaims(res.claims || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (claimId, status) => {
    try {
      await partnerApi.updateClaimStatus(claimId, status);
      loadClaims();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Donation Claims & Reservations</h2>
        <p className="text-xs text-gray-500">Neighbors and volunteers who have reserved free surplus meals for collection</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No claims yet</h4>
            <p className="text-xs text-gray-500 mt-1">When community members claim servings of your donations, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {claims.map((claim) => (
              <div key={claim.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/70">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-gray-400">Claim #{claim.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        claim.status === 'CLAIMED'
                          ? 'bg-amber-100 text-amber-800'
                          : claim.status === 'COLLECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900">{claim.donation_title}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1 font-semibold text-gray-800">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{claim.claimant_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{claim.claimant_phone}</span>
                    </div>
                    <span className="font-bold text-purple-900">
                      Reserved {claim.servings} serving(s)
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      Claimed: {new Date(claim.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {claim.status === 'CLAIMED' && (
                    <button
                      onClick={() => handleUpdateStatus(claim.id, 'COLLECTED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      Mark Collected
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
