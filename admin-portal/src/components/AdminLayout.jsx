'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  HeartHandshake,
  ShoppingBag,
  Gift,
  ShieldAlert,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Vote,
  Bell,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout, isSuperAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isAuthPage = pathname.startsWith('/auth');

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-4">{children}</main>;
  }

  const navItems = [
    { label: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
    { label: '🍛 Curry & Rice Store', href: '/curry-rice', icon: UtensilsCrossed },
    { label: '📦 Marketplace Orders', href: '/curry-rice/orders', icon: ShoppingBag },
    { label: 'Customer Management', href: '/users/customers', icon: Users },
    { label: 'Cook Management (FSSAI)', href: '/users/cooks', icon: UtensilsCrossed },
    { label: 'Donor Management', href: '/users/donors', icon: HeartHandshake },
    { label: 'Homemade Food Posts', href: '/food/posts', icon: ShoppingBag },
    { label: '🗳️ Dish Voting Polls', href: '/polls', icon: Vote },
    { label: 'Pre-Order Cooking', href: '/orders', icon: ShoppingBag },
    { label: 'Food Donations', href: '/food/donations', icon: Gift },
    { label: '🔔 Global Notifications', href: '/notifications', icon: Bell },
    { label: 'Reports & Moderation', href: '/reports', icon: ShieldAlert },
    { label: 'Audit Trail Logs', href: '/audit-logs', icon: FileText },
    { label: 'Admin Profile', href: '/profile', icon: UserCheck },
    { label: 'System Settings', href: '/settings', icon: Settings },
  ];

  if (isSuperAdmin) {
    navItems.splice(8, 0, { label: 'Admin Team (Super Admin)', href: '/admins/manage', icon: Shield });
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7F8] relative">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Palette 1 (#06141B, #11212D, #253745, #4A5C6A) */}
      <aside
        className={`w-72 bg-[#06141B] text-[#CCD0CF] flex flex-col fixed inset-y-0 left-0 z-40 shadow-2xl border-r border-[#253745]/40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#253745] bg-[#11212D] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#253745] to-[#4A5C6A] overflow-hidden flex-shrink-0">
              <img
                src="/ruchi-logo.png"
                alt="Ruchi Bazaar"
                className="w-full h-full object-contain rounded-full bg-white p-0.5"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">RUCHI</span>
                <span className="bg-[#4A5C6A] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Admin Ops
                </span>
              </div>
              <p className="text-[10px] text-[#9BA8AB]">Governance & Security</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#CCD0CF] hover:text-white hover:bg-[#253745] transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Switcher Pill */}
        <div className="px-4 py-3 bg-[#06141B] border-b border-[#253745] text-xs">
          <p className="text-[#9BA8AB] font-semibold mb-1 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#CCD0CF]" /> Switch Active Portal:
          </p>
          <div className="flex items-center space-x-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 bg-[#253745]/80 hover:bg-[#4A5C6A] rounded text-[11px] text-white flex items-center gap-1 transition"
            >
              Customer <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 bg-[#253745]/80 hover:bg-[#4A5C6A] rounded text-[11px] text-white flex items-center gap-1 transition"
            >
              Partner <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#253745] text-white shadow-md border-l-4 border-[#9BA8AB]'
                    : 'text-[#9BA8AB] hover:bg-[#11212D] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#253745] bg-[#11212D]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#253745] text-[#CCD0CF] font-bold flex items-center justify-center text-sm border border-[#4A5C6A]">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{user?.name || 'Authorized Admin'}</p>
              <p className="text-[10px] text-[#9BA8AB] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-[#253745] hover:bg-red-900/60 text-[#CCD0CF] hover:text-white rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#CCD0CF]/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 transition flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[#11212D] truncate">
              {navItems.find((n) => n.href === pathname)?.label || 'Administration Console'}
            </h1>
            <span className="hidden md:flex text-[11px] px-2.5 py-0.5 rounded-full bg-[#11212D]/10 text-[#11212D] font-bold items-center gap-1 border border-[#CCD0CF] flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              XAMPP MySQL Active
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            <span className="hidden lg:flex text-xs text-[#4A5C6A] items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#9BA8AB]" /> Cutoff: 30m Buffer
            </span>
            <div className="hidden lg:block h-5 w-px bg-[#CCD0CF]"></div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#11212D] truncate max-w-[110px] sm:max-w-none">{user?.roles?.join(', ') || 'Admin'}</p>
              <p className="text-[10px] text-[#9BA8AB] font-mono hidden sm:block">admin.ruchi.com</p>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F5F7F8] w-full min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
