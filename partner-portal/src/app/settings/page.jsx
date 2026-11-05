'use client';

import React, { useState } from 'react';
import { Settings, Bell, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PartnerSettingsPage() {
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyCutoff, setNotifyCutoff] = useState(true);
  const [notifyDonations, setNotifyDonations] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Partner Account Settings</h2>
        <p className="text-xs text-gray-500">Configure cooking cutoff alerts and automated order notifications</p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Notification preferences updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-[#174D36]" />
            Cooking & Order Notifications
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCutoff}
                onChange={(e) => setNotifyCutoff(e.target.checked)}
                className="mt-0.5 rounded text-[#174D36] focus:ring-[#174D36]"
              />
              <div>
                <span className="font-bold text-gray-800 block">30-Minute Cutoff Audio Alert</span>
                <span className="text-gray-500">
                  Receive high-priority SMS and dashboard chime when pre-orders auto-close before cooking starts.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-gray-100">
              <input
                type="checkbox"
                checked={notifyOrders}
                onChange={(e) => setNotifyOrders(e.target.checked)}
                className="mt-0.5 rounded text-[#174D36] focus:ring-[#174D36]"
              />
              <div>
                <span className="font-bold text-gray-800 block">Instant Pre-Order Booking Alert</span>
                <span className="text-gray-500">
                  Notify me every time a customer books a portion of my homemade meal.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer pt-2 border-t border-gray-100">
              <input
                type="checkbox"
                checked={notifyDonations}
                onChange={(e) => setNotifyDonations(e.target.checked)}
                className="mt-0.5 rounded text-[#174D36] focus:ring-[#174D36]"
              />
              <div>
                <span className="font-bold text-gray-800 block">Surplus Food Claim Alerts</span>
                <span className="text-gray-500">
                  Receive SMS when community members claim free food servings for pickup.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl transition shadow"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
