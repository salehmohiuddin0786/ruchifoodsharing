'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Utensils,
  HeartHandshake,
  ArrowRight,
} from 'lucide-react';

export default function DashboardView({ onOpenCreatePreOrder, onOpenCreateDonation }) {
  const {
    currentUser,
    orders,
    preorders,
    donations,
    updateOrderStatus,
    cancelOrder,
    refreshData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState(
    currentUser.role === 'cook' ? 'cook_orders' : currentUser.role === 'donor' ? 'donor_posts' : 'customer_orders'
  );

  // Filter cook posts
  const myCookPosts = preorders.filter((p) => p.cook_id === currentUser.id);
  // Filter donor posts
  const myDonationPosts = donations.filter((d) => d.donor_id === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#174D36]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{currentUser.name}</h1>
              <span className="text-xs bg-[#E8F5EC] text-[#174D36] font-bold px-2.5 py-0.5 rounded-full capitalize">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Location: <strong>{currentUser.area}, Hyderabad</strong> • Active in community
            </p>
          </div>
        </div>

        {/* Quick CTA */}
        <div className="flex items-center gap-2">
          {currentUser.role === 'cook' && (
            <button
              onClick={onOpenCreatePreOrder}
              className="bg-[#F5A623] hover:bg-[#DE9319] text-black font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5"
            >
              <span>+ New Pre-Order Meal</span>
            </button>
          )}
          {currentUser.role === 'donor' && (
            <button
              onClick={onOpenCreateDonation}
              className="bg-[#65A878] hover:bg-[#4E8D60] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center gap-1.5"
            >
              <span>+ Donate Surplus Food</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('customer_orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'customer_orders'
              ? 'bg-[#174D36] text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Utensils size={15} />
          <span>My Orders & Bookings ({orders.length})</span>
        </button>

        {currentUser.role === 'cook' && (
          <button
            onClick={() => setActiveSubTab('cook_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'cook_orders'
                ? 'bg-[#174D36] text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={15} />
            <span>Cook Portal & Orders ({myCookPosts.length} posts)</span>
          </button>
        )}

        {currentUser.role === 'donor' && (
          <button
            onClick={() => setActiveSubTab('donor_posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'donor_posts'
                ? 'bg-[#174D36] text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HeartHandshake size={15} />
            <span>My Surplus Donations ({myDonationPosts.length})</span>
          </button>
        )}
      </div>

      {/* Tab 1: Customer Orders */}
      {activeSubTab === 'customer_orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-gray-100">
              <span className="text-4xl">🍲</span>
              <h3 className="text-base font-extrabold text-gray-800">No active meal reservations</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore nearby homemade dishes or free food shares in Hyderabad to make your first booking.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const now = new Date();
              const cutoffTime = new Date(order.order_closes_at || order.orderClosesAt);
              const canCancel = now < cutoffTime && order.status !== 'cancelled' && order.status !== 'collected';

              return (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        #{order.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'collected'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-gray-900">{order.dish_name || order.dishName}</h3>
                    <p className="text-xs text-gray-500">
                      Cook: <strong>{order.cook_name || order.cookName}</strong> • {order.plate_quantity || order.plateQuantity} Plate(s) • Total: <strong>₹{order.total_amount || order.totalAmount}</strong> ({order.payment_status || 'Paid'})
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#65A878]" />
                        <span>{order.fulfillment_type === 'delivery' ? `Delivery to: ${order.delivery_address}` : 'Self Pickup'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#F5A623]" />
                        <span>Cooking starts: {new Date(order.cooking_starts_at || order.cookingStartsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions / Cancellation */}
                  <div className="flex items-center gap-2">
                    {canCancel ? (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="px-3.5 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition"
                      >
                        Cancel Booking
                      </button>
                    ) : order.status === 'cancelled' ? (
                      <span className="text-xs text-red-600 font-semibold">Cancelled (Refunded)</span>
                    ) : (
                      <span className="text-xs text-gray-400">Past 30m Cutoff (Cannot Cancel)</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Cook Portal */}
      {activeSubTab === 'cook_orders' && (
        <div className="space-y-6">
          {myCookPosts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-[#F5A623] uppercase">Planned Cooking Session</span>
                  <h3 className="text-lg font-black text-gray-900">{post.dish_name}</h3>
                  <p className="text-xs text-gray-500">
                    Scheduled cooking: <strong>{new Date(post.cooking_starts_at || post.cookingStartsAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> • Order Cutoff: <strong>{new Date(post.order_closes_at || post.orderClosesAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold bg-[#FFF9EE] text-[#174D36] px-3 py-1 rounded-xl border border-[#F5A623]/30">
                    {post.active_customer_bookings_count} / 4 Slots Filled
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Plates: {post.remaining_plates} / {post.total_plates} left
                  </p>
                </div>
              </div>

              {/* Status Stepper Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 mr-2">Update Session Status:</span>
                <button
                  onClick={() => updateOrderStatus(post.id, 'preparing')}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition"
                >
                  👩‍🍳 Mark Preparing
                </button>
                <button
                  onClick={() => updateOrderStatus(post.id, 'ready')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
                >
                  🍱 Mark Ready for Pickup
                </button>
                <button
                  onClick={() => updateOrderStatus(post.id, 'collected')}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
                >
                  ✅ Mark All Handed Over
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Donor Posts */}
      {activeSubTab === 'donor_posts' && (
        <div className="space-y-4">
          {myDonationPosts.map((post) => (
            <div key={post.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#65A878] uppercase">Free Surplus Share</span>
                <h3 className="text-base font-extrabold text-gray-900">{post.title}</h3>
                <p className="text-xs text-gray-500">
                  {post.remaining_servings} of {post.total_servings} portions remaining • Safe deadline: {new Date(post.expires_at || post.expiresAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                {post.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
