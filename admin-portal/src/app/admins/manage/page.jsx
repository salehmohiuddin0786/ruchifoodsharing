'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Shield, UserPlus, CheckCircle2, AlertCircle, Lock, Mail, Phone, User, Briefcase } from 'lucide-react';

export default function AdminsManagementPage() {
  const { user, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState('Safety & Compliance');
  const [permissions, setPermissions] = useState('VERIFY_COOKS,VIEW_REPORTS');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdmins();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const loadAdmins = async () => {
    try {
      const res = await adminApi.getAdmins();
      setAdmins(res.admins || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await adminApi.createAdmin({
        name,
        email,
        phone,
        password,
        department,
        permissions,
      });

      setSuccessMsg(res.message);
      setShowModal(false);
      setName('');
      setEmail('');
      setPhone('');
      loadAdmins();
    } catch (err) {
      setError(err.message || 'Failed to provision admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">Super Admin Restricted Area</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Administrative accounts can only be provisioned by an authorized Super Administrator. Your current account ({user?.roles?.join(', ')}) does not have this capability.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-900">Admin Team & Access Delegation</h2>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Provision official administrative accounts. Public sign-up is completely blocked.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Admin</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading admin roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Admin Officer</th>
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Permissions</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{adm.name}</div>
                      <div className="text-[11px] text-gray-500">{adm.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          adm.roles?.includes('SUPER_ADMIN')
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {adm.roles}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{adm.department || 'Operations'}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600">
                      {adm.permissions || 'ALL'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {new Date(adm.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {adm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provisioning Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-[#174D36] p-6 text-white">
              <h3 className="font-bold text-lg">Provision New Platform Admin</h3>
              <p className="text-xs text-emerald-100/80 mt-1">Super Admin credential authorization</p>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh.safety@ruchi.com"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Initial Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  >
                    <option value="Safety & Compliance">Safety & Compliance</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Community Outreach">Community Outreach</option>
                    <option value="Platform Moderation">Platform Moderation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Permissions</label>
                  <select
                    value={permissions}
                    onChange={(e) => setPermissions(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#174D36]"
                  >
                    <option value="VERIFY_COOKS,VIEW_REPORTS">Verify Cooks & Reports</option>
                    <option value="MODERATE_POSTS,ORDERS">Moderate Food & Orders</option>
                    <option value="ALL_OPERATIONS">All Operational Rights</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl transition shadow"
                >
                  {submitting ? 'Provisioning...' : 'Confirm Account Provision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
