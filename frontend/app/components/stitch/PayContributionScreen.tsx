'use client';

import React, { useState, useEffect } from 'react';
import { ScreenPath } from './StitchHeader';
import { api } from '../../lib/api';
import { Group } from '../../types';

interface PayContributionScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onConfirmPayment?: () => void;
  groupId?: string;
  memberId?: string;
  group?: Group | null;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function PayContributionScreen({
  onNavigate,
  onConfirmPayment,
  groupId,
  memberId,
  group,
  onNotify,
}: PayContributionScreenProps) {
  const members = group?.members || [];
  const defaultMember =
    members.find((m) => {
      const paid = (m.contributions || [])
        .filter((c) => c.status === 'COMPLETED')
        .reduce((s, c) => s + Number(c.amount || 0), 0);
      return paid < Number(m.contributionExpected || 0);
    }) ||
    members[0] ||
    null;

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    memberId || defaultMember?.id || ''
  );
  const [method, setMethod] = useState<'paypal' | 'card' | 'ach'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (defaultMember?.id && !members.some((m) => m.id === selectedMemberId)) {
      setSelectedMemberId(defaultMember.id);
    }
  }, [defaultMember?.id, members, selectedMemberId]);

  const activeMember =
    members.find((m) => m.id === selectedMemberId) || defaultMember;
  const currency = group?.baseCurrency || 'USD';

  const expectedShare = Number(activeMember?.contributionExpected || 0);
  const alreadyPaid = (activeMember?.contributions || [])
    .filter((c) => c.status === 'COMPLETED')
    .reduce((s, c) => s + Number(c.amount || 0), 0);
  const remainingDue = Math.max(0, expectedShare - alreadyPaid);
  const payAmount = remainingDue > 0 ? remainingDue : expectedShare;

  const totalExpectedPool =
    group?.summary?.totalExpectedContribution ??
    members.reduce((s, m) => s + Number(m.contributionExpected || 0), 0);
  const totalCompletedPool =
    group?.summary?.totalContributionsCompleted ??
    members.reduce(
      (s, m) =>
        s +
        (m.contributions || [])
          .filter((c) => c.status === 'COMPLETED')
          .reduce((cSum, c) => cSum + Number(c.amount || 0), 0),
      0
    );
  const pendingPeers = Math.max(0, totalExpectedPool - totalCompletedPool - payAmount);
  const allocationPct =
    totalExpectedPool > 0
      ? ((expectedShare / totalExpectedPool) * 100).toFixed(1)
      : '0.0';
  const fundedPct =
    totalExpectedPool > 0
      ? Math.min(100, (totalCompletedPool / totalExpectedPool) * 100)
      : 0;
  const thisSharePct =
    totalExpectedPool > 0
      ? Math.min(100 - fundedPct, (payAmount / totalExpectedPool) * 100)
      : 0;

  const handlePay = async () => {
    const targetGroupId = group?.id || groupId;
    const targetMemberId = activeMember?.id || memberId;

    if (!targetGroupId || !targetMemberId) {
      if (onNotify) onNotify('Please select a group and member first.', 'error');
      return;
    }

    if (payAmount <= 0) {
      if (onNotify) onNotify('Contribution amount must be greater than 0.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await api.createContributionOrder(
        targetGroupId,
        targetMemberId,
        payAmount,
        currency
      );

      if (order?.approvalUrl) {
        window.location.href = order.approvalUrl;
        return;
      } else if (order?.orderId) {
        await api.captureContributionOrder(order.orderId);
      }

      setIsPaid(true);
      if (onConfirmPayment) {
        onConfirmPayment();
      }
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1200);
    } catch (e: any) {
      console.warn('Live contribution notice:', e);
      if (onNotify) {
        onNotify(e?.message || 'Failed to initiate PayPal payment.', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-2 space-y-6">
      {/* Navigation Breadcrumb & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e6deff] text-[#431fb9] hover:bg-[#f2ebff] text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Overview</span>
          </button>
          <span className="text-[#c9c4d7]">•</span>
          <span className="text-[13px] text-[#484554]">
            Pool #{(group?.id || groupId || '').slice(0, 8).toUpperCase() || '—'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              isPaid || (expectedShare > 0 && remainingDue === 0)
                ? 'bg-[#dcfce7] text-[#15803d]'
                : 'bg-[#fef3c7] text-[#b45309]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            Status: {isPaid || (expectedShare > 0 && remainingDue === 0) ? 'Paid' : 'Awaiting Payment'}
          </span>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ece4ff] text-[#484554] text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[16px] text-[#431fb9]">verified_user</span>
            <span>
              Consensus Required: {group?.approvalThreshold ?? 0} of {members.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: 2 Columns (7:5 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Payment Execution & Financial Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Top Contribution Highlight Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#e6deff] flex flex-col gap-6 relative overflow-hidden">
            {members.length > 0 && (
              <div>
                <label className="block text-[11px] uppercase font-bold tracking-wider text-[#797586] mb-1.5">
                  Paying As Member
                </label>
                <select
                  value={activeMember?.id || ''}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full sm:w-auto min-w-[260px] px-3 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] text-[13px] font-semibold text-[#1d1833] outline-none cursor-pointer"
                >
                  {members.map((m) => {
                    const paid = (m.contributions || [])
                      .filter((c) => c.status === 'COMPLETED')
                      .reduce((s, c) => s + Number(c.amount || 0), 0);
                    return (
                      <option key={m.id} value={m.id}>
                        {m.user?.name || 'Member'} — {currency} {paid.toLocaleString()} / {Number(m.contributionExpected).toLocaleString()}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#431fb9] font-bold bg-[#e7deff] px-2.5 py-1 rounded-full">
                  {remainingDue === 0 && expectedShare > 0
                    ? 'Seat Fully Funded'
                    : `Remaining Due (${activeMember?.user?.name || 'Member'})`}
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl text-[#1d1833] font-black tracking-tight">
                    ${payAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xl text-[#484554] font-bold">{currency}</span>
                </div>
                <p className="text-[14px] text-[#484554] mt-1">
                  Share for <span className="font-semibold text-[#1d1833]">{group?.name || 'Selected Trip Pool'}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#f7f1ff] border border-[#e6deff] px-3 py-2 rounded-xl self-start">
                <span className="material-symbols-outlined text-[#431fb9] text-[22px]">lock</span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#1d1833] font-bold leading-tight">Multi-Party Vault</span>
                  <span className="text-[10px] text-[#484554] leading-tight">Pre-funded isolation</span>
                </div>
              </div>
            </div>

            {/* Pool Contribution Visualizer */}
            <div className="flex flex-col gap-2.5 bg-[#f7f1ff] p-4 rounded-xl border border-[#e6deff]">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#1d1833] font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5b3fd1]"></span>
                  Your Stake in Total Pool ({currency} {totalExpectedPool.toLocaleString('en-US', { minimumFractionDigits: 2 })} Expected)
                </span>
                <span className="text-[#431fb9] font-bold">{allocationPct}% Allocation</span>
              </div>
              <div className="w-full h-4 bg-[#e6deff] rounded-full overflow-hidden flex p-0.5 gap-0.5">
                <div className="h-full bg-[#633fce] rounded-l-full" style={{ width: `${fundedPct}%` }} title={`Paid (${totalCompletedPool})`}></div>
                <div className="h-full bg-[#5b3fd1]" style={{ width: `${thisSharePct}%` }} title={`This Share (${payAmount})`}></div>
                <div className="h-full bg-[#ded5fa] rounded-r-full" style={{ width: `${Math.max(0, 100 - fundedPct - thisSharePct)}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#484554] pt-1">
                <span>Collected: <strong>${totalCompletedPool.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                <span>Your Share: <strong>${expectedShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                <span>Pending Peers: <strong>${pendingPeers.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>
          </div>

          {/* Secure Settlement Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#e6deff] flex flex-col gap-5">
            {/* Payment Methods */}
            <div className="flex flex-col gap-3">
              <label className="text-[13px] text-[#1d1833] font-semibold flex items-center justify-between">
                <span>Select Funding Method</span>
                <span className="text-[11px] text-[#797586] font-normal">Zero platform transaction fees</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setMethod('paypal')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    method === 'paypal'
                      ? 'bg-[#ece4ff] border-[#5b3fd1] shadow-sm'
                      : 'bg-[#f7f1ff] border-[#e6deff] hover:bg-[#ece4ff]'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#431fb9] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-[#1d1833]">PayPal</span>
                    <span className="text-[10px] text-[#484554]">Recommended</span>
                  </div>
                </div>

                <div
                  onClick={() => setMethod('card')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    method === 'card'
                      ? 'bg-[#ece4ff] border-[#5b3fd1] shadow-sm'
                      : 'bg-[#f7f1ff] border-[#e6deff] hover:bg-[#ece4ff]'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#e6deff] flex items-center justify-center"></div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-[#1d1833]">Debit / Credit</span>
                    <span className="text-[10px] text-[#484554]">Visa, MC, Amex</span>
                  </div>
                </div>

                <div
                  onClick={() => setMethod('ach')}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    method === 'ach'
                      ? 'bg-[#ece4ff] border-[#5b3fd1] shadow-sm'
                      : 'bg-[#f7f1ff] border-[#e6deff] hover:bg-[#ece4ff]'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#e6deff] flex items-center justify-center"></div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-[#1d1833]">Bank Transfer</span>
                    <span className="text-[10px] text-[#484554]">ACH Instant</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing || isPaid || payAmount <= 0}
              className={`w-full py-4 rounded-xl font-bold text-[14px] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                isPaid
                  ? 'bg-[#15803d] text-white'
                  : 'bg-[#5b3fd1] hover:bg-[#431fb9] text-white active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPaid ? 'check_circle' : 'lock'}
              </span>
              <span>
                {isPaid
                  ? 'Contribution Confirmed ✓'
                  : isProcessing
                  ? 'Connecting to PayPal...'
                  : `Confirm & Pay ${currency} ${payAmount.toLocaleString()} via PayPal`}
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Buyer Protection Protocol */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e6deff]">
            <span className="material-symbols-outlined text-[#431fb9] text-[22px]">shield</span>
            <h3 className="font-bold text-sm text-[#1d1833]">Buyer Protection Protocol</h3>
          </div>

          <div className="space-y-3 text-[12px]">
            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff] space-y-1">
              <span className="font-bold text-[#1d1833] block">Zero Unilateral Withdrawals</span>
              <p className="text-[#484554] leading-relaxed">
                Neither the traveler nor individual members can move money without group sign-off quorum.
              </p>
            </div>

            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff] space-y-1">
              <span className="font-bold text-[#1d1833] block">AI Discrepancy Gate</span>
              <p className="text-[#484554] leading-relaxed">
                Gemini multimodal OCR audits line items, foreign currency conversions, and wholesale price baselines.
              </p>
            </div>

            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff] space-y-1">
              <span className="font-bold text-[#1d1833] block">Guaranteed Leftover Refunds</span>
              <p className="text-[#484554] leading-relaxed">
                Any surplus leftover in the pot returns automatically to your PayPal account upon closeout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
