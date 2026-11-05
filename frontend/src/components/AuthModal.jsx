'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, ShieldCheck, Phone, Check } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const { loginWithFacebook, loginWithPhoneOtp } = useApp();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFacebookClick = () => {
    setLoading(true);
    setTimeout(() => {
      loginWithFacebook({
        name: 'Priya Reddy (FB Verified)',
        email: 'priya.reddy.fb@example.in',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      });
      setLoading(false);
      onClose();
    }, 600);
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      setOtpSent(true);
    } else {
      loginWithPhoneOtp(phone);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#174D36] text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black">Welcome to RUCHI</h2>
            <p className="text-xs text-[#A3E5B5]">Sign in to pre-order homemade meals or reserve free food</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Facebook Login Option */}
          <div className="space-y-2">
            <button
              onClick={handleFacebookClick}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-3 text-sm active:scale-98"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{loading ? 'Connecting with Meta...' : 'Continue with Facebook'}</span>
            </button>
            <p className="text-[11px] text-gray-500 text-center leading-tight">
              Requests basic public profile & email. Facebook data is protected under Meta developer policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase">Or Indian Mobile OTP</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Mobile OTP Form */}
          <form onSubmit={handlePhoneSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mobile Number (+91)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">+91</span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  className="w-full pl-12 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174D36] font-mono"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enter 4-Digit OTP (Demo: use any 4 digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-center font-mono tracking-widest text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#174D36]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#174D36] hover:bg-[#0F3826] text-white font-bold rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
            >
              <Phone size={14} />
              <span>{otpSent ? 'Verify OTP & Enter' : 'Send One-Time Password'}</span>
            </button>
          </form>

          {/* Privacy & FSSAI Note */}
          <div className="bg-[#FFF9EE] p-3 rounded-xl border border-[#F5A623]/30 text-[11px] text-gray-600 flex items-start gap-2">
            <ShieldCheck size={16} className="text-[#174D36] shrink-0 mt-0.5" />
            <p>
              By signing in, you agree to RUCHI&apos;s Community Guidelines, Food Safety Standards, and Hyderabad pilot policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
