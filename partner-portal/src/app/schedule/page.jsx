'use client';

import React, { useState, useEffect } from 'react';
import { partnerApi } from '@/lib/api';
import { Calendar, Clock, UtensilsCrossed, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CookingSchedulePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnerApi.getPosts().then((res) => {
      setPosts(res.posts || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Weekly Cooking Schedule & Cutoff Timeline</h2>
        <p className="text-xs text-gray-500">Plan ahead for preparation, ingredient purchases, and meal delivery times</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading schedule timeline...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No scheduled cooking sessions found.</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const cookTime = new Date(post.cooking_starts_at);
              const cutoffTime = new Date(post.order_closes_at);
              const isPast = cutoffTime < new Date();

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-2xl border transition ${
                    isPast ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-gray-900">{post.dish_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-emerald-200 text-[#174D36]">
                        {post.dietary}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${isPast ? 'bg-gray-200 text-gray-700' : 'bg-emerald-200 text-emerald-900'}`}>
                      {isPast ? 'Booking Window Closed' : 'Accepting Pre-Orders'}
                    </span>
                  </div>

                  {/* Visual timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-bold block">1. PRE-ORDER CLOSES</span>
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{cutoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{cutoffTime.toLocaleDateString()}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-bold block">2. COOKING BEGINS</span>
                      <div className="flex items-center gap-1.5 font-bold text-[#174D36] mt-0.5">
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>{cookTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{cookTime.toLocaleDateString()}</span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 font-bold block">3. DISPATCH & PICKUP</span>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {post.delivery_available ? 'Delivery & Pickup' : 'Self Pickup at Kitchen'}
                      </div>
                      <span className="text-[10px] text-gray-500">{post.area}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
