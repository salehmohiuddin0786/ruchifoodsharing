'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import {
  Settings,
  Bell,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Smartphone,
  ShieldCheck,
  UtensilsCrossed,
  Clock,
  Heart,
} from 'lucide-react';

export default function CustomerSettingsPage() {
  const {
    preferences,
    updatePreferences,
    playTestSound,
    enableSoundAndNotifications,
    audioUnlocked,
  } = useNotifications();

  const [radius, setRadius] = useState(5);
  const [saved, setSaved] = useState(false);
  const [testingKey, setTestingKey] = useState(null);

  const handleTest = (soundType, key) => {
    setTestingKey(key);
    playTestSound(soundType);
    setTimeout(() => setTestingKey(null), 1200);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>Account, Sound & Notification Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your real-time alerts, acoustic chimes, volume, and community discovery radius.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-300 text-xs shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Your notification, sound alerts, and discovery preferences have been saved successfully!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="bg-[#0E172E] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6 text-xs text-slate-200">
        {/* Section 1: Sound Alerts & Master Volume */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Acoustic Sound Alerts</h3>
                <p className="text-slate-400 text-[11px]">Play pleasant audio tones when food updates are broadcast</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300">
                {preferences.soundEnabled ? 'Enabled' : 'Muted'}
              </span>
              <button
                type="button"
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

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Volume */}
            <div className="bg-[#16203A]/60 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  {preferences.soundVolume > 0.5 ? (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  ) : preferences.soundVolume > 0 ? (
                    <Volume1 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
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
                className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Test Acoustic Chimes */}
            <div className="bg-[#16203A]/60 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Test Alert Sounds</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTest('DISH_CHIME', 'dish')}
                  className={`p-2 rounded-xl text-center border text-[11px] font-bold transition flex flex-col items-center justify-center space-y-1 ${
                    testingKey === 'dish'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_#F59E0B]'
                      : 'bg-[#1C2541] hover:bg-[#2A375E] text-amber-300 border-amber-500/20'
                  }`}
                >
                  <span className="text-sm">🍽️</span>
                  <span>Dish Chime</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTest('PREORDER_BELL', 'preorder')}
                  className={`p-2 rounded-xl text-center border text-[11px] font-bold transition flex flex-col items-center justify-center space-y-1 ${
                    testingKey === 'preorder'
                      ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_#A855F7]'
                      : 'bg-[#1C2541] hover:bg-[#2A375E] text-purple-300 border-purple-500/20'
                  }`}
                >
                  <span className="text-sm">🔔</span>
                  <span>Pre-Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTest('FREE_FOOD_CHORD', 'free')}
                  className={`p-2 rounded-xl text-center border text-[11px] font-bold transition flex flex-col items-center justify-center space-y-1 ${
                    testingKey === 'free'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_#F43F5E]'
                      : 'bg-[#1C2541] hover:bg-[#2A375E] text-rose-300 border-rose-500/20'
                  }`}
                >
                  <span className="text-sm">❤️</span>
                  <span>Free Food</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Category Subscription Preferences */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Event Category Subscriptions</h3>
              <p className="text-slate-400 text-[11px]">Select which notifications you want to receive</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* New Dishes */}
            <label className="flex items-start justify-between p-3.5 bg-[#16203A]/40 hover:bg-[#16203A]/70 rounded-xl border border-white/5 cursor-pointer transition">
              <div className="flex items-start space-x-3">
                <span className="text-lg">🍽️</span>
                <div>
                  <span className="font-bold text-white block">New Dish Announcements</span>
                  <span className="text-slate-400 text-[11px]">
                    Notify me when cooks or admin publish a newly available hot dish or menu item.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.newDishEnabled}
                onChange={(e) => updatePreferences({ newDishEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            {/* Pre-Orders */}
            <label className="flex items-start justify-between p-3.5 bg-[#16203A]/40 hover:bg-[#16203A]/70 rounded-xl border border-white/5 cursor-pointer transition">
              <div className="flex items-start space-x-3">
                <span className="text-lg">🔔</span>
                <div>
                  <span className="font-bold text-white block">Pre-Order Windows</span>
                  <span className="text-slate-400 text-[11px]">
                    Alert me when special pre-order batches and winning dish pre-orders open for booking.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.preorderEnabled}
                onChange={(e) => updatePreferences({ preorderEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            {/* Free Food */}
            <label className="flex items-start justify-between p-3.5 bg-[#16203A]/40 hover:bg-[#16203A]/70 rounded-xl border border-white/5 cursor-pointer transition">
              <div className="flex items-start space-x-3">
                <span className="text-lg">❤️</span>
                <div>
                  <span className="font-bold text-white block">Community Free Food & Surplus Waste Prevention</span>
                  <span className="text-slate-400 text-[11px]">
                    Immediate alerts when donors or cooks share free surplus food packets before expiry.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.freeFoodEnabled}
                onChange={(e) => updatePreferences({ freeFoodEnabled: e.target.checked })}
                className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Browser Push Notifications */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#16203A]/40 border border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Device & Push Notifications</h4>
              <p className="text-[11px] text-slate-400">Receive notifications even when the browser tab is minimized</p>
            </div>
          </div>

          <button
            type="button"
            onClick={enableSoundAndNotifications}
            className="px-4 py-2 bg-[#1C2541] hover:bg-[#2A375E] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-white/10 transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enable Push Permission</span>
          </button>
        </div>

        {/* Section 4: Neighborhood Discovery Radius */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Neighborhood Discovery Radius</h3>
              <p className="text-slate-400 text-[11px]">Filter cooks and food announcements within this distance</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-[#16203A]/40 p-4 rounded-xl border border-white/5">
            <input
              type="range"
              min={1}
              max={25}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              className="w-full max-w-xs accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="font-black text-sm text-emerald-400 font-mono whitespace-nowrap">
              {radius} km radius
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black rounded-xl text-xs tracking-wide shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
