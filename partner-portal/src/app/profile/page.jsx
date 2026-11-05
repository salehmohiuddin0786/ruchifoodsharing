'use client';

import React, { useState, useEffect } from 'react';
import { partnerApi } from '@/lib/api';
import { User, ShieldCheck, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [bio, setBio] = useState('');
  const [kitchenAddress, setKitchenAddress] = useState('');
  const [area, setArea] = useState('Banjara Hills');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    partnerApi.getProfile().then((res) => {
      setUser(res.user);
      setProfile(res.profile);
      if (res.user) {
        setName(res.user.name || '');
        setPhone(res.user.phone || '');
      }
      if (res.profile) {
        setBusinessName(res.profile.business_name || '');
        setFssaiNumber(res.profile.fssai_number || '');
        setBio(res.profile.bio || '');
        setKitchenAddress(res.profile.kitchen_address || '');
        setArea(res.profile.area || 'Banjara Hills');
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await partnerApi.updateProfile({
        name,
        phone,
        businessName,
        fssaiNumber,
        bio,
        kitchenAddress,
        area,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading partner profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Partner & Kitchen Profile</h2>
        <p className="text-xs text-gray-500">Manage FSSAI license, kitchen address, and business details</p>
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-4 text-xs">
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 bg-[#174D36] text-white font-black text-xl rounded-2xl flex items-center justify-center">
            {name?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">{businessName || name}</h3>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#174D36]">
              {profile?.verification_status || 'VERIFIED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Cook Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 uppercase mb-1">Kitchen / Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 uppercase mb-1">FSSAI Registration Number</label>
            <input
              type="text"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 uppercase mb-1">Kitchen / Pickup Address</label>
            <textarea
              rows={2}
              value={kitchenAddress}
              onChange={(e) => setKitchenAddress(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 uppercase mb-1">Bio / Story</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl transition shadow"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
