'use client';

import React, { useState, useEffect } from 'react';
import * as api from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { ShieldAlert, Users, Utensils, HeartHandshake, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react';

export default function AdminView() {
  const { preorders, refreshData } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      const [metRes, repRes] = await Promise.all([
        api.fetchAdminMetricsApi(),
        api.fetchAdminReportsApi(),
      ]);
      if (metRes && metRes.success) setMetrics(metRes.metrics);
      if (repRes && repRes.success) setReports(repRes.reports);
      setLoading(false);
    }
    loadAdminData();
  }, []);

  const handleTogglePause = async (postId) => {
    await api.togglePostPauseApi(postId);
    refreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-[#174D36] text-white p-6 rounded-3xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#F5A623]">Platform Command</span>
          <h1 className="text-2xl font-black">RUCHI Trust & Safety Dashboard</h1>
          <p className="text-xs text-[#A3E5B5] mt-1">Moderation queue, Hyderabad pilot metrics & emergency controls</p>
        </div>
        <div className="bg-[#0F3826] px-4 py-2 rounded-2xl border border-[#235F45] text-xs font-mono">
          System: <span className="text-emerald-400">MySQL / XAMPP Healthy</span>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs text-gray-500 font-semibold">Registered Users</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.totalUsers}</p>
            <span className="text-[10px] text-emerald-700">{metrics.totalCooks} verified cooks</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs text-gray-500 font-semibold">Active Pre-Orders</span>
            <p className="text-2xl font-black text-[#F5A623] mt-1">{metrics.activePreorders}</p>
            <span className="text-[10px] text-gray-500">4-booking limits active</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs text-gray-500 font-semibold">Free Food Shares</span>
            <p className="text-2xl font-black text-[#65A878] mt-1">{metrics.activeDonations}</p>
            <span className="text-[10px] text-gray-500">Zero waste community</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs text-gray-500 font-semibold">Safety Reports</span>
            <p className="text-2xl font-black text-red-600 mt-1">{metrics.pendingReports}</p>
            <span className="text-[10px] text-gray-500">Requiring review</span>
          </div>
        </div>
      )}

      {/* Moderation Controls on Pre-Orders */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <span>🛑</span> Emergency Post Controls & Moderation
        </h2>
        <div className="divide-y divide-gray-100">
          {preorders.map((post) => (
            <div key={post.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-gray-900">{post.dish_name}</span>
                <span className="text-gray-500 ml-2">by {post.cook_name} in {post.area}</span>
                <div className="text-[11px] text-gray-400">
                  Status: <strong>{post.status.toUpperCase()}</strong> • Bookings: {post.active_customer_bookings_count}/4 slots
                </div>
              </div>
              <button
                onClick={() => handleTogglePause(post.id)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  post.status === 'active'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {post.status === 'active' ? (
                  <>
                    <PauseCircle size={14} />
                    <span>Emergency Pause</span>
                  </>
                ) : (
                  <>
                    <PlayCircle size={14} />
                    <span>Resume Post</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Reports Queue */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <ShieldAlert size={18} className="text-amber-600" />
          <span>User Grievances & Food Safety Reports</span>
        </h2>
        {reports.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No open user safety complaints.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((rep) => (
              <div key={rep.id} className="py-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">{rep.target_title}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    {rep.status}
                  </span>
                </div>
                <p className="text-gray-600">Reason: {rep.reason}</p>
                <span className="text-[10px] text-gray-400">Submitted: {new Date(rep.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
