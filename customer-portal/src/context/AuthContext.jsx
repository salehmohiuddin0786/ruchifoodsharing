'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('ruchi_customer_token');
      const storedUser = localStorage.getItem('ruchi_customer_user');

      if (storedToken && storedUser) {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('ruchi_customer_user', JSON.stringify(data.user));
        } else {
          // Stale / expired token — clear silently without breaking guest state
          localStorage.removeItem('ruchi_customer_token');
          localStorage.removeItem('ruchi_customer_user');
          setUser(null);
        }
      }
    } catch (err) {
      // Network or silent auth check fallback
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, rememberMe = false) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, portal: 'CUSTOMER', rememberMe }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    localStorage.setItem('ruchi_customer_token', data.token);
    localStorage.setItem('ruchi_customer_user', JSON.stringify(data.user));
    setUser(data.user);
    if (data.profile) setProfile(data.profile);
    return data;
  };

  const signup = async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, portal: 'CUSTOMER' }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('ruchi_customer_token', data.token);
    localStorage.setItem('ruchi_customer_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const facebookLogin = async (facebookData) => {
    const res = await fetch(`${API_BASE}/auth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facebookData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Facebook login failed');
    }

    localStorage.setItem('ruchi_customer_token', data.token);
    localStorage.setItem('ruchi_customer_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('ruchi_customer_token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {}
    localStorage.removeItem('ruchi_customer_token');
    localStorage.removeItem('ruchi_customer_user');
    setUser(null);
    setProfile(null);
    router.push('/');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        facebookLogin,
        logout,
        forgotPassword,
        resetPassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
