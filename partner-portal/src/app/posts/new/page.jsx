'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { partnerApi } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import { PlusCircle, Clock, UtensilsCrossed, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AddHomemadeFoodPage() {
  const router = useRouter();

  // Set default cooking starts at: 3 hours in future
  const defaultCookingTime = new Date(Date.now() + 3 * 3600 * 1000);
  // Format for datetime-local input: YYYY-MM-DDTHH:mm
  const formatDateTimeLocal = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Curry & Rice');
  const [dietary, setDietary] = useState('VEG');
  const [pricePerPlate, setPricePerPlate] = useState('180');
  const [totalPlates, setTotalPlates] = useState('12');
  const [cookingStartsAt, setCookingStartsAt] = useState(formatDateTimeLocal(defaultCookingTime));
  const [pickupAddress, setPickupAddress] = useState('Road No. 12, Banjara Hills, Hyderabad');
  const [area, setArea] = useState('Banjara Hills');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('30');
  const [ingredients, setIngredients] = useState('Fresh toor dal, gongura leaves, ghee, green chillies, basmati rice');
  const [allergens, setAllergens] = useState('None');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute 30-min pre-cooking cutoff live in UI
  const cookingDate = new Date(cookingStartsAt);
  const cutoffDate = !isNaN(cookingDate.getTime())
    ? new Date(cookingDate.getTime() - 30 * 60 * 1000)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cutoffDate && cutoffDate <= new Date()) {
      return setError('Cooking start time must be at least 35 minutes in the future to allow for the 30-min cutoff buffer.');
    }

    setLoading(true);
    try {
      await partnerApi.createPost({
        dishName,
        description,
        category,
        dietary,
        pricePerPlate,
        totalPlates,
        cookingStartsAt,
        pickupAddress,
        area,
        deliveryAvailable,
        deliveryFee,
        ingredients,
        allergens,
        imageUrl,
      });

      router.push('/posts');
    } catch (err) {
      setError(err.message || 'Failed to publish homemade food post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link href="/posts" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Add New Homemade Food Post</h2>
          <p className="text-xs text-gray-500">Scheduled home cooking session with automatic 30-minute pre-cooking cutoff</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Real-Time 30-Minute Cutoff Calculation Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-2xl border border-emerald-200 space-y-2">
          <div className="flex items-center space-x-2 text-[#174D36]">
            <Clock className="w-4 h-4 text-[#F5A623]" />
            <span className="font-bold text-xs uppercase tracking-wider">30-Minute Pre-Cooking Buffer Engine</span>
          </div>
          <p className="text-xs text-gray-600">
            To give you uninterrupted time to prepare fresh ingredients, pre-orders will automatically close exactly 30 minutes before your cooking session begins.
          </p>
          {cutoffDate && (
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 block font-semibold">COOKING STARTS AT:</span>
                <span className="font-bold text-gray-800">
                  {cookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cookingDate.toLocaleDateString()})
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-amber-300 ring-2 ring-amber-100">
                <span className="text-[10px] text-amber-800 block font-bold">PRE-ORDERS AUTO-LOCK AT:</span>
                <span className="font-black text-[#174D36]">
                  {cutoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (30 mins prior)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Basic Dish Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dish Name</label>
            <input
              type="text"
              required
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="e.g. Traditional Andhra Pappu & Gongura Rice Thali"
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
              <option value="JAIN">JAIN (No onion / garlic)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cuisine / Food Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Telangana Curry, Biryani, Tiffins"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price per Plate (₹)</label>
            <input
              type="number"
              required
              value={pricePerPlate}
              onChange={(e) => setPricePerPlate(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Total Plates Cooking (Max 4 Unique Customers)
            </label>
            <input
              type="number"
              required
              value={totalPlates}
              onChange={(e) => setTotalPlates(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Scheduled Cooking Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={cookingStartsAt}
              onChange={(e) => setCookingStartsAt(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description & Taste Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how the dish is cooked, secret spices, homemade touch..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ingredients Used</label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. Sona Masoori Rice, Fresh Tur Dal, Ghee, Curry Leaves"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Allergens</label>
            <input
              type="text"
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              placeholder="e.g. Peanuts, Dairy (Ghee), Gluten"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pickup Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            >
              <option value="Banjara Hills">Banjara Hills</option>
              <option value="Madhapur">Madhapur</option>
              <option value="Jubilee Hills">Jubilee Hills</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Begumpet">Begumpet</option>
              <option value="Kondapur">Kondapur</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kitchen Pickup Address</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Street name, landmark, gate number for customer pickup"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Dish Photo"
              helperText="Upload or drag your freshly cooked dish photo (saved automatically to server)"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
          <Link
            href="/posts"
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing...' : 'Publish Homemade Food Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
