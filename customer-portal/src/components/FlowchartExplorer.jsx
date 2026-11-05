'use client';

import React, { useState } from 'react';
import {
  GitFork,
  Clock,
  Users,
  Utensils,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function FlowchartExplorer({ onOpenOrderModal, onOpenPreOrderModal, onOpenDonationModal }) {
  const [activeFlow, setActiveFlow] = useState('preorder_logic'); // 'overall', 'preorder_logic', 'donation_flow', 'roles', 'navigation'

  // Interactive 4-Customer Simulation State
  const [simPlates, setSimPlates] = useState(10);
  const [simCustomers, setSimCustomers] = useState([
    { name: 'Customer A', plates: 3, time: '12:05 PM' },
    { name: 'Customer B', plates: 2, time: '12:12 PM' },
  ]);
  const [simInputPlates, setSimInputPlates] = useState(2);
  const [simMsg, setSimMsg] = useState('');

  const totalBookedPlates = simCustomers.reduce((sum, c) => sum + c.plates, 0);
  const remainingPlates = simPlates - totalBookedPlates;
  const slotsUsed = simCustomers.length;

  const handleSimulateBooking = () => {
    if (slotsUsed >= 4) {
      setSimMsg('❌ REJECTED: Maximum 4 customer bookings reached. Fifth distinct customer cannot book.');
      return;
    }
    if (simInputPlates > remainingPlates) {
      setSimMsg(`❌ REJECTED: Only ${remainingPlates} plate(s) remain.`);
      return;
    }
    const customerLetter = String.fromCharCode(65 + slotsUsed); // A, B, C, D
    const newCustomer = {
      name: `Customer ${customerLetter}`,
      plates: parseInt(simInputPlates, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSimCustomers([...simCustomers, newCustomer]);
    setSimMsg(`✅ ACCEPTED: Customer ${customerLetter} secured ${simInputPlates} plates!`);
  };

  const resetSimulation = () => {
    setSimCustomers([
      { name: 'Customer A', plates: 3, time: '12:05 PM' },
      { name: 'Customer B', plates: 2, time: '12:12 PM' },
    ]);
    setSimMsg('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Flowchart Header */}
      <div className="bg-gradient-to-r from-[#174D36] to-[#0F3826] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#235F45] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F5A623] text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <GitFork size={14} /> Interactive System Blueprint & Flowcharts
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFF9EE]">
            RUCHI Platform Workflows & Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#A3E5B5] mt-1 max-w-2xl">
            Derived directly from the official RUCHI product specification & design flows.
            Explore how customer booking limits, the 30-minute cutoff, surplus food claims, and dashboards function end-to-end.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="px-4 py-2 bg-[#235F45] hover:bg-[#2F7A59] text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Reset Interactive Simulator
        </button>
      </div>

      {/* Navigation Pills between Flows */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
        <button
          onClick={() => setActiveFlow('preorder_logic')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeFlow === 'preorder_logic'
              ? 'bg-[#F5A623] text-black shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Utensils size={15} />
          <span>2. Pre-Order & 4-Customer Rule Logic</span>
        </button>

        <button
          onClick={() => setActiveFlow('overall')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeFlow === 'overall'
              ? 'bg-[#174D36] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <GitFork size={15} />
          <span>1. Overall Discovery & Ordering Flow</span>
        </button>

        <button
          onClick={() => setActiveFlow('donation_flow')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeFlow === 'donation_flow'
              ? 'bg-[#65A878] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <HeartHandshake size={15} />
          <span>3. Free Food Donation Flow (₹0)</span>
        </button>

        <button
          onClick={() => setActiveFlow('roles')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeFlow === 'roles'
              ? 'bg-[#174D36] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users size={15} />
          <span>4. User Roles & Dashboards</span>
        </button>

        <button
          onClick={() => setActiveFlow('navigation')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeFlow === 'navigation'
              ? 'bg-[#174D36] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShieldCheck size={15} />
          <span>5. Navigation Architecture</span>
        </button>
      </div>

      {/* FLOW 2: PRE-ORDER FLOW & 4-CUSTOMER SIMULATION */}
      {activeFlow === 'preorder_logic' && (
        <div className="space-y-6">
          {/* Visual Interactive Simulator */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#F5A623] uppercase">Interactive Rule Simulator</span>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Four-Customer Ceiling & Stock Reservation
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Simulate what happens when distinct customers book plates from a home-cook session.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                  Initial Stock: {simPlates} Plates
                </span>
                <span className="text-xs bg-[#FFF9EE] text-[#174D36] font-bold px-3 py-1.5 rounded-xl border border-[#F5A623]/30">
                  Remaining: {remainingPlates} Plates
                </span>
              </div>
            </div>

            {/* 4-Customer Grid (As designed in ChatGPT chat) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-700">Customer Booking Slots (Max 4 distinct customers):</span>
                <span className="text-[#174D36] font-black">{slotsUsed} of 4 Occupied</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const customer = simCustomers[slotIdx];
                  const isBooked = !!customer;
                  return (
                    <div
                      key={slotIdx}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-36 ${
                        isBooked
                          ? 'bg-[#E8F5EC] border-[#65A878] shadow-sm'
                          : 'bg-gray-50 border-dashed border-gray-300 text-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Slot {slotIdx + 1}
                        </span>
                        {isBooked ? (
                          <span className="bg-[#174D36] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Booked
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                            Available
                          </span>
                        )}
                      </div>

                      {isBooked ? (
                        <div>
                          <p className="font-extrabold text-sm text-gray-900">{customer.name}</p>
                          <p className="text-xs text-emerald-800 font-semibold">{customer.plates} plate(s) booked</p>
                          <p className="text-[10px] text-gray-500">{customer.time}</p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <Users size={20} className="mx-auto text-gray-300" />
                          <p className="text-xs text-gray-400 mt-1">Open for booking</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Test Action */}
            <div className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#F5A623]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700">Simulate Next Customer Ordering:</span>
                <select
                  value={simInputPlates}
                  onChange={(e) => setSimInputPlates(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none"
                >
                  <option value="1">1 Plate</option>
                  <option value="2">2 Plates</option>
                  <option value="3">3 Plates</option>
                  <option value="4">4 Plates</option>
                </select>
                <button
                  onClick={handleSimulateBooking}
                  className="px-4 py-2 bg-[#174D36] hover:bg-[#0F3826] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Attempt Booking
                </button>
              </div>

              {simMsg && (
                <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  simMsg.includes('REJECTED')
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {simMsg}
                </div>
              )}
            </div>

            {/* Step-by-Step Pre-Order Flow Stepper */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900">
                Step-by-Step Homemade Pre-Order Workflow
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-bold text-[#174D36]">Step 1</span>
                  <p className="font-bold text-gray-900">Cook Logs In</p>
                  <p className="text-[11px] text-gray-500">Opens Cook Portal on RUCHI</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-bold text-[#174D36]">Step 2</span>
                  <p className="font-bold text-gray-900">Announce Dish</p>
                  <p className="text-[11px] text-gray-500">Sets total plates & cooking start time</p>
                </div>

                <div className="bg-[#FFF9EE] p-3 rounded-2xl border border-[#F5A623]/40 space-y-1">
                  <span className="font-bold text-[#F5A623]">Step 3 (Auto)</span>
                  <p className="font-bold text-gray-900">30-Min Cutoff</p>
                  <p className="text-[11px] text-gray-600">Calculated strictly: cooking_starts_at - 30m</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-bold text-[#174D36]">Step 4</span>
                  <p className="font-bold text-gray-900">Customers Book</p>
                  <p className="text-[11px] text-gray-500">Up to 4 customers max. Stock deducted atomically.</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1">
                  <span className="font-bold text-[#174D36]">Step 5</span>
                  <p className="font-bold text-gray-900">Orders Close</p>
                  <p className="text-[11px] text-gray-500">Server locks session, cook notified with final list.</p>
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-800">Step 6</span>
                  <p className="font-bold text-gray-900">Fresh Handover</p>
                  <p className="text-[11px] text-emerald-900">Ready alert sent $\rightarrow$ Pickup/Delivery done.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOW 1: OVERALL FLOW */}
      {activeFlow === 'overall' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#174D36] uppercase">End-to-End User Experience</span>
            <h2 className="text-xl font-extrabold text-gray-900">Overall Website & Discovery Flow</h2>
          </div>

          <div className="relative border-l-2 border-[#65A878] pl-6 ml-3 space-y-6 text-xs text-gray-600">
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#174D36] border-2 border-white" />
              <h4 className="font-bold text-sm text-gray-900">1. Guest Visits RUCHI</h4>
              <p className="mt-0.5 text-gray-600">
                Browses public listings across Hyderabad neighbourhoods. Filterable by radius (2 km, 5 km, 10 km) and dietary preference.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#F5A623] border-2 border-white" />
              <h4 className="font-bold text-sm text-gray-900">2. Dual Service Choice</h4>
              <p className="mt-0.5 text-gray-600">
                User selects either <strong>Free Surplus Food</strong> (₹0 community donation) or <strong>Homemade Food Pre-Orders</strong> (paid advance meal).
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#174D36] border-2 border-white" />
              <h4 className="font-bold text-sm text-gray-900">3. Authentication & Verification</h4>
              <p className="mt-0.5 text-gray-600">
                Signs in with one-click <strong>Facebook Login</strong> or phone OTP fallback. Terms & FSSAI disclaimers accepted.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#65A878] border-2 border-white" />
              <h4 className="font-bold text-sm text-gray-900">4. Advance Reservation & Stock Locks</h4>
              <p className="mt-0.5 text-gray-600">
                The database locks stock with atomic transactions, enforcing the 4-customer ceiling and 30-min cutoff. Instant in-app confirmation dispatched.
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#174D36] border-2 border-white" />
              <h4 className="font-bold text-sm text-gray-900">5. Preparation Stepper & Collection</h4>
              <p className="mt-0.5 text-gray-600">
                Customer receives live status updates (Confirmed $\rightarrow$ Preparing $\rightarrow$ Ready for Handover) and coordinates pickup or local delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOW 3: FREE FOOD DONATION FLOW */}
      {activeFlow === 'donation_flow' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#65A878] uppercase">Zero Waste Mission</span>
            <h2 className="text-xl font-extrabold text-gray-900">Free Food Donation Flow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#65A878]/30 space-y-2">
              <div className="font-black text-[#174D36]">1. Surplus Identified</div>
              <p className="text-gray-600">
                Caterer, banquet hall, or restaurant finishes event meal and packs wholesome surplus food into hygienic containers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#65A878]/30 space-y-2">
              <div className="font-black text-[#174D36]">2. Publish Free Post</div>
              <p className="text-gray-600">
                Donor specifies available servings, preparation time, temperature notes, and <strong>Safe Collection Deadline</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#65A878]/30 space-y-2">
              <div className="font-black text-[#174D36]">3. Nearby Broadcast</div>
              <p className="text-gray-600">
                Citizens and community volunteers in the radius receive instant push alerts about free food availability at ₹0.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#65A878]/30 space-y-2">
              <div className="font-black text-[#174D36]">4. Claim & Handover</div>
              <p className="text-gray-600">
                Recipients reserve portions, collect by deadline, and donor marks listing as completed/collected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOW 4: ROLES & DASHBOARDS */}
      {activeFlow === 'roles' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#174D36] uppercase">Role-Based Access Control</span>
            <h2 className="text-xl font-extrabold text-gray-900">User Types and Specialized Dashboards</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-2">
              <span className="text-2xl">👤</span>
              <h4 className="font-extrabold text-gray-900 text-sm">Customer</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Browse nearby feeds</li>
                <li>Reserve free surplus food</li>
                <li>Place & track pre-orders</li>
                <li>Pre-cutoff cancellation</li>
                <li>Follow favorite cooks</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-[#F5A623]/30 bg-[#FFF9EE] space-y-2">
              <span className="text-2xl">👩‍🍳</span>
              <h4 className="font-extrabold text-gray-900 text-sm">Home Cook</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>FSSAI self-declaration</li>
                <li>Publish advance meal sessions</li>
                <li>Enforce 4-customer limit</li>
                <li>Update order preparation stepper</li>
                <li>Coordinate local pickup/delivery</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-[#65A878]/30 bg-[#E8F5EC] space-y-2">
              <span className="text-2xl">💚</span>
              <h4 className="font-extrabold text-gray-900 text-sm">Food Donor</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Caterer / Restaurant profile</li>
                <li>List surplus food shares (₹0)</li>
                <li>Set safe collection deadlines</li>
                <li>Storage/temperature notes</li>
                <li>Confirm collections</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-red-200 bg-red-50 space-y-2">
              <span className="text-2xl">🛡️</span>
              <h4 className="font-extrabold text-gray-900 text-sm">Administrator</h4>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Verify home-cook FSSAI info</li>
                <li>Food safety complaint queue</li>
                <li>Emergency pause on posts</li>
                <li>System metrics & audit trail</li>
                <li>Hyderabad service areas</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* FLOW 5: NAVIGATION ARCHITECTURE */}
      {activeFlow === 'navigation' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100 space-y-6">
          <div>
            <span className="text-xs font-bold text-[#174D36] uppercase">Information Architecture</span>
            <h2 className="text-xl font-extrabold text-gray-900">Complete 8-Block Navigation Structure</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Identical to the navigation layout specified in the ChatGPT conversation blueprint.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <HeartHandshake size={20} className="text-[#65A878]" />
              <div>
                <p className="font-black text-gray-900">Food Sharing</p>
                <p className="text-[11px] text-gray-500">Free food listings (₹0)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <Utensils size={20} className="text-[#F5A623]" />
              <div>
                <p className="font-black text-gray-900">Homemade Food</p>
                <p className="text-[11px] text-gray-500">Pre-order dishes</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <span className="text-xl">👩‍🍳</span>
              <div>
                <p className="font-black text-gray-900">Become a Cook</p>
                <p className="text-[11px] text-gray-500">Cook onboarding & FSSAI</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <span className="text-xl">💚</span>
              <div>
                <p className="font-black text-gray-900">Donate Food</p>
                <p className="text-[11px] text-gray-500">Surplus donations</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <Info size={20} className="text-[#174D36]" />
              <div>
                <p className="font-black text-gray-900">About Us</p>
                <p className="text-[11px] text-gray-500">Zero food waste mission</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <GitFork size={20} className="text-[#174D36]" />
              <div>
                <p className="font-black text-gray-900">How It Works</p>
                <p className="text-[11px] text-gray-500">Platform guide & policies</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <ShieldCheck size={20} className="text-[#65A878]" />
              <div>
                <p className="font-black text-gray-900">Contact & Safety</p>
                <p className="text-[11px] text-gray-500">Grievance & food safety</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between h-28">
              <Users size={20} className="text-[#1877F2]" />
              <div>
                <p className="font-black text-gray-900">Login / Sign Up</p>
                <p className="text-[11px] text-gray-500">Facebook OAuth / Phone OTP</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
