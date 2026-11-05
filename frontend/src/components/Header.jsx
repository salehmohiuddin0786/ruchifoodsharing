'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { HYDERABAD_NEIGHBORHOODS } from '@/lib/constants';
import {
  MapPin,
  Bell,
  HeartHandshake,
  UtensilsCrossed,
  GitFork,
  ShieldCheck,
  User,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export default function Header({
  onOpenCreatePreOrder,
  onOpenCreateDonation,
  onOpenAuth,
  onOpenSafety,
}) {
  const {
    currentUser,
    switchRole,
    selectedNeighborhood,
    setSelectedNeighborhood,
    activeTab,
    setActiveTab,
    notifications,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#174D36] text-white shadow-md border-b border-[#235F45]">
      {/* Top Banner Notice */}
      <div className="bg-[#0F3826] text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-[#F5A623] text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Hyderabad Pilot
        </span>
        <span>
          Serving Madhapur, Banjara Hills, Jubilee Hills, Gachibowli & nearby areas.
        </span>
        <button
          onClick={onOpenSafety}
          className="text-[#65A878] hover:underline flex items-center gap-1 ml-2 font-semibold cursor-pointer"
        >
          FSSAI & Safety Guidelines <ExternalLink size={12} />
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3.5 cursor-pointer"
            onClick={() => setActiveTab('all')}
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF9EE] flex items-center justify-center shadow-inner">
              <span className="text-2xl font-black text-[#174D36] tracking-tighter">R</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#FFF9EE]">RUCHI</span>
                <span className="text-[10px] bg-[#235F45] text-[#A3E5B5] px-2 py-0.5 rounded font-mono font-bold">
                  v2.0 XAMPP
                </span>
              </div>
              <p className="text-[11px] text-[#A3E5B5] font-medium tracking-wide">
                Share Food. Spread Happiness.
              </p>
            </div>
          </div>

          {/* Service Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0F3826] p-1.5 rounded-2xl border border-[#235F45]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#174D36] text-white shadow'
                  : 'text-[#C5E8D1] hover:text-white'
              }`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'donations'
                  ? 'bg-[#65A878] text-white shadow'
                  : 'text-[#C5E8D1] hover:text-white'
              }`}
            >
              <HeartHandshake size={15} />
              <span>Free Food</span>
              <span className="bg-[#FFF9EE] text-[#174D36] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                ₹0
              </span>
            </button>
            <button
              onClick={() => setActiveTab('preorders')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preorders'
                  ? 'bg-[#F5A623] text-black shadow'
                  : 'text-[#C5E8D1] hover:text-white'
              }`}
            >
              <UtensilsCrossed size={15} />
              <span>Home Cook Pre-Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('flowchart')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'flowchart'
                  ? 'bg-[#2B7554] text-white shadow border border-[#65A878]'
                  : 'text-[#A3E5B5] hover:text-white'
              }`}
            >
              <GitFork size={15} className="text-[#F5A623]" />
              <span>Workflows & Logic</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#174D36] text-white shadow'
                  : 'text-[#C5E8D1] hover:text-white'
              }`}
            >
              My Dashboard
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-[#C5E8D1] hover:text-white'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Right Actions: Neighborhood, Notifs, Post Button, Profile */}
          <div className="flex items-center gap-3">
            {/* Hyderabad Neighborhood Picker */}
            <div className="relative hidden sm:flex items-center gap-1 bg-[#0F3826] px-3 py-1.5 rounded-xl border border-[#235F45] text-xs">
              <MapPin size={14} className="text-[#F5A623]" />
              <select
                value={selectedNeighborhood.name}
                onChange={(e) => {
                  const hood = HYDERABAD_NEIGHBORHOODS.find((h) => h.name === e.target.value);
                  if (hood) setSelectedNeighborhood(hood);
                }}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                {HYDERABAD_NEIGHBORHOODS.map((hood) => (
                  <option key={hood.name} value={hood.name} className="bg-[#174D36] text-white">
                    {hood.name} ({hood.zone.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-[#0F3826] hover:bg-[#235F45] transition relative border border-[#235F45] cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F5A623] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 bg-[#174D36] text-white flex justify-between items-center">
                    <span className="font-bold text-sm">Nearby Alerts & Orders</span>
                    <span className="text-xs bg-[#235F45] px-2 py-0.5 rounded text-[#C5E8D1]">
                      {notifications.length} alerts
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-gray-50 transition text-xs">
                          <p className="font-semibold text-gray-900">{notif.title}</p>
                          <p className="text-gray-600 mt-1">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {new Date(notif.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action: Create Post based on role */}
            {currentUser?.role === 'cook' ? (
              <button
                onClick={onOpenCreatePreOrder}
                className="bg-[#F5A623] hover:bg-[#DE9319] text-black px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Cook Pre-Order</span>
              </button>
            ) : currentUser?.role === 'donor' ? (
              <button
                onClick={onOpenCreateDonation}
                className="bg-[#65A878] hover:bg-[#4E8D60] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Donate Food</span>
              </button>
            ) : null}

            {/* User Profile & Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 bg-[#0F3826] hover:bg-[#235F45] px-2.5 py-1.5 rounded-xl border border-[#235F45] transition cursor-pointer"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#65A878]"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-[#A3E5B5] capitalize">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              {/* Role Switcher Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden z-50 p-2">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold text-[#174D36] truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-500 capitalize">Role: {currentUser.role}</p>
                  </div>

                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Switch Role (Testing / Demo)
                    </p>
                    <button
                      onClick={() => {
                        switchRole('customer');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>👤</span> Customer (Aarav - Madhapur)
                    </button>
                    <button
                      onClick={() => {
                        switchRole('cook');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>👩‍🍳</span> Home Cook (Smt. Lakshmi Rao)
                    </button>
                    <button
                      onClick={() => {
                        switchRole('donor');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>💚</span> Food Donor (Kakatiya Caterers)
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>🛡️</span> Platform Admin
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#1877F2] hover:bg-blue-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>🔵</span> Facebook / OTP Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
