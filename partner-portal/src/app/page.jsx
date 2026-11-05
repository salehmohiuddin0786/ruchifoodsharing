'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { partnerApi } from '@/lib/api';
import {
  UtensilsCrossed,
  Gift,
  PlusCircle,
  Clock,
  TrendingUp,
  ShoppingBag,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PartnerDashboardPage() {
  const { user, isCook, isDonor, isBoth, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      loadDashboard();
    }
  }, [user, authLoading]);

  const loadDashboard = async () => {
    try {
      const res = await partnerApi.getDashboard();
      setData(res);
    } catch (e) {
      console.error('Failed to load partner dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await partnerApi.updateOrderStatus(orderId, newStatus);
      loadDashboard();
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

  const stats = data?.stats || {};
  const schedules = data?.upcomingSchedules || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-8">
      {/* Welcome & Fast Actions Header */}
      <div className="bg-gradient-to-r from-[#174D36] to-[#256B4C] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black">{data?.profile?.business_name || user?.name}</h2>
            <span className="bg-[#F5A623] text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {isBoth ? 'Cook & Donor' : isCook ? 'Home Cook' : 'Food Donor'}
            </span>
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Kitchen Location: {data?.profile?.kitchen_address || 'Hyderabad'} • FSSAI: {data?.profile?.fssai_number || 'Certified'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/posts/new"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#F5A623] hover:bg-[#DE9319] text-black rounded-xl text-xs font-bold transition shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Homemade Dish</span>
          </Link>
          <Link
            href="/donations/new"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition"
          >
            <Gift className="w-4 h-4 text-emerald-300" />
            <span>Donate Surplus Food</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Active Dishes</span>
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.activePosts || 0}</p>
          <p className="text-[10px] text-gray-400 mt-1">Accepting pre-orders</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Pre-Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.totalOrders || 0}</p>
          <p className="text-[10px] text-gray-400 mt-1">Customer meals cooked</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Cook Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-black text-[#174D36]">₹{stats.totalEarnings || 0}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Direct to Bank / UPI</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Surplus Batches</span>
            <Gift className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-900">{stats.activeDonations || 0}</p>
          <p className="text-[10px] text-gray-400 mt-1">Available for free pickup</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold uppercase">Servings Shared</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-800">{stats.totalServingsDonated || 0}</p>
          <p className="text-[10px] text-gray-400 mt-1">Meals saved from waste</p>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Cooking Schedule + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Cooking Schedule (30m Cutoff Visualizer) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#174D36]" />
              <h3 className="font-bold text-gray-900">Upcoming Cooking Schedule</h3>
            </div>
            <Link href="/schedule" className="text-xs text-[#174D36] font-bold hover:underline flex items-center gap-1">
              View full schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {schedules.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-semibold">No scheduled cooking sessions today.</p>
              <Link href="/posts/new" className="inline-block mt-2 text-xs font-bold text-[#174D36] underline">
                Schedule a fresh homemade batch &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-800">{item.dish_name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {item.dietary}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Cutoff: <span className="font-semibold text-gray-800">{new Date(item.order_closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[#174D36]" />
                      <span>
                        Cooks: <span className="font-semibold text-gray-800">{new Date(item.cooking_starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>

                  {/* 4-Customer Slot Progress Bar */}
                  <div className="pt-2 border-t border-gray-200/60">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-gray-700">Four-Customer Quality Limit:</span>
                      <span className="font-bold text-[#174D36]">{item.active_customer_bookings_count} / 4 slots filled</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-2">
                      {[1, 2, 3, 4].map((slotNum) => (
                        <div
                          key={slotNum}
                          className={`rounded-full transition ${
                            slotNum <= item.active_customer_bookings_count
                              ? 'bg-[#174D36]'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Incoming Pre-Orders & Kitchen Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#174D36]" />
              <h3 className="font-bold text-gray-900">Live Customer Pre-Orders</h3>
            </div>
            <Link href="/preorders" className="text-xs text-[#174D36] font-bold hover:underline flex items-center gap-1">
              All pre-orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-semibold">No customer pre-orders received yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">Orders will arrive as customers book slots.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{ord.dish_name}</p>
                    <p className="text-[11px] text-gray-500">
                      Customer: <span className="font-semibold text-gray-700">{ord.customer_name}</span> ({ord.customer_phone})
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="font-bold text-[#174D36]">₹{ord.total_amount}</span>
                      <span>•</span>
                      <span>{ord.plate_quantity} plate(s)</span>
                      <span>•</span>
                      <span className="font-mono text-gray-500">{ord.fulfillment_type}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'PREPARING'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ord.status}
                    </span>

                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                        className="text-[10px] px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                      >
                        Start Cooking
                      </button>
                    )}
                    {ord.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'READY')}
                        className="text-[10px] px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
