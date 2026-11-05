'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  ShoppingCart,
  ShoppingBag,
  Bell,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
  Sparkles,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    preferences,
    updatePreferences,
  } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    setNotifDropdownOpen(false);
    if (item.target_url) {
      router.push(item.target_url);
    } else {
      router.push('/notifications');
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Navigation: Always visible across all devices
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Homemade Meals', href: '/homemade-food' },
    { label: "Vote Today's Dish", href: '/vote' },
    { label: 'Free Food', href: '/free-food' },
    { label: 'My Orders', href: '/orders' },
    { label: 'Favourites', href: '/favourites' },
  ];

  return (
    <>
      {/* Discreet Cross-Portal Switcher Bar */}
      <div className="bg-[#060D1E] text-slate-400 text-[11px] py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5BC0DE] animate-pulse"></span>
          <span className="font-medium text-slate-300">
            RUCHI Food Platform • Community Food Network
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-500 font-medium hidden sm:inline">Portals:</span>
          <a
            href="http://localhost:4006"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-0.5 bg-[#1C2541]/80 hover:bg-[#3A506B]/50 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 transition border border-white/5"
          >
            Partner Portal <ExternalLink className="w-2.5 h-2.5 text-[#5BC0DE]" />
          </a>
          <a
            href="http://localhost:4005"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-0.5 bg-[#1C2541]/80 hover:bg-[#3A506B]/50 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 transition border border-white/5"
          >
            Admin Portal <ExternalLink className="w-2.5 h-2.5 text-[#5BC0DE]" />
          </a>
        </div>
      </div>

      {/* Main Luxury Header with Centered Links and Active Dot Indicator */}
      <header className="sticky top-0 z-40 bg-[#0B132B]/85 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Icon */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#D97706] to-[#F59E0B] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all duration-300 overflow-hidden flex-shrink-0">
              <img
                src="/ruchi-logo.png"
                alt="Ruchi Bazaar Logo"
                className="w-full h-full object-contain rounded-full bg-white p-0.5"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-[#F4D6B0] transition-colors">
                  Ruchi Bazaar
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#F4D6B0] font-medium tracking-wider uppercase -mt-0.5">
                Your Cravings, Our Priority!
              </p>
            </div>
          </Link>

          {/* Center: Clean Nav Links with Glowing Dot Indicator */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex flex-col items-center group py-2"
                >
                  <span
                    className={`text-[13px] tracking-wide transition-colors duration-200 ${
                      isActive
                        ? 'text-[#F4D6B0] font-bold'
                        : 'text-slate-300 hover:text-white font-medium'
                    }`}
                  >
                    {link.label}
                  </span>

                  {/* Dot Indicator under active link */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D97706] shadow-[0_0_8px_#D97706] scale-100 opacity-100'
                        : 'bg-transparent scale-0 opacity-0 group-hover:bg-slate-500 group-hover:scale-75 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions / Get Started CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {/* My Orders Quick Button */}
            <Link
              href="/orders"
              className="p-2.5 text-slate-300 hover:text-[#F4D6B0] hover:bg-white/5 rounded-xl transition flex items-center border border-transparent hover:border-white/10"
              title="My Orders & Tracking"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition flex items-center border border-transparent hover:border-white/10"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(217,119,6,0.5)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notification Bell with Badge & Interactive Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className={`relative p-2.5 rounded-xl transition flex items-center border ${
                  notifDropdownOpen
                    ? 'bg-[#1C2541] text-[#F4D6B0] border-[#D97706]/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#F59E0B] animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-bounce">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-[#0E172E] border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-gradient-to-r from-[#16203A] to-[#0E172E] border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🔔</span>
                      <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition flex items-center space-x-1"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                      <button
                        onClick={() => updatePreferences({ soundEnabled: !preferences.soundEnabled })}
                        className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                        title={preferences.soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
                      >
                        {preferences.soundEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center px-4">
                        <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-2xl mb-2">
                          🔕
                        </div>
                        <p className="text-xs font-semibold text-slate-300">No notifications yet</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          You&apos;ll be notified when new dishes, pre-orders, and free food are posted!
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((item) => {
                        const isDish = item.type === 'NEW_DISH';
                        const isPreorder = item.type === 'NEW_PREORDER';
                        const isFreeFood = item.type === 'FREE_FOOD';

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-3.5 hover:bg-white/[0.04] transition cursor-pointer flex items-start space-x-3 group relative ${
                              !item.is_read ? 'bg-[#1C2541]/40' : ''
                            }`}
                          >
                            {/* Unread dot */}
                            {!item.is_read && (
                              <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
                            )}

                            {/* Thumbnail or Badge */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#16203A] border border-white/10 flex-shrink-0 flex items-center justify-center">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                              ) : (
                                <span className="text-lg">
                                  {isDish ? '🍽️' : isPreorder ? '🔔' : isFreeFood ? '❤️' : '📣'}
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                                  {isDish ? 'New Dish' : isPreorder ? 'Pre-Order' : isFreeFood ? 'Free Food' : 'Alert'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {formatRelativeTime(item.created_at)}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition truncate">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-[#060D1E] border-t border-white/10 flex items-center justify-between text-xs">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="w-full py-1.5 text-center font-bold text-amber-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2.5 px-3.5 py-1.5 bg-[#1C2541]/90 hover:bg-[#3A506B]/50 rounded-xl border border-white/10 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D97706] to-[#F59E0B] text-[#0B132B] text-xs font-black flex items-center justify-center shadow">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                    {user.name}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:from-[#B45309] hover:to-[#D97706] text-[#0B132B] font-black rounded-xl text-xs tracking-wide transition shadow-[0_4px_18px_rgba(217,119,6,0.35)] hover:shadow-[0_6px_22px_rgba(217,119,6,0.5)] active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Cart */}
          <div className="flex md:hidden items-center space-x-1">
            <Link
              href="/orders"
              className="p-2 text-slate-300 hover:text-[#F4D6B0] hover:bg-white/5 rounded-xl flex items-center"
              title="My Orders"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>

            <Link
              href="/notifications"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl flex items-center"
              title="Notifications"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#F59E0B]' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-slate-200 hover:bg-white/5 rounded-xl flex items-center"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D97706] text-black text-[9px] font-black rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0B132B]/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#1C2541] text-[#F4D6B0] border border-white/10'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shadow-[0_0_6px_#D97706]" />}
                </Link>
              );
            })}

            <Link
              href="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold ${
                pathname === '/notifications'
                  ? 'bg-[#1C2541] text-[#F4D6B0] border border-white/10'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Bell className="w-4 h-4 text-amber-400" />
            </Link>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-slate-200"
                  >
                    Profile ({user.name})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs text-red-400 font-bold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="w-full flex space-x-2 pt-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-bold border border-white/10 rounded-xl text-slate-200 bg-[#1C2541]/70"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-black bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-black rounded-xl shadow"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
