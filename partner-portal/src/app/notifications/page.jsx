'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { partnerApi } from '@/lib/api';
import { Bell, CheckCircle2, Clock, ShoppingBag, Gift } from 'lucide-react';

export default function PartnerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      partnerApi.getNotifications(user.id).then((res) => {
        setNotifications(res.notifications || []);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Partner Notifications</h2>
        <p className="text-xs text-gray-500">Alerts regarding pre-order cutoff lockouts, new customer bookings, and claims</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-700 text-sm">No new notifications</h4>
            <p className="text-xs text-gray-400 mt-1">You will receive live alerts when customers place orders or 30m cutoffs lock.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-gray-50 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#174D36] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
