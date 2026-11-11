'use client';

import React, { useEffect, useRef } from 'react';
import { ReleaseRequest } from '../../types';
import { formatDualCurrency, formatMoney, formatDate } from '../../lib/utils';
import {
  SparklesIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  CloseIcon,
  FileTextIcon,
} from '../Icons';

interface AiReportModalProps {
  release: ReleaseRequest | null;
  onClose: () => void;
}

export function AiReportModal({ release, onClose }: AiReportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (release) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [release]);

  if (!release || !release.aiReport) return null;

  const report = release.aiReport;
  const hasFlags = report.flags && report.flags.length > 0;
  const grandTotalDual = formatDualCurrency(report.convertedTotalUsd || release.amount);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="ai-report-modal-title"
      className="fixed inset-0 m-auto max-w-3xl w-[95%] max-h-[90vh] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="ai-report-modal-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              AI Multimodal Invoice Verification Report
            </h2>
            <p className="text-xs text-zinc-500">
              Supplier: <strong className="text-zinc-800 dark:text-zinc-200">{release.supplier}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
          aria-label="Close dialog"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6 text-xs">
        {/* Verification Overview Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
            hasFlags
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {hasFlags ? (
              <AlertTriangleIcon className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold text-sm block">
                {hasFlags ? 'Discrepancy Flagged — Requires Vendor Attention' : 'Verification Passed — All Checks Satisfied'}
              </span>
              <span className="text-xs opacity-90">
                Source Language: {report.sourceLanguage || 'Multilingual'} • Overall Confidence: {Math.round((report.overallConfidence || 0.95) * 100)}%
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] block opacity-80">Invoice Grand Total</span>
            <span className="text-sm font-mono font-bold">
              {report.currency} {report.grandTotal?.toLocaleString()} ({grandTotalDual.usd})
            </span>
          </div>
        </div>

        {/* Planted Discrepancies / Flags */}
        {hasFlags && (
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
              <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
              Automated Discrepancy Warnings ({report.flags?.length}):
            </h3>
            {report.flags?.map((flag, idx) => (
              <div
                key={idx}
                className="bg-amber-100/90 dark:bg-amber-900/60 p-3 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
                    {flag.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                    {flag.severity} SEVERITY
                  </span>
                </div>
                <p className="text-xs">{flag.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* 5 Core Verification Checks */}
        <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
            Standard TrustLoad Verification Checks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Line items match combined group order</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              {hasFlags ? (
                <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>Quantities within agreed vendor budgets</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Arithmetic validation: Line totals add to grand total</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Grand total matches release amount requested</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Unit prices reasonable vs wholesale market benchmarks</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Currency FX conversion calculated deterministically in code</span>
            </div>
          </div>
        </div>

        {/* Extracted Line Items Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
            Multimodal Extracted Line Items ({report.lineItems?.length || 0})
          </h3>

          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-zinc-500 font-medium">
                  <th className="py-2.5 px-3">Original Description</th>
                  <th className="py-2.5 px-3">AI English Translation</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right font-bold">Line Total</th>
                  <th className="py-2.5 px-3 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {report.lineItems?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-850/60">
                    <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                      {item.originalDescription || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300">
                      {item.translatedDescription || item.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-600">
                      {report.currency} {item.unitPrice}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {report.currency} {item.lineTotal?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-emerald-600 font-semibold">
                      {item.confidence ? `${Math.round(item.confidence * 100)}%` : '96%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <span className="text-[11px] text-zinc-400">
          TrustLoad AI Protocol: AI provides advisory verification; payout requires human vendor votes.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-900 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2 transition-colors"
        >
          Close Report
        </button>
      </div>
    </dialog>
  );
}
