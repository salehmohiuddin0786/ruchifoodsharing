'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pollPartnerApi } from '@/lib/api';
import {
  Vote,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ChefHat,
  Sparkles,
} from 'lucide-react';

export default function CreateDishPollPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Default dates: cooking tomorrow, voting ends tonight
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const defaultCookingDate = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate()
  )}`;

  // Voting start: now
  const nowIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T${pad(
    today.getHours()
  )}:${pad(today.getMinutes())}`;

  // Voting end: tonight at 22:00
  const tonight = new Date();
  tonight.setHours(22, 0, 0, 0);
  const defaultEndIso = `${tonight.getFullYear()}-${pad(tonight.getMonth() + 1)}-${pad(
    tonight.getDate()
  )}T22:00`;

  const [cookingDate, setCookingDate] = useState(defaultCookingDate);
  const [votingStartsAt, setVotingStartsAt] = useState(nowIso);
  const [votingEndsAt, setVotingEndsAt] = useState(defaultEndIso);

  // Default 2 initial dish options (min 2, max 5)
  const [options, setOptions] = useState([
    {
      dishName: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      foodType: 'NON_VEG',
      estimatedPrice: '180',
    },
    {
      dishName: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      foodType: 'VEG',
      estimatedPrice: '150',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add option (max 5)
  const handleAddOption = () => {
    if (options.length >= 5) {
      setError('You can add a maximum of five (5) dishes per voting poll.');
      return;
    }
    setError('');
    setOptions([
      ...options,
      {
        dishName: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
        foodType: 'VEG',
        estimatedPrice: '160',
      },
    ]);
  };

  // Remove option (min 2)
  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setError('A voting poll must have at least two (2) dish options.');
      return;
    }
    setError('');
    setOptions(options.filter((_, i) => i !== index));
  };

  // Update option field
  const handleOptionChange = (index, field, value) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
  };

  // Submit poll (status: DRAFT or ACTIVE)
  const handleSubmit = async (publishStatus = 'ACTIVE') => {
    setError('');

    if (!title.trim()) {
      setError('Please provide a descriptive title for your poll.');
      return;
    }

    if (!cookingDate || !votingEndsAt) {
      setError('Please provide cooking date and voting end deadline.');
      return;
    }

    // Validate dish names
    for (let i = 0; i < options.length; i++) {
      if (!options[i].dishName.trim()) {
        setError(`Please provide a name for Dish #${i + 1}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        cookingDate,
        votingStartsAt,
        votingEndsAt,
        options,
        status: publishStatus,
      };

      await pollPartnerApi.createPoll(payload);
      router.push('/polls');
    } catch (err) {
      setError(err.message || 'Failed to create dish poll.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <Link
          href="/polls"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dish Polls</span>
        </Link>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Chef Community Polling
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Create Community Dish Poll
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Ask your neighborhood food lovers what they would like you to cook. Set 2 to 5 dishes,
          schedule the voting deadline, and launch the poll live.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Step 1: Poll Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
            <span>1. Poll Schedule & Details</span>
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase">Poll Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vote for Tomorrow's Homestyle Special Lunch!"
              className="w-full p-3.5 border border-gray-300 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 uppercase">
              Description / Notes to Customers (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share ingredients, cooking style, or why you are excited to cook these options..."
              className="w-full p-3.5 border border-gray-300 rounded-2xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Cooking Date
              </label>
              <input
                type="date"
                required
                value={cookingDate}
                onChange={(e) => setCookingDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Voting Starts At
              </label>
              <input
                type="datetime-local"
                required
                value={votingStartsAt}
                onChange={(e) => setVotingStartsAt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Voting Ends At (Deadline)
              </label>
              <input
                type="datetime-local"
                required
                value={votingEndsAt}
                onChange={(e) => setVotingEndsAt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dish Options (2 to 5 dishes) */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-900">
                2. Dish Options ({options.length}/5)
              </h2>
              <p className="text-xs text-gray-500">Provide 2 to 5 dishes for customers to vote on.</p>
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Dish Option</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {options.map((opt, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    Option #{index + 1}
                  </span>

                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={opt.dishName}
                      onChange={(e) => handleOptionChange(index, 'dishName', e.target.value)}
                      placeholder="e.g. Hyderabadi Dum Biryani"
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase">
                        Dietary Type
                      </label>
                      <select
                        value={opt.foodType}
                        onChange={(e) => handleOptionChange(index, 'foodType', e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700 font-bold"
                      >
                        <option value="VEG">VEG</option>
                        <option value="NON_VEG">NON-VEG</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700 uppercase">
                        Est. Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={opt.estimatedPrice}
                        onChange={(e) =>
                          handleOptionChange(index, 'estimatedPrice', e.target.value)
                        }
                        placeholder="160"
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase">
                    Description & Flavor Profile
                  </label>
                  <input
                    type="text"
                    value={opt.description}
                    onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                    placeholder="Short description highlighting flavors, side pairings, or authenticity"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase">
                    Dish Photo Image URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={opt.image}
                      onChange={(e) => handleOptionChange(index, 'image', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-700 font-mono text-[11px]"
                    />
                    {opt.image && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                          src={opt.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('ACTIVE')}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Vote className="w-4 h-4" />
            <span>{loading ? 'Creating Poll...' : 'Publish Poll Live'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
