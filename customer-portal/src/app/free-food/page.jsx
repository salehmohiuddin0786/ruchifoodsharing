'use client';

import React, { useState, useEffect } from 'react';
import { customerApi } from '@/lib/api';
import {
  Gift,
  Clock,
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Package,
  Truck,
  Bike,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Phone,
} from 'lucide-react';

export default function FreeFoodPage() {
  const [donations, setDonations] = useState([]);
  const [area, setArea] = useState('all');
  const [dietary, setDietary] = useState('all');
  const [loading, setLoading] = useState(true);

  // Multi-step Claim Flow state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [claimStep, setClaimStep] = useState(1); // 1: Servings, 2: Fulfillment, 3: Address, 4: Confirmed
  const [servings, setServings] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState('PICKUP'); // 'PICKUP', 'DELIVERY', 'RAPIDO'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [confirmedClaimData, setConfirmedClaimData] = useState(null);

  useEffect(() => {
    loadDonations();
  }, [area, dietary]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (area !== 'all') params.area = area;
      if (dietary !== 'all') params.dietary = dietary;

      const res = await customerApi.getDonations(params);
      setDonations(res.donations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClaimModal = (don) => {
    setSelectedDonation(don);
    setClaimStep(1);
    setServings(1);
    setFulfillmentType('PICKUP');
    setDeliveryAddress('');
    setRecipientPhone('');
    setSpecialNote('');
    setError('');
    setConfirmedClaimData(null);
  };

  const handleCloseClaimModal = () => {
    setSelectedDonation(null);
    setClaimStep(1);
    setError('');
  };

  // Submit Final Free Claim
  const handleFinalClaimSubmit = async (e) => {
    if (e) e.preventDefault();
    setClaiming(true);
    setError('');

    try {
      const claimPayload = {
        donationId: selectedDonation.id,
        servings,
        fulfillmentType: fulfillmentType === 'RAPIDO' ? 'DELIVERY' : fulfillmentType,
        deliveryMethod: fulfillmentType,
        deliveryAddress: fulfillmentType !== 'PICKUP' ? deliveryAddress : null,
        recipientPhone: fulfillmentType !== 'PICKUP' ? recipientPhone : null,
        note: specialNote,
      };

      const res = await customerApi.claimDonation(claimPayload);

      setConfirmedClaimData({
        claimId: res.claimId || `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
        title: selectedDonation.title,
        servings,
        fulfillmentType,
        donorAddress: selectedDonation.pickup_address,
        deliveryAddress: fulfillmentType !== 'PICKUP' ? deliveryAddress : null,
      });

      setClaimStep(4);
      loadDonations();
    } catch (err) {
      setError(err.message || 'Failed to confirm free food claim.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-28 md:pb-16 relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#5BC0DE]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#D97706]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#3A506B]/40 border border-white/10 text-[#F4D6B0] text-[11px] font-bold rounded-full uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5 text-[#5BC0DE]" />
              <span>Zero Food Waste Initiative</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Free Community Food Sharing
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Zero-cost surplus meals from verified local banquets, restaurants, and generous home cooks. Claim directly for self-pickup or doorstep delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="px-3.5 py-2.5 bg-[#1C2541] border border-white/10 rounded-2xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#D97706]"
            >
              <option value="all">All Diets</option>
              <option value="VEG">VEG Only</option>
              <option value="NON_VEG">NON_VEG</option>
              <option value="VEGAN">VEGAN</option>
              <option value="JAIN">JAIN</option>
            </select>

            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="px-3.5 py-2.5 bg-[#1C2541] border border-white/10 rounded-2xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#D97706]"
            >
              <option value="all">All Service Areas</option>
              <option value="North Zone">North Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="East Zone">East Zone</option>
              <option value="West Zone">West Zone</option>
              <option value="Central Zone">Central Zone</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-xs text-slate-400">Loading free food listings...</div>
        ) : donations.length === 0 ? (
          <div className="p-16 text-center bg-[#1C2541]/50 rounded-3xl border border-white/5 space-y-3">
            <Gift className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-sm">No active surplus donations</h3>
            <p className="text-xs text-slate-400">Check back shortly as home kitchens and banquets post new meals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {donations.map((don) => (
              <div
                key={don.id}
                className="bg-[#1C2541]/75 rounded-3xl border border-white/5 overflow-hidden shadow-2xl hover:border-[#5BC0DE]/40 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl hover:-translate-y-1"
              >
                <div>
                  <div className="h-44 bg-[#0B132B] relative overflow-hidden">
                    <img
                      src={don.image_url || 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800'}
                      alt={don.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                        100% FREE
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-[#0B132B]/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] flex items-center justify-between border border-white/10">
                      <span className="flex items-center gap-1 text-rose-300 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        Expires: {new Date(don.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[#F4D6B0] font-bold">{don.remaining_servings} left</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-white leading-snug">{don.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{don.description}</p>
                    <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{don.area || 'Neighborhood Pickup'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Provided by: <span className="text-slate-300 font-semibold">{don.donor_name || 'Community Donor'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenClaimModal(don)}
                    className="w-full py-3 bg-gradient-to-r from-[#5BC0DE] to-[#3A506B] hover:from-[#3A506B] hover:to-[#5BC0DE] text-black font-black rounded-2xl text-xs uppercase tracking-wider transition shadow hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Claim Food Servings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MULTI-STEP CLAIM MODAL (Servings -> Pickup or Delivery -> Address -> Confirmed) */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#1C2541] border border-white/10 p-6 shadow-2xl space-y-5 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="font-black text-white text-base">Claim Free Meal</h3>
                <p className="text-[11px] text-slate-400">
                  Step {claimStep} of 3: {claimStep === 1 ? 'Servings' : claimStep === 2 ? 'Fulfillment' : claimStep === 3 ? 'Delivery Address' : 'Confirmation'}
                </p>
              </div>
              <button
                onClick={handleCloseClaimModal}
                className="w-8 h-8 rounded-full bg-[#0B132B] hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: QUANTITY / SERVINGS SELECTION */}
            {claimStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#0B132B]/80 border border-white/10 space-y-1">
                  <p className="text-xs font-black text-white">{selectedDonation.title}</p>
                  <p className="text-[11px] text-slate-400">{selectedDonation.pickup_address}</p>
                  <p className="text-[11px] text-[#5BC0DE] font-semibold">
                    Available: {selectedDonation.remaining_servings} servings left
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    How many servings do you need?
                  </label>
                  <div className="flex items-center space-x-3 bg-[#0B132B]/80 p-2.5 rounded-2xl border border-white/10 justify-between">
                    <button
                      type="button"
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-8 h-8 rounded-xl bg-[#1C2541] hover:bg-[#3A506B] font-bold text-white flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-black text-base text-white">{servings}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setServings(
                          Math.min(selectedDonation.remaining_servings || 5, servings + 1)
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-[#1C2541] hover:bg-[#3A506B] font-bold text-white flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClaimStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  <span>Next: Choose Pickup or Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: CHOOSE FULFILLMENT (SELF PICKUP OR DELIVERY OR RAPIDO) */}
            {claimStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-300">
                    How will you receive your free meals?
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Food is completely free. Select self-pickup or door courier.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Self Pickup */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('PICKUP')}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                      fulfillmentType === 'PICKUP'
                        ? 'border-[#D97706] bg-[#3A506B]/30'
                        : 'border-white/5 bg-[#0B132B]/60 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#F4D6B0]">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Self-Pickup (Free)</p>
                        <p className="text-[10px] text-slate-400">Collect directly from donor</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">₹0</span>
                  </button>

                  {/* Option 2: Standard Delivery */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('DELIVERY')}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                      fulfillmentType === 'DELIVERY'
                        ? 'border-[#D97706] bg-[#3A506B]/30'
                        : 'border-white/5 bg-[#0B132B]/60 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#5BC0DE]">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">Standard Delivery</p>
                        <p className="text-[10px] text-slate-400">Delivered directly to doorstep</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#F4D6B0]">₹20 service</span>
                  </button>

                  {/* Option 3: Rapido Express Delivery */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('RAPIDO')}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition relative overflow-hidden ${
                      fulfillmentType === 'RAPIDO'
                        ? 'border-[#D97706] bg-gradient-to-r from-[#D97706]/15 via-[#3A506B]/30 to-[#0B132B]'
                        : 'border-white/5 bg-[#0B132B]/60 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#D97706]">
                        <Bike className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-white">Rapido Express Bike</p>
                          <span className="px-1.5 py-0.2 bg-[#D97706] text-black text-[9px] font-black rounded-full uppercase">
                            Fastest
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Express pickup & drop by Rapido courier</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#F4D6B0]">₹35 service</span>
                  </button>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimStep(1)}
                    className="w-1/3 py-3 rounded-2xl bg-[#0B132B] hover:bg-white/5 text-slate-300 font-bold text-xs"
                  >
                    Back
                  </button>

                  {fulfillmentType === 'PICKUP' ? (
                    <button
                      type="button"
                      disabled={claiming}
                      onClick={handleFinalClaimSubmit}
                      className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      {claiming ? 'Confirming...' : 'Confirm Free Claim'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setClaimStep(3)}
                      className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                    >
                      <span>Enter Address</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: ENTER DELIVERY ADDRESS */}
            {claimStep === 3 && (
              <form onSubmit={handleFinalClaimSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    {fulfillmentType === 'RAPIDO' ? 'Rapido Drop-Off Details' : 'Delivery Destination'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Provide accurate location and phone for the rider.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Complete Street Address
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House/Flat No, Apartment Name, Street & Landmark"
                    className="w-full p-3 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Recipient Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    placeholder="Gate code, call before arrival, etc."
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimStep(2)}
                    className="w-1/3 py-3 rounded-2xl bg-[#0B132B] hover:bg-white/5 text-slate-300 font-bold text-xs"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={claiming}
                    className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow disabled:opacity-50"
                  >
                    {claiming
                      ? 'Confirming...'
                      : fulfillmentType === 'RAPIDO'
                      ? 'Confirm with Rapido'
                      : 'Confirm Free Claim'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: CLAIM CONFIRMED CELEBRATION */}
            {claimStep === 4 && confirmedClaimData && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-black flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(217,119,6,0.6)]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-black text-white">Free Claim Confirmed!</h4>
                  <p className="text-xs text-slate-300">
                    {confirmedClaimData.fulfillmentType === 'RAPIDO'
                      ? 'A Rapido courier has been assigned to pick up the meal from the donor and bring it to your door.'
                      : confirmedClaimData.fulfillmentType === 'DELIVERY'
                      ? 'Your free food delivery request has been queued.'
                      : 'Your reservation is locked. Please collect directly at the donor pickup location.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0B132B]/80 border border-white/10 text-left space-y-1 text-xs">
                  <div className="flex justify-between font-mono text-[11px] text-[#F4D6B0]">
                    <span>Claim ID:</span>
                    <span>#{confirmedClaimData.claimId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Meal:</span>
                    <span className="font-bold text-white">{confirmedClaimData.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Servings:</span>
                    <span className="font-bold text-white">{confirmedClaimData.servings} plates</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Fulfillment:</span>
                    <span className="font-bold text-[#5BC0DE] uppercase">
                      {confirmedClaimData.fulfillmentType === 'RAPIDO'
                        ? '⚡ Rapido Express'
                        : confirmedClaimData.fulfillmentType}
                    </span>
                  </div>
                  {confirmedClaimData.fulfillmentType === 'PICKUP' ? (
                    <div className="pt-1 text-[11px] text-slate-400">
                      Pickup Address: <span className="text-white">{confirmedClaimData.donorAddress}</span>
                    </div>
                  ) : (
                    <div className="pt-1 text-[11px] text-slate-400">
                      Delivering to: <span className="text-white">{confirmedClaimData.deliveryAddress}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCloseClaimModal}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider shadow"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
