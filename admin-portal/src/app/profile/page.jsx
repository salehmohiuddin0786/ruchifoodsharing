'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserCheck, Shield, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Staff Profile</h2>
        <p className="text-xs text-gray-500">Security clearance and account profile details</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#174D36] text-white text-2xl font-black flex items-center justify-center shadow-md">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <div className="flex gap-2 mt-1.5">
              {user?.roles?.map((r) => (
                <span key={r} className="px-2 py-0.5 bg-emerald-100 text-[#174D36] rounded text-[10px] font-bold">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-1">Assigned Portal</span>
            <span className="font-bold text-gray-800">Admin Governance Portal (Port 3001)</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-1">Account ID</span>
            <span className="font-mono font-semibold text-gray-700">{user?.id}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-1">Verified Email</span>
            <span className="font-semibold text-emerald-700">Verified & Active</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-1">Session Protocol</span>
            <span className="font-semibold text-gray-700">JWT + HTTP-only Cookie</span>
          </div>
        </div>
      </div>
    </div>
  );
}
