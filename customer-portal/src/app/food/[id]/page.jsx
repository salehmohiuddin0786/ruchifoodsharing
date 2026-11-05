'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { customerApi } from '@/lib/api';
import {
  UtensilsCrossed,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Share2,
  AlertTriangle,
  Bike,
  Package,
  Truck,
  Zap,
} from 'lucide-react';

export default function FoodDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [plates, setPlates] = useState(1);
  const [fulfillment, setFulfillment] = useState('PICKUP'); // 'PICKUP', 'DELIVERY', 'RAPIDO'
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      customerApi
        .getFoodPostById(id)
        .then((res) => setPost(res.post))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrdering(true);
    setError('');
    setSuccess('');

    try {
      const res = await customerApi.placeOrder({
        postId: id,
        plateQuantity: plates,
        fulfillmentType: fulfillment === 'RAPIDO' ? 'DELIVERY' : fulfillment,
        deliveryMethod: fulfillment,
      });
      setSuccess(res.message);
      setTimeout(() => router.push('/orders'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to place pre-order.');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4">
        <div className="text-center text-xs font-bold text-slate-400">Loading homemade dish details...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center rounded-3xl bg-[#1C2541] border border-white/10 space-y-3">
          <h3 className="font-bold text-white text-base">Dish not found</h3>
          <Link href="/homemade-food" className="inline-block text-xs text-[#D97706] font-bold underline">
            &larr; Back to all homemade dishes
          </Link>
        </div>
      </div>
    );
  }

  const isCutoffPassed = new Date(post.order_closes_at) <= new Date();

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-28 md:pb-16 relative">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <Link
          href="/homemade-food"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homemade Dishes</span>
        </Link>

        <div className="bg-[#1C2541]/80 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image & Quick Stats */}
          <div className="relative h-72 md:h-full bg-[#0B132B] min-h-[350px]">
            <img
              src={post.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'}
              alt={post.dish_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-[#0B132B]/90 backdrop-blur-md border border-white/10 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                {post.dietary}
              </span>
              <span className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs px-3 py-1 rounded-full shadow">
                ₹{post.price_per_plate} / plate
              </span>
            </div>
          </div>

          {/* Right: Dish & Cook Details + Booking Form */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5BC0DE]">
                  {post.category}
                </span>
                <h1 className="text-2xl font-black text-white leading-tight mt-0.5">{post.dish_name}</h1>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{post.description}</p>
              </div>

              {/* Cook Profile Card */}
              <div className="p-4 bg-[#0B132B]/80 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">PREPARED BY</span>
                  <span className="font-bold text-sm text-white">{post.cook_name}</span>
                  <p className="text-[11px] text-slate-400">{post.business_name || 'Home Kitchen'}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">License: {post.fssai_number || 'Verified'}</span>
                </div>
              </div>

              {/* Cutoff & 4-Slot Progress Bar */}
              <div className="p-4 bg-[#0B132B]/80 rounded-2xl border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-4 h-4 text-[#D97706]" /> Pre-Order Cutoff:
                  </span>
                  <span className="font-bold text-[#F4D6B0]">
                    {new Date(post.order_closes_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400 font-semibold">4-Customer Slot Limit:</span>
                    <span className="font-bold text-[#5BC0DE]">{post.slots_remaining} of 4 slots open</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`rounded-full ${
                          s <= post.active_customer_bookings_count ? 'bg-[#D97706]' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Fulfillment Method */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-300">Fulfillment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillment('PICKUP')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      fulfillment === 'PICKUP'
                        ? 'border-[#D97706] bg-[#3A506B]/40 text-white'
                        : 'border-white/5 bg-[#0B132B]/60 text-slate-400'
                    }`}
                  >
                    <Package className="w-4 h-4 mx-auto mb-1 text-[#F4D6B0]" />
                    <span className="text-[10px] font-bold block">Pickup (Free)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('DELIVERY')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      fulfillment === 'DELIVERY'
                        ? 'border-[#D97706] bg-[#3A506B]/40 text-white'
                        : 'border-white/5 bg-[#0B132B]/60 text-slate-400'
                    }`}
                  >
                    <Truck className="w-4 h-4 mx-auto mb-1 text-[#5BC0DE]" />
                    <span className="text-[10px] font-bold block">Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('RAPIDO')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      fulfillment === 'RAPIDO'
                        ? 'border-[#D97706] bg-[#3A506B]/40 text-white'
                        : 'border-white/5 bg-[#0B132B]/60 text-slate-400'
                    }`}
                  >
                    <Bike className="w-4 h-4 mx-auto mb-1 text-[#D97706]" />
                    <span className="text-[10px] font-bold block">Rapido</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Action */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {success && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {error && <div className="p-3 bg-rose-950/80 border border-rose-500/30 rounded-xl text-rose-300 text-xs">{error}</div>}

              {isCutoffPassed ? (
                <div className="p-3 bg-[#0B132B] rounded-xl text-center text-xs font-semibold text-slate-400 border border-white/5">
                  Pre-order window closed 30 minutes before cooking.
                </div>
              ) : post.remaining_plates === 0 ? (
                <div className="p-3 bg-rose-950/60 rounded-xl text-center text-xs font-semibold text-rose-300 border border-rose-500/30">
                  This cooking session is Sold Out.
                </div>
              ) : (
                <form onSubmit={handleOrder} className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Plates Quantity:</span>
                    <div className="flex items-center space-x-2 bg-[#0B132B] px-3 py-1.5 rounded-2xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPlates(Math.max(1, plates - 1))}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="font-black text-sm w-6 text-center text-white">{plates}</span>
                      <button
                        type="button"
                        onClick={() => setPlates(Math.min(post.remaining_plates, plates + 1))}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-slate-300">Total Price:</span>
                    <span className="font-black text-xl text-[#F4D6B0]">
                      ₹{post.price_per_plate * plates}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={ordering}
                    className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black uppercase tracking-wider rounded-2xl text-xs transition shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {ordering ? 'Reserving Plate...' : 'Book Pre-Order Now'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
