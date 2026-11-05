'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function CustomerLoginPage() {
  const [identifier, setIdentifier] = useState('customer@ruchi.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSdkReady, setFbSdkReady] = useState(false);
  const { login, facebookLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if FB is already available
    if (typeof window !== 'undefined' && window.FB) {
      setFbSdkReady(true);
    }

    const handleFbReady = () => setFbSdkReady(true);
    window.addEventListener('fb-sdk-ready', handleFbReady);
    return () => window.removeEventListener('fb-sdk-ready', handleFbReady);
  }, []);

  const handleLogin = async (e) => {
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

  const statusChangeCallback = (response) => {
    if (response.status === 'connected') {
      const { accessToken, userID } = response.authResponse;
      window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async function (profile) {
        try {
          if (!profile || profile.error) {
            throw new Error(profile?.error?.message || 'Failed to fetch Facebook profile details.');
          }

          const fbEmail = profile.email || `fb_${profile.id}@ruchicustomer.in`;
          const fbAvatar = profile.picture?.data?.url || null;

          await facebookLogin({
            facebookId: profile.id || userID,
            name: profile.name,
            email: fbEmail,
            avatar: fbAvatar,
            accessToken,
          });

          router.push('/');
        } catch (err) {
          setError(err.message || 'Facebook authentication failed on server.');
          setFbLoading(false);
        }
      });
    } else {
      setFbLoading(false);
    }
  };

  const checkLoginState = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
      });
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setFbLoading(true);

    try {
      if (typeof window === 'undefined' || !window.FB) {
        throw new Error(
          'Facebook SDK is loading or blocked by an ad-blocker. Please wait a moment or disable ad-blockers and try again.'
        );
      }

      window.FB.login(
        function (response) {
          if (response.authResponse) {
            statusChangeCallback(response);
          } else {
            setFbLoading(false);
            if (response.status === 'not_authorized') {
              setError('Facebook login was not authorized. Please approve permissions to proceed.');
            } else {
              setError('Facebook login was cancelled or closed.');
            }
          }
        },
        { scope: 'public_profile' }
      );
    } catch (err) {
      setError(err.message || 'Facebook login failed.');
      setFbLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#D97706]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#5BC0DE]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-[#1C2541]/85 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-8 text-center border-b border-white/5 space-y-2">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] mx-auto shadow-lg shadow-amber-500/25 overflow-hidden">
            <img
              src="/ruchi-logo.png"
              alt="Ruchi Bazaar"
              className="w-full h-full object-contain rounded-full bg-white p-0.5"
            />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to Ruchi Bazaar</h2>
          <p className="text-xs text-[#F4D6B0] font-medium tracking-wide">
            Your Cravings, Our Priority!
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-2xl flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Sign In: Facebook SDK */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={fbLoading}
              className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{fbLoading ? 'Connecting to Facebook...' : 'Continue with Facebook'}</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#1C2541] px-3 text-slate-400 font-semibold tracking-wider">
                  Or with email & phone
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">
                Email or Mobile Phone
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="customer@ruchi.com or phone"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-300 uppercase">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#F4D6B0] hover:underline font-semibold"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0B132B] border-white/20 text-[#D97706] focus:ring-0"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/5 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#F4D6B0] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
