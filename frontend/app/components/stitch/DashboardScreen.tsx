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
  const [activeChartTab, setActiveChartTab] = useState<'donut' | 'bars'>('donut');

  // Modals state (replaces alerts)
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

  // Data for Vault Liquidity:
  // Released: $1,960 (39.2%)
  // Held in Pot: $2,040 (40.8%)
  // Remaining Unpaid: $1,000 (20.0%)
  const totalCap = 5000;
  const released = 1960;
  const held = 2040;
  const unpaid = 1000;

  // Donut SVG circumference math:
  // r = 54, circumference = 2 * PI * 54 = ~339.29
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const pctReleased = released / totalCap; // 0.392
  const pctHeld = held / totalCap; // 0.408
  const pctUnpaid = unpaid / totalCap; // 0.200

  const dashReleased = pctReleased * circ;
  const dashHeld = pctHeld * circ;
  const dashUnpaid = pctUnpaid * circ;

  const offsetReleased = 0;
  const offsetHeld = -dashReleased;
  const offsetUnpaid = -(dashReleased + dashHeld);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e6deff]/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#1d1833] tracking-tight">
              Phone accessories, Dubai run
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ece4ff] text-[#431fb9] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#431fb9] animate-pulse" />
              Active Pool
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] text-[11px] font-medium">
              <span className="material-symbols-outlined text-[13px]">flight_takeoff</span>
              Chidi O.
            </span>
          </div>
          <p className="text-[12px] text-[#797586] mt-1 flex items-center gap-2">
            <span>Vault #DXB-9942</span>
            <span>•</span>
            <span>Initiated May 14, 2026</span>
            <span>•</span>
            <span className="font-semibold text-[#431fb9]">Consensus Quorum: 3 of 5</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('ledger')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#f2ebff] text-[#1d1833] text-[13px] font-semibold border border-[#e6deff] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#797586]">description</span>
            <span>Audit Report</span>
          </button>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#f2ebff] hover:bg-[#e6deff] text-[#431fb9] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">group_add</span>
            <span>Invite</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('new-release')}
            className="px-4 py-2 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Release</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Liquidity Analytics (Hero Charts) */}
      <div className="rounded-2xl bg-white border border-[#e6deff] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Column: Big Key Metric & Status Chips */}
          <div className="flex-1 min-w-[260px] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#797586]">
                Vault Balance
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse" />
                Live Escrow
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-['Bricolage_Grotesque',sans-serif] text-4xl sm:text-5xl font-bold text-[#1d1833] tracking-tight">
                $2,040
              </span>
              <span className="text-sm font-semibold text-[#633fce]">held in the pot</span>
            </div>

            <p className="text-[13px] text-[#484554] max-w-sm leading-normal">
              <strong className="text-[#1d1833]">$4,000</strong> paid in of{' '}
              <strong className="text-[#1d1833]">$5,000</strong> target cap.{' '}
              <strong className="text-[#431fb9]">$1,960</strong> released against verified invoices.
            </p>

            {/* Quick KPI Badges */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-[#f7f1ff] border border-[#e6deff] font-medium text-[#1d1833]">
                🎯 Cap: <strong>$5,000 USD</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#f7f1ff] border border-[#e6deff] font-medium text-[#1d1833]">
                👥 Quorum: <strong>3 of 5 (60%)</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#f7f1ff] border border-[#e6deff] font-medium text-[#15803d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified_user</span>
                Secured
              </span>
            </div>
          </div>

          {/* Middle Column: SVG Donut Allocation Chart */}
          <div className="flex items-center gap-6 px-4 py-2 border-y lg:border-y-0 lg:border-x border-[#e6deff]/70">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#f2ebff"
                  strokeWidth="14"
                  fill="none"
                />
                {/* Released Segment: Purple */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#431fb9"
                  strokeWidth="14"
                  strokeDasharray={`${dashReleased} ${circ}`}
                  strokeDashoffset={offsetReleased}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Held in Pot: Violet */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#7c5be8"
                  strokeWidth="14"
                  strokeDasharray={`${dashHeld} ${circ}`}
                  strokeDashoffset={offsetHeld}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Unpaid: Light Lavender */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#e6deff"
                  strokeWidth="14"
                  strokeDasharray={`${dashUnpaid} ${circ}`}
                  strokeDashoffset={offsetUnpaid}
                  fill="none"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                <span className="font-['Bricolage_Grotesque',sans-serif] text-base font-bold text-[#1d1833] leading-none">
                  $5,000
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#797586] font-semibold mt-0.5">
                  Pool Total
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c5be8]" />
                <span className="text-[#484554]">Held in Pot:</span>
                <strong className="text-[#1d1833] font-mono">$2,040</strong>
                <span className="text-[10px] text-[#797586] font-semibold">(40.8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#431fb9]" />
                <span className="text-[#484554]">Released:</span>
                <strong className="text-[#1d1833] font-mono">$1,960</strong>
                <span className="text-[10px] text-[#797586] font-semibold">(39.2%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e6deff]" />
                <span className="text-[#484554]">Unpaid:</span>
                <strong className="text-[#797586] font-mono">$1,000</strong>
                <span className="text-[10px] text-[#797586] font-semibold">(20.0%)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Mini Cashflow Bar Chart Visualizer */}
          <div className="w-full lg:w-64 space-y-2.5 bg-[#fdf8ff] p-3.5 rounded-xl border border-[#e6deff]/60">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#1d1833]">
              <span>Funding &amp; Payout Pace</span>
              <span className="text-[#431fb9] font-bold">80% Funded</span>
            </div>

            {/* Target vs Deposited Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#797586]">
                <span>Pledges Deposited</span>
                <span>$4,000 / $5,000</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-[#5b3fd1] rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            {/* Approved vs Disbursed Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#797586]">
                <span>Pledged Funds Disbursed</span>
                <span>$1,960 / $4,000</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-[#15803d] rounded-full" style={{ width: '49%' }} />
              </div>
            </div>

            <p className="text-[10px] text-[#797586] leading-tight pt-1">
              🔒 PayPal multi-party ledger auto-reconciled 2m ago.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Active Release with AI Visual Manifest vs. Member Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Active Release Claim & AI Findings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#1d1833]">
                Release Claim Under Review
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
                {approvedLocal ? 'Consensus Approved' : '1 Action Required'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#5b3fd1] flex items-center gap-1 bg-[#f2ebff] px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI Audit v3.4
            </span>
          </div>

          {/* Release Card */}
          <div className="rounded-2xl bg-white border border-[#e6deff] p-5 shadow-xs space-y-4">
            {/* Vendor & Amount Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f2ebff] text-[#431fb9] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-base text-[#1d1833]">
                      Dubai Gadget Wholesale
                    </h3>
                    <span className="px-2 py-0.2 rounded-full bg-zinc-100 text-[#484554] text-[10px] font-semibold">
                      #DGW-7741
                    </span>
                  </div>
                  <p className="text-[12px] text-[#797586]">Submitted by traveler Chidi O. • Deira Branch</p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-[#1d1833]">
                  AED 6,100
                </div>
                <div className="text-[11px] text-[#797586] font-medium">≈ $1,661 USD</div>
              </div>
            </div>

            {/* VISUAL CHART: Manifest vs Invoice AI Match Graph (Replaces Walls of Text) */}
            <div className="rounded-xl bg-[#f7f1ff] p-3.5 border border-[#e6deff]/70 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#1d1833] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#5b3fd1]">analytics</span>
                  AI Manifest Comparison Chart
                </span>
                <span className="text-[#15803d] font-semibold bg-[#dcfce7] px-2 py-0.2 rounded-full text-[10px]">
                  98.4% OCR Confidence
                </span>
              </div>

              {/* Visual Quantity Bar 1: Phone Cases (Discrepancy) */}
              <div className="space-y-1 bg-white p-2.5 rounded-lg border border-amber-200/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-amber-600">warning</span>
                    Phone Cases (#CASE-MAG-SLIM)
                  </span>
                  <span className="font-bold text-amber-800 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                    +100 Over Order (+20%)
                  </span>
                </div>

                {/* Progress Comparison */}
                <div className="grid grid-cols-12 gap-2 items-center text-[10px] text-[#797586] pt-0.5">
                  <span className="col-span-3 text-[10px]">Ordered: 500</span>
                  <div className="col-span-6 h-2 rounded-full bg-zinc-100 overflow-hidden relative">
                    <div className="h-full bg-emerald-500" style={{ width: '83%' }} title="Ordered 500" />
                    <div className="absolute right-0 top-0 bottom-0 bg-amber-500" style={{ width: '17%' }} title="Excess 100" />
                  </div>
                  <span className="col-span-3 text-right font-bold text-amber-900">Billed: 600</span>
                </div>
              </div>

              {/* Visual Quantity Bar 2: Tempered Glass (100% Cleared) */}
              <div className="space-y-1 bg-white p-2.5 rounded-lg border border-emerald-200/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                    Tempered Glass (1,200 units) &amp; USB-C Cables (800 units)
                  </span>
                  <span className="font-bold text-emerald-700 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                    100% Match
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Arithmetic Summary Note */}
              <div className="text-[11px] text-zinc-600 bg-white/70 p-2 rounded-lg flex items-center justify-between">
                <span>
                  <strong>Math Check:</strong> Line items add up to AED 6,340 vs AED 6,100 invoice total.
                </span>
                <span className="font-semibold text-zinc-500 text-[10px]">Cash discount (-AED 240)</span>
              </div>
            </div>

            {/* Quorum Votes Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#1d1833]">Quorum:</span>
                <span className="text-[12px] font-bold text-[#431fb9]">
                  {approvedLocal ? '3 of 3 Votes (Consensus Reached)' : '2 of 3 Required Votes'}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-6 h-6 rounded-full bg-[#5b3fd1] text-white text-[10px] font-bold flex items-center justify-center">
                    AO
                  </span>
                  <span className="w-6 h-6 rounded-full bg-[#633fce] text-white text-[10px] font-bold flex items-center justify-center">
                    TA
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      approvedLocal ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
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

          {/* Historical Settled Payout (Compact) */}
          <div className="rounded-xl bg-white border border-[#e6deff] p-3.5 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
              <div>
                <span className="font-bold text-[#1d1833]">Shenzhen Brightline Co.</span>
                <span className="text-[11px] text-[#797586] ml-2">May 16 via PayPal • Ref: PP-PO-8812</span>
              </div>
            </div>
            <div className="font-bold text-[#1d1833] font-mono">
              CNY 14,200 <span className="text-[#797586] font-normal text-[11px]">(≈ $1,960 USD)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Member Funding Gauge & Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold text-[#1d1833]">
              Member Contributions
            </h2>
            <span className="text-[12px] font-bold text-[#431fb9]">4 of 5 Paid ($4k / $5k)</span>
          </div>

          {/* Member Roster Card */}
          <div className="rounded-2xl bg-white border border-[#e6deff] p-4 shadow-xs space-y-3">
            {/* Visual 5-Seat Funding Bar Chart */}
            <div className="space-y-1.5 bg-[#fdf8ff] p-3 rounded-xl border border-[#e6deff]/60">
              <div className="flex justify-between text-[11px] font-semibold text-[#1d1833]">
                <span>Pool Seat Allocation</span>
                <span className="text-[#15803d]">80% Cleared</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 h-3">
                <div className="bg-emerald-500 rounded-xs" title="Amaka: $1,000 Paid" />
                <div className="bg-emerald-500 rounded-xs" title="Tunde: $1,000 Paid" />
                <div className="bg-emerald-500 rounded-xs" title="Ngozi: $1,000 Paid" />
                <div className="bg-emerald-500 rounded-xs" title="Ibrahim: $1,000 Paid" />
                <div className="bg-amber-300 rounded-xs animate-pulse" title="Bola: $1,000 Pending" />
              </div>
              <div className="flex justify-between text-[10px] text-[#797586] pt-0.5">
                <span>4 Seats Active ($4,000)</span>
                <span>1 Pending ($1,000)</span>
              </div>
            </div>

            {/* Compact Member Rows */}
            <div className="divide-y divide-zinc-100 text-[12px]">
              {[
                { name: 'Amaka O.', method: 'Chase Wire', amount: '$1,000', status: 'paid' },
                { name: 'Tunde A.', method: 'Apple Pay', amount: '$1,000', status: 'paid' },
                { name: 'Ngozi E.', method: 'Debit Card', amount: '$1,000', status: 'paid' },
                { name: 'Ibrahim M.', method: 'ACH Transfer', amount: '$1,000', status: 'paid' },
              ].map((m, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
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

              {/* Pending Seat: Bola K. */}
              <div className="pt-2 flex items-center justify-between bg-amber-50/50 p-2 rounded-lg mt-1 border border-amber-200/60">
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
                    onClick={() => onNavigate('pay-contribution')}
                    className="px-2 py-1 rounded-md bg-[#5b3fd1] text-white text-[11px] font-bold hover:bg-[#431fb9] cursor-pointer"
                  >
                    Pay ($1k)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderSent(true);
                      setTimeout(() => setReminderSent(false), 3000);
                    }}
                    className="px-2 py-1 rounded-md bg-white border border-[#e6deff] text-[#431fb9] text-[11px] font-bold hover:bg-[#f2ebff] cursor-pointer"
                  >
                    {reminderSent ? 'Sent!' : 'Nudge'}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="p-2.5 rounded-xl bg-[#f2ebff] text-[11px] text-[#431fb9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">shield</span>
              <span>Protected by automated PayPal sandbox consensus escrow.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Ledger Table */}
      <div className="rounded-2xl bg-white border border-[#e6deff] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-['Bricolage_Grotesque',sans-serif] text-base font-bold text-[#1d1833]">
              Recent Ledger Activity
            </h3>
            <p className="text-[11px] text-[#797586]">Cryptographic audit trail for Dubai run</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ledger')}
            className="text-[12px] font-bold text-[#5b3fd1] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="bg-[#f7f1ff] text-[#797586] text-[10px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 rounded-l-lg">Time</th>
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr className="hover:bg-[#fdf8ff]">
                <td className="py-2.5 px-3 text-[#797586]">May 17, 10:22 AM</td>
                <td className="py-2.5 px-3 font-semibold text-[#1d1833]">Release Claim #REQ-118</td>
                <td className="py-2.5 px-3">Dubai Gadget Wholesale</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      approvedLocal ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fef3c7] text-[#b45309]'
                    }`}
                  >
                    {approvedLocal ? 'Consensus Approved' : 'Pending Vote (2/3)'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-700 font-mono">
                  ($1,661.00)
                </td>
              </tr>
              <tr className="hover:bg-[#fdf8ff]">
                <td className="py-2.5 px-3 text-[#797586]">May 16, 04:15 PM</td>
                <td className="py-2.5 px-3 font-semibold text-[#1d1833]">Escrow Payout</td>
                <td className="py-2.5 px-3">Shenzhen Brightline Co.</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-semibold">
                    Paid via PayPal
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-[#431fb9] font-mono">
                  ($1,960.00)
                </td>
              </tr>
              <tr className="hover:bg-[#fdf8ff]">
                <td className="py-2.5 px-3 text-[#797586]">May 15, 08:30 AM</td>
                <td className="py-2.5 px-3 font-semibold text-[#1d1833]">ACH Member Deposit</td>
                <td className="py-2.5 px-3">Ibrahim M.</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-semibold">
                    Settled
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">
                  +$1,000.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Invite Members Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setCopiedLink(false);
        }}
        title="Invite Members to Pool"
        subtitle="Dubai Run 2026 • Escrow Vault #DXB-9942"
        icon="group_add"
        iconBg="bg-[#f2ebff]"
        iconColor="text-[#431fb9]"
      >
        <div className="space-y-4">
          <p className="text-[13px] text-[#484554] leading-relaxed">
            Share this secure invite link with group buyers. Members pledge their share directly through PayPal into the protected multi-party vault pot.
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
