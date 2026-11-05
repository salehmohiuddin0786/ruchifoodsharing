'use client';

import React from 'react';
import { X, ShieldCheck, AlertTriangle, BookOpen, CheckCircle, Scale } from 'lucide-react';

export default function SafetyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#174D36] text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#65A878] text-white flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Food Safety, FSSAI & Product Rules
              </h2>
              <p className="text-xs text-[#A3E5B5]">RUCHI Operating Blueprint for Hyderabad, Telangana</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-gray-700 leading-relaxed">
          {/* Section 1: The Strict 4-Customer Order Rule */}
          <div className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#F5A623]/40 space-y-2">
            <h3 className="font-extrabold text-sm text-[#174D36] flex items-center gap-1.5">
              <span>🎯</span> 1. The Four-Customer Order Rule Explained
            </h3>
            <p>
              In our Hyderabad pilot, each home-cook pre-order post can accept a maximum of <strong>4 distinct customer bookings</strong>. This does <em>not</em> mean four plates:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>A customer can book 1, 2, 3 or more plates subject to the cook&apos;s remaining plate inventory.</li>
              <li>Example: Smt. Lakshmi Rao announces 10 plates. Customer A orders 3 plates, Customer B orders 2 plates. 5 plates remain, and 2 of 4 customer slots are occupied.</li>
              <li>Once 4 separate customers have booked, the post automatically locks and closes to new customers on the server, ensuring the home cook is not overwhelmed.</li>
            </ul>
          </div>

          {/* Section 2: Automatic 30-Minute Cutoff */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <span>⏱️</span> 2. Automatic 30-Minute Cutoff
            </h3>
            <p>
              Orders close strictly <strong>30 minutes before the scheduled cooking start time</strong>:
            </p>
            <p className="font-mono bg-gray-50 p-2 rounded-xl border border-gray-200 text-[#174D36] text-[11px]">
              order_closes_at = cooking_starts_at - 30 minutes (Asia/Kolkata IST)
            </p>
            <p className="text-gray-600">
              Even if a user opened the screen prior to cutoff, the Node.js backend and MySQL database reject incoming submissions once server time reaches the cutoff.
            </p>
          </div>

          {/* Section 3: FSSAI Compliance & Registration */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
            <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
              <Scale size={16} />
              <span>3. Indian Food Law (FSSAI) & Regulatory Compliance</span>
            </h3>
            <p className="text-emerald-950">
              Under Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-emerald-900">
              <li>Home cooks preparing food for commercial sale must hold a valid 14-digit FSSAI Registration number.</li>
              <li>Hygiene self-declarations, potable water usage, allergen notifications, and clean domestic handling are mandatory.</li>
              <li>Free food sharing must be kept 100% separate from paid transactions at zero fee (₹0).</li>
            </ul>
          </div>

          {/* Section 4: Hyderabad Pilot Neighborhoods */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <span>📍</span> 4. Hyderabad Pilot Neighborhoods & Expansion
            </h3>
            <p className="text-gray-600">
              Phase 1 & 2 pilot coverage includes: <strong>Madhapur, Gachibowli, Kondapur, Banjara Hills, Jubilee Hills, Hitec City, Begumpet, Kukatpally, Secunderabad, and Charminar</strong>. Radius filtering (2 km, 5 km, 10 km) ensures meals are delivered or collected fresh.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#174D36] text-white font-bold rounded-xl text-xs hover:bg-[#0F3826] transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
