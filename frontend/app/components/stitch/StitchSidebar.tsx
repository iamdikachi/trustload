'use client';

import React from 'react';
import { ScreenPath } from './StitchHeader';

interface StitchSidebarProps {
  currentPath: ScreenPath;
  onNavigate: (path: ScreenPath) => void;
  onGoToLanding: () => void;
  tripName?: string;
  travelerName?: string;
  quorumPolicy?: string;
  activePersonaRole: 'TRAVELER' | 'VENDOR' | 'AUDITOR';
  onSwitchPersona: (role: 'TRAVELER' | 'VENDOR' | 'AUDITOR') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StitchSidebar({
  currentPath,
  onNavigate,
  onGoToLanding,
  tripName = 'Phone accessories, Dubai run',
  travelerName = 'Traveler: Chidi O.',
  quorumPolicy = '3 of 5',
  activePersonaRole,
  onSwitchPersona,
  isMobileOpen = false,
  onCloseMobile,
}: StitchSidebarProps) {
  const mainNavItems: Array<{
    path: ScreenPath;
    label: string;
    icon: string;
    badge?: string;
    badgeClass?: string;
  }> = [
    {
      path: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
    },
    {
      path: 'ledger',
      label: 'Escrow Ledger',
      icon: 'account_balance',
      badge: '6 tx',
      badgeClass: 'bg-[#ece4ff] text-[#431fb9]',
    },
    {
      path: 'final-split',
      label: 'Final Split & Refunds',
      icon: 'splitscreen',
      badge: 'Reconciled',
      badgeClass: 'bg-[#dcfce7] text-[#15803d]',
    },
    {
      path: 'create-group',
      label: 'Create Group',
      icon: 'add_circle',
    },
  ];

  const quickActions: Array<{
    path: ScreenPath;
    label: string;
    icon: string;
    badge?: string;
    badgeClass?: string;
  }> = [
    {
      path: 'new-release',
      label: 'New Release Request',
      icon: 'post_add',
    },
    {
      path: 'review-approve',
      label: 'Review & Approve',
      icon: 'fact_check',
      badge: '1 pending',
      badgeClass: 'bg-[#fef3c7] text-[#b45309]',
    },
    {
      path: 'pay-contribution',
      label: 'Pay My Share ($1k)',
      icon: 'payments',
    },
  ];

  const handleItemClick = (path: ScreenPath) => {
    onNavigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-white border-r border-[#e6deff] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand & Active Trip Pod */}
        <div className="flex flex-col">
          {/* Logo Bar */}
          <div className="h-16 px-5 border-b border-[#e6deff] flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => {
                onGoToLanding();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Return to homepage"
            >
              <div className="w-9 h-9 rounded-lg bg-[#431fb9] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm text-[20px] font-black tracking-tight text-[#1d1833] group-hover:text-[#431fb9] transition-colors">
                  TrustLoad
                </span>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] uppercase font-bold tracking-wider">
                  Escrow
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden text-[#797586] hover:text-[#1d1833] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <div className="px-3 py-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#797586]">
              Main Navigation
            </div>
            {mainNavItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5b3fd1] text-white shadow-sm'
                      : 'text-[#484554] hover:text-[#1d1833] hover:bg-[#f2ebff]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? 'text-white' : 'text-[#797586]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeClass
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Navigation */}
          <div className="px-3 pt-3 space-y-1 border-t border-[#e6deff]/70 mt-2">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#797586]">
              Trip Milestones
            </div>
            {quickActions.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5b3fd1] text-white shadow-sm font-bold'
                      : 'text-[#484554] hover:text-[#1d1833] hover:bg-[#f2ebff]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isActive ? 'text-white' : 'text-[#797586]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeClass
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Persona Switcher, Public Landing Link, User Info */}
        <div className="p-3 border-t border-[#e6deff] space-y-2 bg-[#fdf8ff]">
          {/* Persona Selection */}
          <div className="p-2 rounded-xl bg-white border border-[#e6deff] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#797586] px-1">
              Simulation Persona
            </div>
            <select
              aria-label="Active Simulation Persona"
              value={activePersonaRole}
              onChange={(e) => onSwitchPersona(e.target.value as any)}
              className="w-full text-[12px] font-semibold bg-[#f7f1ff] border border-[#e6deff] rounded-lg px-2.5 py-1.5 text-[#1d1833] cursor-pointer outline-none focus:ring-1 focus:ring-[#5b3fd1]"
            >
              <option value="TRAVELER">✈️ Traveler (Chidi O.)</option>
              <option value="VENDOR">🛒 Vendor (Amaka O.)</option>
              <option value="AUDITOR">👁️ Auditor Mode</option>
            </select>
          </div>

          {/* User Profile Footer Row */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#e6deff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#431fb9] flex items-center justify-center text-white text-[12px] font-bold shadow-sm ring-2 ring-[#e6deff]">
                CO
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#1d1833] leading-tight">
                  Chidi Okonkwo
                </span>
                <span className="text-[10px] text-[#797586] leading-tight">
                  {activePersonaRole === 'TRAVELER'
                    ? 'Escrow Custodian'
                    : activePersonaRole === 'VENDOR'
                    ? 'Member Seat #1'
                    : 'Auditor'}
                </span>
              </div>
            </div>

            {/* Return to Landing Page */}
            <button
              type="button"
              onClick={onGoToLanding}
              title="Return to Public Landing Page"
              className="p-1.5 text-[#5b3fd1] hover:bg-[#f2ebff] rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

