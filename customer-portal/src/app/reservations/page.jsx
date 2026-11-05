'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { customerApi } from '@/lib/api';
import { Gift, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function CustomerReservationsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      customerApi.getReservations().then((res) => {
        setClaims(res.reservations || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-12 text-center">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <h3 className="font-bold text-gray-800">Please Sign In</h3>
        <p className="text-xs text-gray-500 mt-1">Sign in to view your reserved free surplus food portions.</p>
        <Link href="/auth/login" className="inline-block mt-4 px-4 py-2 bg-[#174D36] text-white rounded-xl text-xs font-bold">
          Sign In Now &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Free Food Claims</h1>
        <p className="text-xs text-gray-500 mt-1">Active claims, collection deadlines, and pickup locations for surplus meals</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No free food portions reserved</h4>
            <p className="text-xs text-gray-500 mt-1">Claim surplus meals from local banquet halls and events.</p>
            <Link href="/free-food" className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">
              Browse Free Surplus Food &rarr;
            </Link>
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

                  <h3 className="font-bold text-base text-gray-900">{claim.title}</h3>
                  <p className="text-xs text-gray-600">
                    Donor: <span className="font-semibold text-gray-800">{claim.business_name || claim.donor_name}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-1">
                    <span className="font-bold text-purple-900">{claim.servings} portion(s) reserved</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-rose-600 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Must collect before: {new Date(claim.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-gray-800">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{claim.pickup_address}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Storage: {claim.storage_instructions || 'Consume promptly'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
