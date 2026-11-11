'use client';

import React, { useState } from 'react';
import { Group, CombinedOrderItem, Member } from '../../types';
import { formatDualCurrency, formatMoney, getStatusBadge } from '../../lib/utils';
import { UsersIcon, FileTextIcon, PlusIcon, PayPalIcon, CheckCircleIcon } from '../Icons';

interface TripOrdersTabProps {
  group: Group;
  combinedOrders: CombinedOrderItem[];
  onOpenAddMember: () => void;
  onOpenAddOrder: (member: Member) => void;
}

export function TripOrdersTab({
  group,
  combinedOrders,
  onOpenAddMember,
  onOpenAddOrder,
}: TripOrdersTabProps) {
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('ALL');

  const filteredMembers =
    selectedMemberFilter === 'ALL'
      ? group.members || []
      : group.members?.filter((m) => m.id === selectedMemberFilter) || [];

  return (
    <div className="space-y-6">
      {/* Trip Rules & Governance Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          Trip Governance & Order Protocol (FR1)
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-zinc-500 font-medium">Designated Traveler</span>
            <div className="mt-1 font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              {group.traveler?.name}
            </div>
            <div className="text-zinc-400 font-mono text-[11px] truncate">
              {group.traveler?.email}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-zinc-500 font-medium">Staged Release Rule</span>
            <div className="mt-1 font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              {group.approvalThreshold} of {group.members?.length || 5} Vendor Approvals
            </div>
            <div className="text-zinc-400 text-[11px]">
              No PayPal payout released without human consensus
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-zinc-500 font-medium">Shared Cost Allocation</span>
            <div className="mt-1 font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              {group.sharedCostRule.replace(/_/g, ' ')}
            </div>
            <div className="text-zinc-400 text-[11px]">
              Freight, excess luggage & customs split proportionally
            </div>
          </div>
        </div>
      </div>

      {/* Combined Group Orders (Aggregated View) */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-indigo-600" />
              Combined Trip Shopping List (What the Traveler Must Buy)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Aggregated across all {group.members?.length} contributing vendors for bulk wholesale negotiation
            </p>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {combinedOrders.length} Unique SKUs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Total Qty</th>
                <th className="py-2.5 px-3 text-right">Combined Budget (USD)</th>
                <th className="py-2.5 px-3 text-right">₦ Display Value</th>
                <th className="py-2.5 px-3">Ordering Vendors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {combinedOrders.map((order, idx) => {
                const dual = formatDualCurrency(order.totalBudget);
                return (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {order.item}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {order.totalQuantity} units
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {dual.usd}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {dual.ngn}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {order.vendorDetails?.map((v, vIdx) => (
                          <span
                            key={vIdx}
                            className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                          >
                            {v.memberName} ({v.quantity})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Roster & Individual Member Orders */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-600" />
              Vendor Members ({group.members?.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Each vendor&apos;s contribution committed to the PayPal pot and their specific item order lines
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddMember}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Vendor Member
          </button>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const hasPaid = member.contributions?.some((c) => c.status === 'COMPLETED');
            const expectedDual = formatDualCurrency(member.contributionExpected);
            const totalLines = member.orderLines?.length || 0;

            return (
              <div
                key={member.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/50 p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {member.user.name}
                      </h4>
                      <p className="text-xs text-zinc-500 font-mono">{member.user.email}</p>
                    </div>
                    {hasPaid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Funded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="mt-3 bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Expected Contribution:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {expectedDual.usd}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-mono text-[11px]">
                      <span>₦ Equivalent:</span>
                      <span>{expectedDual.ngn}</span>
                    </div>
                  </div>

                  {/* Order Lines for this Member */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Ordered Items ({totalLines}):
                    </span>
                    <ul className="mt-1 space-y-1 text-xs">
                      {member.orderLines?.map((line) => (
                        <li
                          key={line.id}
                          className="flex justify-between items-center text-zinc-700 dark:text-zinc-300 bg-white/60 dark:bg-zinc-900/40 px-2 py-1 rounded border border-zinc-100 dark:border-zinc-800"
                        >
                          <span className="truncate pr-2">
                            {line.quantity}x {line.item}
                          </span>
                          <span className="font-mono text-zinc-500 text-[11px]">
                            {formatMoney(line.budget)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenAddOrder(member)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
