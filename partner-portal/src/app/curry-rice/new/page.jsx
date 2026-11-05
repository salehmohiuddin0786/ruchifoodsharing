'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { curryRiceApi } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import {
  UtensilsCrossed,
  ArrowLeft,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Zap,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function SellCurryRicePage() {
  const router = useRouter();

  // Category choice: CURRY, RICE, CURRY_RICE, DAILY_MEALS
  const [category, setCategory] = useState('CURRY');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dietary, setDietary] = useState('VEG');
  const [price, setPrice] = useState('140');
  const [servingSize, setServingSize] = useState('500ml container (Serves 1-2)');
  const [stockQuantity, setStockQuantity] = useState('15');
  const [isAvailableDaily, setIsAvailableDaily] = useState(true);
  const [orderType, setOrderType] = useState('INSTANT');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('25');
  const [pickupTimeWindow, setPickupTimeWindow] = useState('12:00 PM - 3:30 PM & 7:00 PM - 10:00 PM');
  const [pickupAddress, setPickupAddress] = useState('Road No. 12, Banjara Hills, Hyderabad');
  const [area, setArea] = useState('Banjara Hills');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryPresets = {
    CURRY: {
      nameSuggestion: 'Authentic Paneer Butter Masala',
      servingSuggestion: '500ml container (Serves 2)',
      priceSuggestion: '160',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
    },
    RICE: {
      nameSuggestion: 'Fragrant Jeera Basmati Rice',
      servingSuggestion: '750ml box (Serves 2)',
      priceSuggestion: '110',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
    },
    CURRY_RICE: {
      nameSuggestion: 'Sona Masoori Rice + Tadka Dal + Poriyal Combo',
      servingSuggestion: 'Full Meal Combo Box (Serves 1-2)',
      priceSuggestion: '190',
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
    },
    DAILY_MEALS: {
      nameSuggestion: 'Executive Homestyle Daily Meal Box (Thali)',
      servingSuggestion: 'Multi-Tier Meal Box with Rice, 2 Curries, Sambar, Curd',
      priceSuggestion: '240',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800',
    },
  };

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    const preset = categoryPresets[cat];
    if (preset) {
      if (!name) setName(preset.nameSuggestion);
      if (servingSize === '500ml container (Serves 1-2)' || !servingSize) {
        setServingSize(preset.servingSuggestion);
      }
      if (price === '140') {
        setPrice(preset.priceSuggestion);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !servingSize) {
      return setError('Please fill in dish name, price, and serving size.');
    }

    setLoading(true);
    try {
      await curryRiceApi.createItem({
        name,
        description,
        category,
        dietary,
        price,
        servingSize,
        stockQuantity,
        isAvailableDaily,
        orderType,
        prepTimeMinutes,
        pickupTimeWindow,
        pickupAddress,
        area,
        imageUrl,
      });

      router.push('/curry-rice');
    } catch (err) {
      setError(err.message || 'Failed to list Curry & Rice item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <Link href="/curry-rice" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sell Curry, Rice or Daily Meals</h1>
          <p className="text-xs text-gray-500">
            Publish an item in the Curry & Rice Marketplace with real-time stock and instant or advance fulfillment
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-8">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Core Category Selector: 4 Requested Options */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            Select Marketplace Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                id: 'CURRY',
                title: 'Sell Curry',
                sub: 'Individual homestyle curries & gravies',
                icon: '🍛',
              },
              {
                id: 'RICE',
                title: 'Sell Rice',
                sub: 'Steamed, Bagara, Jeera or flavoured rice',
                icon: '🍚',
              },
              {
                id: 'CURRY_RICE',
                title: 'Sell Curry + Rice',
                sub: 'Curry & rice combo meal portions',
                icon: '🍱',
              },
              {
                id: 'DAILY_MEALS',
                title: 'Sell Daily Meals',
                sub: 'Full executive thalis & daily tiffin boxes',
                icon: '🍲',
              },
            ].map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  category === cat.id
                    ? 'border-[#1E3A2E] bg-[#1E3A2E]/5 shadow-sm ring-2 ring-[#1E3A2E]/20'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <p className="text-xs font-black text-gray-900">{cat.title}</p>
                <p className="text-[10px] text-gray-500 mt-1 leading-snug">{cat.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Order Fulfillment Mode: Instant vs Advance */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            Ordering Workflow <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'INSTANT',
                title: '⚡ Instant Ordering',
                desc: 'Food is ready or quickly prepared for immediate pickup / delivery.',
              },
              {
                id: 'ADVANCE',
                title: '⏰ Advance Ordering',
                desc: 'Customers pre-book in advance with designated pickup time slot.',
              },
              {
                id: 'BOTH',
                title: '🔄 Both Instant & Advance',
                desc: 'Customers can order immediately or schedule for later today.',
              },
            ].map((mode) => (
              <button
                type="button"
                key={mode.id}
                onClick={() => setOrderType(mode.id)}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  orderType === mode.id
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="text-xs font-bold">{mode.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Image Upload Component */}
        <div className="pt-2 border-t border-gray-100">
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            label="Dish Image Upload"
            helperText="Upload or drag your prepared curry, rice, or meal box photo"
          />
        </div>

        {/* 4. Food Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Food Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Authentic Andhra Gongura Pappu (Dal)"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E] focus:bg-white transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh home-cooked ingredients, spice level, cooking method..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dietary Category</label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E]"
            >
              <option value="VEG">VEG (Vegetarian)</option>
              <option value="NON_VEG">NON_VEG (Non-Vegetarian)</option>
              <option value="VEGAN">VEGAN</option>
              <option value="JAIN">JAIN (No onion / garlic)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Price (₹ per serving) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-xs font-bold text-gray-400">₹</span>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="140"
                className="w-full pl-7 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1E3A2E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Serving Size Specification <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="e.g. 500ml box, 750ml container, Serves 2"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Initial Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1E3A2E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Preparation Time</label>
            <div className="relative">
              <input
                type="number"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(e.target.value)}
                placeholder="25"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E]"
              />
              <span className="absolute right-3 top-3 text-xs text-gray-400">minutes</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pickup Time Window</label>
            <input
              type="text"
              value={pickupTimeWindow}
              onChange={(e) => setPickupTimeWindow(e.target.value)}
              placeholder="e.g. 12:00 PM - 3:30 PM & 7:00 PM - 10:00 PM"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Neighborhood / Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E]"
            >
              <option value="Banjara Hills">Banjara Hills</option>
              <option value="Madhapur">Madhapur</option>
              <option value="Jubilee Hills">Jubilee Hills</option>
              <option value="Gachibowli">Gachibowli</option>
              <option value="Begumpet">Begumpet</option>
              <option value="Kondapur">Kondapur</option>
              <option value="Secunderabad">Secunderabad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Daily Availability</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <span className="text-xs text-gray-700 font-medium">Available every day on schedule</span>
              <input
                type="checkbox"
                checked={isAvailableDaily}
                onChange={(e) => setIsAvailableDaily(e.target.checked)}
                className="w-4 h-4 text-[#1E3A2E] rounded focus:ring-[#1E3A2E]"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pickup Kitchen Address</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Road No., Landmark, Gate info for order collection"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1E3A2E]"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
          <Link
            href="/curry-rice"
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1E3A2E] hover:bg-[#0F1F17] text-white text-xs font-black rounded-xl transition shadow-md flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing to Store...' : 'List in Curry & Rice Marketplace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
