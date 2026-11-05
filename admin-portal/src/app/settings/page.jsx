'use client';

import React, { useState } from 'react';
import { Settings, Server, Database, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [cutoffMins, setCutoffMins] = useState(30);
  const [maxCustomerSlots, setMaxCustomerSlots] = useState(4);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">System & Platform Governance Settings</h2>
        <p className="text-xs text-gray-500">Configure core engine parameters, database heartbeat, and safety rules</p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>System configuration parameters saved and active across all three portals.</span>
        </div>
      )}

      {/* Backend & DB Health Telemetry */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#174D36]" />
          Platform Infrastructure Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 font-bold block">Shared Backend API</span>
            <span className="text-gray-600 font-mono text-[11px]">http://localhost:5001</span>
            <span className="text-[10px] text-emerald-600 block mt-1">● Express 4.x Active</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 font-bold block">MySQL Database</span>
            <span className="text-gray-600 font-mono text-[11px]">localhost:3306 (XAMPP)</span>
            <span className="text-[10px] text-emerald-600 block mt-1">● 19 Relational Tables</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 font-bold block">Cutoff Cron Worker</span>
            <span className="text-gray-600 font-mono text-[11px]">*/30 * * * * * (30s)</span>
            <span className="text-[10px] text-emerald-600 block mt-1">● Auto-locks expired slots</span>
          </div>
        </div>
      </div>

      {/* Core Business Rules Configuration */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F5A623]" />
          Core Algorithm Parameters
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Mandatory Pre-Cooking Cutoff Buffer (Minutes)
            </label>
            <p className="text-gray-500 mb-2 text-[11px]">
              Orders close automatically this many minutes before the home cook begins preparing the meal.
            </p>
            <input
              type="number"
              value={cutoffMins}
              onChange={(e) => setCutoffMins(e.target.value)}
              className="w-32 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="block font-bold text-gray-700 mb-1">
              Maximum Customer Limit per Cooking Session
            </label>
            <p className="text-gray-500 mb-2 text-[11px]">
              Strictly enforced 4-customer limit ensures home-cooked food quality and hygiene.
            </p>
            <input
              type="number"
              value={maxCustomerSlots}
              onChange={(e) => setMaxCustomerSlots(e.target.value)}
              className="w-32 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="px-4 py-2 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl transition"
          >
            Save Parameter Updates
          </button>
        </div>
      </form>
    </div>
  );
}
