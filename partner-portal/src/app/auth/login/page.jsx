'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UtensilsCrossed, Lock, Mail, AlertCircle, ArrowRight, HeartHandshake } from 'lucide-react';

export default function PartnerLoginPage() {
  const [identifier, setIdentifier] = useState('partner@ruchi.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password, rememberMe);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#174D36] p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-[#65A878] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black">Partner Portal</h2>
          <p className="text-emerald-100/80 text-xs mt-1">Home Cooks & Surplus Food Donors</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Registered Email or Phone
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="partner@ruchi.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#174D36] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#174D36] hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#174D36] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#174D36] focus:ring-[#174D36]"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/20 transition active:scale-[0.99]"
            >
              <span>{loading ? 'Signing in...' : 'Sign In to Partner Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-600">
            <span>Want to share homemade meals or donate surplus food? </span>
            <Link href="/auth/signup" className="text-[#174D36] font-bold hover:underline">
              Join as a Partner
            </Link>
          </div>

          {/* Demo Pre-fills */}
          <div className="mt-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-gray-600">
            <p className="font-bold text-emerald-900 mb-1">Demo Credentials:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setIdentifier('partner@ruchi.com'); setPassword('password123'); }}
                className="px-2 py-1 bg-white rounded border border-emerald-200 hover:bg-emerald-100 font-medium"
              >
                Cook & Donor (Lakshmi)
              </button>
              <button
                type="button"
                onClick={() => { setIdentifier('donor@ruchi.com'); setPassword('password123'); }}
                className="px-2 py-1 bg-white rounded border border-emerald-200 hover:bg-emerald-100 font-medium"
              >
                Banquet Donor (Rajesh)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
