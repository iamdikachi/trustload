'use client';

import React from 'react';
import { Group, Member } from '../types';
import { ShieldIcon, PayPalIcon, SparklesIcon, RefreshIcon, UsersIcon, PlusIcon } from './Icons';

interface HeaderProps {
  groups: Group[];
  selectedGroup: Group | null;
  onSelectGroup: (groupId: string) => void;
  activePersona: { role: 'TRAVELER' | 'VENDOR' | 'AUDITOR'; memberId?: string; name: string };
  onSelectPersona: (persona: { role: 'TRAVELER' | 'VENDOR' | 'AUDITOR'; memberId?: string; name: string }) => void;
  onRefresh: () => void;
  onOpenCreateGroup: () => void;
  onGoToLanding?: () => void;
  isLoading?: boolean;
}

export function Header({
  groups,
  selectedGroup,
  onSelectGroup,
  activePersona,
  onSelectPersona,
  onRefresh,
  onOpenCreateGroup,
  onGoToLanding,
  isLoading,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sticky top-0 z-30">
      {/* Top Banner: PayPal Hackathon & FX Rate Ticker */}
      <div className="bg-zinc-900 px-4 py-1.5 text-xs text-zinc-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-[#003087] px-2 py-0.5 font-semibold text-white">
            <PayPalIcon className="w-3.5 h-3.5" />
            PayPal AI Hackathon 2026
          </span>
          <span className="hidden sm:inline text-zinc-400">
            Pool money. Buy together. Everyone sees every naira.
          </span>
        </div>

        {/* Live Stored FX Rates */}
        <div className="flex items-center gap-3 overflow-x-auto text-[11px]">
          <span className="text-zinc-400 font-medium">FX Ticker:</span>
          <span className="font-mono text-emerald-400">1 USD = ₦1,500.00</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-300">1 USD = ¥7.20 CNY</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-300">1 USD = 3.67 AED</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-300">1 USD = ₺34.20 TRY</span>
          {onGoToLanding && (
            <button
              type="button"
              onClick={onGoToLanding}
              className="ml-2 text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2"
            >
              ← Landing Page
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div
          className={`flex items-center gap-3 ${onGoToLanding ? 'cursor-pointer' : ''}`}
          onClick={onGoToLanding}
          title={onGoToLanding ? 'Return to Landing Page' : undefined}
        >
          <div className="h-10 w-10 rounded-xl bg-[#582be8] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <ShieldIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                TrustLoad
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                <SparklesIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                AI Verified
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Transparent group money for cross-border pooled buying trips
            </p>
          </div>
        </div>

        {/* Controls: Group Selector, Persona Switcher, Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Trip Selector */}
          <div className="flex items-center gap-1.5">
            <select
              aria-label="Select Active Buying Trip"
              value={selectedGroup?.id || ''}
              onChange={(e) => onSelectGroup(e.target.value)}
              className="text-xs sm:text-sm font-medium rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 max-w-[220px] sm:max-w-[280px] truncate"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onOpenCreateGroup}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 p-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Create New Buying Trip"
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">New Trip</span>
            </button>
          </div>

          {/* Persona Switcher (Crucial for Demoing Traveler vs Vendor Flow) */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
            <span className="text-zinc-500 font-medium px-1.5 hidden md:inline">
              Role:
            </span>
            <select
              aria-label="Active Simulation Persona"
              value={
                activePersona.role === 'TRAVELER'
                  ? 'traveler'
                  : activePersona.role === 'AUDITOR'
                  ? 'auditor'
                  : `vendor:${activePersona.memberId}`
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'traveler') {
                  onSelectPersona({
                    role: 'TRAVELER',
                    name: selectedGroup?.traveler?.name || 'Traveler',
                  });
                } else if (val === 'auditor') {
                  onSelectPersona({
                    role: 'AUDITOR',
                    name: 'Auditor (Transparent)',
                  });
                } else if (val.startsWith('vendor:')) {
                  const mId = val.replace('vendor:', '');
                  const member = selectedGroup?.members?.find((m) => m.id === mId);
                  onSelectPersona({
                    role: 'VENDOR',
                    memberId: mId,
                    name: member?.user?.name || 'Vendor',
                  });
                }
              }}
              className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 outline-none pr-2 cursor-pointer"
            >
              <option value="traveler" className="dark:bg-zinc-900">
                ✈️ Traveler ({selectedGroup?.traveler?.name || 'Traveler'})
              </option>
              {selectedGroup?.members?.map((m) => (
                <option key={m.id} value={`vendor:${m.id}`} className="dark:bg-zinc-900">
                  🛒 Vendor ({m.user.name})
                </option>
              ))}
              <option value="auditor" className="dark:bg-zinc-900">
                👁️ Auditor / Full Transparency
              </option>
            </select>
          </div>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Refresh Group Data"
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
