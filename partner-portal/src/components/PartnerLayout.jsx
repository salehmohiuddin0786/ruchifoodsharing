'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  ShoppingBag,
  Calendar,
  Gift,
  FileCheck2,
  Truck,
  Bell,
  User,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Vote,
  Menu,
  X,
} from 'lucide-react';

export default function PartnerLayout({ children }) {
  const pathname = usePathname();
  const { user, logout, isCook, isDonor, isBoth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isAuthPage = pathname.startsWith('/auth');

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#F8F9F6] flex items-center justify-center p-4">{children}</main>;
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9F6] relative">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Palette 3: #0F1F17, #1E3A2E, #3E5A3F, #6B7F67, #C7CBB8 */}
      <aside
        className={`w-72 bg-[#0F1F17] text-[#C7CBB8] flex flex-col fixed inset-y-0 left-0 z-40 shadow-2xl border-r border-[#1E3A2E] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E3A2E] bg-[#1E3A2E]/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#3E5A3F] to-[#6B7F67] overflow-hidden flex-shrink-0">
              <img
                src="/ruchi-logo.png"
                alt="Ruchi Bazaar"
                className="w-full h-full object-contain rounded-full bg-white p-0.5"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">RUCHI</span>
                <span className="bg-[#3E5A3F] text-[#C7CBB8] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#6B7F67]/50">
                  Partner
                </span>
              </div>
              <p className="text-[10px] text-[#C7CBB8]/80">Cook & Food Donor Hub</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#C7CBB8] hover:text-white hover:bg-[#1E3A2E] transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Switcher Pill */}
        <div className="px-4 py-3 bg-[#0F1F17] border-b border-[#1E3A2E] text-xs">
          <p className="text-[#C7CBB8] font-semibold mb-1 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#6B7F67]" /> Switch Portal:
          </p>
          <div className="flex items-center space-x-2">
            <a
              href="http://localhost:4004"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 bg-[#1E3A2E] hover:bg-[#3E5A3F] rounded text-[11px] text-[#C7CBB8] hover:text-white flex items-center gap-1 transition"
            >
              Customer <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="http://localhost:4005"
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 bg-[#1E3A2E] hover:bg-[#3E5A3F] rounded text-[11px] text-[#C7CBB8] hover:text-white flex items-center gap-1 transition"
            >
              Admin <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div>
            <Link
              href="/"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === '/' ? 'bg-[#3E5A3F] text-white shadow-md' : 'text-[#C7CBB8] hover:bg-[#1E3A2E] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Partner Dashboard</span>
            </Link>
          </div>

          {/* Homemade Food Cooking Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7F67]">
              Advance Pre-Orders (Cook)
            </p>
            <Link
              href="/posts"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/posts' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>My Pre-Order Posts</span>
            </Link>
            <Link
              href="/posts/new"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === '/posts/new' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Pre-Order Dish</span>
            </Link>
            <Link
              href="/preorders"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/preorders' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pre-Orders (30m Cutoff)</span>
            </Link>
          </div>

          {/* Curry & Rice Selling Marketplace Section */}
          <div className="space-y-1 pt-2 border-t border-[#1E3A2E]">
            <div className="flex items-center justify-between px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#C7CBB8]">
                Curry & Rice Store
              </p>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                NEW
              </span>
            </div>
            <Link
              href="/curry-rice"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/curry-rice' ? 'bg-[#3E5A3F] text-white shadow' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>Manage Store & Stock</span>
            </Link>
            <Link
              href="/curry-rice/new"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === '/curry-rice/new' ? 'bg-[#C7CBB8] text-[#0F1F17]' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>+ Sell Curry / Rice / Meals</span>
            </Link>
            <Link
              href="/curry-rice/orders"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/curry-rice/orders' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Incoming Orders & Prep</span>
            </Link>
          </div>

          {/* Dish Voting & Community Food Polling Section */}
          <div className="space-y-1 pt-2 border-t border-[#1E3A2E]">
            <div className="flex items-center justify-between px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#C7CBB8]">
                Dish Voting & Polls
              </p>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                COMMUNITY
              </span>
            </div>
            <Link
              href="/polls"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/polls' ? 'bg-[#3E5A3F] text-white shadow' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <Vote className="w-4 h-4 text-[#F4D6B0]" />
              <span>My Dish Polls & Votes</span>
            </Link>
            <Link
              href="/polls/create"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === '/polls/create' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>+ Create Dish Poll</span>
            </Link>
          </div>

          {/* Surplus Food Sharing Section */}
          <div className="space-y-1 pt-2 border-t border-[#1E3A2E]">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7F67]">
              Free Food Sharing (Donor)
            </p>
            <Link
              href="/donations"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/donations' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Food Donations</span>
            </Link>
            <Link
              href="/donations/new"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === '/donations/new' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Food Donation</span>
            </Link>
            <Link
              href="/donations/claims"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/donations/claims' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Donation Claims</span>
            </Link>
            <Link
              href="/collections"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/collections' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Collection Management</span>
            </Link>
          </div>

          {/* General Section */}
          <div className="space-y-1 pt-2 border-t border-[#1E3A2E]">
            <Link
              href="/notifications"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/notifications' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>
            <Link
              href="/profile"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/profile' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Kitchen & Donor Profile</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/settings' ? 'bg-[#3E5A3F] text-white' : 'text-[#C7CBB8] hover:bg-[#1E3A2E]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-[#1E3A2E] bg-[#1E3A2E]/80">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#3E5A3F] text-white font-bold flex items-center justify-center text-sm shadow">
              {user?.name ? user.name.charAt(0) : 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-white">{user?.name || 'Partner'}</p>
              <span className="bg-[#3D4337] text-[#C7CBB8] text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                {isBoth ? 'COOK & DONOR' : isCook ? 'HOME COOK' : 'DONOR'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-[#3D4337] hover:bg-red-900/60 text-[#C7CBB8] hover:text-white rounded-lg text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full min-w-0">
        <header className="h-16 bg-white border-b border-[#C7CBB8]/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-gray-700 hover:text-black hover:bg-gray-100 transition flex-shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[#0F1F17] truncate">RUCHI Partner Workspace</h1>
            <span className="hidden md:flex text-[11px] px-2.5 py-0.5 rounded-full bg-[#3E5A3F]/10 text-[#1E3A2E] font-bold items-center gap-1 border border-[#6B7F67]/30 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3E5A3F]" />
              FSSAI Certified Kitchen
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs font-bold text-[#0F1F17] truncate max-w-[110px] sm:max-w-none">{user?.name || 'Partner'}</p>
              <p className="text-[10px] text-[#6B7F67] font-mono hidden sm:block">partner.ruchi.com</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F8F9F6] w-full min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
