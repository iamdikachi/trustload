'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';

interface CreateGroupScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onCreateGroup?: (data: any) => void;
}

export function CreateGroupScreen({ onNavigate, onCreateGroup }: CreateGroupScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState('Phone accessories, Dubai run');
  const [currency, setCurrency] = useState<'USD' | 'AED' | 'NGN' | 'EUR' | 'GBP'>('USD');
  const [consensus, setConsensus] = useState<'majority' | 'unanimous'>('majority');
  const [perMemberContribution, setPerMemberContribution] = useState<number>(1000);
  const [totalTarget, setTotalTarget] = useState<number>(5000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateGroup) {
      onCreateGroup({
        name: groupName,
        baseCurrency: currency,
        totalPotTarget: totalTarget,
        approvalThreshold: consensus === 'majority' ? 0.6 : 1.0,
      });
    }
    onNavigate('dashboard');
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-2">
      {/* Back Navigation */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e6deff] text-[#431fb9] hover:bg-[#f2ebff] text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Overview</span>
        </button>
      </div>

      {/* Page Header & Stepper Track */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-label-sm text-[11px] px-2.5 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] font-semibold tracking-wide uppercase">
              Group Pool Architecture
            </span>
            <span className="font-label-sm text-[11px] text-[#797586] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b3fd1]"></span> Multi-Party Consensus
            </span>
          </div>
          <h1 className="font-headline-lg text-3xl sm:text-4xl font-black text-[#1d1833] tracking-tight">
            Create Group Pool
          </h1>
          <p className="font-body-md text-[14px] text-[#484554] max-w-xl mt-1">
            Lock shared rules, define target procurement manifests, and invite pooled capital depositors under automated OCR audit consensus.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-[#e6deff] flex items-center gap-1 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              step === 1 ? 'bg-[#f2ebff] text-[#431fb9]' : 'text-[#484554]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#431fb9] text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Setup &amp; Rules</span>
          </button>
          <span className="material-symbols-outlined text-[#797586] text-[18px]">chevron_right</span>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              step === 2 ? 'bg-[#f2ebff] text-[#431fb9]' : 'text-[#484554] opacity-70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#e6deff] text-[#1d1833] text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span>Manifest &amp; Invites</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Form Parameters & Manifest Builder (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {step === 1 ? (
            <>
              {/* Card 1: Core Parameters & Traveler Identity */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e6deff]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                    </span>
                    <h2 className="text-base font-bold text-[#1d1833]">Pool Configuration</h2>
                  </div>
                  <span className="text-[11px] text-[#797586]">Section 1.1</span>
                </div>

                <div className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                      Group Trip Title
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-[#f7f1ff] text-[#1d1833] border border-[#e6deff] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#c9beff]"
                    />
                  </div>

                  {/* Base Settlement Currency */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                      Base Settlement Currency
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['USD', 'AED', 'NGN', 'EUR', 'GBP'] as const).map((c) => {
                        const symbols: Record<string, string> = {
                          USD: '($)',
                          AED: '(د.إ)',
                          NGN: '(₦)',
                          EUR: '(€)',
                          GBP: '(£)',
                        };
                        const isSelected = currency === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCurrency(c)}
                            className={`h-11 rounded-lg text-[13px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#5b3fd1] text-white font-bold shadow-sm'
                                : 'bg-[#f7f1ff] hover:bg-[#ece4ff] text-[#484554] border border-[#e6deff]'
                            }`}
                          >
                            <span className="font-bold">{c}</span>
                            <span className="text-[10px] opacity-80">{symbols[c]}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-[#484554] mt-1.5">
                      All ledger debits, supplier purchase receipts, and reimbursement splits normalize to this base token.
                    </p>
                  </div>

                  {/* Designated Procurement Traveler Card */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                      Designated Procurement Traveler
                    </label>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f7f1ff] border border-[#e6deff]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#431fb9] flex items-center justify-center text-white text-[15px] font-bold shadow-sm">
                          CO
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-[#1d1833]">Chidi O. (You)</span>
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-bold">
                              <span className="material-symbols-outlined text-[13px]">verified</span> Verified Agent
                            </span>
                          </div>
                          <p className="text-[11px] text-[#484554]">
                            +234 ••• ••• 4190 • DXB Trade License Level 2
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#797586]">lock</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Card 2: Consensus Policy */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e6deff]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                      <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
                    </span>
                    <h2 className="text-base font-bold text-[#1d1833]">Consensus &amp; Release Policy</h2>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#e6deff] text-[#1b0063] font-semibold">
                    Strict Multi-Sig
                  </span>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setConsensus('majority')}
                    className={`flex items-start p-3.5 rounded-xl cursor-pointer transition-all border ${
                      consensus === 'majority'
                        ? 'bg-[#f7f1ff] border-[#5b3fd1] shadow-sm'
                        : 'bg-white border-[#e6deff] hover:bg-[#f7f1ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consensus"
                      checked={consensus === 'majority'}
                      onChange={() => setConsensus('majority')}
                      className="mt-1 w-4 h-4 text-[#5b3fd1] accent-[#5b3fd1]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#1d1833]">
                          Majority Sign-off (Recommended)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-bold">
                          3 of 5 Quorum
                        </span>
                      </div>
                      <p className="text-[12px] text-[#484554] mt-1">
                        At least 3 of 5 contributors must sign off on OCR-parsed invoices before funds disburse.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setConsensus('unanimous')}
                    className={`flex items-start p-3.5 rounded-xl cursor-pointer transition-all border ${
                      consensus === 'unanimous'
                        ? 'bg-[#f7f1ff] border-[#5b3fd1] shadow-sm'
                        : 'bg-white border-[#e6deff] hover:bg-[#f7f1ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consensus"
                      checked={consensus === 'unanimous'}
                      onChange={() => setConsensus('unanimous')}
                      className="mt-1 w-4 h-4 text-[#5b3fd1] accent-[#5b3fd1]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#1d1833]">
                          Unanimous Clearance (100%)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#797586] font-semibold">
                          5 of 5 Quorum
                        </span>
                      </div>
                      <p className="text-[12px] text-[#484554] mt-1">
                        All 5 members must individually verify optical line items. A single objection pauses settlement.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </>
          ) : (
            /* Step 2: Manifest & Depositor Setup */
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6deff]">
                <h2 className="text-base font-bold text-[#1d1833]">Procurement Manifest Items</h2>
                <span className="text-[11px] text-[#431fb9] font-semibold">+ Add Custom Item</span>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="p-3 bg-[#f7f1ff] rounded-xl flex justify-between items-center border border-[#e6deff]">
                  <div>
                    <span className="font-bold text-[#1d1833] block">Phone Cases (MagSafe Slim)</span>
                    <span className="text-[11px] text-[#484554]">Target quantity: 500 units • $1.44/ea</span>
                  </div>
                  <span className="font-bold text-[#1d1833]">$720.00</span>
                </div>
                <div className="p-3 bg-[#f7f1ff] rounded-xl flex justify-between items-center border border-[#e6deff]">
                  <div>
                    <span className="font-bold text-[#1d1833] block">Tempered Glass Screen Protectors</span>
                    <span className="text-[11px] text-[#484554]">Target quantity: 1,200 units • $0.75/ea</span>
                  </div>
                  <span className="font-bold text-[#1d1833]">$900.00</span>
                </div>
                <div className="p-3 bg-[#f7f1ff] rounded-xl flex justify-between items-center border border-[#e6deff]">
                  <div>
                    <span className="font-bold text-[#1d1833] block">Braided USB-C Fast Charging Cables</span>
                    <span className="text-[11px] text-[#484554]">Target quantity: 800 units • $1.25/ea</span>
                  </div>
                  <span className="font-bold text-[#1d1833]">$1,000.00</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[13px] font-semibold text-[#1d1833] mb-1">
                  Expected Capital per Member Seat
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1d1833]">$</span>
                  <input
                    type="number"
                    value={perMemberContribution}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPerMemberContribution(v);
                      setTotalTarget(v * 5);
                    }}
                    className="w-32 h-10 px-3 bg-[#f7f1ff] rounded-lg border border-[#e6deff] text-[13px] font-semibold text-[#1d1833]"
                  />
                  <span className="text-[12px] text-[#484554]">x 5 members = Total Target ${totalTarget}</span>
                </div>
              </div>
            </section>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => (step === 2 ? setStep(1) : onNavigate('dashboard'))}
              className="px-5 py-2.5 rounded-xl bg-[#ece4ff] hover:bg-[#e6deff] text-[#484554] text-[13px] font-semibold transition-all cursor-pointer"
            >
              {step === 2 ? '← Back to Rules' : 'Cancel'}
            </button>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-md transition-all cursor-pointer"
              >
                Continue to Manifest &amp; Invites →
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-md transition-all cursor-pointer"
              >
                Save &amp; Launch Group Pool
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e6deff]">
            <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
            <span className="font-bold text-[13px] text-[#1d1833]">Live Group Pool Preview</span>
          </div>

          <div>
            <span className="text-[11px] text-[#797586] uppercase tracking-wider block">Pool Name</span>
            <span className="text-base font-bold text-[#1d1833]">{groupName}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff]">
              <span className="text-[#797586] block text-[10px] uppercase">Base Currency</span>
              <span className="font-bold text-[#1d1833]">{currency}</span>
            </div>
            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff]">
              <span className="text-[#797586] block text-[10px] uppercase">Sign-Off Quorum</span>
              <span className="font-bold text-[#1d1833]">
                {consensus === 'majority' ? '3 of 5 (60%)' : '5 of 5 (100%)'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-[#f2ebff] rounded-xl border border-[#e6deff] space-y-1">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#484554]">Target Vault Pot:</span>
              <span className="font-bold text-[#431fb9] text-base">${totalTarget}.00</span>
            </div>
            <p className="text-[11px] text-[#484554]">
              Protected in the multi-party group pot with automatic refund triggers.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

