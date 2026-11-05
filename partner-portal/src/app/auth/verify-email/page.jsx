'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function PartnerVerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyEmail(token || 'default', otp);
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#174D36] p-6 text-center text-white">
          <div className="w-12 h-12 bg-[#65A878] rounded-xl flex items-center justify-center mx-auto mb-2">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold">Email Verification</h2>
          <p className="text-xs text-emerald-100/80 mt-1">Confirm your partner email address</p>
        </div>

        <div className="p-8">
          {success ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-gray-800">Email Verified Successfully!</h3>
              <p className="text-xs text-gray-600">Redirecting to your Partner Dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-gray-600">
                Please enter the 6-digit verification code sent to your registered email address.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg tracking-widest font-mono font-bold focus:ring-2 focus:ring-[#174D36]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
              >
                <span>{loading ? 'Verifying...' : 'Confirm OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <Link href="/" className="text-xs text-gray-500 hover:underline">
                  Skip for now, go to Dashboard &rarr;
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
