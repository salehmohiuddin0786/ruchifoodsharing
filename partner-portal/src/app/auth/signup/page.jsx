'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed, HeartHandshake, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';

export default function PartnerSignupPage() {
  const [partnerType, setPartnerType] = useState('COOK_DONOR'); // 'COOK', 'DONOR', 'COOK_DONOR'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [kitchenAddress, setKitchenAddress] = useState('');
  const [area, setArea] = useState('Madhapur');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup({
        name,
        email,
        phone,
        password,
        partnerType,
        businessName: businessName || `${name}'s Kitchen`,
        kitchenAddress: kitchenAddress || `${area}, Hyderabad`,
        area,
        fssaiNumber,
        bio,
      });

      router.push('/auth/verify-email');
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl my-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#174D36] p-6 text-center text-white">
          <h2 className="text-2xl font-black">Join RUCHI Partner Network</h2>
          <p className="text-emerald-100/80 text-xs mt-1">
            Empowering home chefs and surplus food donors across Hyderabad
          </p>
        </div>

        <form onSubmit={handleSignup} className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Partner Role Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Your Partner Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPartnerType('COOK')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  partnerType === 'COOK'
                    ? 'border-[#174D36] bg-emerald-50/70 ring-2 ring-[#174D36]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <UtensilsCrossed className="w-5 h-5 text-[#174D36]" />
                    {partnerType === 'COOK' && <Check className="w-4 h-4 text-[#174D36]" />}
                  </div>
                  <p className="font-bold text-gray-900 text-xs">Home Cook</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Prepare homemade meals for pre-orders</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPartnerType('DONOR')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  partnerType === 'DONOR'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <HeartHandshake className="w-5 h-5 text-purple-600" />
                    {partnerType === 'DONOR' && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                  <p className="font-bold text-gray-900 text-xs">Food Donor</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Donate surplus food from banquets or events</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPartnerType('COOK_DONOR')}
                className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  partnerType === 'COOK_DONOR'
                    ? 'border-[#F5A623] bg-amber-50/70 ring-2 ring-[#F5A623]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-[#F5A623] text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Recommended
                </span>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Sparkles className="w-5 h-5 text-[#F5A623]" />
                    {partnerType === 'COOK_DONOR' && <Check className="w-4 h-4 text-[#F5A623]" />}
                  </div>
                  <p className="font-bold text-gray-900 text-xs">Both (Cook & Donor)</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Sell home meals and donate surplus under 1 account</p>
                </div>
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smt. Lakshmi Rao"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kitchen / Organization Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Lakshmi Amma Homemade Specials"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lakshmi@ruchi.com"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Phone (for OTP)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primary Hyderabad Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
              >
                <option value="Madhapur">Madhapur</option>
                <option value="Banjara Hills">Banjara Hills</option>
                <option value="Jubilee Hills">Jubilee Hills</option>
                <option value="Gachibowli">Gachibowli</option>
                <option value="Begumpet">Begumpet</option>
                <option value="Kondapur">Kondapur</option>
                <option value="Kukatpally">Kukatpally</option>
                <option value="Hitec City">Hitec City</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              FSSAI Registration Number (Optional / Pending)
            </label>
            <input
              type="text"
              value={fssaiNumber}
              onChange={(e) => setFssaiNumber(e.target.value)}
              placeholder="e.g. 23623032000845 (Or leave blank to submit later)"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kitchen / Pickup Address</label>
            <textarea
              rows={2}
              value={kitchenAddress}
              onChange={(e) => setKitchenAddress(e.target.value)}
              placeholder="House/Plot No, Street, Landmark in Hyderabad..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg transition"
          >
            <span>{loading ? 'Creating Partner Account...' : 'Complete Partner Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-gray-600">
            Already have an active partner account?{' '}
            <Link href="/auth/login" className="text-[#174D36] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
