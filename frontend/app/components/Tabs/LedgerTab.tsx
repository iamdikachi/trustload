'use client';

import React, { useState } from 'react';
import { Group, LedgerEntry } from '../../types';
import { formatDualCurrency, formatMoney, formatDate } from '../../lib/utils';
import { ShieldIcon, PayPalIcon, DownloadIcon, FileTextIcon } from '../Icons';

interface LedgerTabProps {
  group: Group;
}

export function LedgerTab({ group }: LedgerTabProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const entries = group.ledgerEntries || [];

  const filteredEntries = entries.filter((entry) => {
    if (filterType !== 'ALL' && entry.type !== filterType) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const descMatch = (entry.description || '').toLowerCase().includes(term);
    const refMatch = (entry.paypalRef || '').toLowerCase().includes(term);
    const memberMatch = (entry.member?.user?.name || '').toLowerCase().includes(term);
    return descMatch || refMatch || memberMatch;
  });

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Type',
      'Description',
      'Vendor / Member',
      'Base Amount (USD)',
      'Original Amount',
      'Currency',
      'FX Rate',
      'PayPal Reference',
    ];

    const rows = filteredEntries.map((e) => [
      e.createdAt,
      e.type,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${e.member?.user?.name || 'Group'}"`,
      e.amount,
      e.originalAmount,
      e.currency,
      e.fxRate,
      e.paypalRef,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TrustLoad-Ledger-${group.id.slice(0, 8)}-${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Ledger Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              <ShieldIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Live Audited Immutable Ledger (FR8)
              </h2>
              <p className="text-xs text-zinc-500">
                Every dollar, yuan, dirham, and naira is recorded in an append-only verifiable transaction ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm transition-colors"
          >
            <DownloadIcon className="w-4 h-4 text-zinc-500" />
            Export Ledger CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'CONTRIBUTION', 'STAGED_RELEASE', 'RECEIPT_SPEND', 'REFUND'].map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {type === 'ALL' ? 'All Transactions' : type.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by vendor or PayPal ref..."
            className="w-full text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Vendor / Recipient</th>
                <th className="py-2.5 px-3 text-right">Base Amount (USD)</th>
                <th className="py-2.5 px-3 text-right">₦ Display Value</th>
                <th className="py-2.5 px-3 text-right">Original Amount & FX</th>
                <th className="py-2.5 px-3 font-mono">PayPal Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filteredEntries.map((entry) => {
                const isDebit = parseFloat(String(entry.amount)) < 0;
                const dual = formatDualCurrency(Math.abs(parseFloat(String(entry.amount))));
                const isCopied = copiedRef === entry.paypalRef;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          entry.type === 'CONTRIBUTION'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200'
                            : entry.type === 'STAGED_RELEASE'
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
                            : entry.type === 'REFUND'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {entry.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-medium max-w-xs truncate">
                      {entry.description || 'Ledger event'}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300 font-semibold whitespace-nowrap">
                      {entry.member?.user?.name || group.traveler?.name || 'Group Pot'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isDebit ? `-${dual.usd}` : `+${dual.usd}`}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {isDebit ? `-${dual.ngn}` : `+${dual.ngn}`}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap text-[11px]">
                      {entry.currency} {Number(entry.originalAmount).toLocaleString()}
                      {entry.currency !== 'USD' && (
                        <span className="block text-[10px] text-zinc-400">
                          Rate: {Number(entry.fxRate).toFixed(4)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopy(entry.paypalRef)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Click to copy PayPal Ref"
                      >
                        <PayPalIcon className="w-3 h-3" />
                        <span>{entry.paypalRef}</span>
                        {isCopied && <span className="text-emerald-500 text-[10px]">Copied!</span>}
                      </button>
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
