'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';
import { Modal } from './Modal';
import { Group, ReleaseRequest } from '../../types';
import { api } from '../../lib/api';

interface DashboardScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onApproveRelease?: (releaseRequestId?: string) => void;
  isReleaseApproved?: boolean;
  group?: Group | null;
  releaseRequests?: ReleaseRequest[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function DashboardScreen({
  onNavigate,
  onApproveRelease,
  isReleaseApproved = false,
  group,
  releaseRequests = [],
  isLoading = false,
  onRefresh,
  onNotify,
}: DashboardScreenProps) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [nudgedMemberId, setNudgedMemberId] = useState<string | null>(null);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTargetId, setDisputeTargetId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Quantity discrepancy against group order');
  const [isDisputing, setIsDisputing] = useState(false);

  // Add real member state inside Invite Modal
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberBudget, setNewMemberBudget] = useState('500');
  const [isAddingMember, setIsAddingMember] = useState(false);

  if (isLoading && !group) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#5b3fd1] border-t-transparent animate-spin" />
        <p className="text-sm text-[#484554] font-medium">Loading live trip data from PostgreSQL...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full py-16 text-center bg-white rounded-2xl border border-[#e6deff] p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#f2ebff] text-[#5b3fd1] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[28px]">flight_takeoff</span>
        </div>
        <h2 className="text-xl font-bold text-[#1d1833]">No Buying Trip Pools Yet</h2>
        <p className="text-sm text-[#484554] max-w-md mx-auto">
          Start a new trip pool to collect group funds, upload supplier invoices, and track every transaction.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('create-group')}
          className="px-5 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-sm font-bold shadow-sm cursor-pointer"
        >
          + Start New Trip Pool
        </button>
      </div>
    );
  }

  const currency = group.baseCurrency || 'USD';
  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ['USD', 'EUR', 'GBP', 'AED', 'NGN'].includes(currency) ? currency : 'USD',
      maximumFractionDigits: 2,
    }).format(val);

  const members = group.members || [];
  const summary = group.summary;

  const expectedTotal =
    summary?.totalExpectedContribution ??
    members.reduce((sum, m) => sum + Number(m.contributionExpected || 0), 0);

  const completedTotal =
    summary?.totalContributionsCompleted ??
    members.reduce(
      (sum, m) =>
        sum +
        (m.contributions || [])
          .filter((c) => c.status === 'COMPLETED')
          .reduce((s, c) => s + Number(c.amount || 0), 0),
      0
    );

  const netReleased = summary?.netSpend ?? summary?.totalReleased ?? 0;
  const potBalance = summary?.potBalance ?? Math.max(0, completedTotal - netReleased);
  const unpaidTotal = Math.max(0, expectedTotal - completedTotal);

  const denom = Math.max(expectedTotal, completedTotal, 1);
  const pctReleased = Math.min(100, Math.max(0, (netReleased / denom) * 100));
  const pctHeld = Math.min(100 - pctReleased, Math.max(0, (potBalance / denom) * 100));
  const pctUnpaid = Math.max(0, 100 - pctReleased - pctHeld);

  const allReleases =
    releaseRequests.length > 0
      ? releaseRequests
      : group.releaseRequests || group.pendingReleaseRequests || [];

  const pendingReleases = allReleases.filter(
    (r) =>
      r.status === 'AWAITING_APPROVAL' ||
      r.status === 'PENDING_VERIFICATION' ||
      r.status === 'PENDING'
  );
  const settledReleases = allReleases.filter(
    (r) => r.status === 'APPROVED' || r.status === 'RELEASED'
  );

  const primaryPending = pendingReleases[0] || null;
  const approvalThreshold = group.approvalThreshold || 1;

  const memberStatuses = members.map((m) => {
    const expected = Number(m.contributionExpected || 0);
    const paid = (m.contributions || [])
      .filter((c) => c.status === 'COMPLETED')
      .reduce((s, c) => s + Number(c.amount || 0), 0);
    return {
      id: m.id,
      name: m.user?.name || 'Member',
      email: m.user?.email || '',
      expected,
      paid,
      isPaid: expected > 0 ? paid >= expected : paid > 0,
      ordersSummary: (m.orderLines || []).map((o) => `${o.quantity}x ${o.item}`).join(', '),
    };
  });

  const paidMembersCount = memberStatuses.filter((m) => m.isPaid).length;
  const firstUnpaidMember = memberStatuses.find((m) => !m.isPaid);
  const shareToPay = firstUnpaidMember
    ? Math.max(0, firstUnpaidMember.expected - firstUnpaidMember.paid)
    : memberStatuses[0]?.expected || 0;

  const handleApproveClaim = async (req: ReleaseRequest) => {
    setApprovingId(req.id);
    try {
      if (onApproveRelease) {
        await onApproveRelease(req.id);
      }
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleConfirmDispute = async () => {
    if (!disputeTargetId) {
      setIsDisputeModalOpen(false);
      return;
    }
    setIsDisputing(true);
    try {
      const voterId = members[0]?.id;
      if (voterId) {
        await api.submitApproval(disputeTargetId, {
          memberId: voterId,
          decision: 'REJECTED',
          comment: disputeReason,
        });
      }
      if (onNotify) {
        onNotify('Dispute recorded on the release claim.', 'info');
      }
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err: any) {
      if (onNotify) {
        onNotify(err?.message || 'Failed to record dispute.', 'error');
      }
    } finally {
      setIsDisputing(false);
      setIsDisputeModalOpen(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    setIsAddingMember(true);
    try {
      await api.addMemberToGroup(group.id, {
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        contributionExpected: Number(newMemberBudget) || 500,
      });
      setNewMemberName('');
      setNewMemberEmail('');
      if (onNotify) {
        onNotify(`${newMemberName.trim()} added to "${group.name}"!`, 'success');
      }
      if (onRefresh) {
        await onRefresh();
      }
      setIsInviteModalOpen(false);
    } catch (err: any) {
      if (onNotify) {
        onNotify(err?.message || 'Could not add member to pool.', 'error');
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?view=app&screen=pay-contribution&groupId=${group.id}`
      : `https://trustload.network/join/${group.id.slice(0, 8)}`;

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Quick Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e6deff]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#1d1833] tracking-tight">
              {group.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                group.status === 'CLOSED'
                  ? 'bg-zinc-100 text-zinc-700'
                  : 'bg-[#ece4ff] text-[#431fb9]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  group.status === 'CLOSED' ? 'bg-zinc-500' : 'bg-[#431fb9] animate-pulse'
                }`}
              />
              {group.status}
            </span>
          </div>
          <p className="text-[12px] text-[#797586] mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Traveler: <strong>{group.traveler?.name || 'Assigned Traveler'}</strong>
            </span>
            <span>•</span>
            <span>Pool #{group.id.slice(0, 8).toUpperCase()}</span>
            <span>•</span>
            <span className="font-semibold text-[#431fb9]">
              Consensus Quorum: {approvalThreshold} of {members.length} votes required
            </span>
          </p>
        </div>

        {/* Clear Primary Navigation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('pay-contribution')}
            className="px-4 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[17px]">payments</span>
            <span>{shareToPay > 0 ? `Pay Share (${formatMoney(shareToPay)})` : 'Add Contribution'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('new-release')}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#f2ebff] text-[#1d1833] text-[13px] font-semibold border border-[#e6deff] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[17px] text-[#5b3fd1]">receipt_long</span>
            <span>Upload Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-3 py-2.5 rounded-xl bg-[#f2ebff] hover:bg-[#e6deff] text-[#431fb9] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Add or invite group members"
          >
            <span className="material-symbols-outlined text-[17px]">group_add</span>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic "Next Action" Callout Banner */}
      {primaryPending && !isReleaseApproved ? (
        <div className="bg-[#f7f1ff] border-2 border-[#5b3fd1] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#5b3fd1] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">how_to_vote</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold uppercase tracking-wider">
                  Action Required
                </span>
                <span className="text-[12px] font-semibold text-[#431fb9]">
                  {primaryPending.approvals?.length || 0} of {approvalThreshold} votes collected
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d1833] mt-0.5">
                {primaryPending.supplier || 'Supplier Invoice'} · {primaryPending.currency}{' '}
                {Number(primaryPending.originalAmount || 0).toLocaleString()} ({formatMoney(Number(primaryPending.amount || 0))})
              </h3>
              <p className="text-[12px] text-[#484554] mt-0.5">
                Traveler {group.traveler?.name || ''} submitted this purchase claim. Review AI audit findings and cast your vote.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('review-approve')}
              className="px-4 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <span>Review &amp; Vote</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      ) : firstUnpaidMember ? (
        <div className="bg-[#fffbeb] border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-700 text-[24px]">payments</span>
            <div>
              <span className="text-[13px] font-bold text-amber-900">
                Funding In Progress ({paidMembersCount} of {members.length} members paid)
              </span>
              <p className="text-[12px] text-amber-800">
                {firstUnpaidMember.name} still owes {formatMoney(firstUnpaidMember.expected - firstUnpaidMember.paid)} to complete the pool target.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pay-contribution')}
            className="px-4 py-2 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[12px] font-bold cursor-pointer shrink-0"
          >
            Pay Contribution →
          </button>
        </div>
      ) : (
        <div className="bg-[#dcfce7] border border-[#22c55e]/50 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#15803d] text-[26px]">check_circle</span>
            <div>
              <span className="text-[13px] font-bold text-[#15803d]">
                Pool Funded &amp; Up to Date
              </span>
              <p className="text-[11px] text-[#166534]">
                All {members.length} members have funded their shares and no pending release claims require review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ledger')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#22c55e]/40 text-[#15803d] text-[12px] font-bold hover:bg-emerald-50 cursor-pointer"
          >
            View Ledger →
          </button>
        </div>
      )}

      {/* 3. Three High-Level Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#797586]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pot Vault Balance</span>
            <div className="w-8 h-8 rounded-lg bg-[#f2ebff] text-[#5b3fd1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-[#1d1833] tracking-tight">
              {formatMoney(potBalance)}
            </div>
            <p className="text-[11px] text-[#484554] mt-1">
              Current net vault balance in {currency}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#797586]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pledges Collected</span>
            <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#15803d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-[#1d1833] tracking-tight">
              {formatMoney(completedTotal)}
            </div>
            <p className="text-[11px] text-[#484554] mt-1">
              of {formatMoney(expectedTotal)} target ({paidMembersCount} of {members.length} members)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#797586]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Vendor Spend</span>
            <div className="w-8 h-8 rounded-lg bg-[#ece4ff] text-[#431fb9] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-[#1d1833] tracking-tight">
              {formatMoney(netReleased)}
            </div>
            <p className="text-[11px] text-[#484554] mt-1">
              {settledReleases.length} approved release{settledReleases.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Single Clean Visual Liquidity Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
          <span className="font-bold text-[#1d1833]">
            Total Pool Target: {formatMoney(expectedTotal)}
          </span>
          <span className="text-[11px] text-[#797586]">
            Quorum: <strong>{approvalThreshold} of {members.length} votes</strong> • Shared Rule: <strong>{group.sharedCostRule}</strong>
          </span>
        </div>

        <div className="w-full h-3.5 bg-[#f2ebff] rounded-full overflow-hidden flex p-0.5 gap-1">
          <div className="h-full bg-[#431fb9] rounded-l-full transition-all" style={{ width: `${pctReleased}%` }} />
          <div className="h-full bg-[#7c5be8] transition-all" style={{ width: `${pctHeld}%` }} />
          <div className="h-full bg-[#e6deff] rounded-r-full transition-all" style={{ width: `${pctUnpaid}%` }} />
        </div>

        <div className="flex items-center justify-between gap-3 text-[11px] text-[#484554] pt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#431fb9]" />
            <span>Net Spend: <strong>{formatMoney(netReleased)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c5be8]" />
            <span>Pot Balance: <strong>{formatMoney(potBalance)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e6deff]" />
            <span>Unpaid Pledges: <strong>{formatMoney(unpaidTotal)}</strong></span>
          </div>
        </div>
      </div>

      {/* 5. Main 2-Column Split: Active Invoices vs. Member Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Purchases & Releases (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#1d1833]">
                Purchases &amp; Release Claims
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
                {pendingReleases.length} Pending
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('review-approve')}
              className="text-[12px] font-bold text-[#5b3fd1] hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
            >
              <span>View all</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {primaryPending ? (
            <div className="rounded-2xl bg-white border border-[#e6deff] p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f2ebff] text-[#431fb9] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">storefront</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1d1833]">
                      {primaryPending.supplier || 'Supplier Claim'}
                    </h3>
                    <p className="text-[12px] text-[#797586]">
                      Submitted by {group.traveler?.name || 'Traveler'} • {new Date(primaryPending.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-[#1d1833]">
                    {primaryPending.currency} {Number(primaryPending.originalAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#797586] font-medium">
                    ≈ {formatMoney(Number(primaryPending.amount || 0))}
                  </div>
                </div>
              </div>

              {/* AI Audit Findings Summary */}
              {primaryPending.aiReport && (
                <div className="rounded-xl bg-[#f7f1ff] p-3.5 border border-[#e6deff] space-y-2 text-[12px]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#5b3fd1]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      AI Audit Findings
                    </span>
                    {primaryPending.aiReport.overallConfidence && (
                      <span className="text-[#15803d] font-semibold bg-[#dcfce7] px-2 py-0.2 rounded-full text-[10px]">
                        {Math.round(primaryPending.aiReport.overallConfidence * 100)}% Confidence
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[#484554]">
                    {(primaryPending.aiReport.flags || []).map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-amber-600 text-[15px] shrink-0 mt-0.5">warning</span>
                        <span>{flag.message}</span>
                      </li>
                    ))}
                    {(!primaryPending.aiReport.flags || primaryPending.aiReport.flags.length === 0) && (
                      <li className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[#15803d] text-[15px] shrink-0 mt-0.5">check_circle</span>
                        <span>Invoice line items match group manifest specifications.</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Quorum Votes Row & Decision Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#1d1833]">Quorum:</span>
                  <span className="text-[12px] font-bold text-[#431fb9]">
                    {primaryPending.approvals?.length || 0} of {approvalThreshold} Required Votes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDisputeTargetId(primaryPending.id);
                      setIsDisputeModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#e6deff] text-[#484554] hover:bg-[#f2ebff] text-[12px] font-semibold cursor-pointer transition-colors"
                  >
                    Dispute
                  </button>
                  <button
                    type="button"
                    disabled={approvingId === primaryPending.id}
                    onClick={() => handleApproveClaim(primaryPending)}
                    className="px-4 py-1.5 rounded-lg text-white text-[12px] font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-colors bg-[#5b3fd1] hover:bg-[#431fb9] disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock_open</span>
                    <span>
                      {approvingId === primaryPending.id
                        ? 'Recording...'
                        : `Approve (${formatMoney(Number(primaryPending.amount || 0))})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-[#e6deff] p-6 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1d1833]">No Pending Release Claims</p>
              <p className="text-xs text-[#797586]">
                Upload a supplier invoice to initiate an AI check and group payout vote.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('new-release')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#f2ebff] text-[#431fb9] text-xs font-bold hover:bg-[#e6deff] cursor-pointer"
              >
                + Upload Supplier Invoice
              </button>
            </div>
          )}

          {/* Settled Purchases List */}
          {settledReleases.map((rel) => (
            <div
              key={rel.id}
              className="rounded-xl bg-white border border-[#e6deff] p-3.5 flex items-center justify-between text-[12px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
                <div>
                  <span className="font-bold text-[#1d1833]">{rel.supplier || 'Verified Supplier'}</span>
                  <span className="text-[11px] text-[#797586] ml-2">
                    {rel.status} • {new Date(rel.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="font-bold text-[#1d1833] font-mono">
                {rel.currency} {Number(rel.originalAmount || 0).toLocaleString()}{' '}
                <span className="text-[#797586] font-normal text-[11px]">
                  ({formatMoney(Number(rel.amount || 0))})
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Member Contributions & Pledges (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#1d1833]">
              Member Contributions
            </h2>
            <span className="text-[12px] font-bold text-[#431fb9]">
              {paidMembersCount} of {members.length} Paid
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#e6deff] p-4 shadow-xs space-y-3">
            {/* Seat Progress Visualization */}
            {memberStatuses.length > 0 && (
              <div className="space-y-1.5 bg-[#fdf8ff] p-3 rounded-xl border border-[#e6deff]/60">
                <div className="flex justify-between text-[11px] font-semibold text-[#1d1833]">
                  <span>Member Seats Pledged</span>
                  <span className="text-[#15803d]">
                    {expectedTotal > 0 ? Math.min(100, Math.round((completedTotal / expectedTotal) * 100)) : 0}% Funded
                  </span>
                </div>
                <div
                  className="grid gap-1.5 h-2.5"
                  style={{ gridTemplateColumns: `repeat(${memberStatuses.length}, minmax(0, 1fr))` }}
                >
                  {memberStatuses.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xs ${m.isPaid ? 'bg-emerald-500' : 'bg-amber-300 animate-pulse'}`}
                      title={`${m.name}: ${formatMoney(m.paid)} / ${formatMoney(m.expected)}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Member List */}
            {memberStatuses.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#797586]">
                No members added to this trip pool yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 text-[12px]">
                {memberStatuses.map((m) => (
                  <div
                    key={m.id}
                    className={`py-2.5 flex items-center justify-between ${
                      !m.isPaid ? 'bg-amber-50/50 px-2 rounded-lg my-1 border border-amber-200/60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-full font-bold text-[11px] flex items-center justify-center shrink-0 ${
                          m.isPaid ? 'bg-[#f2ebff] text-[#5b3fd1]' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-[#1d1833] block truncate">{m.name}</span>
                        <span className="text-[10px] text-[#797586] block truncate">
                          {m.ordersSummary || m.email}
                        </span>
                      </div>
                    </div>

                    {m.isPaid ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-semibold text-[10px] flex items-center gap-0.5 shrink-0">
                        <span className="material-symbols-outlined text-[12px]">done</span>
                        {formatMoney(m.paid)}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setNudgedMemberId(m.id);
                            if (onNotify) onNotify(`Payment reminder sent to ${m.name}`, 'info');
                            setTimeout(() => setNudgedMemberId(null), 3000);
                          }}
                          className="px-2 py-1 rounded-md bg-white border border-[#e6deff] text-[#431fb9] text-[10px] font-bold hover:bg-[#f2ebff] cursor-pointer"
                        >
                          {nudgedMemberId === m.id ? 'Sent ✓' : 'Nudge'}
                        </button>
                        <span className="font-mono font-bold text-[#1d1833] text-[11px]">
                          {formatMoney(m.expected)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Direct Pay Action */}
            <button
              type="button"
              onClick={() => onNavigate('pay-contribution')}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[12px] font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Pay Member Contribution</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Transparent Ledger Audit Callout */}
      <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ece4ff] text-[#431fb9] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-[#1d1833]">
              Transparent Transaction Ledger
            </h4>
            <p className="text-[12px] text-[#797586]">
              Every deposit, vendor payout, refund, and currency conversion is recorded on the PostgreSQL ledger.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('ledger')}
          className="px-4 py-2.5 rounded-xl bg-[#f2ebff] hover:bg-[#e6deff] text-[#5b3fd1] font-bold text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span>Open Full Ledger</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Invite / Add Real Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setCopiedLink(false);
        }}
        title="Add or Invite Pool Member"
        subtitle={`${group.name}`}
        icon="group_add"
        iconBg="bg-[#f2ebff]"
        iconColor="text-[#431fb9]"
      >
        <div className="space-y-4">
          <form onSubmit={handleAddMember} className="space-y-3 pb-4 border-b border-[#e6deff]">
            <div className="text-[11px] uppercase font-bold tracking-wider text-[#5b3fd1]">
              Add Member Directly
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Full Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                required
                className="px-3 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] text-[13px] text-[#1d1833] outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
                className="px-3 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] text-[13px] text-[#1d1833] outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder={`Expected Pledge (${currency})`}
                value={newMemberBudget}
                onChange={(e) => setNewMemberBudget(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] text-[13px] text-[#1d1833] outline-none"
              />
              <button
                type="submit"
                disabled={isAddingMember}
                className="px-4 py-2 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold cursor-pointer disabled:opacity-60"
              >
                {isAddingMember ? 'Adding...' : 'Add to Pool'}
              </button>
            </div>
          </form>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold tracking-wider text-[#797586]">
              Or Share Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] text-[12px] font-mono text-[#1d1833] select-all outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#f2ebff] hover:bg-[#e6deff] text-[#431fb9]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedLink ? 'done' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Dispute Release Claim"
        subtitle={primaryPending?.supplier || 'Supplier Claim'}
        icon="warning"
        iconBg="bg-amber-100"
        iconColor="text-amber-800"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#484554] leading-relaxed">
            Placing a dispute logs a rejection vote and notifies the traveler to upload an amended invoice.
          </p>

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold tracking-wider text-[#797586]">
              Reason for Dispute
            </label>
            <div className="space-y-1.5">
              {[
                'Quantity discrepancy against group order',
                'Line items total mismatch on invoice',
                'Unauthorized item / price deviation',
              ].map((reason, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#e6deff] hover:bg-[#fdf8ff] cursor-pointer text-[12px] text-[#1d1833]"
                >
                  <input
                    type="radio"
                    name="dispute-reason"
                    checked={disputeReason === reason}
                    onChange={() => setDisputeReason(reason)}
                    className="accent-[#5b3fd1]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsDisputeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#e6deff] text-[#484554] text-[13px] font-semibold hover:bg-[#f2ebff] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDisputing}
              onClick={handleConfirmDispute}
              className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[13px] font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-60"
            >
              {isDisputing ? 'Submitting...' : 'Confirm Dispute'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
