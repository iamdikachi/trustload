'use client';

import React, { useState } from 'react';

interface LandingPageProps {
  onEnterApp: () => void;
  onStartGroup: () => void;
}

export function LandingPage({ onEnterApp, onStartGroup }: LandingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [approvedInDemo, setApprovedInDemo] = useState(false);

  const faqs = [
    {
      q: 'Does the AI move my money?',
      a: 'No. AI reads and checks invoices. Only a group approval can release money.',
    },
    {
      q: 'Which currencies work?',
      a: "Invoices can be in any currency. Amounts are converted to your group's currency with the rate recorded.",
    },
    {
      q: 'Who holds the money?',
      a: 'It sits in the group pot, paid through PayPal, and is released in stages.',
    },
    {
      q: 'What if an invoice is wrong?',
      a: 'The AI flags the mismatch and the group can reject or ask for a corrected invoice.',
    },
    {
      q: 'Is this live?',
      a: 'This is a hackathon build running in PayPal sandbox mode, so no real money moves.',
    },
  ];

  return (
    <div className="bg-[#fdf8ff] text-[#1d1833] font-['Public_Sans',sans-serif] text-[15px] leading-[24px] antialiased selection:bg-[#5b3fd1] selection:text-white min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#ffffff]/80 backdrop-blur-xl border-b border-[#e6deff]">
        <div className="h-[72px] max-w-[1200px] mx-auto px-5 md:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEnterApp}
              className="flex items-center gap-2.5 cursor-pointer text-left bg-transparent border-0 p-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#431fb9] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[20px] text-[#1d1833] tracking-tight">
                TrustLoad
              </span>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              className="text-[#1d1833] hover:text-[#431fb9] text-[15px] font-normal transition-colors"
              href="#how-it-works"
            >
              How it works
            </a>
            <a
              className="text-[#1d1833] hover:text-[#431fb9] text-[15px] font-normal transition-colors"
              href="#use-cases"
            >
              Use cases
            </a>
            <a
              className="text-[#1d1833] hover:text-[#431fb9] text-[15px] font-normal transition-colors"
              href="#faq"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onEnterApp}
              className="text-[#431fb9] hover:text-[#5b3fd1] font-semibold text-[15px] transition-colors cursor-pointer bg-transparent border-0"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onStartGroup}
              className="inline-flex items-center justify-center h-[48px] px-6 rounded-[10px] bg-[#431fb9] text-white font-semibold text-[15px] hover:bg-[#5b3fd1] transition-all cursor-pointer shadow-sm border-0"
            >
              Start a group
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              title="Dashboard profile"
              className="w-8 h-8 rounded-full bg-[#431fb9] flex items-center justify-center shrink-0 cursor-pointer border-0 text-white"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="w-full pt-[72px] bg-[#fdf8ff] min-h-[calc(100vh-72px)]">
        <div className="flex flex-col w-full">
          {/* 1. HERO SECTION (Section 8.1) */}
          <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#EEE9FE] to-[#ffffff] pt-10 pb-24">
            {/* Ambient Radial Glow Behind Product Preview */}
            <div className="pointer-events-none absolute top-12 right-0 w-[550px] h-[550px] rounded-full bg-[#C9B8FF]/40 blur-[100px] -z-0" />
            <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column: Copy & Actions */}
                <div className="lg:col-span-6 flex flex-col items-start gap-4">
                  {/* Eyebrow Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EEE9FE] text-[#5B3FD1] font-semibold text-[13px]">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    <span>Built with PayPal and AI</span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#1A1530] text-[40px] md:text-[60px] lg:text-[64px] tracking-tight leading-[1.05]">
                    Pool money. Buy together. Everyone sees every naira.
                  </h1>

                  {/* Subheadline */}
                  <p className="text-[#5D5877] max-w-xl text-[17px] leading-relaxed font-normal">
                    TrustLoad turns group buying trips into something everyone can trust. Fund a shared pot, check every invoice with AI, and release money only when the group approves.
                  </p>

                  {/* Buttons Group */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onStartGroup}
                      className="inline-flex items-center justify-center h-[48px] px-6 rounded-[10px] bg-[#5B3FD1] text-white font-semibold text-[15px] hover:bg-[#4B32B3] transition-colors shadow-sm cursor-pointer border-0"
                    >
                      Start a group
                    </button>
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center justify-center h-[48px] px-6 rounded-[10px] bg-white text-[#1A1530] font-semibold text-[15px] shadow-sm hover:bg-[#FAF9FE] border border-[#e6deff]/60 transition-colors"
                    >
                      See how it works
                    </a>
                  </div>

                  {/* Sandbox Note */}
                  <p className="text-[#5D5877] text-[14px]">
                    Free to try in sandbox mode. No real money moves.
                  </p>
                </div>

                {/* Right Column: Product Preview Card */}
                <div className="lg:col-span-6 w-full">
                  <div className="relative bg-white rounded-[20px] p-6 shadow-[0_16px_48px_rgba(91,63,209,0.16)] border border-[#e6deff]/50 flex flex-col gap-4">
                    {/* Group Header Meta */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                        <span className="font-semibold uppercase tracking-wider text-[#5D5877] text-[11px]">
                          Active Trip Ledger
                        </span>
                      </div>
                      <span className="font-semibold text-[#5B3FD1] bg-[#EEE9FE] px-2.5 py-0.5 rounded-full text-[11px]">
                        Dubai Run 2026
                      </span>
                    </div>

                    <div>
                      <p className="text-[13px] text-[#5D5877]">
                        Phone accessories, Dubai run • Traveler:{' '}
                        <span className="font-semibold text-[#1A1530]">Chidi O.</span>
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[44px] md:text-[56px] text-[#1A1530] tracking-tight leading-none">
                          $2,040
                        </span>
                        <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#5D5877] text-xl">
                          held in the pot
                        </span>
                      </div>
                    </div>

                    {/* Money Trail Signature Component */}
                    <div className="flex flex-col gap-2 pt-1">
                      {/* Visual Bar */}
                      <div className="w-full h-[16px] rounded-full overflow-hidden flex bg-[#E3DEF5]">
                        <div
                          className="h-full bg-[#5B3FD1] transition-all"
                          style={{ width: '39.2%' }}
                          title="Released: $1,960"
                        />
                        <div
                          className="h-full bg-[#8D6CFA] transition-all"
                          style={{ width: '40.8%' }}
                          title="Held: $2,040"
                        />
                        <div
                          className="h-full bg-[#E3DEF5]"
                          style={{ width: '20%' }}
                          title="Pending: $1,000"
                        />
                      </div>

                      {/* Legend */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-semibold text-[12px] text-[#5D5877]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#5B3FD1] shrink-0" />
                          <span>Released ($1,960)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#8D6CFA] shrink-0" />
                          <span>Held in pot ($2,040)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#E3DEF5] shrink-0" />
                          <span>Unpaid ($1,000)</span>
                        </div>
                      </div>

                      {/* Sentence Descriptor */}
                      <p className="text-[13px] text-[#5D5877] leading-normal pt-1">
                        $4,000 paid in of $5,000 agreed. $1,960 has gone to the traveler against approved invoices.
                      </p>
                    </div>

                    {/* Release Request Sub-Card */}
                    <div className="rounded-[16px] bg-[#FAF9FE] p-4 flex flex-col gap-3 border border-zinc-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[17px] text-[#1A1530]">
                            Dubai Gadget Wholesale
                          </h4>
                          <p className="text-[13px] text-[#5D5877] font-medium">
                            AED 6,100 (~$1,661 USD)
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                          Needs your review
                        </span>
                      </div>

                      {/* Discrepancy Flag Items */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-2 text-[12px] text-[#B45309] font-medium">
                          <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">warning</span>
                          <span>Phone cases: invoice says 600, the order allows 500</span>
                        </div>
                        <div className="flex items-start gap-2 text-[12px] text-[#B45309] font-medium">
                          <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">warning</span>
                          <span>Line items add up to AED 6,340, not the AED 6,100 total</span>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <span className="font-semibold text-[12px] text-[#5D5877]">
                          {approvedInDemo ? '✓ 3 of 3 members approved' : '2 of 3 members approved'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setApprovedInDemo(false)}
                            className="h-8 px-3 rounded-[8px] bg-[#FEE2E2] text-[#B91C1C] font-semibold text-[12px] hover:opacity-90 transition-opacity cursor-pointer border-0"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setApprovedInDemo(true);
                              setTimeout(onEnterApp, 700);
                            }}
                            className="h-8 px-3 rounded-[8px] bg-[#5B3FD1] text-white font-semibold text-[12px] hover:bg-[#4B32B3] transition-colors cursor-pointer border-0"
                          >
                            {approvedInDemo ? 'Approved!' : 'Approve release'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. THE PROBLEM SECTION (Section 8.2) */}
          <section className="w-full bg-[#FAF9FE] py-20 border-t border-[#e6deff]/40">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12 flex flex-col gap-8">
              <div className="max-w-2xl flex flex-col gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#5B3FD1] text-[11px]">
                  The Reality of Group Sourcing
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[32px] md:text-[40px] text-[#1A1530] leading-tight">
                  Group buying runs on trust. That is the problem.
                </h2>
                <p className="text-[#5D5877] text-[15px] leading-relaxed">
                  Every week, groups of traders across Africa pool money and send one person abroad to buy goods for everyone. Nobody sees the receipts, shares get argued over, and when something goes wrong there is nothing to point to.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Card 1 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[22px]">visibility_off</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[20px] text-[#1A1530]">
                    No visibility
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    Contributors cannot see how their money is spent.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[22px]">balance</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[20px] text-[#1A1530]">
                    Arguments over shares
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    Splitting the goods after the trip turns into a fight.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[22px]">gavel</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[20px] text-[#1A1530]">
                    No recourse
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    If the wrong goods arrive or money goes missing, there is no record.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. HOW IT WORKS (Section 8.3) */}
          <section className="w-full bg-white py-24 border-t border-[#e6deff]/40" id="how-it-works">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12 flex flex-col gap-10">
              <div className="flex flex-col gap-2 text-center items-center">
                <span className="font-semibold uppercase tracking-wider text-[#5B3FD1] text-[11px]">
                  End-to-End Workflow
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[32px] md:text-[40px] text-[#1A1530]">
                  How TrustLoad works
                </h2>
                <p className="text-[#5D5877] max-w-xl text-[15px]">
                  Every movement of money is anchored in smart verification, pooled approval, and indisputable ledger clarity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Step 1 */}
                <div className="bg-[#FAF9FE] rounded-[16px] p-6 flex flex-col justify-between gap-4 border border-[#e6deff]/40">
                  <div className="flex flex-col gap-2">
                    <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#5B3FD1] text-[24px]">
                      01
                    </span>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[22px] text-[#1A1530]">
                      Fund the pot.
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      Every member pays their share through PayPal before the trip.
                    </p>
                  </div>

                  {/* Supporting Visual: 5 Contributor Rows */}
                  <div className="bg-white rounded-[12px] p-4 flex flex-col gap-2 shadow-sm border border-zinc-100">
                    {[
                      { name: 'Amaka', amount: '$1,000 paid', status: 'paid' },
                      { name: 'Tunde', amount: '$1,000 paid', status: 'paid' },
                      { name: 'Ngozi', amount: '$1,000 paid', status: 'paid' },
                      { name: 'Ibrahim', amount: '$1,000 paid', status: 'paid' },
                      { name: 'Bola', amount: '$1,000 waiting', status: 'waiting' },
                    ].map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[13px] py-1 border-b last:border-0 border-zinc-50">
                        <span className="font-medium text-[#1A1530]">{row.name}</span>
                        {row.status === 'paid' ? (
                          <span className="font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full text-[11px]">
                            {row.amount}
                          </span>
                        ) : (
                          <span className="font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full text-[11px]">
                            {row.amount}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-[#FAF9FE] rounded-[16px] p-6 flex flex-col justify-between gap-4 border border-[#e6deff]/40">
                  <div className="flex flex-col gap-2">
                    <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#5B3FD1] text-[24px]">
                      02
                    </span>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[22px] text-[#1A1530]">
                      Request a release.
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      The traveler uploads a supplier invoice and asks for part of the money.
                    </p>
                  </div>

                  {/* Supporting Visual: Invoice Drop Zone */}
                  <div className="bg-white rounded-[12px] p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm min-h-[160px] border border-dashed border-[#e6deff]">
                    <div className="w-10 h-10 rounded-full bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                      <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    </div>
                    <p className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[15px] text-[#1A1530]">
                      Drop an invoice here or choose a file
                    </p>
                    <p className="text-[12px] text-[#5D5877]">Photos and PDFs, any language</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-[#FAF9FE] rounded-[16px] p-6 flex flex-col justify-between gap-4 border border-[#e6deff]/40">
                  <div className="flex flex-col gap-2">
                    <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#5B3FD1] text-[24px]">
                      03
                    </span>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[22px] text-[#1A1530]">
                      AI checks the invoice.
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      It reads any language and currency, compares it to the group order, and flags anything that does not match.
                    </p>
                  </div>

                  {/* Supporting Visual: AI Inspection Badge */}
                  <div className="bg-white rounded-[12px] p-4 flex flex-col gap-2.5 shadow-sm border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#5B3FD1] bg-[#EEE9FE] px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-[13px]">auto_awesome</span> Vision AI OCR
                      </span>
                      <span className="text-[12px] text-[#5D5877]">Rate: 1 AED = 0.272 USD</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] bg-[#FAF9FE] p-2 rounded-[8px]">
                      <span className="font-medium text-[#1A1530]">Currency Normalized</span>
                      <span className="font-semibold text-[#1A1530]">AED 6,100 → $1,661.12</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#B45309]">
                      <span className="material-symbols-outlined text-[16px]">rule</span>
                      <span>Order spec mismatch: 600 units detected (limit: 500)</span>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-[#FAF9FE] rounded-[16px] p-6 flex flex-col justify-between gap-4 border border-[#e6deff]/40">
                  <div className="flex flex-col gap-2">
                    <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[#5B3FD1] text-[24px]">
                      04
                    </span>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[22px] text-[#1A1530]">
                      Approve and split.
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      The group approves, PayPal sends the money, and AI splits goods and costs fairly after the trip.
                    </p>
                  </div>

                  {/* Supporting Visual: Settlement Preview */}
                  <div className="bg-white rounded-[12px] p-4 flex flex-col gap-2 shadow-sm border border-zinc-100">
                    <div className="flex items-center justify-between text-[12px] text-[#5D5877] pb-1">
                      <span>Item &amp; Freight Allocation</span>
                      <span>Status</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#1A1530]">Vendor Release Approved</span>
                      <span className="text-[#15803D] font-semibold text-[11px] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                        Sent via PayPal
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#1A1530]">Shared Freight Apportionment</span>
                      <span className="text-[#5D5877] text-[12px] font-medium">$140.00 / member</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#1A1530]">Final Balance / Refund Due</span>
                      <span className="font-semibold text-[#5B3FD1] text-[12px]">Auto-calculated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. AI FEATURE SECTION (Section 8.4) */}
          <section className="w-full bg-[#FAF9FE] py-24 border-t border-[#e6deff]/40">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column: Copy & Value Points */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold uppercase tracking-wider text-[#5B3FD1] text-[11px]">
                      Invoice Intelligence
                    </span>
                    <h2 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[32px] md:text-[40px] text-[#1A1530] leading-tight">
                      AI that reads the invoice so you do not have to.
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Point 1 */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1] shrink-0">
                        <span className="material-symbols-outlined text-[20px]">translate</span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[16px] text-[#1A1530]">
                          Multilingual scanning
                        </h4>
                        <p className="text-[#5D5877] text-[15px]">
                          Reads photos and PDFs in Chinese, Arabic, Turkish, English and more
                        </p>
                      </div>
                    </div>

                    {/* Point 2 */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1] shrink-0">
                        <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[16px] text-[#1A1530]">
                          Real-time exchange
                        </h4>
                        <p className="text-[#5D5877] text-[15px]">
                          Converts every amount to your group&apos;s currency
                        </p>
                      </div>
                    </div>

                    {/* Point 3 */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1] shrink-0">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[16px] text-[#1A1530]">
                          Transparent reasoning
                        </h4>
                        <p className="text-[#5D5877] text-[15px]">
                          Explains every flag in plain words
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Large Invoice Report Card */}
                <div className="lg:col-span-6 w-full">
                  <div className="bg-white rounded-[20px] p-6 shadow-[0_16px_48px_rgba(91,63,209,0.16)] border border-[#e6deff]/50 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-[#5B3FD1] bg-[#EEE9FE] px-2.5 py-0.5 rounded-full text-[11px]">
                          Automated Audit Run
                        </span>
                        <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[20px] text-[#1A1530] mt-2">
                          Dubai Gadget Wholesale, AED 6,100
                        </h3>
                      </div>
                      <span className="material-symbols-outlined text-[#5B3FD1] text-[24px]">verified</span>
                    </div>

                    <div className="flex flex-col gap-3 py-2">
                      {/* Item 1: Amber */}
                      <div className="p-3.5 rounded-[12px] bg-[#FEF3C7] text-[#B45309] flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] shrink-0 mt-1.5" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px]">
                            Discrepancy: Quantity Over-allocation
                          </span>
                          <p className="text-[13px] leading-snug">
                            Phone cases: invoice says 600, the order allows 500
                          </p>
                        </div>
                      </div>

                      {/* Item 2: Amber */}
                      <div className="p-3.5 rounded-[12px] bg-[#FEF3C7] text-[#B45309] flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] shrink-0 mt-1.5" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px]">
                            Discrepancy: Mathematical Total
                          </span>
                          <p className="text-[13px] leading-snug">
                            Line items add up to AED 6,340, not the AED 6,100 total
                          </p>
                        </div>
                      </div>

                      {/* Item 3: Green */}
                      <div className="p-3.5 rounded-[12px] bg-[#DCFCE7] text-[#15803D] flex items-start gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] shrink-0 mt-1.5" />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[13px]">
                            Verified Line Items
                          </span>
                          <p className="text-[13px] leading-snug">
                            Remaining items match the group order
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[13px] border-t border-zinc-100">
                      <p className="font-semibold text-[#5D5877]">
                        AI recommends. People approve every payment.
                      </p>
                      <span className="material-symbols-outlined text-[#5D5877] text-[18px]">how_to_reg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. TRUST AND SAFETY SECTION (Section 8.5) */}
          <section className="w-full bg-white py-20 border-t border-[#e6deff]/40">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12 flex flex-col gap-8">
              <div className="max-w-xl flex flex-col gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#5B3FD1] text-[11px]">
                  Institutional Safeguards
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[32px] md:text-[40px] text-[#1A1530]">
                  Your money moves only when the group says so.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tile 1 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[20px]">layers</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                    Staged release
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    Money is released in parts, not all at once.
                  </p>
                </div>

                {/* Tile 2 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                    Group approval
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    Nothing is paid without an approval on record.
                  </p>
                </div>

                {/* Tile 3 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                    Live ledger
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    Every naira has a PayPal reference.
                  </p>
                </div>

                {/* Tile 4 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#EEE9FE] flex items-center justify-center text-[#5B3FD1]">
                    <span className="material-symbols-outlined text-[20px]">history_edu</span>
                  </div>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                    Full audit trail
                  </h3>
                  <p className="text-[#5D5877] text-[15px]">
                    Invoices, AI results and approvals are all kept.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. USE CASES SECTION (Section 8.6) */}
          <section className="w-full bg-[#FAF9FE] py-20 border-t border-[#e6deff]/40" id="use-cases">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="font-semibold uppercase tracking-wider text-[#5B3FD1] text-[11px]">
                  Versatile Collective Escrow
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[32px] md:text-[40px] text-[#1A1530]">
                  Built for any group that pools money.
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Case 1: Highlighted Live Demo */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col justify-between gap-4 ring-2 ring-[#5B3FD1]/20">
                  <div className="flex flex-col gap-2">
                    <span className="self-start px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-semibold text-[11px]">
                      Live in this demo
                    </span>
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530] mt-1">
                      Buying trips abroad
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      China, Dubai, Turkey, the UK and beyond.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onEnterApp}
                    className="font-semibold text-[#5B3FD1] flex items-center gap-1 hover:underline cursor-pointer text-left bg-transparent border-0 p-0 text-[13px]"
                  >
                    Active pathway <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                {/* Case 2 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                      Community projects
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      Boreholes, transformers, street lights.
                    </p>
                  </div>
                  <span className="font-semibold text-[#5D5877] text-[13px]">Infrastructure</span>
                </div>

                {/* Case 3 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                      Events and family contributions
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      Weddings, memorials, extended family funds.
                    </p>
                  </div>
                  <span className="font-semibold text-[#5D5877] text-[13px]">Social &amp; Family</span>
                </div>

                {/* Case 4 */}
                <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_2px_rgba(26,21,48,0.06),0_8px_24px_rgba(91,63,209,0.08)] border border-[#e6deff]/40 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[18px] text-[#1A1530]">
                      Trade association dues
                    </h3>
                    <p className="text-[#5D5877] text-[15px]">
                      Market unions, artisan guilds, collective purchases.
                    </p>
                  </div>
                  <span className="font-semibold text-[#5D5877] text-[13px]">Commerce Unions</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. NUMBERS STRIP (Section 8.7) */}
          <section className="w-full bg-white py-16 border-t border-[#e6deff]/40">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#FAF9FE] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-2 border border-[#e6deff]/40">
                  <span className="material-symbols-outlined text-[#5B3FD1] text-[32px]">payments</span>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[28px] text-[#1A1530]">
                    Any currency
                  </h3>
                  <p className="text-[#5D5877] text-[13px]">
                    Global FX conversion synced at exact checkout rates
                  </p>
                </div>
                <div className="bg-[#FAF9FE] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-2 border border-[#e6deff]/40">
                  <span className="material-symbols-outlined text-[#5B3FD1] text-[32px]">language</span>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[28px] text-[#1A1530]">
                    Any language
                  </h3>
                  <p className="text-[#5D5877] text-[13px]">
                    Automated OCR parsing for global trade receipts
                  </p>
                </div>
                <div className="bg-[#FAF9FE] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-2 border border-[#e6deff]/40">
                  <span className="material-symbols-outlined text-[#5B3FD1] text-[32px]">lock</span>
                  <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[28px] text-[#1A1530]">
                    Every payment on the record
                  </h3>
                  <p className="text-[#5D5877] text-[13px]">
                    Immutable audit trail backed by PayPal payment IDs
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FAQ SECTION (Section 8.8) */}
          <section className="w-full bg-[#FAF9FE] py-24 border-t border-[#e6deff]/40" id="faq">
            <div className="max-w-[800px] mx-auto px-5 md:px-12 flex flex-col gap-8">
              <div className="flex flex-col gap-2 text-center items-center">
                <span className="font-semibold uppercase tracking-wider text-[#5B3FD1] text-[11px]">
                  Common Questions
                </span>
                <h2 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[32px] md:text-[40px] text-[#1A1530]">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-[#e6deff]/50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer border-0 bg-transparent"
                      >
                        <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[17px] text-[#1A1530]">
                          {faq.q}
                        </span>
                        <span
                          className={`material-symbols-outlined text-[#5D5877] transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#5B3FD1]' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-0 border-t border-zinc-100/60 pt-3">
                          <p className="text-[#5D5877] text-[15px] leading-relaxed font-normal">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 9. FINAL CALL TO ACTION BAND (Section 8.9) */}
          <section className="w-full bg-gradient-to-r from-[#2A1B63] to-[#5B3FD1] text-white py-20">
            <div className="max-w-[1200px] mx-auto px-5 md:px-12 text-center flex flex-col items-center gap-4">
              <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[32px] md:text-[36px] font-bold text-white leading-tight">
                Start your first group in two minutes.
              </h2>
              <p className="text-[#EEE9FE] max-w-xl text-[17px] font-normal">
                Create a pool, invite vendors, and connect PayPal in seconds.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onStartGroup}
                  className="inline-flex items-center justify-center h-[48px] px-8 rounded-[10px] bg-white text-[#2A1B63] font-semibold text-[15px] hover:bg-[#FAF9FE] shadow-lg transition-colors cursor-pointer border-0"
                >
                  Start a group
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#322d49] text-[#f4eeff]/80">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#431fb9] flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[20px] text-white">
                  TrustLoad
                </span>
              </div>
              <p className="text-[#f4eeff]/80 text-[15px] max-w-sm">
                Pool money. Buy together. Everyone sees every naira.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a
                className="text-[13px] font-semibold text-[#f4eeff]/80 hover:text-white transition-colors"
                href="#how-it-works"
              >
                How it works
              </a>
              <a
                className="text-[13px] font-semibold text-[#f4eeff]/80 hover:text-white transition-colors"
                href="#use-cases"
              >
                Use cases
              </a>
              <a
                className="text-[13px] font-semibold text-[#f4eeff]/80 hover:text-white transition-colors"
                href="#faq"
              >
                FAQ
              </a>
              <button
                type="button"
                onClick={onEnterApp}
                className="text-[13px] font-bold text-[#c9beff] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                App Dashboard →
              </button>
            </div>
          </div>

          <div className="border-t border-[#c9c4d7]/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#f4eeff]/60">
            <p>Built for the PayPal AI Hackathon 2026.</p>
            <p>© 2026 TrustLoad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
