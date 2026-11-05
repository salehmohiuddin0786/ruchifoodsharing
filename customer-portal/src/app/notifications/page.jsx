'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Volume1,
  RotateCw,
  Sparkles,
  ExternalLink,
  Sliders,
  UtensilsCrossed,
  Clock,
  Heart,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    preferences,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications,
    playTestSound,
    audioUnlocked,
    enableSoundAndNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL | NEW_DISH | NEW_PREORDER | FREE_FOOD
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [soundTesting, setSoundTesting] = useState(null);

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.type === activeTab;
  });

  const countForType = (type) => {
    if (type === 'ALL') return notifications.length;
    return notifications.filter((n) => n.type === type).length;
  };

  const handleTestSound = (type, key) => {
    setSoundTesting(key);
    playTestSound(type);
    setTimeout(() => setSoundTesting(null), 1200);
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleItemClick = (item) => {
    markAsRead(item.id);
    if (item.target_url) {
      router.push(item.target_url);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400/80 mb-1">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span>Notifications</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                <Bell className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>Food Alerts & Announcements</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-red-500/20 text-red-400 border border-red-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time notifications for newly added dishes, pre-orders, and community free-food posts.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={refreshNotifications}
              className="px-3 py-2 bg-[#16203A] hover:bg-[#1E2C4F] rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-white/10 flex items-center space-x-1.5 transition"
              title="Refresh notifications"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 flex items-center space-x-1.5 transition shadow"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 flex items-center space-x-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Autoplay Unlock Banner (if browser autoplay is restricted) */}
        {!audioUnlocked && (
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#1C2541] to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Enable Live Audio & Sound Alerts</p>
                <p className="text-[11px] text-slate-300">
                  Click below to allow browser audio playback for instant culinary chimes whenever dishes are added!
                </p>
              </div>
            </div>
            <button
              onClick={enableSoundAndNotifications}
              className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(217,119,6,0.4)] hover:scale-[1.02] active:scale-[0.98] transition self-start sm:self-auto"
            >
              Enable Sound & Alerts
            </button>
          </div>
        )}

        {/* Interactive Sound Alerts Control Center Card */}
        <div className="bg-[#0E172E] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1C2541] flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sound Alerts & Volume Preferences</h3>
                <p className="text-[11px] text-slate-400">Acoustic chimes for dish publications, pre-orders, and free food</p>
              </div>
            </div>

            {/* Sound Mute/Unmute Switch */}
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-300">
                {preferences.soundEnabled ? 'Alert Sounds: ON' : 'Alert Sounds: OFF'}
              </span>
              <button
                onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  preferences.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Volume Slider */}
            <div className="space-y-1.5 bg-[#16203A]/50 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  {preferences.soundVolume > 0.5 ? (
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  ) : preferences.soundVolume > 0 ? (
                    <Volume1 className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Alert Sound Volume</span>
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {Math.round(preferences.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={preferences.soundVolume}
                onChange={(e) => updatePreferences({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Test Sound Acoustic Chimes */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Test Notification Sounds</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTestSound('DISH_CHIME', 'dish')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 ${
                    soundTesting === 'dish'
                      ? 'bg-amber-500 text-black border-amber-400 scale-95 shadow-[0_0_12px_#F59E0B]'
                      : 'bg-[#16203A] hover:bg-[#1E2C4F] text-amber-300 border-amber-500/20'
                  }`}
                  title="Test Dish Chime (Ascending C5-E5-G5 harmonic tone)"
                >
                  <span>🍽️</span>
                  <span className="truncate">Dish Chime</span>
                </button>

                <button
                  onClick={() => handleTestSound('PREORDER_BELL', 'preorder')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 ${
                    soundTesting === 'preorder'
                      ? 'bg-purple-500 text-white border-purple-400 scale-95 shadow-[0_0_12px_#A855F7]'
                      : 'bg-[#16203A] hover:bg-[#1E2C4F] text-purple-300 border-purple-500/20'
                  }`}
                  title="Test Pre-Order Bell (Two-tone resonant bell)"
                >
                  <span>🔔</span>
                  <span className="truncate">Pre-Order</span>
                </button>

                <button
                  onClick={() => handleTestSound('FREE_FOOD_CHORD', 'free')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 ${
                    soundTesting === 'free'
                      ? 'bg-rose-500 text-white border-rose-400 scale-95 shadow-[0_0_12px_#F43F5E]'
                      : 'bg-[#16203A] hover:bg-[#1E2C4F] text-rose-300 border-rose-500/20'
                  }`}
                  title="Test Free Food Chord (Warm emotional harmonic chord)"
                >
                  <span>❤️</span>
                  <span className="truncate">Free Food</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Alerts', icon: Bell, count: countForType('ALL') },
            { id: 'NEW_DISH', label: 'New Dishes', icon: UtensilsCrossed, emoji: '🍽️', count: countForType('NEW_DISH') },
            { id: 'NEW_PREORDER', label: 'Pre-Orders', icon: Clock, emoji: '🔔', count: countForType('NEW_PREORDER') },
            { id: 'FREE_FOOD', label: 'Free Food', icon: Heart, emoji: '❤️', count: countForType('FREE_FOOD') },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-[#0E172E] text-slate-300 hover:text-white hover:bg-[#16203A] border-white/10'
                }`}
              >
                {tab.emoji ? <span>{tab.emoji}</span> : <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-black/30 text-black' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notification Cards Stream */}
        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="py-20 text-center">
              <RotateCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-[#0E172E] border border-white/10 rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-3xl">
                {activeTab === 'NEW_DISH' ? '🍽️' : activeTab === 'NEW_PREORDER' ? '🔔' : activeTab === 'FREE_FOOD' ? '❤️' : '🔕'}
              </div>
              <h3 className="text-base font-bold text-white">No notifications in this category</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {activeTab === 'ALL'
                  ? 'Whenever a new dish is added, a pre-order is scheduled, or free food is posted, you will receive an alert with sound right here.'
                  : `There are currently no active alerts for ${activeTab.replace('_', ' ').toLowerCase()}.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isDish = item.type === 'NEW_DISH';
              const isPreorder = item.type === 'NEW_PREORDER';
              const isFreeFood = item.type === 'FREE_FOOD';

              return (
                <div
                  key={item.id}
                  className={`group relative bg-[#0E172E] hover:bg-[#131E3D] border rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    !item.is_read
                      ? 'border-amber-500/40 bg-gradient-to-r from-[#141F3C] to-[#0E172E]'
                      : 'border-white/10'
                  }`}
                >
                  {/* Left: Thumbnail & Content */}
                  <div
                    onClick={() => handleItemClick(item)}
                    className="flex items-start space-x-4 flex-1 cursor-pointer w-full"
                  >
                    {/* Unread indicator */}
                    {!item.is_read && (
                      <span className="absolute -left-1 top-6 w-2.5 h-6 bg-gradient-to-b from-[#D97706] to-[#F59E0B] rounded-r shadow-[0_0_10px_#F59E0B]" />
                    )}

                    {/* Image / Icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-[#16203A] border border-white/15 flex-shrink-0 flex items-center justify-center shadow-inner">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <span className="text-2xl">
                          {isDish ? '🍽️' : isPreorder ? '🔔' : isFreeFood ? '❤️' : '📣'}
                        </span>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isDish
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isPreorder
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : isFreeFood
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {isDish ? '🍽️ New Dish' : isPreorder ? '🔔 Pre-Order' : isFreeFood ? '❤️ Free Food' : 'Announcement'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {formatRelativeTime(item.created_at)}
                        </span>
                        {!item.is_read && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300">
                            NEW
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 w-full sm:w-auto justify-end">
                    {item.target_url && (
                      <button
                        onClick={() => handleItemClick(item)}
                        className="px-3 py-1.5 bg-[#1C2541] hover:bg-[#2A375E] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 flex items-center space-x-1 transition"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0E172E] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Clear All Notifications?</h3>
                <p className="text-xs text-slate-400">
                  This will permanently remove all your saved notifications from the system. This cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#16203A] text-slate-300 hover:bg-[#1E2C4F] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearAll();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/30"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
