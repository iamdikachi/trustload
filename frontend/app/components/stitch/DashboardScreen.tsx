'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';

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

  const handleApprove = () => {
    setApprovedLocal(true);
    if (onApproveRelease) {
      onApproveRelease();
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-6">
        {/* Top Section: Header & Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-3xl sm:text-4xl font-black text-[#1d1833] tracking-tight">
                Phone accessories, Dubai run
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ece4ff] text-[#431fb9] font-label-sm text-[11px] uppercase tracking-wider font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#431fb9] animate-pulse"></span>
                Active Pool
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7deff] text-[#1f005f] font-label-sm text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
                Traveler: Chidi O.
              </span>
            </div>
            <p className="font-body-sm text-[13px] text-[#484554] flex items-center gap-2 flex-wrap">
              <span>Pool Vault ID: #DXB-9942</span>
              <span className="text-[#c9c4d7]">•</span>
              <span>Initiated May 14, 2026</span>
              <span className="text-[#c9c4d7]">•</span>
              <span className="font-label-sm text-[11px] text-[#431fb9] uppercase font-semibold">
                Consensus Quorum 3 of 5
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('ledger')}
              className="px-4 py-2.5 rounded-xl bg-white text-[#1d1833] hover:bg-[#f2ebff] font-label-lg text-[14px] font-semibold transition-all shadow-sm border border-[#e6deff] flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-[#797586]">description</span>
              <span>Export Audit Report</span>
            </button>
            <button
              onClick={() => {
                alert('Invite link copied: https://trustload.network/join/dxb-9942');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#f2ebff] text-[#431fb9] hover:bg-[#e6deff] font-label-lg text-[14px] font-semibold transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>Invite Members</span>
            </button>
            <button
              onClick={() => onNavigate('new-release')}
              className="px-5 py-2.5 rounded-xl bg-[#5b3fd1] text-white hover:bg-[#431fb9] font-label-lg text-[14px] font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Release Request</span>
            </button>
          </div>
        </div>

        {/* Signature Money Trail Card (Hero Visualizer) */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-[#e6deff]">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#c9beff]/30 to-transparent blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-[#e7deff]/25 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-sm text-[11px] uppercase font-bold tracking-widest text-[#484554]">
                    Escrow Status
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-label-sm text-[11px] font-semibold">
                    Live Multi-Party Vault
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display-lg text-4xl sm:text-5xl font-black text-[#1d1833] tracking-tight">
                    $2,040
                  </span>
                  <span className="font-headline-sm text-xl text-[#633fce] font-semibold">
                    held in the pot
                  </span>
                </div>
                <p className="font-body-md text-[15px] text-[#484554] mt-1 max-w-2xl">
                  <strong className="text-[#1d1833] font-semibold">$4,000</strong> paid in of{' '}
                  <strong className="text-[#1d1833] font-semibold">$5,000</strong> agreed.{' '}
                  <strong className="text-[#431fb9] font-semibold">$1,960</strong> has gone to the
                  traveler against approved invoices.
                </p>
              </div>

              {/* Quick Status Metrics */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3.5 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#431fb9] text-[20px]">flag</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[11px] text-[#797586]">Target Cap</span>
                    <span className="font-label-md text-[13px] font-bold text-[#1d1833]">
                      $5,000 USD
                    </span>
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#633fce] text-[20px]">
                    how_to_reg
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[11px] text-[#797586]">Consensus Rule</span>
                    <span className="font-label-md text-[13px] font-bold text-[#1d1833]">
                      3 of 5 Approvals
                    </span>
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#f7f1ff] border border-[#e6deff] flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#5b3fd1] text-[20px]">
                    verified_user
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[11px] text-[#797586]">Escrow Vault</span>
                    <span className="font-label-md text-[13px] font-bold text-[#1d1833]">Secured</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Segmented Money Bar (Liquidity Visualizer) */}
            <div className="flex flex-col gap-2">
              <div className="w-full h-4 rounded-full bg-[#e6deff] overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
                {/* Released ($1,960 = 39.2%) */}
                <div
                  className="h-full rounded-l-full bg-[#431fb9] transition-all duration-700 ease-out"
                  style={{ width: '39.2%' }}
                  title="Released: $1,960"
                ></div>
                {/* Held ($2,040 = 40.8%) */}
                <div
                  className="h-full bg-[#7c5be8] transition-all duration-700 ease-out"
                  style={{ width: '40.8%' }}
                  title="Held: $2,040"
                ></div>
                {/* Unpaid ($1,000 = 20%) */}
                <div
                  className="h-full rounded-r-full bg-[#c9c4d7]/50 transition-all duration-700 ease-out"
                  style={{ width: '20.0%' }}
                  title="Unpaid / Pledged: $1,000"
                ></div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#431fb9]"></span>
                    <span className="font-label-md text-[13px] text-[#1d1833] font-medium">
                      Released to Traveler:
                    </span>
                    <span className="font-label-md text-[13px] font-bold text-[#431fb9]">
                      $1,960.00
                    </span>
                    <span className="font-label-sm text-[11px] text-[#797586]">(39.2%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#7c5be8]"></span>
                    <span className="font-label-md text-[13px] text-[#1d1833] font-medium">
                      Held in Vault Pot:
                    </span>
                    <span className="font-label-md text-[13px] font-bold text-[#7c5be8]">
                      $2,040.00
                    </span>
                    <span className="font-label-sm text-[11px] text-[#797586]">(40.8%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#c9c4d7]"></span>
                    <span className="font-label-md text-[13px] text-[#1d1833] font-medium">
                      Remaining Unpaid:
                    </span>
                    <span className="font-label-md text-[13px] font-bold text-[#797586]">
                      $1,000.00
                    </span>
                    <span className="font-label-sm text-[11px] text-[#797586]">(20.0%)</span>
                  </div>
                </div>
                <div className="font-label-sm text-[11px] text-[#484554] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#431fb9]">lock</span>
                  Smart Settlement Ledger synced 2m ago
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Main Content Grid (60% / 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Release Requests & AI Verification (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-headline-sm text-lg font-bold text-[#1d1833]">
                  Release Requests
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-label-sm text-[11px] font-bold">
                  {approvedLocal ? 'Consensus Cleared' : '1 Action Required'}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2ebff] font-label-sm text-[11px] text-[#431fb9] font-semibold">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                AI Audit v3.4 Active
              </div>
            </div>

            {/* ACTIVE REQUEST CARD (Needs Review) */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#e6deff] flex flex-col gap-4 transition-all hover:shadow-md">
              {/* Vendor & Amount Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#f2ebff] flex items-center justify-center text-[#431fb9] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[26px]">storefront</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-[18px] font-bold text-[#1d1833]">
                        Dubai Gadget Wholesale
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#ece4ff] text-[#484554] font-label-sm text-[11px] font-semibold">
                        Invoice #DGW-7741
                      </span>
                    </div>
                    <span className="font-body-sm text-[13px] text-[#484554] mt-0.5">
                      Submitted by traveler Chidi O. • Deira Souk Branch
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-md text-2xl font-bold text-[#1d1833]">
                      AED 6,100
                    </span>
                    <span className="font-body-sm text-[13px] text-[#484554] font-semibold">
                      (≈ $1,661 USD)
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold mt-1 ${
                      approvedLocal
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : 'bg-[#e6deff] text-[#5d5099]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {approvedLocal ? 'check_circle' : 'warning'}
                    </span>
                    {approvedLocal ? 'Payout Authorized' : 'Needs Review'}
                  </span>
                </div>
              </div>

              {/* AI AUDITOR DISCREPANCIES BOX */}
              <div className="rounded-xl bg-[#f7f1ff] p-4 flex flex-col gap-3 border border-[#e6deff]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#5b3fd1] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                    </div>
                    <span className="font-label-md text-[13px] font-bold text-[#1d1833]">
                      AI Inspector Findings
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#431fb9] font-semibold">
                    OCR Confidence: 98.4%
                  </span>
                </div>

                {/* Finding rows */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#e6deff]/60">
                    <span className="material-symbols-outlined text-[18px] text-[#b45309] shrink-0 mt-0.5">
                      rule
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-sm text-[13px] text-[#1d1833] font-medium">
                        <strong>Phone cases:</strong> invoice says 600, the pool manifest allows 500
                        (+100 extra units detected).
                      </span>
                      <span className="font-label-sm text-[11px] text-[#797586] mt-0.5">
                        Manifest SKU: #CASE-MAG-SLIM • Cost diff: +AED 620
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#e6deff]/60">
                    <span className="material-symbols-outlined text-[18px] text-[#b45309] shrink-0 mt-0.5">
                      calculate
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-sm text-[13px] text-[#1d1833] font-medium">
                        Line items add up to <strong>AED 6,340</strong>, not the claimed{' '}
                        <strong>AED 6,100</strong> total.
                      </span>
                      <span className="font-label-sm text-[11px] text-[#797586] mt-0.5">
                        Implied vendor cash discount (-AED 240) or unlisted freight rebate.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#e6deff]/60">
                    <span className="material-symbols-outlined text-[18px] text-[#15803d] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-sm text-[13px] text-[#1d1833] font-medium">
                        Remaining items match group manifest specifications.
                      </span>
                      <span className="font-label-sm text-[11px] text-[#797586] mt-0.5">
                        Tempered glass (1,200 units) and Braided USB-C cables (800 units) strictly
                        cleared.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consensus Tracker */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-[13px] font-bold text-[#1d1833]">
                      Member Approval Quorum:
                    </span>
                    <span className="font-label-md text-[13px] font-bold text-[#431fb9]">
                      {approvedLocal ? '3 of 3 Approved' : '2 of 3 Required Votes'}
                    </span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[#484554] font-medium">
                    {approvedLocal ? 'Quorum achieved' : 'Awaiting your vote'}
                  </span>
                </div>

                {/* Approver Avatars & status */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f7f1ff] border border-[#e6deff]">
                    <div className="w-6 h-6 rounded-full bg-[#5b3fd1] text-white font-bold text-[10px] flex items-center justify-center">
                      AO
                    </div>
                    <span className="font-body-sm text-[12px] text-[#1d1833] font-medium">
                      Amaka O.
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#15803d]">
                      check_circle
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f7f1ff] border border-[#e6deff]">
                    <div className="w-6 h-6 rounded-full bg-[#633fce] text-white font-bold text-[10px] flex items-center justify-center">
                      TA
                    </div>
                    <span className="font-body-sm text-[12px] text-[#1d1833] font-medium">
                      Tunde A.
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#15803d]">
                      check_circle
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      approvedLocal
                        ? 'bg-[#dcfce7] border-[#86efac]'
                        : 'bg-[#e6deff] border-[#c9c4d7] animate-pulse'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center ${
                        approvedLocal
                          ? 'bg-[#15803d] text-white'
                          : 'bg-[#797586] text-white'
                      }`}
                    >
                      YOU
                    </div>
                    <span className="font-body-sm text-[12px] text-[#1d1833] font-bold">
                      {approvedLocal ? 'Chidi O. (Approved)' : 'Chidi O. (Pending Sign-off)'}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-[#15803d]">
                      {approvedLocal ? 'verified' : 'hourglass_top'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#e6deff]">
                <button
                  type="button"
                  onClick={() => onNavigate('review-approve')}
                  className="inline-flex items-center gap-1.5 font-label-md text-[13px] text-[#431fb9] font-bold hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>View Invoice &amp; Shipping Manifest</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert('Release hold requested. Traveler notified to request vendor credit.');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#ece4ff] text-[#484554] hover:bg-[#e6deff] font-label-md text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    Reject / Dispute
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approvedLocal}
                    className={`px-5 py-2 rounded-xl font-label-md text-[13px] font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                      approvedLocal
                        ? 'bg-[#15803d] text-white'
                        : 'bg-[#5b3fd1] hover:bg-[#431fb9] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {approvedLocal ? 'check_circle' : 'lock_open'}
                    </span>
                    <span>{approvedLocal ? 'Release Approved ✓' : 'Approve Release ($1,661)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* HISTORICAL RELEASED ITEM */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#e6deff] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-lg text-[14px] font-bold text-[#1d1833]">
                      Shenzhen Brightline Co.
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-label-sm text-[10px] font-bold">
                      Released
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[#484554]">
                    <span>Cleared May 16 via Escrow Payout</span>
                    <span className="text-[#c9c4d7]">•</span>
                    <span className="font-label-sm text-[#797586]">Ref: PP-PO-88129034</span>
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 text-right">
                <span className="font-headline-sm text-base font-bold text-[#1d1833]">
                  CNY 14,200
                </span>
                <span className="font-body-sm text-[12px] text-[#484554] font-medium">
                  (≈ $1,960 USD)
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Member Contributions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-headline-sm text-lg font-bold text-[#1d1833]">
                  Member Contributions
                </h2>
                <span className="font-body-sm text-[12px] text-[#484554]">
                  4 of 5 Paid • $1,000 agreed per seat
                </span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#f2ebff] font-label-sm text-[11px] text-[#431fb9] font-bold">
                80% Funded
              </div>
            </div>

            {/* Member List Container */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#e6deff] flex flex-col gap-1">
              {/* Member 1: Amaka O. */}
              <div className="p-2 rounded-xl hover:bg-[#f7f1ff] transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5b3fd1] text-white font-bold text-sm flex items-center justify-center">
                    AO
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                      Amaka O.
                    </span>
                    <span className="font-body-sm text-[12px] text-[#484554]">
                      May 14 • Chase Wire
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                    $1,000.00
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-label-sm text-[10px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">done</span>
                    Paid
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#e6deff] w-full my-0.5"></div>

              {/* Member 2: Tunde A. */}
              <div className="p-2 rounded-xl hover:bg-[#f7f1ff] transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#633fce] text-white font-bold text-sm flex items-center justify-center">
                    TA
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                      Tunde A.
                    </span>
                    <span className="font-body-sm text-[12px] text-[#484554]">
                      May 14 • Apple Pay
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                    $1,000.00
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-label-sm text-[10px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">done</span>
                    Paid
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#e6deff] w-full my-0.5"></div>

              {/* Member 3: Ngozi E. */}
              <div className="p-2 rounded-xl hover:bg-[#f7f1ff] transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5d5099] text-white font-bold text-sm flex items-center justify-center">
                    NE
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                      Ngozi E.
                    </span>
                    <span className="font-body-sm text-[12px] text-[#484554]">
                      May 15 • Debit Card
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                    $1,000.00
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-label-sm text-[10px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">done</span>
                    Paid
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#e6deff] w-full my-0.5"></div>

              {/* Member 4: Ibrahim M. */}
              <div className="p-2 rounded-xl hover:bg-[#f7f1ff] transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#431fb9] text-white font-bold text-sm flex items-center justify-center">
                    IM
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                      Ibrahim M.
                    </span>
                    <span className="font-body-sm text-[12px] text-[#484554]">
                      May 15 • ACH Transfer
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                    $1,000.00
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-label-sm text-[10px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">done</span>
                    Paid
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#e6deff] w-full my-0.5"></div>

              {/* Member 5: Bola K. (Waiting) */}
              <div className="p-3 rounded-xl bg-[#f7f1ff] border border-[#e6deff] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e6deff] text-[#484554] font-bold text-sm flex items-center justify-center">
                      BK
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-lg text-[13px] font-bold text-[#1d1833]">
                        Bola K.
                      </span>
                      <span className="font-body-sm text-[11px] text-[#797586]">Pledged seat #5</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-label-lg text-[13px] font-bold text-[#797586]">
                      $0.00 <span className="font-body-sm text-[11px] font-normal">/ $1,000</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] font-label-sm text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      Payment Waiting
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-label-sm text-[11px] text-[#484554]">
                    Invite sent via WhatsApp
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('pay-contribution')}
                      className="px-2.5 py-1 rounded-lg bg-[#5b3fd1] text-white hover:bg-[#431fb9] font-label-sm text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Pay Share ($1,000)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReminderSent(true);
                        setTimeout(() => setReminderSent(false), 3000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#e6deff] text-[#431fb9] hover:bg-[#f2ebff] font-label-sm text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">send</span>
                      <span>{reminderSent ? 'Sent!' : 'Reminder'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Collective Trust Security Card */}
            <div className="rounded-2xl bg-[#f2ebff] border border-[#e6deff] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#431fb9] shrink-0 shadow-xs border border-[#e6deff]">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-[13px] font-bold text-[#1d1833]">
                  Zero-Disbursement Guarantee
                </span>
                <span className="font-body-sm text-[12px] text-[#484554]">
                  Funds are released only when 3 of 5 members approve verified optical receipts.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Ledger Summary Table Preview */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#e6deff] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-base font-bold text-[#1d1833]">
                  Recent Ledger Activity
                </h3>
                <span className="font-body-sm text-[12px] text-[#484554]">
                  Immutable cryptographic audit trail for Dubai run
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('ledger')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f2ebff] text-[#431fb9] hover:bg-[#e6deff] font-label-md text-[13px] font-bold transition-all cursor-pointer"
              type="button"
            >
              <span>Go to Full Escrow Ledger</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-table-data text-[13px]">
              <thead>
                <tr className="bg-[#f7f1ff] text-[#484554] font-label-sm text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">Timestamp</th>
                  <th className="py-3 px-4">Transaction / Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Verification State</th>
                  <th className="py-3 px-4 text-right">Debit</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6deff]">
                {/* Row 1 */}
                <tr className="hover:bg-[#f7f1ff]/60 transition-colors">
                  <td className="py-3.5 px-4 text-[#484554] font-label-sm text-[11px]">
                    May 17, 10:22 AM
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1d1833]">
                    Disbursement Hold Request #REQ-118
                  </td>
                  <td className="py-3.5 px-4 text-[#1d1833]">Dubai Gadget Wholesale</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-semibold inline-flex items-center gap-1 ${
                        approvedLocal
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-[#ece4ff] text-[#5d5099]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {approvedLocal ? 'check_circle' : 'pending'}
                      </span>
                      {approvedLocal ? 'Consensus Met (3/3)' : 'Pending Signatures (2/3)'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#b45309]">($1,661.00)</td>
                  <td className="py-3.5 px-4 text-right text-[#797586]">—</td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-[#f7f1ff]/60 transition-colors">
                  <td className="py-3.5 px-4 text-[#484554] font-label-sm text-[11px]">
                    May 16, 04:15 PM
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1d1833]">Escrow Payout Released</td>
                  <td className="py-3.5 px-4 text-[#1d1833]">Shenzhen Brightline Co.</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-label-sm text-[11px] font-semibold inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      Consensus Met (3/3)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#431fb9]">($1,960.00)</td>
                  <td className="py-3.5 px-4 text-right text-[#797586]">—</td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-[#f7f1ff]/60 transition-colors">
                  <td className="py-3.5 px-4 text-[#484554] font-label-sm text-[11px]">
                    May 15, 08:30 AM
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1d1833]">
                    Inbound Deposit: ACH Ingestion
                  </td>
                  <td className="py-3.5 px-4 text-[#1d1833]">Ibrahim M. (Member)</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-label-sm text-[11px] font-semibold inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      Settled into Pot
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#797586]">—</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#1d1833]">+$1,000.00</td>
                </tr>
                {/* Row 4 */}
                <tr className="hover:bg-[#f7f1ff]/60 transition-colors">
                  <td className="py-3.5 px-4 text-[#484554] font-label-sm text-[11px]">
                    May 14, 02:40 PM
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1d1833]">
                    Pool Genesis &amp; Initial 3 Depositors
                  </td>
                  <td className="py-3.5 px-4 text-[#1d1833]">Amaka, Tunde, Ngozi</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-label-sm text-[11px] font-semibold inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      Settled into Pot
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#797586]">—</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#1d1833]">+$3,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Screen Footer */}
        <footer className="w-full bg-white border border-[#e6deff] rounded-2xl py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-base text-[#431fb9] font-bold">TrustLoad</span>
            <span className="font-body-sm text-[12px] text-[#484554]">
              — Multi-Party Escrow &amp; AI Settlement Verification
            </span>
          </div>
          <div className="font-label-sm text-[11px] text-[#797586]">
            © 2026 TrustLoad Financial Technologies. Protected by automated multi-sig consensus.
          </div>
        </footer>
      </div>
    </div>
  );
}

