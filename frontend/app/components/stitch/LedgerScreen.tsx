'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';

interface LedgerScreenProps {
  onNavigate: (path: ScreenPath) => void;
}

export function LedgerScreen({ onNavigate }: LedgerScreenProps) {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'release' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 'tx-1',
      category: 'deposit',
      title: 'Member Deposit',
      subtitle: 'Batch Contribution #1',
      member: 'Ibrahim M.',
      avatar: 'IM',
      date: 'May 17, 2026, 09:12 AM',
      ref: 'PP-TX-99482103',
      amount: '+$1,000.00',
      isCredit: true,
      status: 'Escrowed / Cleared',
      statusClass: 'bg-[#f2ebff] text-[#431fb9]',
    },
    {
      id: 'tx-2',
      category: 'pending',
      title: 'Disbursement Hold Request',
      subtitle: 'Invoice #DGW-7741 • AED 6,100',
      member: 'Dubai Gadget Wholesale',
      avatar: 'DG',
      date: 'May 17, 2026, 10:22 AM',
      ref: 'PP-REQ-1184920',
      amount: '($1,661.00)',
      isCredit: false,
      status: 'Pending Signatures (2/3)',
      statusClass: 'bg-[#fef3c7] text-[#b45309]',
    },
    {
      id: 'tx-3',
      category: 'release',
      title: 'Traveler Payout',
      subtitle: 'Direct Supplier Remittance • CNY 14,200',
      member: 'Shenzhen Brightline Co.',
      avatar: 'SB',
      date: 'May 16, 2026, 04:45 PM',
      ref: 'PP-PO-88129034',
      amount: '-$1,960.00',
      isCredit: false,
      status: 'Disbursed (3 of 3 approved)',
      statusClass: 'bg-[#e7deff] text-[#1f005f]',
    },
    {
      id: 'tx-4',
      category: 'deposit',
      title: 'Member Deposit',
      subtitle: 'Batch Contribution #1',
      member: 'Ngozi E.',
      avatar: 'NE',
      date: 'May 15, 2026, 11:30 AM',
      ref: 'PP-TX-77491028',
      amount: '+$1,000.00',
      isCredit: true,
      status: 'Escrowed / Cleared',
      statusClass: 'bg-[#f2ebff] text-[#431fb9]',
    },
    {
      id: 'tx-5',
      category: 'deposit',
      title: 'Member Deposit',
      subtitle: 'Batch Contribution #1',
      member: 'Tunde A.',
      avatar: 'TA',
      date: 'May 14, 2026, 03:15 PM',
      ref: 'PP-TX-66381920',
      amount: '+$1,000.00',
      isCredit: true,
      status: 'Escrowed / Cleared',
      statusClass: 'bg-[#f2ebff] text-[#431fb9]',
    },
    {
      id: 'tx-6',
      category: 'deposit',
      title: 'Member Deposit',
      subtitle: 'Pool Genesis Pledge #1',
      member: 'Amaka O.',
      avatar: 'AO',
      date: 'May 14, 2026, 02:40 PM',
      ref: 'PP-TX-55271819',
      amount: '+$1,000.00',
      isCredit: true,
      status: 'Escrowed / Cleared',
      statusClass: 'bg-[#f2ebff] text-[#431fb9]',
    },
  ];

  const filtered = transactions.filter((tx) => {
    if (filter !== 'all' && tx.category !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.ref.toLowerCase().includes(q) ||
        tx.member.toLowerCase().includes(q) ||
        tx.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ece4ff] text-[#431fb9] font-label-sm text-[11px] uppercase tracking-wider shadow-sm font-bold">
              <span className="material-symbols-outlined text-[14px]">verified_user</span> Multi-Sig Consensus Active
            </span>
            <span className="font-label-sm text-[11px] text-[#484554] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b3fd1]"></span> Node v2.4-sandbox
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl sm:text-4xl font-black text-[#1d1833] tracking-tight">
            Escrow Ledger &amp; Transaction Audit
          </h1>
          <p className="font-body-md text-[14px] text-[#484554] flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#1d1833]">Phone accessories, Dubai run</span>
            <span className="text-[#797586]">•</span>
            <span>Every naira and dollar anchored to a verified PayPal sandbox transaction.</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-end">
          <button
            type="button"
            onClick={() => {
              const csv = `Timestamp,Transaction,Member,PayPal Reference,Amount,Status\n` +
                transactions.map(t => `"${t.date}","${t.title}","${t.member}","${t.ref}","${t.amount}","${t.status}"`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `trustload_escrow_ledger.csv`;
              a.click();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e6deff] text-[#431fb9] hover:bg-[#d6cdff] transition-all font-label-lg text-[13px] font-bold shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV / PDF audit report</span>
          </button>
          <button
            type="button"
            onClick={() => window.open('https://sandbox.paypal.com', '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5b3fd1] text-white hover:bg-[#431fb9] transition-all font-label-lg text-[13px] font-bold shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span>View PayPal Merchant Sandbox</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pot Deposited */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e6deff] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-[13px] text-[#484554]">Total Pot Deposited</span>
            <span className="w-8 h-8 rounded-lg bg-[#f7f1ff] flex items-center justify-center text-[#431fb9]">
              <span className="material-symbols-outlined text-[18px]">savings</span>
            </span>
          </div>
          <div className="text-3xl font-black text-[#1d1833] mb-1">$4,000.00</div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ece4ff] text-[#431fb9] font-label-sm text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b3fd1] mr-1"></span>4 deposits cleared
            </span>
            <span className="text-[11px] text-[#797586]">80% of total target</span>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e6deff] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-[13px] text-[#484554]">Disbursed to Traveler</span>
            <span className="w-8 h-8 rounded-lg bg-[#e7deff] flex items-center justify-center text-[#1f005f]">
              <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
            </span>
          </div>
          <div className="text-3xl font-black text-[#633fce] mb-1">$1,960.00</div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] font-label-sm text-[10px] font-semibold">
              1 verified release
            </span>
            <span className="text-[11px] text-[#797586]">Shenzhen supplier</span>
          </div>
        </div>

        {/* Current Vault Balance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e6deff] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-[13px] text-[#484554]">Current Vault Balance</span>
            <span className="w-8 h-8 rounded-lg bg-[#e6deff] flex items-center justify-center text-[#431fb9]">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </span>
          </div>
          <div className="text-3xl font-black text-[#1d1833] mb-1">$2,040.00</div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-label-sm text-[10px] font-semibold">
              <span className="material-symbols-outlined text-[12px] mr-1">shield</span> Secured
            </span>
            <span className="text-[11px] text-[#797586]">Ready for stage 2</span>
          </div>
        </div>

        {/* Pending / Pipeline */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e6deff] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-[13px] text-[#484554]">Pending / Pipeline</span>
            <span className="w-8 h-8 rounded-lg bg-[#ece4ff] flex items-center justify-center text-[#45387f]">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </span>
          </div>
          <div className="text-3xl font-black text-[#1d1833] mb-1">$1,661.00</div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ece4ff] text-[#45387f] font-label-sm text-[10px] font-semibold">
              Consensus pending
            </span>
            <span className="text-[11px] text-[#797586]">1 invoice match</span>
          </div>
        </div>
      </div>

      {/* Liquidity Visualizer Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e6deff] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/3">
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="font-semibold text-[#1d1833]">Escrow Liquidity State</span>
            <span className="text-[#484554]">49.0% Released • 51.0% Locked</span>
          </div>
          <div className="h-4 w-full bg-[#f2ebff] rounded-full overflow-hidden flex p-0.5 gap-0.5">
            <div className="h-full bg-[#5b3fd1] rounded-l-full transition-all duration-500" style={{ width: '49%' }}></div>
            <div className="h-full bg-[#7c5be8] rounded-r-full transition-all duration-500" style={{ width: '51%' }}></div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[12px] flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#5b3fd1]"></span>
            <span className="text-[#484554]">Released: <strong className="text-[#1d1833] font-semibold">$1,960.00</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#7c5be8]"></span>
            <span className="text-[#484554]">Vault Locked: <strong className="text-[#1d1833] font-semibold">$2,040.00</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#c9c4d7]"></span>
            <span className="text-[#484554]">Awaiting Gate: <strong className="text-[#1d1833] font-semibold">$1,000.00</strong></span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e6deff] flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#5b3fd1] text-white shadow-sm'
                : 'bg-[#f7f1ff] text-[#484554] hover:bg-[#ece4ff]'
            }`}
          >
            All transactions (6)
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              filter === 'deposit'
                ? 'bg-[#5b3fd1] text-white shadow-sm'
                : 'bg-[#f7f1ff] text-[#484554] hover:bg-[#ece4ff]'
            }`}
          >
            Deposits only (4)
          </button>
          <button
            onClick={() => setFilter('release')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              filter === 'release'
                ? 'bg-[#5b3fd1] text-white shadow-sm'
                : 'bg-[#f7f1ff] text-[#484554] hover:bg-[#ece4ff]'
            }`}
          >
            Releases only (1)
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#5b3fd1] text-white shadow-sm'
                : 'bg-[#f7f1ff] text-[#484554] hover:bg-[#ece4ff]'
            }`}
          >
            Pending actions (1)
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-grow sm:w-64">
          <span className="material-symbols-outlined text-[18px] text-[#797586] absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference ID, member..."
            className="w-full h-11 pl-9 pr-3 bg-[#f7f1ff] rounded-xl text-[13px] text-[#1d1833] placeholder:text-[#797586] focus:outline-none focus:ring-2 focus:ring-[#c9beff] border border-[#e6deff]"
          />
        </div>
      </div>

      {/* Comprehensive Ledger Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e6deff] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f1ff] text-[#484554] font-label-sm text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-6 font-semibold">Transaction &amp; Category</th>
                <th className="py-3.5 px-4 font-semibold">Member / Beneficiary</th>
                <th className="py-3.5 px-4 font-semibold">Date &amp; Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">PayPal Reference</th>
                <th className="py-3.5 px-6 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6deff] text-[13px]">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#f7f1ff]/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                        <span className="material-symbols-outlined text-[20px]">
                          {tx.category === 'deposit'
                            ? 'add_circle'
                            : tx.category === 'release'
                            ? 'payments'
                            : 'pending_actions'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-[#1d1833]">{tx.title}</div>
                        <div className="text-[12px] text-[#484554]">{tx.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#1d1833]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#ece4ff] flex items-center justify-center text-[#431fb9] text-[11px] font-bold">
                        {tx.avatar}
                      </div>
                      <span>{tx.member}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#484554] whitespace-nowrap text-[12px]">
                    {tx.date}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-[12px] text-[#1d1833] bg-[#f7f1ff] border border-[#e6deff] px-2 py-1 rounded-md">
                      {tx.ref}
                    </span>
                  </td>
                  <td
                    className={`py-4 px-6 text-right font-headline-sm text-base font-bold ${
                      tx.isCredit ? 'text-[#15803d]' : 'text-[#633fce]'
                    }`}
                  >
                    {tx.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-[11px] font-semibold ${tx.statusClass}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Transaction audit token: ${tx.ref}\nAnchored to PayPal Sandbox.\nCryptographic status: Verified.`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#f7f1ff] hover:bg-[#ece4ff] text-[#431fb9] font-label-md text-[12px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Receipt</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

