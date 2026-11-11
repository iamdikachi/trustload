'use client';

import React, { useState } from 'react';
import { Group } from '../../types';
import { formatDualCurrency, formatMoney, getStatusBadge } from '../../lib/utils';
import { PayPalIcon, ShieldIcon, CheckCircleIcon, ArrowRightIcon } from '../Icons';

interface SettlementTabProps {
  group: Group;
  onExecuteSettlement: () => void;
  isSettling?: boolean;
}

export function SettlementTab({
  group,
  onExecuteSettlement,
  isSettling,
}: SettlementTabProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const allocations = group.allocations || [];
  const statusBadge = getStatusBadge(group.status);
  const isClosed = group.status === 'CLOSED';

  // Calculate total refunds to be sent
  const totalRefundAmount = allocations.reduce((acc, a) => {
    const net = parseFloat(String(a.netOwedOrRefund)) || 0;
    return net > 0 ? acc + net : acc;
  }, 0);

  const totalRefundDual = formatDualCurrency(totalRefundAmount);

  return (
    <div className="space-y-6">
      {/* Settlement Overview Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-xs text-zinc-500">Trip Settlement Protocol (FR7)</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Trip Closeout & PayPal Refund Engine
            </h2>
            <p className="text-xs text-zinc-500 max-w-2xl">
              When the buying trip ends, remaining pot funds are automatically refunded to vendors through the PayPal Refund API, and the group closes with a balanced, verifiable zero-sum ledger.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-500 font-medium">Refunds Total</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalRefundDual.usd}
            </div>
            <div className="text-xs font-semibold text-emerald-700">
              ≈ {totalRefundDual.ngn}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isClosed ? (
          <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-100">Ready to conclude this run?</strong>{' '}
              Clicking below dispatches PayPal sandbox refunds to vendors owed leftover funds and seals the audit trail.
            </div>

            {showConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    onExecuteSettlement();
                  }}
                  disabled={isSettling}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 shadow transition-colors"
                >
                  <PayPalIcon className="w-4 h-4" />
                  Confirm & Execute PayPal Refunds
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isSettling}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-bold py-2.5 px-4 shadow transition-colors"
              >
                <PayPalIcon className="w-4 h-4" />
                Settle Group & Execute PayPal Refunds
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            Group trip successfully closed. All refunds issued via PayPal Sandbox and ledger is balanced.
          </div>
        )}
      </div>

      {/* Per-Vendor Refund & Closeout Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Per-Vendor Settlement Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3 text-right">Pot Contribution ($)</th>
                <th className="py-2.5 px-3 text-right">Final Verified Spend ($)</th>
                <th className="py-2.5 px-3 text-right">Net Owed / Refund ($)</th>
                <th className="py-2.5 px-3">Settlement Resolution</th>
                <th className="py-2.5 px-3 font-mono">PayPal Transaction Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {allocations.map((alloc) => {
                const member = group.members?.find((m) => m.id === alloc.memberId);
                const goods = parseFloat(String(alloc.goodsTotal)) || 0;
                const shared = parseFloat(String(alloc.sharedCostShare)) || 0;
                const spend = goods + shared;
                const contributed = parseFloat(String(member?.contributionExpected)) || 0;
                const net = parseFloat(String(alloc.netOwedOrRefund)) || 0;
                const isRefund = net > 0;
                const initialContrib = member?.contributions?.[0];

                return (
                  <tr
                    key={alloc.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {member?.user?.name || 'Vendor'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {formatMoney(contributed)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-800 dark:text-zinc-200">
                      {formatMoney(spend)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={isRefund ? 'text-emerald-600' : 'text-rose-600'}>
                        {isRefund ? `+${formatMoney(net)}` : formatMoney(net)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {isRefund ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <PayPalIcon className="w-3.5 h-3.5" />
                          PayPal Refund ({formatMoney(net)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-medium text-zinc-600 dark:text-zinc-400">
                          Fully Absorbed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                      {initialContrib?.paypalCaptureId
                        ? `REF-PPL-${initialContrib.paypalCaptureId.slice(-8)}`
                        : 'PAYPAL-REF-PENDING'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
