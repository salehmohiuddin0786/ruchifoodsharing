'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { customerApi, curryRiceCustomerApi } from '@/lib/api';
import {
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Bike,
  Package,
  Truck,
  Sparkles,
  Calendar,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'STORE', 'PREORDER'

  const loadAllOrders = () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.allSettled([
      customerApi.getOrders(),
      curryRiceCustomerApi.getMyOrders(),
    ])
      .then(([foodRes, crRes]) => {
        const rawFood =
          foodRes.status === 'fulfilled' ? foodRes.value?.orders || [] : [];
        const rawMarketplace =
          crRes.status === 'fulfilled' ? crRes.value?.orders || [] : [];

        // 1. Normalize homemade pre-orders
        const normalizedFood = rawFood.map((o) => ({
          id: o.id,
          orderNumber: o.id,
          source: 'PREORDER',
          orderType: 'ADVANCE',
          title: o.dish_name || 'Homemade Meal Pre-Order',
          itemsCount: o.plate_quantity || 1,
          items: [
            {
              item_name: o.dish_name || 'Homemade Dish',
              quantity: o.plate_quantity || 1,
              total_price: o.total_amount,
            },
          ],
          totalAmount: parseFloat(o.total_amount || 0),
          status: (o.status || 'CONFIRMED').toUpperCase(),
          fulfillmentType: (o.fulfillment_type || 'PICKUP').toUpperCase(),
          cookName: o.cook_name || 'Verified Home Cook',
          businessName: o.business_name || '',
          kitchenAddress: o.kitchen_address,
          fssaiNumber: o.fssai_number,
          createdAt: o.created_at,
          deliveryAddress: o.delivery_address || null,
        }));

        // 2. Normalize cart / store orders
        const normalizedMarketplace = rawMarketplace.map((o) => {
          const itemSummary =
            o.items && o.items.length > 0
              ? o.items.map((i) => `${i.item_name} ×${i.quantity}`).join(', ')
              : 'Ruchi Bazaar Meal Order';

          return {
            id: o.id,
            orderNumber: o.order_number || o.id,
            source: 'STORE',
            orderType: (o.order_type || 'INSTANT').toUpperCase(),
            title: itemSummary,
            itemsCount: o.items_count || o.items?.length || 1,
            items: o.items || [],
            totalAmount: parseFloat(o.total_amount || 0),
            status: (o.status || 'PENDING').toUpperCase(),
            fulfillmentType: (o.fulfillment_type || 'PICKUP').toUpperCase(),
            cookName: o.cook_name || 'Verified Kitchen & Chef',
            businessName: o.business_name || '',
            kitchenAddress: o.kitchen_address,
            fssaiNumber: o.fssai_number,
            createdAt: o.created_at,
            deliveryAddress: o.delivery_address || null,
            customerNote: o.customer_note || null,
          };
        });

        // 3. Merge and sort newest first
        const merged = [...normalizedFood, ...normalizedMarketplace].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(merged);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load combined orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAllOrders();
  }, [user]);

  // Clean address to ensure no district or unwanted city text appears
  const formatKitchenAddress = (rawAddress) => {
    if (!rawAddress) return 'Verified Neighborhood Kitchen';
    if (
      rawAddress.includes('Hyderabad') ||
      rawAddress.includes('Banjara') ||
      rawAddress.includes('distric')
    ) {
      return 'Verified Neighborhood Kitchen';
    }
    return rawAddress;
  };

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'STORE') return ord.source === 'STORE';
    if (activeTab === 'PREORDER') return ord.source === 'PREORDER';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'CONFIRMED':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'PREPARING':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40';
      case 'READY':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-teal-950/80 text-teal-300 border-teal-500/40';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#1C2541]/85 border border-white/10 text-center space-y-4 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#D97706]/20 text-[#D97706] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(217,119,6,0.25)]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-black text-white text-xl">Sign In to View Orders</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please sign in to check your live order tracking, homemade meal bookings, and past purchases.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login?redirect=/orders"
              className="inline-block px-7 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg hover:scale-105 transition"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-28 md:pb-16 relative">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                My Orders & Meal Bookings
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live kitchen tracking, delivery details, and order history across Ruchi Bazaar
            </p>
          </div>

          <button
            onClick={loadAllOrders}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 bg-[#1C2541] hover:bg-[#3A506B]/50 border border-white/10 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5BC0DE] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-[#D97706] text-black shadow-md shadow-amber-500/25'
                : 'bg-[#1C2541]/70 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <span>All Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('STORE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'STORE'
                ? 'bg-[#D97706] text-black shadow-md shadow-amber-500/25'
                : 'bg-[#1C2541]/70 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <span>Marketplace Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {orders.filter((o) => o.source === 'STORE').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PREORDER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'PREORDER'
                ? 'bg-[#D97706] text-black shadow-md shadow-amber-500/25'
                : 'bg-[#1C2541]/70 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <span>Advance Pre-Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {orders.filter((o) => o.source === 'PREORDER').length}
            </span>
          </button>
        </div>

        {/* Orders Card Container */}
        <div className="rounded-3xl bg-[#1C2541]/85 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 font-bold flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#D97706] animate-spin" />
              <span>Fetching all your orders from kitchen servers...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <ShoppingBag className="w-14 h-14 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-base">
                {orders.length === 0 ? 'No orders placed yet' : 'No orders in this category'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Explore delicious homemade meals, daily thali combos, and curries freshly cooked by verified home chefs.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg hover:scale-105 transition"
                >
                  Start Ordering Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-5 hover:bg-white/[0.02] transition"
                >
                  <div className="space-y-3 flex-1">
                    {/* Top Row: Order ID, Status, Type, and Fulfillment */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#F4D6B0] bg-[#0B132B]/80 px-2.5 py-1 rounded-lg border border-white/5">
                        #{ord.orderNumber}
                      </span>

                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5">
                        {ord.source === 'STORE' ? 'Store Order' : 'Advance Pre-Order'}
                      </span>

                      <span className="text-xs text-slate-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B132B]/60 border border-white/5">
                        {ord.fulfillmentType === 'DELIVERY' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-[#5BC0DE]" />
                            <span className="font-semibold text-[#5BC0DE]">Delivery</span>
                          </>
                        ) : (
                          <>
                            <Package className="w-3.5 h-3.5 text-[#F4D6B0]" />
                            <span className="font-semibold text-[#F4D6B0]">Self Pickup</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Order Title */}
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-white">
                        {ord.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Cook & Kitchen:{' '}
                        <span className="font-bold text-white">{ord.cookName}</span>{' '}
                        {ord.businessName && (
                          <span className="text-slate-400">({ord.businessName})</span>
                        )}
                      </p>
                    </div>

                    {/* Itemized pills */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B132B]/90 border border-white/10 text-xs"
                          >
                            <span className="font-bold text-slate-200">
                              {item.item_name}
                            </span>
                            <span className="text-xs font-black text-[#D97706] bg-[#D97706]/15 px-1.5 py-0.5 rounded">
                              ×{item.quantity}
                            </span>
                            {item.total_price && (
                              <span className="text-[#F4D6B0] font-mono text-[11px] font-bold">
                                ₹{item.total_price}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Delivery Note if any */}
                    {ord.customerNote && (
                      <div className="text-xs text-slate-400 italic bg-[#0B132B]/40 px-3 py-1.5 rounded-xl border border-white/5">
                        Note: {ord.customerNote}
                      </div>
                    )}

                    {/* Amount & Time */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="font-black text-lg text-[#F4D6B0]">
                        ₹{ord.totalAmount.toFixed(2)}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">
                        {ord.itemsCount} item(s)
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Placed: {new Date(ord.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Kitchen / Pickup Location & FSSAI */}
                  <div className="w-full md:w-64 flex-shrink-0">
                    <div className="p-3.5 bg-[#0B132B]/90 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-white text-[11px] uppercase tracking-wider text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>
                            {ord.fulfillmentType === 'DELIVERY'
                              ? 'Delivery Order'
                              : 'Kitchen Pickup'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {formatKitchenAddress(ord.kitchenAddress)}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {ord.fssaiNumber || '23623032000845'}
                        </span>
                      </div>
                    </div>
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
