'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { partnerApi } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import { Gift, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AddFoodDonationPage() {
  const router = useRouter();

  // Expiration 6 hours in future
  const defaultExpiryTime = new Date(Date.now() + 6 * 3600 * 1000);
  const formatDateTimeLocal = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Curry & Rice');
  const [dietary, setDietary] = useState('VEG');
  const [totalServings, setTotalServings] = useState('25');
  const [preparedAt, setPreparedAt] = useState(formatDateTimeLocal(new Date()));
  const [expiresAt, setExpiresAt] = useState(formatDateTimeLocal(defaultExpiryTime));
  const [pickupAddress, setPickupAddress] = useState('Kakatiya Banquet Lane, Begumpet, Hyderabad');
  const [area, setArea] = useState('Begumpet');
  const [storageInstructions, setStorageInstructions] = useState('Keep warm in thermal containers or refrigerate promptly.');
  const [allergens, setAllergens] = useState('None');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(expiresAt) <= new Date()) {
      return setError('Expiry time must be in the future.');
    }

    setLoading(true);
    try {
      await partnerApi.createDonation({
        title,
        description,
        category,
        dietary,
        totalServings,
        preparedAt,
        expiresAt,
        pickupAddress,
        area,
        storageInstructions,
        allergens,
        imageUrl,
      });

      router.push('/donations');
    } catch (err) {
      setError(err.message || 'Failed to list food donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/donations" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">List Surplus Food Donation</h2>
          <p className="text-xs text-gray-500">Share clean, prepared surplus meals free of cost to local families and shelters</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Surplus Food Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 25 Fresh Meals: Hyderabadi Veg Biryani & Mirchi Ka Salan"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dietary Category</label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            >
              <option value="VEG">VEG (Vegetarian)</option>
              <option value="NON_VEG">NON_VEG (Non-Vegetarian)</option>
              <option value="VEGAN">VEGAN</option>
              <option value="JAIN">JAIN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Food Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Wedding Buffet Surplus, Rice & Curry"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Available Servings</label>
            <input
              type="number"
              required
              value={totalServings}
              onChange={(e) => setTotalServings(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Time Food Was Prepared</label>
            <input
              type="datetime-local"
              required
              value={preparedAt}
              onChange={(e) => setPreparedAt(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-rose-700">
              Safe Collection Expiry Deadline (Food safety window)
            </label>
            <input
              type="datetime-local"
              required
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-rose-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 font-bold"
            />
            <p className="text-[10px] text-gray-400 mt-1">Listing automatically expires past this timestamp.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh untouched corporate banquet surplus packaged in clean hygienic containers."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Storage & Handling Instructions</label>
            <input
              type="text"
              value={storageInstructions}
              onChange={(e) => setStorageInstructions(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hyderabad Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            >
              <option value="Begumpet">Begumpet</option>
              <option value="Madhapur">Madhapur</option>
              <option value="Banjara Hills">Banjara Hills</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Secunderabad">Secunderabad</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Donation Surplus Food Photo"
              helperText="Upload or drag a photo of the packed surplus food for community verification"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pickup Address & Contact Point</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
          <Link href="/donations" className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-1.5"
          >
            <Gift className="w-4 h-4" />
            <span>{loading ? 'Publishing...' : 'List Surplus Food Donation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
