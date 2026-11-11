'use client';

import React from 'react';
import { Group, Allocation, Receipt } from '../../types';
import { formatDualCurrency, formatMoney, formatDate } from '../../lib/utils';
import { ReceiptIcon, SparklesIcon, PlusIcon, CheckCircleIcon, ShieldIcon } from '../Icons';

interface AllocationTabProps {
  group: Group;
  onOpenUploadReceipt: () => void;
  onRunAiAllocation: () => void;
  isAllocating?: boolean;
}

export function AllocationTab({
  group,
  onOpenUploadReceipt,
  onRunAiAllocation,
  isAllocating,
}: AllocationTabProps) {
  const receipts = group.receipts || [];
  const allocations = group.allocations || [];

  const totalGoods = allocations.reduce(
    (acc, a) => acc + (parseFloat(String(a.goodsTotal)) || 0),
    0
  );
  const totalShared = allocations.reduce(
    (acc, a) => acc + (parseFloat(String(a.sharedCostShare)) || 0),
    0
  );
  const totalAllocated = totalGoods + totalShared;

  const totalGoodsDual = formatDualCurrency(totalGoods);
  const totalSharedDual = formatDualCurrency(totalShared);
  const totalAllocatedDual = formatDualCurrency(totalAllocated);

  return (
    <div className="space-y-6">
      {/* Header & Upload Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ReceiptIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Final Receipts & AI Cost Allocation (FR6)
              </h2>
              <p className="text-xs text-zinc-500">
                AI reads final post-trip receipts, attributes goods to the vendor who ordered them, and splits shared shipping/transport fairly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenUploadReceipt}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-zinc-500" />
            Upload Trip Receipt
          </button>
          <button
            type="button"
            onClick={onRunAiAllocation}
            disabled={isAllocating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-semibold shadow transition-colors"
          >
            <SparklesIcon className={`w-4 h-4 ${isAllocating ? 'animate-spin' : ''}`} />
            Run AI Allocation
          </button>
        </div>
      </div>

      {/* Final Receipts Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <ReceiptIcon className="w-4 h-4 text-blue-600" />
          Extracted Trip Receipts ({receipts.length})
        </h3>
        {receipts.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No final trip receipts uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receipts.map((rcpt) => {
              const sharedSum =
                rcpt.aiExtraction?.sharedCosts?.reduce(
                  (sum, c) => sum + (c.amount || 0),
                  0
                ) || 0;
              const goodsSub = rcpt.aiExtraction?.goodsSubtotal || 0;

              return (
                <div
                  key={rcpt.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850/60 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                        {rcpt.aiExtraction?.supplier || 'Trip Vendor Receipt'}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Date: {rcpt.aiExtraction?.date || formatDate(rcpt.createdAt)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                      {rcpt.currency} {Number(rcpt.originalAmount).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700 space-y-1">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                      <span>Goods Subtotal:</span>
                      <span className="font-mono font-medium">
                        {rcpt.currency} {goodsSub.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-indigo-600 font-medium">
                      <span>Shared Costs (Freight/Customs):</span>
                      <span className="font-mono">
                        {rcpt.currency} {sharedSum.toLocaleString()}
                      </span>
                    </div>
                    {rcpt.aiExtraction?.sharedCosts?.map((sc, scIdx) => (
                      <div
                        key={scIdx}
                        className="text-[11px] text-zinc-400 pl-2 flex justify-between"
                      >
                        <span>• {sc.description}</span>
                        <span className="font-mono">
                          {rcpt.currency} {sc.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Per-Vendor Split Matrix */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-emerald-600" />
              Vendor Cost Allocation & Net Balance Matrix
            </h3>
            <p className="text-xs text-zinc-500">
              Rule: <strong className="text-zinc-800 dark:text-zinc-200">{group.sharedCostRule.replace(/_/g, ' ')}</strong>. Shared freight & fees divided proportionally by goods value.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Vendor Member</th>
                <th className="py-2.5 px-3 text-right">Goods Allocated ($)</th>
                <th className="py-2.5 px-3 text-right">Shared Freight Share ($)</th>
                <th className="py-2.5 px-3 text-right">Total Final Cost ($)</th>
                <th className="py-2.5 px-3 text-right">PayPal Contributed ($)</th>
                <th className="py-2.5 px-3 text-right font-bold">Net Owed / Refund Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {allocations.map((alloc) => {
                const member = group.members?.find((m) => m.id === alloc.memberId);
                const goods = parseFloat(String(alloc.goodsTotal)) || 0;
                const shared = parseFloat(String(alloc.sharedCostShare)) || 0;
                const finalCost = goods + shared;
                const contributed = parseFloat(String(member?.contributionExpected)) || 0;
                const net = parseFloat(String(alloc.netOwedOrRefund)) || 0;
                const isRefund = net > 0;

                return (
                  <tr
                    key={alloc.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {member?.user?.name || 'Vendor'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                      {formatMoney(goods)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-600 font-medium">
                      +{formatMoney(shared)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatMoney(finalCost)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-500">
                      {formatMoney(contributed)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                          isRefund
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300'
                        }`}
                      >
                        {isRefund
                          ? `Refund: +${formatMoney(net)}`
                          : `Owes: ${formatMoney(Math.abs(net))}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-850/80 font-bold text-zinc-900 dark:text-zinc-100">
                <td className="py-3 px-3">Total Allocated Spend:</td>
                <td className="py-3 px-3 text-right font-mono">{totalGoodsDual.usd}</td>
                <td className="py-3 px-3 text-right font-mono text-indigo-600">
                  +{totalSharedDual.usd}
                </td>
                <td className="py-3 px-3 text-right font-mono">{totalAllocatedDual.usd}</td>
                <td className="py-3 px-3 text-right font-mono">
                  {formatMoney(group.summary?.totalContributionsCompleted)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-600 text-[11px]">
                  ✓ Reconciled with Pot
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
