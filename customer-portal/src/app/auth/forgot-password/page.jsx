'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSubmitted(true);
      if (res.resetToken) setResetToken(res.resetToken);
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#174D36] p-6 text-white text-center">
          <h2 className="text-xl font-bold">Password Recovery</h2>
          <p className="text-xs text-emerald-100/80 mt-1">Single-use reset link dispatch</p>
        </div>

        <div className="p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-gray-800">Check Your Email</h3>
              <p className="text-xs text-gray-600">
                A password reset token has been dispatched to <span className="font-semibold">{email}</span>.
              </p>
              {resetToken && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs">
                  <p className="font-bold text-amber-900 mb-1">Developer Test Token:</p>
                  <code className="text-[11px] break-all bg-white p-1 rounded block">{resetToken}</code>
                  <Link
                    href={`/auth/reset-password?token=${resetToken}`}
                    className="inline-block mt-2 text-[#174D36] font-bold underline"
                  >
                    Reset Password Now &rarr;
                  </Link>
                </div>
              )}
              <Link href="/auth/login" className="inline-block text-xs text-[#174D36] font-bold hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-gray-600">
                Enter your email address and we'll send you a single-use password recovery link.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@ruchi.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Dispatching...' : 'Send Recovery Link'}</span>
              </button>

              <div className="text-center pt-2">
                <Link href="/auth/login" className="text-xs text-gray-600 hover:text-[#174D36] font-semibold">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
