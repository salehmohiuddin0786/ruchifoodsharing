'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { ShieldAlert, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await adminApi.getReports();
      setReports(res.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeReport) return;
    setResolving(true);
    try {
      await adminApi.resolveReport(activeReport.id, adminNotes);
      setActiveReport(null);
      setAdminNotes('');
      loadReports();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Safety & Quality Dispute Reports</h2>
        <p className="text-xs text-gray-500">Review reported homemade meals, unhygienic conditions, and deceptive claims</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading dispute reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-800 text-sm">Clean Record</h4>
            <p className="text-xs text-gray-500">No open disputes or consumer safety violations.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((rep) => (
              <div key={rep.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                      {rep.target_type}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{rep.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{rep.target_title || 'Reported Incident'}</h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-2xl">
                    "{rep.reason}"
                  </p>
                  {rep.admin_notes && (
                    <p className="text-[11px] text-emerald-800 italic mt-1">
                      Moderator action: {rep.admin_notes}
                    </p>
                  )}
                </div>

                <div>
                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() => { setActiveReport(rep); setAdminNotes(''); }}
                      className="px-3.5 py-1.5 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl transition shadow"
                    >
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-[#174D36] p-6 text-white">
              <h3 className="font-bold text-base">Resolve Incident #{activeReport.id}</h3>
              <p className="text-xs text-emerald-100/80 mt-1">Target: {activeReport.target_title}</p>
            </div>
            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Investigation Findings & Resolution Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Detail actions taken (e.g., Contacted cook, inspected hygiene verification, warned user)..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
                >
                  {resolving ? 'Submitting...' : 'Mark as Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
