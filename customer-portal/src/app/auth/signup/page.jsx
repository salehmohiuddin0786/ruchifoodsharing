'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Lock, MapPin, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function CustomerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [area, setArea] = useState('Central Zone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const { signup, facebookLogin } = useAuth();
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
        area,
        portal: 'CUSTOMER',
      });
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setError('');
    setFbLoading(true);

    try {
      if (typeof window === 'undefined' || !window.FB) {
        throw new Error('Facebook SDK is still initializing or blocked by ad-blocker. Please try again.');
      }

      window.FB.login(
        function (response) {
          if (response.authResponse) {
            const { accessToken, userID } = response.authResponse;
            window.FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, async function (profile) {
              try {
                if (!profile || profile.error) {
                  throw new Error(profile?.error?.message || 'Failed to fetch Facebook profile.');
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
                setError(err.message || 'Facebook registration failed.');
                setFbLoading(false);
              }
            });
          } else {
            setFbLoading(false);
            if (response.status === 'not_authorized') {
              setError('Facebook signup was not authorized.');
            } else {
              setError('Facebook signup was cancelled or closed.');
            }
          }
        },
        { scope: 'public_profile' }
      );
    } catch (err) {
      setError(err.message || 'Facebook signup failed.');
      setFbLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#D97706]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#5BC0DE]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-[#1C2541]/85 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden relative z-10">
        <div className="p-8 text-center border-b border-white/5 space-y-2">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] mx-auto shadow-lg shadow-amber-500/25 overflow-hidden">
            <img
              src="/ruchi-logo.png"
              alt="Ruchi Bazaar"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <h2 className="text-2xl font-black text-white">Join Ruchi Bazaar</h2>
          <p className="text-xs text-[#F4D6B0] font-medium tracking-wide">
            Your Cravings, Our Priority!
          </p>
        </div>

        <div className="p-8 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-2xl flex items-center space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Social Sign Up with Facebook */}
          <button
            type="button"
            onClick={handleFacebookSignup}
            disabled={fbLoading}
            className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>{fbLoading ? 'Connecting to Facebook...' : 'Sign Up with Facebook'}</span>
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#1C2541] px-3 text-slate-400 font-semibold tracking-wider">
                Or fill details below
              </span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D97706]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase">Primary Service Area</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0B132B]/80 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-[#D97706]"
                >
                  <option value="Central Zone">Central Zone</option>
                  <option value="North Zone">North Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="East Zone">East Zone</option>
                  <option value="West Zone">West Zone</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#F4D6B0] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
