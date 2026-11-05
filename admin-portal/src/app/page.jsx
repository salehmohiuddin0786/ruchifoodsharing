'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import {
  Users,
  UtensilsCrossed,
  HeartHandshake,
  ShoppingBag,
  Gift,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [foodPosts, setFoodPosts] = useState([]);
  const [cooks, setCooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      loadDashboardData();
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [mRes, repRes, postRes, cookRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getReports(),
        adminApi.getFoodPosts(),
        adminApi.getCooks(),
      ]);
      setMetrics(mRes.metrics);
      setReports(repRes.reports || []);
      setFoodPosts(postRes.posts || []);
      setCooks(cookRes.cooks || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTogglePostPause = async (postId) => {
    try {
      await adminApi.togglePostPause(postId);
      loadDashboardData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleVerifyCook = async (cookId, status) => {
    try {
      await adminApi.verifyCook(cookId, status);
      loadDashboardData();
    } catch (e) {
      alert(e.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#174D36]"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Customers', value: metrics?.totalCustomers || 0, icon: Users, color: 'emerald', href: '/users/customers' },
    { title: 'Home Cooks', value: metrics?.totalCooks || 0, icon: UtensilsCrossed, color: 'blue', href: '/users/cooks' },
    { title: 'Food Donors', value: metrics?.totalDonors || 0, icon: HeartHandshake, color: 'purple', href: '/users/donors' },
    { title: 'Active Food Posts', value: metrics?.activeFoodPosts || 0, icon: ShoppingBag, color: 'amber', href: '/food/posts' },
    { title: 'Free Donations Available', value: metrics?.activeDonations || 0, icon: Gift, color: 'teal', href: '/food/donations' },
    { title: 'Platform Orders', value: metrics?.totalOrders || 0, icon: TrendingUp, color: 'indigo', href: '/orders' },
    { title: 'Safety Reports', value: metrics?.pendingReports || 0, icon: ShieldAlert, color: 'rose', href: '/reports', urgent: metrics?.pendingReports > 0 },
  ];

  const pendingVerificationCooks = cooks.filter((c) => c.verification_status === 'PENDING' || !c.verification_status);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#174D36] to-[#206346] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black">Welcome back, {user?.name || 'Administrator'}</h2>
            <span className="bg-[#F5A623] text-black font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
              {user?.roles?.[0]}
            </span>
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Monitoring food safety, pre-order cutoff windows, and community welfare across Hyderabad.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className={`p-4 bg-white rounded-2xl border transition hover:shadow-md ${
                card.urgent ? 'border-rose-300 ring-2 ring-rose-200' : 'border-gray-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.urgent ? 'text-rose-500' : 'text-gray-400'}`} />
              </div>
              <p className={`text-2xl font-black ${card.urgent ? 'text-rose-600' : 'text-gray-900'}`}>{card.value}</p>
            </Link>
          );
        })}
      </div>

      {/* 2-Column Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: FSSAI Verification Queue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5 text-[#174D36]" />
              <h3 className="font-bold text-gray-900">Cook Verification Queue</h3>
            </div>
            <Link href="/users/cooks" className="text-xs text-[#174D36] font-bold hover:underline flex items-center gap-1">
              View all cooks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {cooks.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No registered cooks found.</p>
          ) : (
            <div className="space-y-3">
              {cooks.slice(0, 4).map((cook) => (
                <div key={cook.id} className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{cook.name}</p>
                    <p className="text-xs text-gray-500 truncate">{cook.business_name || 'Home Kitchen'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                        FSSAI: {cook.fssai_number || 'Under Review'}
                      </span>
                      <span className="text-[10px] text-gray-400">{cook.area}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-3">
                    {cook.verification_status === 'VERIFIED' ? (
                      <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerifyCook(cook.id, 'VERIFIED')}
                        className="text-xs px-3 py-1 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-lg font-bold transition"
                      >
                        Approve FSSAI
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Live Food Posts Emergency Moderation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#174D36]" />
              <h3 className="font-bold text-gray-900">Active Homemade Food Posts</h3>
            </div>
            <Link href="/food/posts" className="text-xs text-[#174D36] font-bold hover:underline flex items-center gap-1">
              Manage all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {foodPosts.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No active food posts.</p>
          ) : (
            <div className="space-y-3">
              {foodPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{post.dish_name}</p>
                    <p className="text-xs text-gray-500">
                      Cook: <span className="font-medium text-gray-700">{post.cook_name}</span> • ₹{post.price_per_plate}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span className="font-semibold text-emerald-700">
                        {post.remaining_plates}/{post.total_plates} plates left
                      </span>
                      <span>•</span>
                      <span>Bookings: {post.active_customer_bookings_count}/4 max</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => handleTogglePostPause(post.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                        post.status === 'ACTIVE'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      {post.status === 'ACTIVE' ? (
                        <>
                          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resume</span>
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

      {/* Safety & Moderation Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-gray-900">Safety & Quality Dispute Reports</h3>
          </div>
          <Link href="/reports" className="text-xs text-[#174D36] font-bold hover:underline flex items-center gap-1">
            Open incident management <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">All Clean: Zero Pending Disputes</p>
            <p className="text-xs text-gray-500">No active complaints or safety violations flagged by community users.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.slice(0, 3).map((rep) => (
              <div key={rep.id} className="py-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-100 text-rose-700">
                    {rep.target_type}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{rep.target_title || rep.reason}</p>
                  <p className="text-xs text-gray-500">{rep.reason}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(rep.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
