'use client';

import React from 'react';
import { Group } from '../types';
import { formatDualCurrency, getStatusBadge } from '../lib/utils';
import { CoinsIcon, PayPalIcon, SparklesIcon, ShieldIcon, AlertTriangleIcon } from './Icons';

interface MetricsProps {
  group: Group;
}

export function Metrics({ group }: MetricsProps) {
  const summary = group.summary || {
    totalContributionsCompleted: 0,
    totalReleased: 0,
    potBalance: 0,
    totalExpectedContribution: 0,
    pendingReleaseRequestCount: 0,
    memberCount: group.members?.length || 0,
  };

  const potFunded = formatDualCurrency(summary.totalContributionsCompleted);
  const released = formatDualCurrency(summary.totalReleased);
  const remaining = formatDualCurrency(summary.potBalance);
  const target = formatDualCurrency(summary.totalExpectedContribution);
  const statusBadge = getStatusBadge(group.status);

  // Check if any release request has flags
  const flaggedCount =
    group.releaseRequests?.filter((r) => r.aiReport?.flags && r.aiReport.flags.length > 0)
      .length || 0;

  return (
    <div className="space-y-4">
      {/* Group Title & Trip Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}
            >
              {statusBadge.label}
            </span>
            <span className="text-xs text-blue-200">
              Trip ID: <span className="font-mono text-white">{group.id.slice(0, 8)}...</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {group.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200">
            Designated Traveler:{' '}
            <strong className="text-white">{group.traveler?.name}</strong> ({group.traveler?.email})
            &nbsp;•&nbsp;
            Threshold:{' '}
            <strong className="text-white">
              {group.approvalThreshold} of {group.members?.length || 5} vendors required
            </strong>
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 text-right">
          <span className="text-xs text-blue-200">Base Currency</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-wide">
              {group.baseCurrency} (USD)
            </span>
            <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
              Dual Display ₦ NGN
            </span>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pot Funded */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Total Pot Funded</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#003087] flex items-center justify-center">
              <PayPalIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {potFunded.usd}
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ≈ {potFunded.ngn}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <span>Target: {target.usd}</span>
            <span className="text-emerald-600 font-medium">
              {summary.totalExpectedContribution > 0
                ? `${Math.round(
                    (summary.totalContributionsCompleted /
                      summary.totalExpectedContribution) *
                      100
                  )}% Funded`
                : '100% Funded'}
            </span>
          </div>
        </div>

        {/* Card 2: Staged Released */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Staged Released</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <CoinsIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {released.usd}
            </div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              ≈ {released.ngn}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <span>PayPal Payouts</span>
            <span className="text-indigo-600 font-medium">Human Approved</span>
          </div>
        </div>

        {/* Card 3: Remaining Pot Escrow Balance */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>Remaining in Pot</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <ShieldIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {remaining.usd}
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ≈ {remaining.ngn}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <span>Held in PayPal Escrow</span>
            <span className="text-emerald-600 font-medium">Secure</span>
          </div>
        </div>

        {/* Card 4: AI Verification Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-medium">
            <span>AI Verification Status</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>{flaggedCount > 0 ? `${flaggedCount} Alert` : '100% OK'}</span>
              {flaggedCount > 0 && (
                <AlertTriangleIcon className="w-5 h-5 text-amber-500 inline" />
              )}
            </div>
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {summary.pendingReleaseRequestCount} Pending Approval
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <span>Multilingual Vision</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Chinese & Arabic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
