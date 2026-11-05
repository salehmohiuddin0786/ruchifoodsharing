'use client';

import React from 'react';
import FlowchartExplorer from '@/components/FlowchartExplorer';

export default function ArchitecturePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">RUCHI System Architecture & Flowchart Explorer</h1>
        <p className="text-xs text-gray-500 mt-1">
          Interactive visualization of the 5 core operational algorithms: 30-minute pre-cooking cutoff, 4-customer limit, dual food safety, and atomic slot reservation.
        </p>
      </div>

      <FlowchartExplorer />
    </div>
  );
}
