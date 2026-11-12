'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';
import { Modal } from './Modal';

interface DashboardScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onApproveRelease?: () => void;
  isReleaseApproved?: boolean;
}

export function DashboardScreen({
  onNavigate,
  onApproveRelease,
  isReleaseApproved = false,
}: DashboardScreenProps) {
  const [approvedLocal, setApprovedLocal] = useState(isReleaseApproved);
  const [reminderSent, setReminderSent] = useState(false);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Quantity discrepancy (+100 extra phone cases)');
  const [isDisputed, setIsDisputed] = useState(false);

  const handleApprove = () => {
    setApprovedLocal(true);
    if (onApproveRelease) {
      onApproveRelease();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Quick Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e6deff]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#1d1833] tracking-tight">
              Phone accessories, Dubai run
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ece4ff] text-[#431fb9] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#431fb9] animate-pulse" />
              Active Trip
            </span>
          </div>
          <p className="text-[12px] text-[#797586] mt-1 flex items-center gap-2 flex-wrap">
            <span>Traveler: <strong>Chidi Okonkwo</strong></span>
            <span>•</span>
            <span>Batch #DXB-9942</span>
            <span>•</span>
            <span className="font-semibold text-[#431fb9]">Consensus Quorum: 3 of 5 votes required</span>
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
            <span>Pay Share ($1,000)</span>
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
            title="Invite new group members"
          >
            <span className="material-symbols-outlined text-[17px]">group_add</span>
            <span>Invite</span>
          </button>
        </div>
      </div>

      {/* 2. Unmissable "Next Action" Callout Banner for New Users */}
      {!approvedLocal ? (
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
                  2 of 3 votes collected
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1d1833] mt-0.5">
                Dubai Gadget Wholesale · AED 6,100 ($1,661 USD)
              </h3>
              <p className="text-[12px] text-[#484554] mt-0.5">
                Traveler Chidi submitted this purchase claim. Your approval is needed to disburse funds.
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
      ) : (
        <div className="bg-[#dcfce7] border border-[#22c55e]/50 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#15803d] text-[26px]">check_circle</span>
            <div>
              <span className="text-[13px] font-bold text-[#15803d]">Consensus Reached &amp; Release Approved!</span>
              <p className="text-[11px] text-[#166534]">
                3 of 3 votes collected. $1,661 USD has been authorized for Dubai Gadget Wholesale.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ledger')}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#22c55e]/40 text-[#15803d] text-[12px] font-bold hover:bg-emerald-50 cursor-pointer"
          >
            View in Ledger →
          </button>
        </div>
      )}

      {/* 3. Three High-Level Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Vault Balance */}
        <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#797586]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pot Vault Balance</span>
            <div className="w-8 h-8 rounded-lg bg-[#f2ebff] text-[#5b3fd1] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-[#1d1833] tracking-tight">
              $2,040.00
            </div>
            <p className="text-[11px] text-[#484554] mt-1">
              Available in group pot for upcoming purchases
            </p>
          </div>
        </div>

        {/* Card 2: Pledges Collected */}
        <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#797586]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pledges Collected</span>
            <div className="w-8 h-8 rounded-lg bg-[#dcfce7] text-[#15803d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-[#1d1833] tracking-tight">
              $4,000 / $5,000
            </div>
            <p className="text-[11px] text-[#484554] mt-1">
              4 of 5 member seats funded (80% collected)
            </p>
          </div>
        </div>

        {/* Card 3: Disbursed to Vendors */}
        <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#797586]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disbursed to Vendors</span>
            <div className="w-8 h-8 rounded-lg bg-[#ece4ff] text-[#431fb9] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-[#1d1833] tracking-tight">
              $1,960.00
            </div>
            <p className="text-[11px] text-[#484554] mt-1">
              Paid out against 1 approved supplier invoice
            </p>
          </div>
        </div>
      </div>

      {/* 4. Single Clean Visual Liquidity Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#e6deff] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
          <span className="font-bold text-[#1d1833]">Total Pool Allocation: $5,000.00 USD</span>
          <span className="text-[11px] text-[#797586]">
            Target Cap: <strong>$5,000</strong> • Consensus Threshold: <strong>60% (3 votes)</strong>
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="w-full h-3.5 bg-[#f2ebff] rounded-full overflow-hidden flex p-0.5 gap-1">
          <div className="h-full bg-[#431fb9] rounded-l-full" style={{ width: '39.2%' }} title="Released ($1,960.00)" />
          <div className="h-full bg-[#7c5be8]" style={{ width: '40.8%' }} title="Held in Pot ($2,040.00)" />
          <div className="h-full bg-[#e6deff] rounded-r-full" style={{ width: '20.0%' }} title="Pending ($1,000.00)" />
        </div>

        {/* Clean Legend */}
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#484554] pt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#431fb9]" />
            <span>Released: <strong>$1,960.00 (39.2%)</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c5be8]" />
            <span>Held in Pot: <strong>$2,040.00 (40.8%)</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e6deff]" />
            <span>Unpaid Pledges: <strong>$1,000.00 (20.0%)</strong></span>
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
                {approvedLocal ? '0 Pending' : '1 Pending'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('review-approve')}
              className="text-[12px] font-bold text-[#5b3fd1] hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
            >
              <span>View details</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Active Claim Card */}
          <div className="rounded-2xl bg-white border border-[#e6deff] p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebff] text-[#431fb9] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1d1833]">
                    Dubai Gadget Wholesale
                  </h3>
                  <p className="text-[12px] text-[#797586]">
                    Submitted by traveler Chidi O. • Invoice #DGW-7741
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-[#1d1833]">
                  AED 6,100
                </div>
                <div className="text-[11px] text-[#797586] font-medium">≈ $1,661 USD</div>
              </div>
            </div>

            {/* AI Audit Findings Summary */}
            <div className="rounded-xl bg-[#f7f1ff] p-3.5 border border-[#e6deff] space-y-2 text-[12px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#5b3fd1]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  AI Audit Findings
                </span>
                <span className="text-[#15803d] font-semibold bg-[#dcfce7] px-2 py-0.2 rounded-full text-[10px]">
                  98.4% Confidence
                </span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#484554]">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[15px] shrink-0 mt-0.5">warning</span>
                  <span><strong>Quantity Mismatch:</strong> 600 phone cases billed vs. 500 in group order manifest (+100 extra).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[#15803d] text-[15px] shrink-0 mt-0.5">check_circle</span>
                  <span>Tempered glass (1,200 units) and USB-C cables (800 units) strictly match specifications.</span>
                </li>
              </ul>
            </div>

            {/* Quorum Votes Row & Decision Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#1d1833]">Quorum:</span>
                <span className="text-[12px] font-bold text-[#431fb9]">
                  {approvedLocal ? '3 of 3 Votes (Consensus Reached)' : '2 of 3 Required Votes'}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-6 h-6 rounded-full bg-[#5b3fd1] text-white text-[10px] font-bold flex items-center justify-center" title="Amaka O. (Approved)">
                    AO
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#633fce] text-white text-[10px] font-bold flex items-center justify-center" title="Tunde A. (Approved)">
                    TA
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      approvedLocal ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                    title={approvedLocal ? 'Chidi O. (Approved)' : 'Your Vote Pending'}
                  >
                    YOU
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-[#e6deff] text-[#484554] hover:bg-[#f2ebff] text-[12px] font-semibold cursor-pointer transition-colors"
                >
                  Dispute
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approvedLocal}
                  className={`px-4 py-1.5 rounded-lg text-white text-[12px] font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    approvedLocal ? 'bg-emerald-600' : 'bg-[#5b3fd1] hover:bg-[#431fb9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {approvedLocal ? 'check' : 'lock_open'}
                  </span>
                  <span>{approvedLocal ? 'Approved ✓' : 'Approve ($1,661)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settled Purchase Summary Card */}
          <div className="rounded-xl bg-white border border-[#e6deff] p-3.5 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
              <div>
                <span className="font-bold text-[#1d1833]">Shenzhen Brightline Co.</span>
                <span className="text-[11px] text-[#797586] ml-2">Cleared May 16 • Ref: PP-PO-8812</span>
              </div>
            </div>
            <div className="font-bold text-[#1d1833] font-mono">
              CNY 14,200 <span className="text-[#797586] font-normal text-[11px]">(≈ $1,960 USD)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Member Contributions & Pledges (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#1d1833]">
              Member Contributions
            </h2>
            <span className="text-[12px] font-bold text-[#431fb9]">4 of 5 Paid ($4,000)</span>
          </div>

          <div className="rounded-2xl bg-white border border-[#e6deff] p-4 shadow-xs space-y-3">
            {/* 5-Seat Progress Visualization */}
            <div className="space-y-1.5 bg-[#fdf8ff] p-3 rounded-xl border border-[#e6deff]/60">
              <div className="flex justify-between text-[11px] font-semibold text-[#1d1833]">
                <span>Member Seats Pledged</span>
                <span className="text-[#15803d]">80% Funded</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-2.5">
                <div className="bg-emerald-500 rounded-xs" title="Amaka O.: $1,000 Paid" />
                <div className="bg-emerald-500 rounded-xs" title="Tunde A.: $1,000 Paid" />
                <div className="bg-emerald-500 rounded-xs" title="Ngozi E.: $1,000 Paid" />
                <div className="bg-emerald-500 rounded-xs" title="Ibrahim M.: $1,000 Paid" />
                <div className="bg-amber-300 rounded-xs animate-pulse" title="Bola K.: $1,000 Pending" />
              </div>
            </div>

            {/* Member List */}
            <div className="divide-y divide-zinc-100 text-[12px]">
              {[
                { name: 'Amaka O.', method: 'Chase Wire', amount: '$1,000.00', status: 'paid' },
                { name: 'Tunde A.', method: 'Apple Pay', amount: '$1,000.00', status: 'paid' },
                { name: 'Ngozi E.', method: 'Debit Card', amount: '$1,000.00', status: 'paid' },
                { name: 'Ibrahim M.', method: 'ACH Transfer', amount: '$1,000.00', status: 'paid' },
              ].map((m, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#f2ebff] text-[#5b3fd1] font-bold text-[11px] flex items-center justify-center">
                      {m.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <span className="font-bold text-[#1d1833]">{m.name}</span>
                      <span className="text-[11px] text-[#797586] ml-2">{m.method}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-semibold text-[10px] flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">done</span>
                    {m.amount}
                  </span>
                </div>
              ))}

              {/* Pending Member Seat: Bola K. */}
              <div className="py-2.5 flex items-center justify-between bg-amber-50/50 p-2 rounded-lg mt-1 border border-amber-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center justify-center">
                    BK
                  </span>
                  <div>
                    <span className="font-bold text-[#1d1833]">Bola K.</span>
                    <span className="text-[10px] text-amber-800 block">Pledged Seat #5</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setReminderSent(true);
                      setTimeout(() => setReminderSent(false), 3000);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#e6deff] text-[#431fb9] text-[11px] font-bold hover:bg-[#f2ebff] cursor-pointer"
                  >
                    {reminderSent ? 'Nudge Sent ✓' : 'Nudge'}
                  </button>
                  <span className="font-mono font-bold text-[#1d1833] text-[11px]">$1,000</span>
                </div>
              </div>
            </div>

            {/* Direct Pay Action */}
            <button
              type="button"
              onClick={() => onNavigate('pay-contribution')}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[12px] font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Pay Your $1,000 Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Transparent Ledger Audit Callout (Clean link instead of congested table) */}
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
              6 verified records logged. Every deposit, payout, and currency exchange is permanently anchored to the group ledger.
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

      {/* Invite Members Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setCopiedLink(false);
        }}
        title="Invite Members to Pool"
        subtitle="Dubai Run 2026 • Pool #DXB-9942"
        icon="group_add"
        iconBg="bg-[#f2ebff]"
        iconColor="text-[#431fb9]"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#484554] leading-relaxed">
            Share this secure invite link with group buyers. Members pledge their share directly into the protected multi-party vault pot.
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold tracking-wider text-[#797586]">
              Shareable Vault Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="https://trustload.network/join/dxb-9942"
                className="flex-1 px-3 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] text-[13px] font-mono text-[#1d1833] select-all outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://trustload.network/join/dxb-9942');
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#5b3fd1] hover:bg-[#431fb9] text-white shadow-xs'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedLink ? 'done' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#fdf8ff] border border-[#e6deff] flex items-center justify-between text-[12px]">
            <span className="text-[#484554]">Target Pledge per Seat:</span>
            <span className="font-bold text-[#1d1833]">$1,000.00 USD</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#e6deff] text-[#1d1833] text-[13px] font-semibold hover:bg-[#f2ebff] cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Dispute Release Claim"
        subtitle="Dubai Gadget Wholesale • Invoice #DGW-7741"
        icon="warning"
        iconBg="bg-amber-100"
        iconColor="text-amber-800"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#484554] leading-relaxed">
            Placing a dispute will freeze this release claim. Traveler Chidi O. will be notified to obtain an amended invoice or credit note from the vendor.
          </p>

          <div className="space-y-2">
            <label className="text-[11px] uppercase font-bold tracking-wider text-[#797586]">
              Reason for Dispute
            </label>
            <div className="space-y-1.5">
              {[
                'Quantity overage (+100 extra phone cases billed)',
                'Line items total mismatch (AED 6,340 vs 6,100 total)',
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
              onClick={() => {
                setIsDisputed(true);
                setIsDisputeModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[13px] font-bold shadow-xs cursor-pointer transition-colors"
            >
              Confirm Dispute &amp; Hold
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
