'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { ShoppingBag, PauseCircle, PlayCircle, Clock, MapPin, Search } from 'lucide-react';

export default function AdminFoodPostsPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await adminApi.getFoodPosts();
      setPosts(res.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async (id) => {
    try {
      await adminApi.togglePostPause(id);
      loadPosts();
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.dish_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.cook_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Homemade Food Post Moderation</h2>
          <p className="text-xs text-gray-500">Live oversight of homemade meals, remaining plates, and 30-min cutoffs</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by dish, cook, or area..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading cooking posts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No food posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Dish & Category</th>
                  <th className="py-3 px-4">Home Cook</th>
                  <th className="py-3 px-4">Price & Plates</th>
                  <th className="py-3 px-4">Customer Slots</th>
                  <th className="py-3 px-4">30-Min Pre-Order Cutoff</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{post.dish_name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {post.dietary}
                        </span>
                        <span className="text-[11px] text-gray-400">{post.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{post.cook_name}</div>
                      <div className="text-[10px] text-gray-400">{post.business_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      ₹{post.price_per_plate}
                      <div className="text-[11px] font-normal text-gray-500">
                        {post.remaining_plates} / {post.total_plates} left
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800">
                        {post.active_customer_bookings_count} / 4
                      </span>{' '}
                      <span className="text-[10px] text-gray-400">max slots</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{new Date(post.order_closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Cooks at: {new Date(post.cooking_starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : post.status === 'CLOSED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleTogglePause(post.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          post.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {post.status === 'ACTIVE' ? 'Emergency Pause' : 'Resume Listing'}
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
