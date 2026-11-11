'use client';

import React from 'react';
import { Group, ReleaseRequest, Member } from '../../types';
import { formatDualCurrency, formatDate, getStatusBadge } from '../../lib/utils';
import {
  SparklesIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  PayPalIcon,
  PlusIcon,
  FileTextIcon,
  ArrowRightIcon,
} from '../Icons';

interface ReleasesTabProps {
  group: Group;
  activePersona: { role: 'TRAVELER' | 'VENDOR' | 'AUDITOR'; memberId?: string; name: string };
  onOpenSubmitRelease: () => void;
  onOpenAiReport: (release: ReleaseRequest) => void;
  onApproveRelease: (releaseId: string, memberId: string, decision: 'APPROVED' | 'REJECTED') => void;
  onTriggerPayout: (releaseId: string) => void;
}

export function ReleasesTab({
  group,
  activePersona,
  onOpenSubmitRelease,
  onOpenAiReport,
  onApproveRelease,
  onTriggerPayout,
}: ReleasesTabProps) {
  const releases = group.releaseRequests || [];
  const activeMember = group.members?.find((m) => m.id === activePersona.memberId);

  return (
    <div className="space-y-6">
      {/* Traveler Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <SparklesIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Staged Releases & AI Invoice Verification (FR3 / FR4 / FR5)
              </h2>
              <p className="text-xs text-zinc-500">
                Traveler uploads multilingual supplier invoices. AI verifies quantities and totals before vendors vote on staged PayPal payouts.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSubmitRelease}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 shadow transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Submit Staged Release Request
        </button>
      </div>

      {/* Release Requests Cards */}
      <div className="space-y-4">
        {releases.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <FileTextIcon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              No staged release requests submitted yet.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              The traveler can click &apos;Submit Staged Release Request&apos; to upload an invoice.
            </p>
          </div>
        ) : (
          releases.map((release) => {
            const dual = formatDualCurrency(release.amount);
            const statusBadge = getStatusBadge(release.status);
            const approvals = release.approvals || [];
            const approvedCount = approvals.filter((a) => a.decision === 'APPROVED').length;
            const threshold = group.approvalThreshold || 3;
            const isThresholdMet = approvedCount >= threshold;
            const hasFlags =
              release.aiReport?.flags && release.aiReport.flags.length > 0;
            const userHasVoted = activeMember
              ? approvals.some((a) => a.memberId === activeMember.id)
              : false;

            return (
              <div
                key={release.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-4"
              >
                {/* Release Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Submitted: {formatDate(release.createdAt)}
                      </span>
                      {release.sourceLanguage && (
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                          🌐 Lang: {release.sourceLanguage}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {release.supplier || 'Unknown Supplier'}
                    </h3>
                  </div>

                  {/* Amounts */}
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                      {dual.usd}
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ≈ {dual.ngn}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      Original: {release.currency} {Number(release.originalAmount).toLocaleString()} (FX: {Number(release.fxRate).toFixed(4)})
                    </div>
                  </div>
                </div>

                {/* AI Verification Match Report Summary */}
                {release.aiReport && (
                  <div
                    className={`p-4 rounded-xl border ${
                      hasFlags
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <SparklesIcon
                          className={`w-4 h-4 ${
                            hasFlags ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          AI Multimodal Verification Report
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          Confidence: {Math.round((release.aiReport.overallConfidence || 0.95) * 100)}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenAiReport(release)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                      >
                        View Full Extraction & Line Items
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    </div>

                    {/* AI Flags & Discrepancies Alert */}
                    {hasFlags ? (
                      <div className="space-y-1.5 mt-2">
                        {release.aiReport.flags?.map((flag, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-start gap-2 bg-amber-100/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 p-2.5 rounded-lg text-xs"
                          >
                            <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold uppercase tracking-wider text-[11px] block">
                                {flag.code} ({flag.severity} Priority Discrepancy)
                              </strong>
                              <span>{flag.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          All AI verification checks passed: item descriptions match group orders, quantities within limits, arithmetic totals add up accurately.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Governance: Approval Progress & Payout Release */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {/* Approval Progress */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Vendor Approvals:
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: threshold }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            i < approvedCount
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          ✓
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-zinc-500">
                      ({approvedCount}/{threshold} required)
                    </span>
                  </div>

                  {/* Actions according to Persona and Status */}
                  <div className="flex items-center gap-2">
                    {release.status === 'RELEASED' ? (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <PayPalIcon className="w-4 h-4" />
                        <span>PayPal Payout Complete:</span>
                        <span className="font-mono text-[11px]">
                          {release.paypalPayoutId}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Vendor Approval Actions */}
                        {activePersona.role === 'VENDOR' && activeMember && !userHasVoted && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onApproveRelease(release.id, activeMember.id, 'APPROVED')
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-semibold text-xs shadow-sm transition-colors"
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Approve ({activeMember.user.name})
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onApproveRelease(release.id, activeMember.id, 'REJECTED')
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 font-semibold text-xs shadow-sm transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {userHasVoted && (
                          <span className="text-zinc-500 italic text-[11px]">
                            ✓ You have voted on this release
                          </span>
                        )}

                        {/* Staged Payout Trigger */}
                        {isThresholdMet && (
                          <button
                            type="button"
                            onClick={() => onTriggerPayout(release.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0070BA] hover:bg-[#003087] text-white px-3.5 py-1.5 font-bold text-xs shadow transition-colors"
                          >
                            <PayPalIcon className="w-4 h-4" />
                            Execute Staged PayPal Payout ({dual.usd})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
