'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';
import { Modal } from './Modal';

interface FinalSplitScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onSettleGroup?: () => void;
}

export function FinalSplitScreen({ onNavigate, onSettleGroup }: FinalSplitScreenProps) {
  const [isDisbursed, setIsDisbursed] = useState(false);
  const [autoOffset, setAutoOffset] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDisburse = () => {
    setIsDisbursed(true);
    if (onSettleGroup) {
      onSettleGroup();
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header Area */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-[11px] tracking-wider uppercase text-[#431fb9] font-bold">
              Consensus Reached
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9c4d7]"></span>
            <span className="font-label-sm text-[11px] text-[#484554]">
              Batch Ref: #DXB-8821-EXP
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl sm:text-4xl font-black text-[#1d1833] tracking-tight">
            Trip Reconciliation &amp; Final Split
          </h1>
          <p className="font-body-md text-[14px] text-[#484554] max-w-3xl">
            Phone accessories, Dubai run • AI-calculated net settlement across goods purchases, shared logistics, and deposits.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] font-label-md text-[13px] font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Reconciled (OCR Match 100%)
          </span>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 rounded-lg bg-[#f2ebff] hover:bg-[#ece4ff] text-[#1d1833] flex items-center justify-center transition-all cursor-pointer"
            title="View History"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
        </div>
      </div>

      {/* Top Summary Metrics Grid (4 cards across desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Surplus / Pot Balance */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff] relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-[#f7f1ff] rounded-full flex items-center justify-center text-[#5b3fd1]">
            <span className="material-symbols-outlined text-[28px]">savings</span>
          </div>
          <div className="flex items-center gap-2 text-[#484554] text-[13px] font-medium mb-1">
            <span>Surplus / Pot Balance</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-[#431fb9] mb-1">
            $1,379.00
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#484554]">
            <span className="inline-flex items-center text-[#15803d] font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 27.6%
            </span>
            <span>Leftover Pot Surplus saved</span>
          </div>
        </div>

        {/* Card 2: Total Disbursed */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff] relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-[#f7f1ff] rounded-full flex items-center justify-center text-[#431fb9]">
            <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
          </div>
          <div className="flex items-center gap-2 text-[#484554] text-[13px] font-medium mb-1">
            <span>Total Disbursed</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-[#1d1833] mb-1">
            $3,621.00
          </div>
          <div className="text-[12px] text-[#484554] truncate">
            Shenzhen ($1,960) + Dubai ($1,661)
          </div>
        </div>

        {/* Card 3: Shared Freight */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff] relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-[#f7f1ff] rounded-full flex items-center justify-center text-[#7c5be8]">
            <span className="material-symbols-outlined text-[28px]">local_shipping</span>
          </div>
          <div className="flex items-center gap-2 text-[#484554] text-[13px] font-medium mb-1">
            <span>Shared Freight Pool</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-[#1d1833] mb-1">
            $320.00
          </div>
          <div className="text-[12px] text-[#484554]">
            $64.00 apportioned equally across 5
          </div>
        </div>

        {/* Card 4: Total Paid In */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff] relative overflow-hidden group">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-[#f7f1ff] rounded-full flex items-center justify-center text-[#45387f]">
            <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div className="flex items-center gap-2 text-[#484554] text-[13px] font-medium mb-1">
            <span>Total Paid In</span>
          </div>
          <div className="text-3xl font-black tracking-tight text-[#1d1833] mb-1">
            $4,000.00
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#484554]">
            <span className="w-2 h-2 rounded-full bg-[#b45309]"></span>
            <span>4 of 5 deposited ($1,000 unpaid Bola)</span>
          </div>
        </div>
      </div>

      {/* Segmented Escrow Liquidity Visualizer */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1d1833] text-[14px]">
              Escrow Allocation &amp; Safety Cushion
            </span>
            <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-[#e6deff] text-[#431fb9] font-semibold">
              Active Pot
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[#484554] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#5b3fd1]"></span>
              <span>Disbursed Out ($3,621.00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#7c5be8]"></span>
              <span>Unallocated Surplus ($379.00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#c9c4d7]"></span>
              <span>Receivable Gap ($529.00)</span>
            </div>
          </div>
        </div>
        <div className="w-full h-4 bg-[#e6deff] rounded-full overflow-hidden flex p-0.5 gap-0.5">
          <div
            className="h-full bg-[#5b3fd1] rounded-l-full transition-all"
            style={{ width: '72.4%' }}
            title="Disbursed purchases: 72.4%"
          ></div>
          <div
            className="h-full bg-[#7c5be8] transition-all"
            style={{ width: '7.6%' }}
            title="Surplus pool: 7.6%"
          ></div>
          <div
            className="h-full bg-[#c9c4d7] rounded-r-full transition-all"
            style={{ width: '20%' }}
            title="Pending member collections: 20%"
          ></div>
        </div>
      </div>

      {/* Two-Column Settlement & Proof Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Member Net Settlement Breakdown - 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#e6deff] overflow-hidden">
            <div className="p-5 bg-white border-b border-[#e6deff]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#1d1833]">Individual Member Balances</h2>
                  <p className="text-[12px] text-[#484554]">
                    5 participants verified via biometric passkey &amp; smart escrow receipts
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2ebff] text-[#484554] text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-[#431fb9]">calculate</span>
                  <span>Deposit − [Goods + Freight] = Net Settlement</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f7f1ff] text-[#484554] text-[11px]">
                <span className="font-semibold text-[#1d1833]">Settlement Rules:</span>
                <span className="flex items-center gap-1 text-[#15803d]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span> Positive = Automated Refund
                </span>
                <span className="flex items-center gap-1 text-[#b45309]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]"></span> Negative = Payment Requested
                </span>
              </div>
            </div>

            {/* Member Rows */}
            <div className="divide-y divide-[#ece4ff]">
              {/* Member 1: Amaka */}
              <div className="p-5 hover:bg-[#f7f1ff]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-11 h-11 rounded-full bg-[#e6deff] flex items-center justify-center text-[#431fb9] font-bold text-sm">
                    AO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1d1833]">Amaka Okafor</span>
                      <span className="material-symbols-outlined text-[16px] text-[#15803d]">verified_user</span>
                    </div>
                    <span className="text-[12px] text-[#484554]">amaka.okafor@email.com</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center flex-1 max-w-sm text-[12px]">
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Paid Deposit</span>
                    <span className="font-semibold text-[#1d1833]">$1,000.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Goods Invoiced</span>
                    <span className="font-semibold text-[#1d1833]">$720.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Freight (1/5)</span>
                    <span className="font-semibold text-[#1d1833]">$64.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px]">
                  <div className="text-right text-[11px] text-[#484554]">
                    <div>Total Absorbed</div>
                    <div className="font-medium">$784.00</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[12px] font-bold shadow-sm">
                    +$216.00 Refund Due
                  </span>
                </div>
              </div>

              {/* Member 2: Tunde */}
              <div className="p-5 hover:bg-[#f7f1ff]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-11 h-11 rounded-full bg-[#e7deff] flex items-center justify-center text-[#633fce] font-bold text-sm">
                    TA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1d1833]">Tunde Adeleke</span>
                      <span className="material-symbols-outlined text-[16px] text-[#15803d]">verified_user</span>
                    </div>
                    <span className="text-[12px] text-[#484554]">tunde.ade@techhub.ng</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center flex-1 max-w-sm text-[12px]">
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Paid Deposit</span>
                    <span className="font-semibold text-[#1d1833]">$1,000.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Goods Invoiced</span>
                    <span className="font-semibold text-[#1d1833]">$810.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Freight (1/5)</span>
                    <span className="font-semibold text-[#1d1833]">$64.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px]">
                  <div className="text-right text-[11px] text-[#484554]">
                    <div>Total Absorbed</div>
                    <div className="font-medium">$874.00</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[12px] font-bold shadow-sm">
                    +$126.00 Refund Due
                  </span>
                </div>
              </div>

              {/* Member 3: Ngozi */}
              <div className="p-5 hover:bg-[#f7f1ff]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-11 h-11 rounded-full bg-[#ece4ff] flex items-center justify-center text-[#45387f] font-bold text-sm">
                    NE
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1d1833]">Ngozi Eze</span>
                      <span className="material-symbols-outlined text-[16px] text-[#15803d]">verified_user</span>
                    </div>
                    <span className="text-[12px] text-[#484554]">eze.ngozi@globaltrade.co</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center flex-1 max-w-sm text-[12px]">
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Paid Deposit</span>
                    <span className="font-semibold text-[#1d1833]">$1,000.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Goods Invoiced</span>
                    <span className="font-semibold text-[#1d1833]">$690.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Freight (1/5)</span>
                    <span className="font-semibold text-[#1d1833]">$64.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px]">
                  <div className="text-right text-[11px] text-[#484554]">
                    <div>Total Absorbed</div>
                    <div className="font-medium">$754.00</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[12px] font-bold shadow-sm">
                    +$246.00 Refund Due
                  </span>
                </div>
              </div>

              {/* Member 4: Ibrahim */}
              <div className="p-5 hover:bg-[#f7f1ff]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-11 h-11 rounded-full bg-[#ece4ff] flex items-center justify-center text-[#1d1833] font-bold text-sm">
                    IB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1d1833]">Ibrahim Bello</span>
                      <span className="material-symbols-outlined text-[16px] text-[#797586]">check_circle</span>
                    </div>
                    <span className="text-[12px] text-[#484554]">ibrahim.bello@lagos.org</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center flex-1 max-w-sm text-[12px]">
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Paid Deposit</span>
                    <span className="font-semibold text-[#1d1833]">$1,000.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Goods Invoiced</span>
                    <span className="font-semibold text-[#1d1833]">$1,050.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Freight (1/5)</span>
                    <span className="font-semibold text-[#1d1833]">$64.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px]">
                  <div className="text-right text-[11px] text-[#484554]">
                    <div>Total Absorbed</div>
                    <div className="font-medium">$1,114.00</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fef3c7] text-[#b45309] text-[12px] font-bold shadow-sm">
                    -$114.00 Balance to Pay
                  </span>
                </div>
              </div>

              {/* Member 5: Bola */}
              <div className="p-5 hover:bg-[#f7f1ff]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#ffdad6]/20">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-11 h-11 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] font-bold text-sm">
                    BT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-[#1d1833]">Bola Tinubu</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold uppercase tracking-wider">
                        Unpaid
                      </span>
                    </div>
                    <span className="text-[12px] text-[#484554]">bola.tinubu@ventures.ng</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center flex-1 max-w-sm text-[12px]">
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Paid Deposit</span>
                    <span className="font-semibold text-[#ba1a1a]">$0.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Goods Invoiced</span>
                    <span className="font-semibold text-[#1d1833]">$351.00</span>
                  </div>
                  <div>
                    <span className="text-[#797586] block text-[10px] uppercase">Freight (1/5)</span>
                    <span className="font-semibold text-[#1d1833]">$64.00</span>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px]">
                  <div className="text-right text-[11px] text-[#484554]">
                    <div>Total Absorbed</div>
                    <div className="font-medium">$415.00</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fee2e2] text-[#b91c1c] text-[12px] font-bold shadow-sm">
                    -$415.00 Balance to Pay
                  </span>
                </div>
              </div>
            </div>

            {/* Table Bottom Aggregate Bar */}
            <div className="p-4 bg-[#ece4ff] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[#484554] text-[11px]">
                <span className="material-symbols-outlined text-[18px] text-[#431fb9]">shield</span>
                <span>All invoices parsed via Gemini Flash 2.0 OCR with SHA-256 item receipts.</span>
              </div>
              <div className="flex items-center gap-6 text-[13px] font-semibold">
                <span className="text-[#484554]">
                  Net Inflows Due: <strong className="text-[#b45309]">-$529.00</strong>
                </span>
                <span className="text-[#484554]">
                  Net Refunds Due: <strong className="text-[#15803d]">+$588.00</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Ledger Balance Proof & Disbursal Actions - 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Mathematical Proof Box */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff]">
            <div className="flex items-center justify-between pb-3 mb-4 bg-[#f7f1ff] -mx-5 -mt-5 p-5 rounded-t-xl border-b border-[#e6deff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <h3 className="font-bold text-[13px] text-[#1d1833]">Ledger Balance Proof</h3>
                  <span className="text-[11px] text-[#15803d] font-semibold">$0.00 audit discrepancy</span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#15803d] font-bold">
                Perfect Match (100%)
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between text-[#484554]">
                <span>Total Member Deposits</span>
                <span className="font-semibold text-[#1d1833]">$4,000.00</span>
              </div>
              <div className="flex items-center justify-between text-[#484554]">
                <span>Total Purchases &amp; Freight</span>
                <span className="font-semibold text-[#ba1a1a]">-$3,621.00</span>
              </div>
              <div className="h-px bg-[#ece4ff] my-1"></div>
              <div className="flex items-center justify-between text-[#1d1833] font-bold text-sm">
                <span>Net Member Surplus to Return</span>
                <span className="text-[#15803d]">+$379.00</span>
              </div>
            </div>

            {/* Escrow Multi-Sig & Safety Rule Banner */}
            <div className="mt-4 p-3 rounded-lg bg-[#f7f1ff] border border-[#e6deff] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#431fb9] text-[18px] shrink-0 mt-0.5">
                lock_clock
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[12px] text-[#1d1833]">Escrow Safety Rule</span>
                <p className="text-[11px] text-[#484554] leading-relaxed">
                  Smart escrow consensus ensures funds cannot disburse unless pending payments (<strong className="text-[#1d1833] font-semibold">$529.00</strong>) are cleared or offset against the surplus pool.
                </p>
              </div>
            </div>

            {/* Sign-Off Status Micro Visualizer */}
            <div className="mt-4 pt-2">
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="text-[#484554] font-medium">Consensus Sign-Off</span>
                <span className="font-bold text-[#431fb9]">4 of 5 Approved</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                <div className="h-2 rounded-full bg-[#15803d]" title="Amaka Approved"></div>
                <div className="h-2 rounded-full bg-[#15803d]" title="Tunde Approved"></div>
                <div className="h-2 rounded-full bg-[#15803d]" title="Ngozi Approved"></div>
                <div className="h-2 rounded-full bg-[#15803d]" title="Ibrahim Approved"></div>
                <div className="h-2 rounded-full bg-[#c9c4d7]" title="Bola Pending"></div>
              </div>
            </div>
          </div>

          {/* Main Action & Payout Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6deff] relative overflow-hidden">
            <span className="font-label-sm text-[10px] uppercase tracking-wider text-[#431fb9] font-bold">
              Execution Phase
            </span>
            <h3 className="text-base font-bold text-[#1d1833] mt-1 mb-1">Execute Batch Payout</h3>
            <p className="text-[12px] text-[#484554] mb-4 leading-relaxed">
              Instant settlement payout to Amaka, Tunde &amp; Ngozi verified PayPal accounts with zero fees.
            </p>

            <button
              type="button"
              onClick={handleDisburse}
              disabled={isDisbursed}
              className={`w-full py-3.5 px-6 rounded-xl font-label-lg text-[13px] font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isDisbursed
                  ? 'bg-[#15803d] text-white'
                  : 'bg-[#5b3fd1] hover:bg-[#431fb9] text-white active:scale-[0.98]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDisbursed ? 'check_circle' : 'payments'}
              </span>
              <span>{isDisbursed ? 'Refunds Dispatched via PayPal ✓' : 'Disburse refunds via PayPal ($588.00)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-[#f2ebff] hover:bg-[#ece4ff] text-[#431fb9] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download Settlement PDF</span>
            </button>

            {/* Offset Toggle Option */}
            <div className="mt-3 p-3 rounded-lg bg-[#f7f1ff] border border-[#e6deff] flex items-center justify-between">
              <div className="flex flex-col pr-2">
                <span className="text-[12px] font-semibold text-[#1d1833]">Auto-offset Bola deficit</span>
                <span className="text-[10px] text-[#484554]">Absorb from surplus pot temporarily</span>
              </div>
              <input
                type="checkbox"
                checked={autoOffset}
                onChange={(e) => setAutoOffset(e.target.checked)}
                className="w-4 h-4 text-[#5b3fd1] rounded cursor-pointer accent-[#5b3fd1]"
              />
            </div>

            <div className="mt-3 flex items-center gap-1.5 justify-center text-[#797586] text-[11px]">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>256-Bit Escrow Vault Protected</span>
            </div>
          </div>
        </div>
      </div>
      {/* Settlement PDF Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setIsDownloading(false);
        }}
        title="Settlement Audit Document"
        subtitle="Cryptographic Certificate • Batch #DXB-8821-EXP"
        icon="description"
        iconBg="bg-[#f2ebff]"
        iconColor="text-[#431fb9]"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#fdf8ff] border border-[#e6deff] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6deff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-[22px]">picture_as_pdf</span>
                <span className="font-bold text-[13px] text-[#1d1833]">
                  TrustLoad_Dubai_Run_Final_Settlement.pdf
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <span className="text-[#797586] block text-[11px]">Total Escrow Processed:</span>
                <span className="font-bold text-[#1d1833]">$5,000.00 USD</span>
              </div>
              <div>
                <span className="text-[#797586] block text-[11px]">Vendor Releases:</span>
                <span className="font-bold text-[#431fb9]">$4,412.00 USD</span>
              </div>
              <div>
                <span className="text-[#797586] block text-[11px]">Refunds to Members:</span>
                <span className="font-bold text-emerald-600">+$588.00 USD</span>
              </div>
              <div>
                <span className="text-[#797586] block text-[11px]">Consensus Quorum:</span>
                <span className="font-bold text-[#1d1833]">3 of 3 Unanimous</span>
              </div>
            </div>

            <div className="text-[10px] text-[#797586] font-mono bg-white p-2 rounded-lg border border-zinc-100">
              SHA256: 9b2d8f4e1903c73ba547841c6f93284918e983427189bfcc
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-[#e6deff] text-[#484554] text-[13px] font-semibold hover:bg-[#f2ebff] cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDownloading(true);
                setTimeout(() => {
                  setIsDownloading(false);
                  setIsPdfModalOpen(false);
                }, 1500);
              }}
              className="px-4 py-2 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isDownloading ? 'hourglass_top' : 'download'}
              </span>
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

