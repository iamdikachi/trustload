'use client';

import React, { useState } from 'react';
import { Group, Member } from '../../types';
import { formatDualCurrency, formatDate, getStatusBadge } from '../../lib/utils';
import { PayPalIcon, CheckCircleIcon, ArrowRightIcon, CoinsIcon } from '../Icons';

interface FundingTabProps {
  group: Group;
  onInitiatePayPalContribution: (member: Member, amount: number) => void;
}

export function FundingTab({ group, onInitiatePayPalContribution }: FundingTabProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    group.members?.[0]?.id || ''
  );
  const [customAmount, setCustomAmount] = useState<string>('500.00');

  const summary = group.summary || {
    totalExpectedContribution: 0,
    totalContributionsCompleted: 0,
    potBalance: 0,
  };

  const progressPct =
    summary.totalExpectedContribution > 0
      ? Math.min(
          100,
          Math.round(
            (summary.totalContributionsCompleted /
              summary.totalExpectedContribution) *
              100
          )
        )
      : 100;

  const targetDual = formatDualCurrency(summary.totalExpectedContribution);
  const fundedDual = formatDualCurrency(summary.totalContributionsCompleted);

  return (
    <div className="space-y-6">
      {/* PayPal Pot Funding Progress Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#003087]">
                <PayPalIcon className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  PayPal Pot Funding (FR2)
                </h2>
                <p className="text-xs text-zinc-500">
                  Vendors pool funds into a shared transparent PayPal Sandbox holding pot
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-500 font-medium">Pot Progress</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {progressPct}%{' '}
              <span className="text-xs font-normal text-zinc-500">
                ({fundedDual.usd} of {targetDual.usd})
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-600">
              ≈ {fundedDual.ngn}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-zinc-500">
          <span>Target Budget: {targetDual.usd}</span>
          <span className="text-emerald-600 font-medium">
            {summary.totalContributionsCompleted >= summary.totalExpectedContribution
              ? '✓ Target Fully Funded'
              : 'Funding in Progress'}
          </span>
        </div>
      </div>

      {/* Interactive PayPal Sandbox Contribution Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <CoinsIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Fund Pot via PayPal Sandbox
          </h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Simulate or execute a vendor payment using the PayPal Orders API and immediate Capture webhook recording.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Vendor Member
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {group.members?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.name} ({formatDualCurrency(m.contributionExpected).usd})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Contribution Amount ($ USD)
            </label>
            <input
              type="number"
              step="10.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full text-xs font-mono font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 500.00"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                const member = group.members?.find((m) => m.id === selectedMemberId);
                if (member && parseFloat(customAmount) > 0) {
                  onInitiatePayPalContribution(member, parseFloat(customAmount));
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-bold py-2.5 px-4 shadow transition-colors"
            >
              <PayPalIcon className="w-4 h-4" />
              Pay via PayPal Sandbox
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contributions Audit Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          Vendor Contributions & Sandbox Transaction IDs
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Every contribution is tied to an immutable PayPal Order and Capture reference.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vendor Member</th>
                <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                <th className="py-2.5 px-3 text-right">₦ Display Value</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 font-mono">PayPal Order ID</th>
                <th className="py-2.5 px-3 font-mono">PayPal Capture ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {group.members?.flatMap((m) =>
                (m.contributions || []).map((c) => {
                  const dual = formatDualCurrency(c.amount);
                  const badge = getStatusBadge(c.status);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-3 text-zinc-500">{formatDate(c.createdAt)}</td>
                      <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {m.user.name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {dual.usd}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-600 font-medium">
                        {dual.ngn}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                        {c.paypalOrderId}
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                        {c.paypalCaptureId || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
