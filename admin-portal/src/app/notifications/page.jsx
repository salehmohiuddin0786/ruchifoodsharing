'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Send,
  RotateCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Volume2,
  Calendar,
  Layers,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetUrl: '/curry-rice',
    imageUrl: '',
    soundType: 'DISH_CHIME',
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  // Fetch admin events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ruchi_admin_token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus,
        eventType: filterType,
      });

      const res = await fetch(`${API_BASE}/notifications/admin/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch events:', e);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filterStatus, filterType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Broadcast Submission
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    setBroadcasting(true);
    setBroadcastSuccess(null);

    try {
      const token = localStorage.getItem('ruchi_admin_token');
      const res = await fetch(`${API_BASE}/notifications/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(broadcastForm),
      });

      const data = await res.json();
      if (res.ok) {
        setBroadcastSuccess(`Announcement broadcast successfully to ${data.event?.recipientCount || 'all'} members!`);
        setBroadcastForm({
          title: '',
          message: '',
          targetUrl: '/curry-rice',
          imageUrl: '',
          soundType: 'DISH_CHIME',
        });
        setTimeout(() => {
          setShowBroadcastModal(false);
          setBroadcastSuccess(null);
          fetchEvents();
        }, 1500);
      } else {
        alert(data.error || 'Failed to broadcast announcement.');
      }
    } catch (err) {
      alert('Error broadcasting announcement: ' + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  // Handle Retry
  const handleRetry = async (eventId) => {
    setRetryingId(eventId);
    try {
      const token = localStorage.getItem('ruchi_admin_token');
      const res = await fetch(`${API_BASE}/notifications/admin/events/${eventId}/retry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (e) {
      console.error('Retry failed:', e);
    } finally {
      setRetryingId(null);
    }
  };

  // Aggregated delivery stats
  const totalRecipients = events.reduce((acc, ev) => acc + (ev.recipient_count || 0), 0);
  const totalDelivered = events.reduce((acc, ev) => acc + (ev.success_count || 0), 0);
  const totalFailed = events.reduce((acc, ev) => acc + (ev.failure_count || 0), 0);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#253745]/30">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#5BC0DE] font-bold tracking-wider uppercase mb-1">
            <span>Governance & Operations</span>
            <span>•</span>
            <span>Platform Communications</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-[#06141B] text-white">
              <Bell className="w-5 h-5" />
            </span>
            <span>Global Notifications & Real-Time Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor automated system triggers, food publication events, acoustic chimes, and broadcast platform announcements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEvents}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#06141B] to-[#11212D] text-white rounded-xl text-xs font-bold hover:shadow-lg transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-[#5BC0DE]" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Broadcast Events</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800">{pagination.total}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Triggered dishes, pre-orders & posts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients Reached</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600">{totalRecipients}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Registered active member inboxes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Successful In-App Alerts</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-800">{totalDelivered}</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Delivered with real-time sockets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Failed / Retries</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-rose-600">{totalFailed}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Excluded or suspended deliveries</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Filter Type:</span>
          {['ALL', 'NEW_DISH', 'NEW_PREORDER', 'FREE_FOOD', 'ANNOUNCEMENT'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === type
                  ? 'bg-[#06141B] text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL'
                ? 'All'
                : type === 'NEW_DISH'
                ? '🍽️ New Dish'
                : type === 'NEW_PREORDER'
                ? '🔔 Pre-Order'
                : type === 'FREE_FOOD'
                ? '❤️ Free Food'
                : '📣 Announcement'}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIAL">Partial</option>
            <option value="FAILED">Failed</option>
            <option value="PROCESSING">Processing</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Event ID & Time</th>
                <th className="p-4">Trigger Type</th>
                <th className="p-4">Title & Message Payload</th>
                <th className="p-4 text-center">Recipients</th>
                <th className="p-4 text-center">Delivery Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading notification audit records...</span>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No notification events recorded yet</p>
                    <p className="text-[11px] text-slate-400">
                      When cooks or admins publish dishes, pre-orders, or free food, audit records will show here.
                    </p>
                  </td>
                </tr>
              ) : (
                events.map((ev) => {
                  const isDish = ev.event_type === 'NEW_DISH';
                  const isPreorder = ev.event_type === 'NEW_PREORDER';
                  const isFreeFood = ev.event_type === 'FREE_FOOD';

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono">
                        <span className="font-bold text-slate-900 block">#{ev.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ev.created_at).toLocaleString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isDish
                              ? 'bg-amber-100 text-amber-800'
                              : isPreorder
                              ? 'bg-purple-100 text-purple-800'
                              : isFreeFood
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <span>{isDish ? '🍽️' : isPreorder ? '🔔' : isFreeFood ? '❤️' : '📣'}</span>
                          <span>{ev.event_type}</span>
                        </span>
                      </td>

                      <td className="p-4 max-w-md">
                        <div className="font-bold text-slate-800">{ev.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ev.message}</p>
                        {ev.target_url && (
                          <span className="text-[10px] text-blue-600 font-mono mt-0.5 block truncate">
                            URL: {ev.target_url}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-slate-800">
                        {ev.recipient_count || 0}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ev.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ev.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ev.status === 'COMPLETED' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{ev.status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {ev.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleRetry(ev.id)}
                            disabled={retryingId === ev.id}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ml-auto"
                          >
                            <RefreshCw className={`w-3 h-3 ${retryingId === ev.id ? 'animate-spin' : ''}`} />
                            <span>Retry</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Delivered</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-[#06141B] text-white rounded-xl">
                  <Send className="w-4 h-4 text-[#5BC0DE]" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-800">Send Platform Announcement</h3>
                  <p className="text-[11px] text-slate-400">Broadcasts to all registered active members with sound</p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {broadcastSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{broadcastSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 📢 Special Weekend Biryani Festival Announced!"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#06141B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details about the announcement or event for all members..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#06141B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Page URL</label>
                  <input
                    type="text"
                    placeholder="/curry-rice or /homemade-food"
                    value={broadcastForm.targetUrl}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#06141B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Optional Image URL</label>
                  <input
                    type="text"
                    placeholder="https://... or /ruchi-logo.png"
                    value={broadcastForm.imageUrl}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#06141B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Acoustic Sound Alert</label>
                <select
                  value={broadcastForm.soundType}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, soundType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#06141B] bg-white"
                >
                  <option value="DISH_CHIME">🍽️ Dish Chime (Culinary Ascending Harmonic)</option>
                  <option value="PREORDER_BELL">🔔 Pre-Order Bell (Dual-Tone Resonant Alert)</option>
                  <option value="FREE_FOOD_CHORD">❤️ Free Food Chord (Warm Community Tone)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-5 py-2 bg-[#06141B] hover:bg-[#11212D] text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
                >
                  <Send className={`w-3.5 h-3.5 ${broadcasting ? 'animate-bounce' : ''}`} />
                  <span>{broadcasting ? 'Broadcasting...' : 'Broadcast to Members'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
