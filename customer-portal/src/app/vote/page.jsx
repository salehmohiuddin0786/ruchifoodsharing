'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { pollCustomerApi } from '@/lib/api';
import {
  Vote,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Trophy,
  ArrowRight,
  TrendingUp,
  History,
  Calendar,
  ShieldCheck,
  Check,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react';

export default function CustomerDishVotingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activePolls, setActivePolls] = useState([]);
  const [historyPolls, setHistoryPolls] = useState([]);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'HISTORY'
  const [loading, setLoading] = useState(true);
  const [submittingVoteId, setSubmittingVoteId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadPolls = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [activeRes, historyRes] = await Promise.allSettled([
        pollCustomerApi.getActivePolls(),
        pollCustomerApi.getPollHistory(),
      ]);

      if (activeRes.status === 'fulfilled') {
        setActivePolls(activeRes.value.polls || []);
      }
      if (historyRes.status === 'fulfilled') {
        setHistoryPolls(historyRes.value.polls || []);
      }
    } catch (err) {
      console.error('Failed to load dish polls:', err);
      setErrorMessage('Could not connect to voting servers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [user]);

  // Handle voting for a dish
  const handleVote = async (pollId, optionId, dishName) => {
    if (!user) {
      router.push(`/auth/login?redirect=/vote`);
      return;
    }

    setSubmittingVoteId(optionId);
    setErrorMessage('');

    try {
      const res = await pollCustomerApi.vote(pollId, optionId);

      // Update local state smoothly
      setActivePolls((prev) =>
        prev.map((poll) => {
          if (poll.id === pollId) {
            return {
              ...poll,
              userVotedOptionId: optionId,
              total_votes: res.totalVotes !== undefined ? res.totalVotes : poll.total_votes,
              options: res.options || poll.options,
            };
          }
          return poll;
        })
      );

      setToastMessage(res.message || `Vote submitted for ${dishName}!`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit vote. Please try again.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSubmittingVoteId(null);
    }
  };

  // Format countdown until deadline
  const formatCountdown = (deadlineStr) => {
    if (!deadlineStr) return 'Ending soon';
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline - now;

    if (diffMs <= 0) return 'Voting closed';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days}d ${diffHours % 24}h remaining`;
    }
    return `${diffHours}h ${diffMins}m remaining`;
  };

  // Format clean kitchen address
  const cleanKitchenAddress = (raw) => {
    if (!raw) return 'Neighborhood Home Kitchen';
    if (raw.includes('Hyderabad') || raw.includes('Banjara')) {
      return 'Neighborhood Home Kitchen';
    }
    return raw;
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-28 md:pb-16 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs rounded-2xl shadow-2xl flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error alert toast */}
      {errorMessage && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-rose-950 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-2xl shadow-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Hero Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1C2541]/90 via-[#1C2541]/70 to-[#0B132B]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#F4D6B0] text-xs font-bold uppercase tracking-wider">
              <Vote className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Community Food Polling</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Vote for Today's Dish
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Decide what your neighborhood home chefs cook! Cast your vote for tomorrow's special menu.
              The dish with the most votes wins, and is freshly prepared for advance pre-order.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center sm:items-end gap-3 flex-shrink-0">
            <button
              onClick={loadPolls}
              disabled={loading}
              className="px-4 py-2.5 bg-[#0B132B] hover:bg-[#3A506B]/40 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#5BC0DE] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Polls</span>
            </button>

            <div className="px-4 py-2 bg-[#0B132B]/80 rounded-2xl border border-white/5 text-right">
              <span className="text-[11px] text-slate-400 block font-medium">1 Vote Per Customer</span>
              <span className="text-xs font-black text-[#F4D6B0]">Changeable until deadline</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ACTIVE'
                ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black shadow-lg shadow-amber-500/25'
                : 'bg-[#1C2541]/70 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Active Dish Polls</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 font-mono">
              {activePolls.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black shadow-lg shadow-amber-500/25'
                : 'bg-[#1C2541]/70 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Winners & Results</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 font-mono">
              {historyPolls.length}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#D97706] animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">
              Fetching community polls...
            </p>
          </div>
        )}

        {/* =========================================================================
            ACTIVE POLLS TAB
        ========================================================================= */}
        {!loading && activeTab === 'ACTIVE' && (
          <div className="space-y-10">
            {activePolls.length === 0 ? (
              <div className="p-16 rounded-3xl bg-[#1C2541]/70 border border-white/10 text-center space-y-3">
                <Vote className="w-14 h-14 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Active Polls Right Now</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Home chefs usually schedule new polls in the morning and evening. Check back soon
                  or view recent winning dishes in the Past Results tab!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('HISTORY')}
                    className="px-5 py-2.5 bg-[#3A506B]/50 hover:bg-[#3A506B] rounded-xl text-xs font-bold text-slate-200 transition"
                  >
                    View Past Winning Dishes
                  </button>
                </div>
              </div>
            ) : (
              activePolls.map((poll) => {
                const hasVoted = Boolean(poll.userVotedOptionId);

                return (
                  <div
                    key={poll.id}
                    className="rounded-3xl bg-[#1C2541]/85 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
                  >
                    {/* Poll Header Banner */}
                    <div className="p-6 sm:p-7 border-b border-white/10 bg-gradient-to-r from-[#0B132B]/80 to-[#1C2541]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[#F4D6B0] flex items-center gap-1.5 bg-[#0B132B] px-3 py-1 rounded-xl border border-white/5">
                            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>{formatCountdown(poll.voting_ends_at)}</span>
                          </span>

                          <span className="text-slate-400 font-semibold bg-white/5 px-2.5 py-1 rounded-xl">
                            Cooking Date: {new Date(poll.cooking_date).toLocaleDateString()}
                          </span>

                          <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-white pt-1">
                          {poll.title}
                        </h2>

                        {poll.description && (
                          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                            {poll.description}
                          </p>
                        )}

                        <div className="pt-1 flex items-center space-x-2 text-xs text-slate-400">
                          <ChefHat className="w-4 h-4 text-[#F4D6B0]" />
                          <span>
                            Cook:{' '}
                            <strong className="text-white">
                              {poll.cook_name} ({poll.business_name || 'Home Chef'})
                            </strong>
                          </span>
                          <span>•</span>
                          <span>{cleanKitchenAddress(poll.kitchen_address)}</span>
                        </div>
                      </div>

                      {/* Vote Count Summary & Status */}
                      <div className="text-left md:text-right flex-shrink-0 bg-[#0B132B]/60 p-4 rounded-2xl border border-white/5">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                          Community Participation
                        </span>
                        <div className="text-2xl font-black text-[#F4D6B0] font-mono">
                          {poll.total_votes || 0}{' '}
                          <span className="text-xs font-normal text-slate-400">votes</span>
                        </div>
                        {hasVoted && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold mt-1">
                            <CheckCircle2 className="w-3 h-3" /> You have voted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options Grid: Section 2 Dish Voting Card Requirements */}
                    <div className="p-6 sm:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {poll.options.map((opt) => {
                          const isVotedByMe = poll.userVotedOptionId === opt.id;
                          const isVeg = opt.food_type === 'VEG';
                          const isSubmitting = submittingVoteId === opt.id;

                          return (
                            <div
                              key={opt.id}
                              className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 border ${
                                isVotedByMe
                                  ? 'bg-[#0B132B] border-[#D97706] shadow-[0_0_25px_rgba(217,119,6,0.25)] ring-2 ring-[#D97706]/40'
                                  : 'bg-[#0B132B]/70 hover:bg-[#0B132B]/90 border-white/5 hover:border-white/20'
                              }`}
                            >
                              {/* Top Badges */}
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                    isVeg
                                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                                      : 'bg-rose-950/80 text-rose-400 border-rose-500/30'
                                  }`}
                                >
                                  {isVeg ? 'VEG' : 'NON-VEG'}
                                </span>

                                {opt.estimated_price && (
                                  <span className="text-xs font-black text-[#F4D6B0] font-mono">
                                    Est. ₹{opt.estimated_price}/plate
                                  </span>
                                )}
                              </div>

                              {/* Dish Image */}
                              <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 border border-white/5 shadow-inner group">
                                <img
                                  src={
                                    opt.image ||
                                    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
                                  }
                                  alt={opt.dish_name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />

                                {isVotedByMe && (
                                  <div className="absolute top-2 right-2 px-3 py-1 bg-[#D97706] text-black font-black text-[10px] uppercase rounded-full shadow-lg flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Your Vote</span>
                                  </div>
                                )}
                              </div>

                              {/* Dish Details */}
                              <div className="space-y-1.5 flex-1">
                                <h3 className="font-black text-base text-white">{opt.dish_name}</h3>
                                {opt.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {opt.description}
                                  </p>
                                )}
                              </div>

                              {/* Percentage Bar & Live Vote Count */}
                              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-400 font-medium">
                                    {opt.vote_count || 0} votes
                                  </span>
                                  <span className="font-black text-[#F4D6B0] font-mono">
                                    {opt.percentage || 0}%
                                  </span>
                                </div>

                                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      isVotedByMe
                                        ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]'
                                        : 'bg-[#3A506B]'
                                    }`}
                                    style={{ width: `${Math.max(4, opt.percentage || 0)}%` }}
                                  />
                                </div>

                                {/* Vote / Change Vote Button */}
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleVote(poll.id, opt.id, opt.dish_name)}
                                    disabled={isSubmitting}
                                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                                      isVotedByMe
                                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-800/60'
                                        : 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706] text-black shadow-amber-500/25'
                                    }`}
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : isVotedByMe ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Voted (Click to re-confirm)</span>
                                      </>
                                    ) : hasVoted ? (
                                      <>
                                        <Vote className="w-3.5 h-3.5" />
                                        <span>Change Vote to This</span>
                                      </>
                                    ) : (
                                      <>
                                        <Vote className="w-3.5 h-3.5" />
                                        <span>Vote for this Dish</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =========================================================================
            PAST WINNERS & RESULTS TAB
        ========================================================================= */}
        {!loading && activeTab === 'HISTORY' && (
          <div className="space-y-6">
            {historyPolls.length === 0 ? (
              <div className="p-16 rounded-3xl bg-[#1C2541]/70 border border-white/10 text-center space-y-3">
                <History className="w-12 h-12 text-slate-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No Closed Polls Yet</h4>
                <p className="text-xs text-slate-400">
                  Closed and finalized community polls will appear here once voting deadlines expire.
                </p>
              </div>
            ) : (
              historyPolls.map((poll) => {
                const isTied = poll.status === 'TIED';

                return (
                  <div
                    key={poll.id}
                    className="p-6 rounded-3xl bg-[#1C2541]/85 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6"
                  >
                    {/* Poll Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border ${
                              isTied
                                ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {isTied ? '⚖️ TIED RESULT' : '🏆 FINALIZED WINNER'}
                          </span>
                          <span className="text-slate-400 text-xs">
                            Total Votes: <strong className="text-white">{poll.total_votes}</strong>
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">{poll.title}</h3>
                        <p className="text-xs text-slate-300">
                          Cook: <strong className="text-white">{poll.cook_name}</strong> •{' '}
                          {cleanKitchenAddress(poll.kitchen_address)}
                        </p>
                      </div>

                      {/* Pre-order or announcement pill */}
                      {poll.winning_dish_name && (
                        <div className="p-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 rounded-2xl border border-amber-500/30 text-left sm:text-right">
                          <span className="text-[10px] font-black uppercase text-[#F4D6B0] block">
                            Winning Dish Announced
                          </span>
                          <span className="text-sm font-black text-white block">
                            {poll.winning_dish_name}
                          </span>
                          <Link
                            href="/homemade-food"
                            className="inline-flex items-center gap-1 text-[11px] text-[#D97706] hover:text-[#F4D6B0] font-bold mt-1"
                          >
                            <span>Check Pre-Orders</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Breakdown of options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {poll.options.map((opt) => {
                        const isWinner = poll.winner_option_id === opt.id;

                        return (
                          <div
                            key={opt.id}
                            className={`p-4 rounded-2xl border flex flex-col justify-between ${
                              isWinner
                                ? 'bg-gradient-to-b from-[#0B132B] to-[#1C2541] border-[#D97706] shadow-lg shadow-amber-500/15'
                                : 'bg-[#0B132B]/60 border-white/5 opacity-80'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                    opt.food_type === 'VEG'
                                      ? 'bg-emerald-950 text-emerald-400'
                                      : 'bg-rose-950 text-rose-400'
                                  }`}
                                >
                                  {opt.food_type}
                                </span>

                                {isWinner && (
                                  <span className="text-[10px] font-black px-2 py-0.5 bg-[#D97706] text-black rounded-full flex items-center gap-1 shadow">
                                    <Trophy className="w-3 h-3" /> Winner
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-sm text-white">{opt.dish_name}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2">
                                {opt.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-3 border-t border-white/5">
                              <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1">
                                <span>{opt.vote_count} votes</span>
                                <span className="text-[#F4D6B0]">{opt.percentage}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isWinner ? 'bg-[#D97706]' : 'bg-[#3A506B]'
                                  }`}
                                  style={{ width: `${opt.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
