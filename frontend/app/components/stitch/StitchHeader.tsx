'use client';

import React from 'react';

export type ScreenPath =
  | 'dashboard'
  | 'ledger'
  | 'final-split'
  | 'create-group'
  | 'new-release'
  | 'review-approve'
  | 'pay-contribution';

interface StitchHeaderProps {
  currentPath: ScreenPath;
  onNavigate: (path: ScreenPath) => void;
  onGoToLanding: () => void;
  tripName?: string;
  travelerName?: string;
  quorumPolicy?: string;
  activePersonaRole?: string;
  onSwitchPersona?: (role: 'TRAVELER' | 'VENDOR' | 'AUDITOR') => void;
}

export function StitchHeader({
  currentPath,
  onNavigate,
  onGoToLanding,
  tripName = 'Phone accessories, Dubai run',
  travelerName = 'Traveler: Chidi O.',
  quorumPolicy = '3 of 5',
  activePersonaRole = 'TRAVELER',
  onSwitchPersona,
}: StitchHeaderProps) {
  const navItems: Array<{ path: ScreenPath; label: string }> = [
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'ledger', label: 'Ledger' },
    { path: 'final-split', label: 'Final Split' },
    { path: 'create-group', label: 'Create Group' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#ffffff] shadow-[0_1px_8px_rgba(42,27,99,0.05)] border-b border-[#e6deff]">
      <div className="h-16 max-w-[1200px] mx-auto px-6 flex items-center justify-between gap-4">
        {/* Brand & Active Trip Selector */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
            title="Return to Dashboard"
          >
            <div className="w-9 h-9 rounded-lg bg-[#5b3fd1] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm text-[20px] font-bold tracking-tight text-[#1d1833]">
                TrustLoad
              </span>
              <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] uppercase font-bold tracking-wider">
                Escrow
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-[#e6deff]">
            <div className="flex flex-col text-left">
              <div
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => onNavigate('dashboard')}
              >
                <span className="font-label-md text-[13px] font-semibold text-[#1d1833] hover:text-[#431fb9] transition-colors">
                  {tripName}
                </span>
                <span className="material-symbols-outlined text-[#797586] text-[16px]">expand_more</span>
              </div>
              <span className="font-body-sm text-[13px] text-[#484554]">{travelerName}</span>
            </div>
            <span className="font-label-sm text-[11px] px-2.5 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] font-semibold tracking-wide">
              Sandbox mode
            </span>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`px-3 py-1.5 rounded-lg font-label-md text-[13px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#5b3fd1] text-white shadow-sm font-semibold'
                    : 'text-[#484554] hover:text-[#1d1833] hover:bg-[#ece4ff]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Policy, Landing Link, Notifications, Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f1ff] border border-[#e6deff]">
            <span className="w-2 h-2 rounded-full bg-[#5b3fd1] animate-pulse"></span>
            <span className="font-label-sm text-[11px] text-[#484554]">
              Sign-off Policy: <strong className="text-[#1d1833] font-semibold">{quorumPolicy}</strong>
            </span>
          </div>

          {/* Landing Page Link */}
          <button
            type="button"
            onClick={onGoToLanding}
            title="View Public Landing Page"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold text-[#5b3fd1] hover:bg-[#f2ebff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">web</span>
            <span>Landing</span>
          </button>

          {/* Persona Switcher / Avatar */}
          <div className="flex items-center gap-1.5">
            {onSwitchPersona && (
              <select
                aria-label="Active Simulation Persona"
                value={activePersonaRole}
                onChange={(e) => onSwitchPersona(e.target.value as any)}
                className="text-[11px] font-semibold bg-[#f7f1ff] border border-[#e6deff] rounded-lg px-2 py-1 text-[#1d1833] cursor-pointer outline-none"
              >
                <option value="TRAVELER">✈️ Traveler (Chidi)</option>
                <option value="VENDOR">🛒 Vendor (Amaka)</option>
                <option value="AUDITOR">👁️ Auditor Mode</option>
              </select>
            )}

            <div
              className="w-8 h-8 rounded-full bg-[#431fb9] flex items-center justify-center text-white font-label-md text-[13px] font-bold shadow-sm ring-2 ring-[#e6deff] cursor-pointer"
              title="Chidi Okonkwo (Active User)"
            >
              CO
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

