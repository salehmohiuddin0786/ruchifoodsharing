'use client';

import React, { useState, useEffect } from 'react';
import { pollAdminApi } from '@/lib/api';
import {
  Vote,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldAlert,
  Shield,
  Clock,
  Calendar,
  Trophy,
  Scale,
  RefreshCw,
  X,
  Edit,
  Eye,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function AdminDishPollsPage() {
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Audit Log Modal State
  const [auditModalPoll, setAuditModalPoll] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Moderation Modal State
  const [moderatePoll, setModeratePoll] = useState(null);
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [submittingMod, setSubmittingMod] = useState(false);

  // Suspend Modal State
  const [suspendPoll, setSuspendPoll] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pollsRes, statsRes] = await Promise.allSettled([
        pollAdminApi.getAllPolls({
          status: statusFilter,
          search: search.trim(),
        }),
        pollAdminApi.getStats(),
      ]);

      if (pollsRes.status === 'fulfilled') {
        setPolls(pollsRes.value.polls || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.stats || null);
      }
    } catch (err) {
      console.error('Failed to load admin polls:', err);
      setErrorMessage(err.message || 'Failed to load polling records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Open Audit Logs Modal
  const openAuditLogs = async (poll) => {
    setAuditModalPoll(poll);
    setLoadingLogs(true);
    try {
      const res = await pollAdminApi.getAuditLogs(poll.id);
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error('Audit log fetch error:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Open Moderation Modal
  const openModerationModal = (poll) => {
    setModeratePoll(poll);
    setModTitle(poll.title);
    setModDesc(poll.description || '');
  };

  // Submit Moderation
  const handleModerateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingMod(true);
    try {
      await pollAdminApi.moderatePoll(moderatePoll.id, {
        title: modTitle.trim(),
        description: modDesc.trim(),
      });
      setToastMessage('Poll details moderated successfully.');
      setTimeout(() => setToastMessage(''), 3000);
      setModeratePoll(null);
      loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to moderate poll.');
    } finally {
      setSubmittingMod(false);
    }
  };

  // Submit Suspension
  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    if (!suspendReason.trim()) {
      setErrorMessage('Please state the reason for suspension.');
      return;
    }
    setSubmittingSuspend(true);
    try {
      await pollAdminApi.suspendPoll(suspendPoll.id, suspendReason.trim());
      setToastMessage('Poll has been suspended.');
      setTimeout(() => setToastMessage(''), 3000);
      setSuspendPoll(null);
      loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to suspend poll.');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-[#11212D] border border-emerald-500 text-white font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-rose-950 border border-rose-500 text-rose-200 font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#06141B] border border-[#253745] text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-[#CCD0CF] uppercase tracking-wider">
              Platform Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dish Voting & Community Polling Management
          </h1>
          <p className="text-xs text-[#CCD0CF]/80 max-w-xl">
            Supervise community dish voting, monitor vote integrity, review audit logs, and moderate
            or suspend fraudulent activities.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-3 bg-[#11212D] hover:bg-[#253745] rounded-2xl text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Polls</span>
              <Vote className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-black text-gray-900 font-mono">{stats.totalPolls}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Polls</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-700 font-mono">{stats.activePolls}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Closed Polls</span>
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-blue-700 font-mono">{stats.closedPolls}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Votes Cast</span>
              <Vote className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-700 font-mono">{stats.totalVotesCast}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-purple-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Unique Voters</span>
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-purple-700 font-mono">{stats.totalVoters}</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'CLOSED', 'TIED', 'DRAFT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-[#11212D] text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cook or dish title..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-gray-400"
          />
        </form>
      </div>

      {/* Polls Listing */}
      {loading ? (
        <div className="p-16 text-center text-xs text-gray-400 font-bold flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          <span>Loading governance polling data...</span>
        </div>
      ) : polls.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-gray-200 text-center space-y-3 shadow-sm">
          <Vote className="w-12 h-12 text-gray-300 mx-auto" />
          <h4 className="text-base font-bold text-gray-800">No Polls Found</h4>
          <p className="text-xs text-gray-500">
            No community dish polls match your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const isTied = poll.status === 'TIED';
            const isClosed = poll.status === 'CLOSED';
            const isActive = poll.status === 'ACTIVE';
            const isCancelled = poll.status === 'CANCELLED';

            return (
              <div
                key={poll.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-sm hover:border-gray-300 transition"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        #{poll.id}
                      </span>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isTied
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isClosed
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : isCancelled
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {poll.status}
                      </span>

                      <span className="text-xs text-gray-500">
                        Cooking Date: {new Date(poll.cooking_date).toLocaleDateString()}
                      </span>

                      <span className="text-xs text-gray-400">
                        Deadline: {new Date(poll.voting_ends_at).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-gray-900">{poll.title}</h3>
                    {poll.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{poll.description}</p>
                    )}

                    <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>
                        Cook: <strong className="text-gray-900">{poll.cook_name}</strong>
                      </span>
                      <span>•</span>
                      <span>Kitchen: {poll.kitchen_address || 'Registered Kitchen'}</span>
                      <span>•</span>
                      <span>Email: {poll.cook_email || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 flex-shrink-0">
                    <div className="px-3.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        Total Votes
                      </span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        {poll.total_votes || 0}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => openAuditLogs(poll)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                        title="View Audit Trail Logs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Audit Logs</span>
                      </button>

                      <button
                        onClick={() => openModerationModal(poll)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                        title="Edit / Moderate Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Moderate</span>
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => {
                            setSuspendPoll(poll);
                            setSuspendReason('');
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                          title="Suspend Poll"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dish Options Overview */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {poll.options?.map((opt) => {
                      const isWinner = poll.winner_option_id === opt.id;
                      const percentage =
                        poll.total_votes > 0
                          ? Math.round((opt.vote_count / poll.total_votes) * 100)
                          : 0;

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border text-xs ${
                            isWinner ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[10px] text-gray-500 uppercase">
                              {opt.food_type}
                            </span>
                            {isWinner && (
                              <span className="text-[10px] font-black text-amber-700 flex items-center gap-0.5">
                                <Trophy className="w-3 h-3" /> Winner
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-gray-900 truncate">{opt.dish_name}</h4>
                          <div className="flex justify-between font-mono text-[11px] font-bold text-gray-600 mt-2">
                            <span>{opt.vote_count} votes</span>
                            <span>{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          AUDIT LOGS MODAL
      ========================================================================= */}
      {auditModalPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-200 p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-black text-gray-900">
                  Audit Logs: {auditModalPoll.title}
                </h3>
              </div>
              <button
                onClick={() => setAuditModalPoll(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {loadingLogs ? (
                <div className="p-8 text-center text-xs text-gray-500">Loading audit trail...</div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No audit logs recorded for this poll.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-gray-600">
                      Actor: <strong className="text-gray-900">{log.actor_name}</strong> (
                      {log.actor_email})
                    </p>

                    {log.old_value && (
                      <div className="font-mono text-[11px] text-rose-700 bg-rose-50 p-2 rounded-xl">
                        Old: {JSON.stringify(log.old_value)}
                      </div>
                    )}
                    {log.new_value && (
                      <div className="font-mono text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                        New: {JSON.stringify(log.new_value)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right border-t border-gray-100">
              <button
                onClick={() => setAuditModalPoll(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODERATION MODAL
      ========================================================================= */}
      {moderatePoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-black text-gray-900">Moderate Dish Poll</h3>
              </div>
              <button
                onClick={() => setModeratePoll(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModerateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Poll Title
                </label>
                <input
                  type="text"
                  required
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModeratePoll(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMod}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  {submittingMod ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUSPEND MODAL
      ========================================================================= */}
      {suspendPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-black text-gray-900">Suspend Poll</h3>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to suspend "{suspendPoll.title}"? Voting will be stopped immediately
              and marked as CANCELLED.
            </p>

            <form onSubmit={handleSuspendSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Suspension Reason (Required for Audit Trail)
                </label>
                <textarea
                  required
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Inappropriate content, fraudulent votes reported, duplicate poll..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSuspendPoll(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSuspend}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  {submittingSuspend ? 'Suspending...' : 'Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
