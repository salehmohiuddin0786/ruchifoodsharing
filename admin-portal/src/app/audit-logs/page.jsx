'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { FileText, Shield, User, Clock } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await adminApi.getAuditLogs();
      setLogs(res.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Governance Audit Trail</h2>
        <p className="text-xs text-gray-500">Immutable ledger of administrative actions, status toggles, and verifications</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No audit events recorded.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#174D36]/10 text-[#174D36]">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Target: <span className="font-semibold text-gray-800">{log.target_type} ({log.target_id})</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-mono text-[11px] bg-gray-50 p-1.5 rounded border border-gray-100">
                    {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Executed by: <span className="font-medium text-gray-700">{log.actor_name || log.actor_id}</span>
                  </p>
                </div>

                <div className="text-right text-xs text-gray-400 font-mono">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
