'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { pollPartnerApi } from '@/lib/api';
import {
  Vote,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Scale,
  ShoppingBag,
  RefreshCw,
  X,
  Check,
  Calendar,
  Sparkles,
  ExternalLink,
  ChefHat,
} from 'lucide-react';

export default function PartnerDishPollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Tie-Break Modal State
  const [tieBreakPoll, setTieBreakPoll] = useState(null);
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [tieReason, setTieReason] = useState('');
  const [submittingTie, setSubmittingTie] = useState(false);

  // Pre-Order Creation Modal State
  const [preorderPoll, setPreorderPoll] = useState(null);
  const [pricePerPlate, setPricePerPlate] = useState('160');
  const [totalPlates, setTotalPlates] = useState('20');
  const [cookingStartsAt, setCookingStartsAt] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState('35');
  const [submittingPreorder, setSubmittingPreorder] = useState(false);

  const loadPolls = async () => {
    setLoading(true);
    try {
      const res = await pollPartnerApi.getMyPolls();
      setPolls(res.polls || []);
    } catch (err) {
      console.error('Failed to load cook polls:', err);
      setErrorMessage(err.message || 'Failed to load dish polls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  // Publish a draft poll
  const handlePublish = async (pollId) => {
    try {
      await pollPartnerApi.publishPoll(pollId);
      setToastMessage('Poll is now live and accepting customer votes!');
      setTimeout(() => setToastMessage(''), 3000);
      loadPolls();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to publish poll.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Cancel poll
  const handleCancel = async (pollId) => {
    if (!window.confirm('Are you sure you want to cancel this voting poll?')) return;
    try {
      await pollPartnerApi.cancelPoll(pollId, 'Cancelled by chef');
      setToastMessage('Poll has been cancelled.');
      setTimeout(() => setToastMessage(''), 3000);
      loadPolls();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel poll.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // Submit Tie Break
  const handleTieBreakSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWinnerId || !tieReason.trim()) {
      setErrorMessage('Please pick the winning dish and provide an explanation reason.');
      return;
    }

    setSubmittingTie(true);
    try {
      await pollPartnerApi.tieBreak(tieBreakPoll.id, {
        winningOptionId: selectedWinnerId,
        tieBreakReason: tieReason.trim(),
      });
      setToastMessage('Tie broken successfully! Winning dish finalized and voters notified.');
      setTimeout(() => setToastMessage(''), 3500);
      setTieBreakPoll(null);
      loadPolls();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resolve tie.');
    } finally {
      setSubmittingTie(false);
    }
  };

  // Open Pre-Order Modal
  const openPreorderModal = (poll) => {
    setPreorderPoll(poll);
    setPricePerPlate(poll.winning_dish_price ? String(poll.winning_dish_price) : '160');
    setTotalPlates('20');

    // Default cooking start time: tomorrow at 12:30 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 30, 0, 0);
    // Format YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
      tomorrow.getDate()
    )}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
    setCookingStartsAt(localIso);
  };

  // Submit Pre-Order Creation
  const handlePreorderSubmit = async (e) => {
    e.preventDefault();
    if (!cookingStartsAt || !pricePerPlate) {
      setErrorMessage('Please fill in cooking start time and price per plate.');
      return;
    }

    setSubmittingPreorder(true);
    try {
      const res = await pollPartnerApi.createPreorder(preorderPoll.id, {
        pricePerPlate: parseFloat(pricePerPlate),
        totalPlates: parseInt(totalPlates, 10) || 20,
        cookingStartsAt,
        deliveryAvailable,
        deliveryFee: deliveryAvailable ? parseFloat(deliveryFee) : 0,
      });

      setToastMessage(res.message || 'Pre-order created successfully from winning dish!');
      setTimeout(() => setToastMessage(''), 4000);
      setPreorderPoll(null);
      loadPolls();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create pre-order.');
    } finally {
      setSubmittingPreorder(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-[#1E3A2E] border border-emerald-500 text-white font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-rose-950 border border-rose-500 text-rose-200 font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0F1F17] border border-[#1E3A2E] shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-[#C7CBB8] uppercase tracking-wider">
              Home Cook Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dish Voting & Community Polls
          </h1>
          <p className="text-xs text-[#C7CBB8]/80 max-w-xl">
            Let customers vote on what you should cook next. Close polls, resolve ties, and transform
            the winning dish into advance pre-orders with 1 click.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadPolls}
            disabled={loading}
            className="p-2.5 bg-[#1E3A2E] hover:bg-[#3E5A3F] rounded-2xl text-slate-300 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/polls/create"
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Dish Poll</span>
          </Link>
        </div>
      </div>

      {/* Polls Listing */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500 font-bold flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
          <span>Loading your dish polls...</span>
        </div>
      ) : polls.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-gray-200 text-center space-y-4 shadow-sm">
          <Vote className="w-14 h-14 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Dish Polls Created Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Engage your neighborhood foodies by creating a poll for your next lunch or dinner!
          </p>
          <div className="pt-2">
            <Link
              href="/polls/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A2E] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#3E5A3F] transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Poll</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const isTied = poll.status === 'TIED';
            const isClosed = poll.status === 'CLOSED';
            const isActive = poll.status === 'ACTIVE';
            const isDraft = poll.status === 'DRAFT';

            // Find leading dish
            const leadingOption = poll.options?.length > 0 ? poll.options[0] : null;

            return (
              <div
                key={poll.id}
                className="rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Header Row */}
                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isTied
                            ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                            : isClosed
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : isDraft
                            ? 'bg-gray-100 text-gray-800 border-gray-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {poll.status}
                      </span>

                      <span className="text-xs text-gray-500 font-medium">
                        Cooking Date: {new Date(poll.cooking_date).toLocaleDateString()}
                      </span>

                      <span className="text-xs text-gray-400 font-mono">
                        Deadline: {new Date(poll.voting_ends_at).toLocaleString()}
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-gray-900 pt-1">{poll.title}</h2>
                    {poll.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">{poll.description}</p>
                    )}
                  </div>

                  {/* Actions / Metrics */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right px-4 py-2 bg-white rounded-2xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        Total Votes
                      </span>
                      <span className="text-xl font-black text-emerald-700 font-mono">
                        {poll.total_votes || 0}
                      </span>
                    </div>

                    {/* Action buttons depending on state */}
                    {isDraft && (
                      <button
                        onClick={() => handlePublish(poll.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
                      >
                        Publish Live
                      </button>
                    )}

                    {isActive && (
                      <button
                        onClick={() => handleCancel(poll.id)}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition"
                      >
                        Cancel Poll
                      </button>
                    )}

                    {isTied && (
                      <button
                        onClick={() => {
                          setTieBreakPoll(poll);
                          setSelectedWinnerId(poll.options[0]?.id || '');
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Break Tie</span>
                      </button>
                    )}

                    {isClosed && poll.winning_dish_name && (
                      <button
                        onClick={() => openPreorderModal(poll)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Create Pre-Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Dish Options Breakdown */}
                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {poll.options?.map((opt) => {
                      const isWinner = poll.winner_option_id === opt.id;
                      const isVeg = opt.food_type === 'VEG';

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                            isWinner
                              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-[9px] font-black px-2 py-0.2 rounded-full ${
                                  isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isVeg ? 'VEG' : 'NON-VEG'}
                              </span>

                              {isWinner && (
                                <span className="text-[10px] font-black text-amber-700 flex items-center gap-0.5">
                                  <Trophy className="w-3 h-3" /> Winner
                                </span>
                              )}
                            </div>

                            <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-gray-100">
                              <img
                                src={
                                  opt.image ||
                                  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'
                                }
                                alt={opt.dish_name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <h4 className="font-bold text-xs text-gray-900 line-clamp-1">
                              {opt.dish_name}
                            </h4>
                            {opt.estimated_price && (
                              <span className="text-[11px] font-mono font-bold text-gray-500">
                                ₹{opt.estimated_price}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-gray-700">
                              <span>{opt.vote_count || 0} votes</span>
                              <span>{opt.percentage || 0}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isWinner ? 'bg-amber-500' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${opt.percentage || 0}%` }}
                              />
                            </div>
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
          MODAL 1: TIE-BREAK RESOLUTION
      ========================================================================= */}
      {tieBreakPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-black text-gray-900">Resolve Tied Dish Vote</h3>
              </div>
              <button
                onClick={() => setTieBreakPoll(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Two or more dishes received the highest vote count in "{tieBreakPoll.title}". As the home
              chef, please select the winning dish and provide an explanation reason for customers.
            </p>

            <form onSubmit={handleTieBreakSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Select Winning Dish
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tieBreakPoll.options.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition ${
                        selectedWinnerId === opt.id
                          ? 'bg-amber-50 border-amber-500 text-amber-900'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="winningOption"
                        value={opt.id}
                        checked={selectedWinnerId === opt.id}
                        onChange={() => setSelectedWinnerId(opt.id)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-bold block">{opt.dish_name}</span>
                        <span className="text-gray-500">
                          {opt.vote_count} votes ({opt.percentage}%)
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Reason for Decision (Required for Audit Log & Notification)
                </label>
                <textarea
                  required
                  rows={3}
                  value={tieReason}
                  onChange={(e) => setTieReason(e.target.value)}
                  placeholder="e.g. Fresh farm ingredients available at morning market, or customer requests."
                  className="w-full p-3 border border-gray-300 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setTieBreakPoll(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTie}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow"
                >
                  {submittingTie ? 'Finalizing...' : 'Confirm Winner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PRE-ORDER CREATION FROM WINNING DISH (Rule 11)
      ========================================================================= */}
      {preorderPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-gray-200 p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-gray-900">
                  Publish Pre-Order: {preorderPoll.winning_dish_name}
                </h3>
              </div>
              <button
                onClick={() => setPreorderPoll(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Automatic RUCHI Booking Safeguards Active:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-emerald-700">
                <li>RUCHI 4-customer booking slots limit strictly enforced</li>
                <li>Automatic 30-minute order cutoff before cooking scheduled</li>
              </ul>
            </div>

            <form onSubmit={handlePreorderSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Price Per Plate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerPlate}
                    onChange={(e) => setPricePerPlate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Total Plates Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={totalPlates}
                    onChange={(e) => setTotalPlates(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Cooking Start Time (Cutoff applied 30m prior)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={cookingStartsAt}
                  onChange={(e) => setCookingStartsAt(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryAvailable}
                    onChange={(e) => setDeliveryAvailable(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Offer Bike/Delivery</span>
                </label>

                {deliveryAvailable && (
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="text-gray-500 font-bold">Fee: ₹</span>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="w-16 p-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setPreorderPoll(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPreorder}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow"
                >
                  {submittingPreorder ? 'Publishing...' : 'Publish Pre-Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
