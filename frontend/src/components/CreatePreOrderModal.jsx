'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FOOD_CATEGORIES, HYDERABAD_NEIGHBORHOODS } from '@/lib/constants';
import { X, Clock, AlertTriangle, ShieldCheck, Sparkles, ChefHat } from 'lucide-react';

export default function CreatePreOrderModal({ onClose }) {
  const { currentUser, createPreOrder, selectedNeighborhood } = useApp();

  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Traditional South Indian');
  const [dietary, setDietary] = useState('veg');
  const [pricePerPlate, setPricePerPlate] = useState('150');
  const [totalPlates, setTotalPlates] = useState('8');
  
  // Set default cooking start time to 2 hours from now
  const defaultCookStart = new Date(Date.now() + 120 * 60000).toISOString().slice(0, 16);
  const [cookingStartTime, setCookingStartTime] = useState(defaultCookStart);
  const [cutoffTimeStr, setCutoffTimeStr] = useState('');

  const [pickupAddress, setPickupAddress] = useState(
    `Road No. 10, ${selectedNeighborhood.name}, Hyderabad`
  );
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState('35');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80'
  );
  const [fssaiAgreed, setFssaiAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  // Automatically compute and display 30-minute cutoff preview
  useEffect(() => {
    if (cookingStartTime) {
      const cookDate = new Date(cookingStartTime);
      const cutoffDate = new Date(cookDate.getTime() - 30 * 60000);
      setCutoffTimeStr(
        cutoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ' (' +
          cutoffDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
          ')'
      );
    }
  }, [cookingStartTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fssaiAgreed) {
      alert('Please agree to the food safety and hygiene declaration.');
      return;
    }

    setLoading(true);
    const postData = {
      dishName,
      description,
      category,
      dietary,
      pricePerPlate: parseFloat(pricePerPlate),
      totalPlates: parseInt(totalPlates, 10),
      cookingStartsAt: new Date(cookingStartTime).toISOString(),
      pickupAddress,
      area: selectedNeighborhood.name,
      deliveryAvailable,
      deliveryFee: deliveryAvailable ? parseFloat(deliveryFee) : 0,
      ingredients,
      allergens,
      imageUrl,
    };

    const res = await createPreOrder(postData);
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
            <div className="w-9 h-9 rounded-xl bg-[#F5A623] text-black flex items-center justify-center font-bold">
              <ChefHat size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Announce Home-Cooked Pre-Order</h2>
              <p className="text-xs text-[#A3E5B5]">Accept up to 4 customer bookings before cooking starts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Important Automatic Cutoff Explainer Box */}
          <div className="bg-[#FFF9EE] p-3.5 rounded-2xl border border-[#F5A623]/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#174D36] flex items-center gap-1.5">
                <Clock size={15} className="text-[#F5A623]" />
                <span>Automatic 30-Minute Cutoff:</span>
              </span>
              <span className="font-mono font-bold bg-[#174D36] text-[#A3E5B5] px-2.5 py-0.5 rounded-full">
                {cutoffTimeStr || 'Calculating...'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              When cooking starts, customers need food to be prepared fresh without last-minute chaos. The server will automatically lock orders <strong>strictly 30 minutes before your scheduled cooking start</strong> and send you your final preparation summary.
            </p>
          </div>

          {/* Dish Title & Dietary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Dish Name *</label>
              <input
                type="text"
                required
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g. Hyderabadi Mutton Dum Biryani, Kachi Gosht"
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
            <label className="block font-bold text-gray-700 mb-1">Appetising Description & Heritage Story *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your authentic ingredients, cooking technique, and portion size..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          {/* Category & Plates */}
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
              <label className="block font-bold text-gray-700 mb-1">Price per Plate (₹ INR) *</label>
              <input
                type="number"
                required
                min="20"
                value={pricePerPlate}
                onChange={(e) => setPricePerPlate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Total Plates Capacity *</label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={totalPlates}
                onChange={(e) => setTotalPlates(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Cooking Start Time & 4-Customer Rule Notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Planned Cooking Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={cookingStartTime}
                onChange={(e) => setCookingStartTime(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
              />
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
              <span className="text-xl">👩‍🍳</span>
              <p className="text-[11px] text-emerald-900 leading-tight">
                <strong>4-Customer Limit:</strong> Even if you offer 10 plates, only 4 customer bookings are accepted to keep portions manageable.
              </p>
            </div>
          </div>

          {/* Pickup Address & Delivery */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Pickup Address / Landmark *</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="deliv"
                checked={deliveryAvailable}
                onChange={(e) => setDeliveryAvailable(e.target.checked)}
                className="w-4 h-4 text-[#174D36] rounded"
              />
              <label htmlFor="deliv" className="font-bold text-gray-700 cursor-pointer">
                Can deliver locally via Dunzo / Rapido / Self
              </label>
            </div>
            {deliveryAvailable && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-semibold">Delivery Fee: ₹</span>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-16 p-1 bg-white border border-gray-300 rounded text-center font-bold"
                />
              </div>
            )}
          </div>

          {/* Ingredients & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Key Ingredients</label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Basmati Rice, Pure Ghee, Saffron..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Common Allergens (if any)</label>
              <input
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="Dairy, Peanuts, Gluten..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* FSSAI Self-Declaration */}
          <div className="flex items-start gap-2 bg-[#FFF9EE] p-3 rounded-xl border border-[#F5A623]/30">
            <input
              type="checkbox"
              id="fssai"
              checked={fssaiAgreed}
              onChange={(e) => setFssaiAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#174D36]"
            />
            <label htmlFor="fssai" className="text-[11px] text-gray-700 leading-tight">
              <strong>FSSAI & Hygiene Declaration:</strong> I confirm this meal will be freshly cooked in a clean domestic kitchen under hygienic conditions with potable water and fresh ingredients.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#F5A623] hover:bg-[#DE9319] text-black font-extrabold rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing Post...' : 'Publish Pre-Order Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
