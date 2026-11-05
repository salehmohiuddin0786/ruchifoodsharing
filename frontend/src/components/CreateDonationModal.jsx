'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FOOD_CATEGORIES } from '@/lib/constants';
import { X, HeartHandshake, Shield, AlertCircle } from 'lucide-react';

export default function CreateDonationModal({ onClose }) {
  const { currentUser, createDonation, selectedNeighborhood } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [dietary, setDietary] = useState('veg');
  const [totalServings, setTotalServings] = useState('20');
  
  // Safe deadline default: 4 hours from now
  const defaultExpiry = new Date(Date.now() + 240 * 60000).toISOString().slice(0, 16);
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);

  const [pickupAddress, setPickupAddress] = useState(
    `Banquet Hall / Kitchen, ${selectedNeighborhood.name}, Hyderabad`
  );
  const [storageInstructions, setStorageInstructions] = useState(
    'Maintained in food warmers >65°C. Keep covered and consume within 3-4 hours of pickup.'
  );
  const [allergens, setAllergens] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  );
  const [safetyPledge, setSafetyPledge] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!safetyPledge) {
      alert('Please confirm the community food safety pledge.');
      return;
    }

    setLoading(true);
    const donationData = {
      title,
      description,
      category,
      dietary,
      totalServings: parseInt(totalServings, 10),
      preparedAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      pickupAddress,
      area: selectedNeighborhood.name,
      storageInstructions,
      allergens,
      imageUrl,
    };

    const res = await createDonation(donationData);
    setLoading(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#174D36] text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#65A878] text-white flex items-center justify-center font-bold">
              <HeartHandshake size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Donate Free Surplus Food</h2>
              <p className="text-xs text-[#A3E5B5]">Zero commercial fee (₹0) • Help feed local citizens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Zero Waste Banner */}
          <div className="bg-[#E8F5EC] p-3 rounded-2xl border border-[#65A878]/40 text-xs text-[#174D36] flex items-start gap-2.5">
            <Shield size={18} className="shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>100% Free Surplus Food:</strong> By listing here, you are offering edible surplus food to your community at zero charge. Thank you for preventing food waste in Hyderabad!
            </p>
          </div>

          {/* Title & Dietary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Food Title / Description *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Steamed Bagara Rice & Dal Tadka (Packaged)"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174D36]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Dietary Status</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
              >
                <option value="veg">🟢 Pure Veg</option>
                <option value="non-veg">🔴 Non-Veg</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="jain">🌾 Jain</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Details & Packaging Status *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Prepared for lunch at 1 PM today. Stored cleanly in food-grade thermal containers. Ideal for individuals or shelters."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          {/* Category, Servings & Safe Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              >
                {FOOD_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Available Servings *</label>
              <input
                type="number"
                required
                min="1"
                value={totalServings}
                onChange={(e) => setTotalServings(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Safe Collection Deadline *</label>
              <input
                type="datetime-local"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Handling & Storage Instructions */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Temperature & Storage Instructions *
            </label>
            <input
              type="text"
              required
              value={storageInstructions}
              onChange={(e) => setStorageInstructions(e.target.value)}
              placeholder="e.g. Keep chilled, or consume hot within 3 hours..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Pickup Address / Kitchen Location *</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          {/* Safety Pledge Checkbox */}
          <div className="flex items-start gap-2 bg-[#E8F5EC] p-3 rounded-xl border border-[#65A878]/30">
            <input
              type="checkbox"
              id="pledge"
              checked={safetyPledge}
              onChange={(e) => setSafetyPledge(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#174D36]"
            />
            <label htmlFor="pledge" className="text-[11px] text-gray-700 leading-tight">
              <strong>Donor Food Safety Pledge:</strong> I confirm this surplus food is wholesome, hygienic, was prepared under sanitary conditions, and is provided free of charge (₹0).
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#65A878] hover:bg-[#4E8D60] text-white font-extrabold rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Posting Donation...' : 'Publish Free Surplus Food Share'}
          </button>
        </form>
      </div>
    </div>
  );
}
