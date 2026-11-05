'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { customerApi } from '@/lib/api';
import { User, Mail, Phone, MapPin, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [area, setArea] = useState('Central Zone');
  const [dietary, setDietary] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    customerApi.getProfile().then((res) => {
      if (res.user) {
        setName(res.user.name || '');
        setPhone(res.user.phone || '');
        setEmail(res.user.email || '');
      }
      if (res.profile) {
        setDeliveryAddress(res.profile.default_delivery_address || '');
        setArea(res.profile.area || 'Central Zone');
        setDietary(res.profile.dietary_preference || 'all');
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await customerApi.updateProfile({
        name,
        phone,
        defaultDeliveryAddress: deliveryAddress,
        area,
        dietaryPreference: dietary,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center text-xs font-bold text-slate-400">Loading customer profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-28 md:pb-16 relative">
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D97706]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[550px] h-[550px] rounded-full bg-[#5BC0DE]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Customer Profile</h1>
          <p className="text-xs text-slate-400 mt-1">Manage delivery address and food preferences</p>
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center space-x-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Profile changes updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="rounded-3xl bg-[#1C2541]/85 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 text-xs">
          <div className="flex items-center space-x-4 pb-5 border-b border-white/5">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-black font-black text-xl rounded-2xl flex items-center justify-center shadow-lg">
              {name?.charAt(0) || 'C'}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{name}</h3>
              <p className="text-slate-400 text-xs">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="block font-bold text-slate-300 uppercase text-[11px]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-300 uppercase text-[11px]">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-[#D97706]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-300 uppercase text-[11px]">Default Delivery Address</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Flat No, Building, Street, Landmark"
              className="w-full p-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-300 uppercase text-[11px]">Default Service Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                <option value="Central Zone">Central Zone</option>
                <option value="North Zone">North Zone</option>
                <option value="South Zone">South Zone</option>
                <option value="East Zone">East Zone</option>
                <option value="West Zone">West Zone</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-300 uppercase text-[11px]">Dietary Preference</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full p-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-[#D97706]"
              >
                <option value="all">Any Cuisine</option>
                <option value="VEG">Vegetarian Only</option>
                <option value="NON_VEG">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="JAIN">Jain</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black uppercase tracking-wider rounded-2xl text-xs transition shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
