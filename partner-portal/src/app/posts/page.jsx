'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { partnerApi } from '@/lib/api';
import { UtensilsCrossed, PlusCircle, Clock, PauseCircle, PlayCircle, MapPin } from 'lucide-react';

export default function MyFoodPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await partnerApi.getPosts();
      setPosts(res.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async (id) => {
    try {
      await partnerApi.togglePostPause(id);
      loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Homemade Food Posts</h2>
          <p className="text-xs text-gray-500">Manage your active cooking sessions, remaining plates, and 4-slot bookings</p>
        </div>

        <Link
          href="/posts/new"
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Dish</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading dishes...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <UtensilsCrossed className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">No dishes posted yet</h4>
            <p className="text-xs text-gray-500 mt-1">Start offering home-cooked authentic meals to your neighbors.</p>
            <Link
              href="/posts/new"
              className="inline-block mt-3 px-4 py-2 bg-[#F5A623] hover:bg-[#DE9319] text-black text-xs font-bold rounded-xl"
            >
              Add Your First Dish &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-[#174D36]">
                      {post.dietary}
                    </span>
                    <span className="text-xs text-gray-400">{post.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900">{post.dish_name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{post.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                    <span className="font-bold text-gray-900">₹{post.price_per_plate} / plate</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">
                      {post.remaining_plates} / {post.total_plates} plates left
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Cutoff: {new Date(post.order_closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-[#174D36]">
                      Bookings: {post.active_customer_bookings_count} / 4 slots
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePause(post.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      post.status === 'ACTIVE'
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {post.status === 'ACTIVE' ? (
                      <>
                        <PauseCircle className="w-4 h-4 text-amber-700" />
                        <span>Pause Orders</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 text-emerald-700" />
                        <span>Resume Orders</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
