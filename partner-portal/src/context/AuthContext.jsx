'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('ruchi_partner_token');
      const storedUser = localStorage.getItem('ruchi_partner_user');

      if (storedToken && storedUser) {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('ruchi_partner_user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('ruchi_partner_token');
          localStorage.removeItem('ruchi_partner_user');
          setUser(null);
        }
      }
    } catch (err) {
      // Quietly handle auth check
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, rememberMe = false) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, portal: 'PARTNER', rememberMe }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    localStorage.setItem('ruchi_partner_token', data.token);
    localStorage.setItem('ruchi_partner_user', JSON.stringify(data.user));
    setUser(data.user);
    if (data.profile) setProfile(data.profile);
    return data;
  };

  const signup = async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, portal: 'PARTNER' }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('ruchi_partner_token', data.token);
    localStorage.setItem('ruchi_partner_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('ruchi_partner_token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {}
    localStorage.removeItem('ruchi_partner_token');
    localStorage.removeItem('ruchi_partner_user');
    setUser(null);
    setProfile(null);
    router.push('/auth/login');
  };

  const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request reset');
    return data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  };

  const verifyEmail = async (token, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data;
  };

  const isCook = user?.roles?.includes('COOK') || user?.roles?.includes('COOK_DONOR');
  const isDonor = user?.roles?.includes('DONOR') || user?.roles?.includes('COOK_DONOR');
  const isBoth = user?.roles?.includes('COOK_DONOR');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        isCook,
        isDonor,
        isBoth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
