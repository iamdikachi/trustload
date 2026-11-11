'use client';

import React from 'react';
import { ScreenPath } from './StitchHeader';

interface StitchTopBarProps {
  currentPath: ScreenPath;
  onOpenMobileSidebar: () => void;
  onGoToLanding: () => void;
  tripName?: string;
}

export function StitchTopBar({
  currentPath,
  onOpenMobileSidebar,
  onGoToLanding,
  tripName = 'Phone accessories, Dubai run',
}: StitchTopBarProps) {
  const titles: Record<ScreenPath, string> = {
    dashboard: 'Group Escrow Dashboard',
    ledger: 'Escrow Ledger & Transaction Audit',
    'final-split': 'Trip Reconciliation & Final Split',
    'create-group': 'Create Group Escrow Pool',
    'new-release': 'New Release Request',
    'review-approve': 'Review Escrow Release Claim',
    'pay-contribution': 'Pay Member Contribution Share',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e6deff] shadow-[0_1px_6px_rgba(42,27,99,0.03)]">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-[#1d1833] hover:bg-[#f2ebff] transition-colors cursor-pointer"
            title="Open Sidebar Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-base sm:text-lg font-bold text-[#1d1833] tracking-tight">
                {titles[currentPath] || 'TrustLoad Escrow'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Sandbox
              </span>
            </div>
            <p className="text-[11px] text-[#484554] hidden sm:block">
              {tripName} • Automated Multi-Party Escrow
            </p>
          </div>
        </div>

        {/* Right: Live FX Ticker, Notifications, and Landing Shortcut */}
        <div className="flex items-center gap-3">
          {/* FX Ticker */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f1ff] border border-[#e6deff] text-[11px] font-mono">
            <span className="text-[#797586] font-sans font-medium">FX:</span>
            <span className="text-[#15803d] font-semibold">1 USD = ₦1,500</span>
            <span className="text-[#c9c4d7]">|</span>
            <span className="text-[#1d1833]">1 USD = 3.67 AED</span>
            <span className="text-[#c9c4d7]">|</span>
            <span className="text-[#1d1833]">1 USD = ¥7.20 CNY</span>
          </div>

          <button
            type="button"
            onClick={onGoToLanding}
            className="text-[12px] font-semibold text-[#5b3fd1] hover:bg-[#f2ebff] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="View Public Landing Page"
          >
            <span className="material-symbols-outlined text-[16px]">web</span>
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          <button
            type="button"
            onClick={() => alert('No new notifications. All 6 ledger transactions verified.')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#484554] hover:bg-[#f2ebff] hover:text-[#1d1833] transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
}

