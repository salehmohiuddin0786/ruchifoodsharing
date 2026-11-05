'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import PreOrderCard from '@/components/PreOrderCard';
import FreeFoodCard from '@/components/FreeFoodCard';
import DashboardView from '@/components/DashboardView';
import AdminView from '@/components/AdminView';
import FlowchartExplorer from '@/components/FlowchartExplorer';
import OrderModal from '@/components/OrderModal';
import CreatePreOrderModal from '@/components/CreatePreOrderModal';
import CreateDonationModal from '@/components/CreateDonationModal';
import AuthModal from '@/components/AuthModal';
import SafetyModal from '@/components/SafetyModal';
import { UtensilsCrossed, HeartHandshake, GitFork, Sparkles, Filter, X } from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    preorders,
    donations,
    loading,
    selectedNeighborhood,
    radiusFilter,
    submitReport,
  } = useApp();

  // Modals state
  const [selectedPostForOrder, setSelectedPostForOrder] = useState(null);
  const [showCreatePreOrder, setShowCreatePreOrder] = useState(false);
  const [showCreateDonation, setShowCreateDonation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Handle reporting
  const handleOpenReport = (targetType, targetId, targetTitle) => {
    setReportTarget({ targetType, targetId, targetTitle });
  };

  const handleSendReport = (e) => {
    e.preventDefault();
    if (reportTarget && reportReason.trim()) {
      submitReport(reportTarget.targetType, reportTarget.targetId, reportTarget.targetTitle, reportReason);
      setReportTarget(null);
      setReportReason('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9EE]">
      {/* Top Header */}
      <Header
        onOpenCreatePreOrder={() => setShowCreatePreOrder(true)}
        onOpenCreateDonation={() => setShowCreateDonation(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSafety={() => setShowSafetyModal(true)}
      />

      {/* Hero Banner (visible on main feeds) */}
      {(activeTab === 'all' || activeTab === 'preorders' || activeTab === 'donations') && (
        <HeroBanner
          onOpenCreatePreOrder={() => setShowCreatePreOrder(true)}
          onOpenCreateDonation={() => setShowCreateDonation(true)}
          onOpenSafety={() => setShowSafetyModal(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'flowchart' ? (
          <FlowchartExplorer
            onOpenOrderModal={(p) => setSelectedPostForOrder(p)}
            onOpenPreOrderModal={() => setShowCreatePreOrder(true)}
            onOpenDonationModal={() => setShowCreateDonation(true)}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            onOpenCreatePreOrder={() => setShowCreatePreOrder(true)}
            onOpenCreateDonation={() => setShowCreateDonation(true)}
          />
        ) : activeTab === 'admin' ? (
          <AdminView />
        ) : (
          /* Feeds */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* Quick Flowchart Discovery Bar */}
            <div className="bg-[#FFF9EE] border-2 border-dashed border-[#F5A623] p-4 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F5A623] text-black flex items-center justify-center font-bold shrink-0">
                  <GitFork size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#174D36]">
                    Interactive Workflow & 4-Customer Rule Simulation
                  </h3>
                  <p className="text-xs text-gray-600">
                    Test how server-enforced limits, the 30-minute advance cutoff, and surplus food distribution work.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('flowchart')}
                className="px-5 py-2.5 bg-[#174D36] hover:bg-[#0F3826] text-white text-xs font-bold rounded-xl shadow transition shrink-0 cursor-pointer"
              >
                Open Workflow Diagrams & Simulator →
              </button>
            </div>

            {/* Section 1: Homemade Food Pre-Orders */}
            {(activeTab === 'all' || activeTab === 'preorders') && (
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#F5A623] text-black flex items-center justify-center font-bold">
                        <UtensilsCrossed size={18} />
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                        Home Cook Pre-Orders
                      </h2>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Fresh meals cooked in limited batches. <strong>Strict 4-customer booking ceiling</strong> & <strong>30-minute cutoff</strong>.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#174D36] bg-[#E8F5EC] px-3 py-1.5 rounded-xl border border-[#65A878]/30">
                    {preorders.length} Dishes Near {selectedNeighborhood.name} ({radiusFilter} km)
                  </span>
                </div>

                {preorders.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl text-center space-y-2 border border-gray-100">
                    <span className="text-3xl">🍲</span>
                    <p className="text-sm font-bold text-gray-700">No active home-cook dishes in this radius.</p>
                    <p className="text-xs text-gray-500">Try expanding radius to 10 km or check other Hyderabad areas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {preorders.map((post) => (
                      <PreOrderCard
                        key={post.id}
                        post={post}
                        onSelectPost={(p) => setSelectedPostForOrder(p)}
                        onReport={handleOpenReport}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Section 2: Free Surplus Food Sharing */}
            {(activeTab === 'all' || activeTab === 'donations') && (
              <section className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#65A878] text-white flex items-center justify-center font-bold">
                        <HeartHandshake size={18} />
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                        Free Surplus Food Sharing
                      </h2>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      100% free community donations (₹0). Safe collection deadlines and hygiene checked.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#174D36] bg-[#E8F5EC] px-3 py-1.5 rounded-xl border border-[#65A878]/30">
                    {donations.length} Free Offers Available
                  </span>
                </div>

                {donations.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl text-center space-y-2 border border-gray-100">
                    <span className="text-3xl">💚</span>
                    <p className="text-sm font-bold text-gray-700">No surplus food posted right now.</p>
                    <p className="text-xs text-gray-500">Check back after lunch or dinner catering hours.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {donations.map((donation) => (
                      <FreeFoodCard
                        key={donation.id}
                        post={donation}
                        onReserve={async (d) => {
                          const res = await useApp.reserveDonation?.(d.id, 1);
                        }}
                        onReport={handleOpenReport}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#174D36] text-white border-t border-[#235F45] py-8 px-4 text-center text-xs space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-[#FFF9EE]">RUCHI</span>
          <span className="text-[#A3E5B5]">• Share Food. Spread Happiness.</span>
        </div>
        <p className="text-[#C5E8D1] max-w-xl mx-auto">
          Hyderabad Pilot: Connecting neighborhood home cooks, community donors, and citizens.
          Built with Next.js (JSX) + Node.js Express + MySQL & XAMPP.
        </p>
        <p className="text-[11px] text-white/50 pt-2">
          © 2026 RUCHI Food Sharing. Compliant with Indian Food Safety & Standards (FSSAI) guidelines.
        </p>
      </footer>

      {/* MODALS */}
      {selectedPostForOrder && (
        <OrderModal
          post={selectedPostForOrder}
          onClose={() => setSelectedPostForOrder(null)}
        />
      )}

      {showCreatePreOrder && (
        <CreatePreOrderModal onClose={() => setShowCreatePreOrder(false)} />
      )}

      {showCreateDonation && (
        <CreateDonationModal onClose={() => setShowCreateDonation(false)} />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showSafetyModal && (
        <SafetyModal onClose={() => setShowSafetyModal(false)} />
      )}

      {/* Grievance Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900">Report Listing / Issue</h3>
              <button onClick={() => setReportTarget(null)} className="text-gray-400 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Reporting: <strong>{reportTarget.targetTitle}</strong>
            </p>
            <form onSubmit={handleSendReport} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Reason for report (e.g. food expired, misleading description, hygiene concern)..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174D36]"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Submit Report to Trust & Safety Queue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
