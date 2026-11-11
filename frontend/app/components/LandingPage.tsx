'use client';

import React, { useState } from 'react';
import {
  ShieldIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  PayPalIcon,
  ArrowRightIcon,
  EyeOffIcon,
  ScaleIcon,
  GlobeIcon,
  UploadIcon,
  ChevronDownIcon,
  FileTextIcon,
  CoinsIcon,
  RefreshIcon,
  UserIcon,
} from './Icons';

interface LandingPageProps {
  onEnterApp: () => void;
  onStartGroup: () => void;
}

export function LandingPage({ onEnterApp, onStartGroup }: LandingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [approvedInDemo, setApprovedInDemo] = useState(false);

  const faqs = [
    {
      q: 'Does the traveler carry cash?',
      a: 'No. The traveler requests staged payouts through PayPal as purchases are made abroad, or uses digital cards backed by the authorized release amount. Funds stay safely in escrow until the group reviews and approves each invoice.',
    },
    {
      q: 'Which currencies work?',
      a: 'Any currency! The traveler can buy goods in Chinese Yuan (CNY), UAE Dirhams (AED), Turkish Lira (TRY), British Pounds (GBP), Euros (EUR), and more. AI extracts amounts and converts deterministically to the group base currency with recorded live FX rates.',
    },
    {
      q: 'Who holds the money?',
      a: 'Funds are securely deposited into a pooled PayPal Sandbox pot. Neither the traveler nor individual members can withdraw or redirect money without achieving the required group consensus approval threshold.',
    },
    {
      q: 'What if an invoice is wrong?',
      a: 'Gemini multimodal AI flags discrepancies immediately—such as quantity mismatches, unauthorized items, arithmetic errors, or unrealistic exchange rates. Members review the detailed AI report and vote to reject or hold the release until corrected.',
    },
    {
      q: 'Is this free?',
      a: 'TrustLoad is built as an open hackathon demonstration. All escrow, payout, and refund mechanics run against PayPal’s official Sandbox platform with zero transaction fees during the evaluation period.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-zinc-900 font-sans antialiased selection:bg-[#582be8] selection:text-white">
      {/* 1. Header / Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onEnterApp}>
            <div className="w-8 h-8 rounded-lg bg-[#582be8] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <ShieldIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-950">
              TrustLoad
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-600">
            <a href="#how-it-works" className="hover:text-zinc-950 transition-colors">
              How it works
            </a>
            <a href="#use-cases" className="hover:text-zinc-950 transition-colors">
              Use cases
            </a>
            <a href="#faq" className="hover:text-zinc-950 transition-colors">
              FAQ
            </a>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onEnterApp}
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-2 py-1.5 transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onStartGroup}
              className="bg-[#582be8] hover:bg-[#4a24c7] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm shadow-purple-500/25 transition-all cursor-pointer"
            >
              Start a group
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              title="Demo user profile"
              className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 text-[#582be8] flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-12 sm:pt-16 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/80 px-3 py-1 text-xs font-semibold text-[#582be8]">
              <SparklesIcon className="w-3.5 h-3.5 text-[#582be8]" />
              <span>Built with PayPal and AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.08] text-zinc-950">
              Pool money. Buy<br />
              together.<br />
              Everyone sees<br />
              every naira.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl font-normal">
              For pooled items, group buying trips abroad, something everyone can trust. Fully audited pot, staged releases, and AI verification on every foreign invoice.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onStartGroup}
                className="bg-[#582be8] hover:bg-[#4a24c7] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-lg shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                Start a group
              </button>
              <a
                href="#how-it-works"
                className="bg-white hover:bg-zinc-50 text-zinc-800 text-xs sm:text-sm font-semibold px-5 py-3 rounded-lg border border-zinc-200/90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>See how it works</span>
              </a>
            </div>

            <p className="text-[11px] text-zinc-400">
              Pay in any currency, payouts flow through PayPal.
            </p>
          </div>

          {/* Right Hero Interactive Widget Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xl shadow-purple-500/5 p-6 space-y-4 relative">
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-700 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE TRIP TO DUBAI</span>
                </div>
                <span className="bg-purple-50 text-[#582be8] border border-purple-200/70 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                  Trip status: Active
                </span>
              </div>

              {/* Pot Balance */}
              <div>
                <p className="text-xs text-zinc-500">
                  From pooled pot, Dubai trip | Traveler: <strong className="text-zinc-800 font-semibold">Chidi O.</strong>
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-zinc-950">$2,040</span>
                  <span className="text-xs font-semibold text-zinc-500">held in the pot</span>
                </div>
              </div>

              {/* Tri-color Segmented Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-zinc-100 flex overflow-hidden">
                  <div className="bg-[#582be8] h-full" style={{ width: '38%' }} title="Released so far" />
                  <div className="bg-[#3b82f6] h-full" style={{ width: '45%' }} title="Reserved" />
                  <div className="bg-purple-100 h-full" style={{ width: '17%' }} title="Available" />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#582be8]" /> Released so far ($835)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Reserved ($1,205)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-200" /> Available ($0)
                  </span>
                </div>
              </div>

              {/* Status Note Banner */}
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/70 text-[11px] text-zinc-600 leading-snug">
                Latest release: 2 of 4 proposed | $1,280 request from Chidi awaiting group approval
              </div>

              {/* Sub-card: Staged Release Request with AI Flags */}
              <div className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block">Dubai Gadget Wholesale</span>
                    <span className="text-[10px] text-zinc-400 font-medium">AED 4,700 - 15 Nov 2026</span>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Pending approval
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-1.5 text-amber-800">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Invoice stated quantity 200, but order was 150</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-zinc-600">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live AED/USD rate $0.2724 applied (fair market: $0.2720)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Hero Card */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-500 font-medium">
                  {approvedInDemo ? '✓ 3 of 3 members approved' : '2 of 3 members approved'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setApprovedInDemo(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovedInDemo(true);
                      setTimeout(onEnterApp, 700);
                    }}
                    className="bg-[#582be8] hover:bg-[#4a24c7] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm shadow-purple-500/20 cursor-pointer transition-all"
                  >
                    {approvedInDemo ? 'Approved!' : 'Approve release'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: "THE REALITY OF GROUP BUYING" */}
      <section className="py-20 bg-white border-y border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              THE REALITY OF GROUP BUYING
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              Group buying runs on trust. That<br className="hidden sm:inline" /> is the problem.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Every week, groups in Nigeria pool millions of naira to buy inventory and personal items from Dubai, Guangzhou, Istanbul, and the UK. Trust is the currency, but WhatsApp screenshots, fuzzy receipts, and unverified rates leave everyone wondering who’s taking a cut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-zinc-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#582be8] flex items-center justify-center">
                <EyeOffIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900">No visibility</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every buyer is separated from their money’s secret.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-zinc-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#582be8] flex items-center justify-center">
                <ScaleIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900">Arguments over shares</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Splits turn sour after the trip: who owes what?
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-zinc-200/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#582be8] flex items-center justify-center">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900">No recourse</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                If the traveler goes silent or money gets missing, there is no recourse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: "STEP BY STEP PROCESS" - How TrustLoad works */}
      <section id="how-it-works" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            STEP BY STEP PROCESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
            How TrustLoad works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600">
            From pooled pot to final delivery, every step is protected by PayPal Sandbox, verified by AI, and recorded on the immutable ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 01 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-4">
            <span className="text-xs font-bold text-purple-600 font-mono">01</span>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Fund the pot.</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Everyone pledges their share through PayPal into a shared pot.
              </p>
            </div>
            {/* Visual checklist */}
            <div className="p-3 bg-zinc-50/80 rounded-xl space-y-1.5 text-xs font-medium border border-zinc-100">
              {[
                { name: 'Chidi', amount: '$500 paid', status: 'paid' },
                { name: 'Tunde', amount: '$500 paid', status: 'paid' },
                { name: 'Ngozi', amount: '$500 paid', status: 'paid' },
                { name: 'Ibrahim', amount: '$500 paid', status: 'paid' },
                { name: 'You', amount: '$40 pending', status: 'pending' },
              ].map((m, idx) => (
                <div key={idx} className="flex justify-between items-center text-zinc-700">
                  <span className="text-xs font-medium">{m.name}</span>
                  {m.status === 'paid' ? (
                    <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded">
                      {m.amount}
                    </span>
                  ) : (
                    <span className="text-amber-800 font-semibold text-[11px] bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded">
                      {m.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 02 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-4">
            <span className="text-xs font-bold text-purple-600 font-mono">02</span>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Request a release.</h3>
              <p className="text-xs text-zinc-500 mt-1">
                The traveler uploads an invoice, receipt, and notes for each release.
              </p>
            </div>
            {/* Visual upload box */}
            <div className="p-8 border-2 border-dashed border-zinc-200 rounded-xl text-center space-y-2 bg-zinc-50/50">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center mx-auto">
                <UploadIcon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-zinc-800">Drop an invoice here or choose a file</p>
              <p className="text-[11px] text-zinc-400">Supports any currency, any language</p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-4">
            <span className="text-xs font-bold text-purple-600 font-mono">03</span>
            <div>
              <h3 className="text-base font-bold text-zinc-900">AI checks the invoice.</h3>
              <p className="text-xs text-zinc-500 mt-1">
                AI reads any language and currency, compares it to the group order, and flags matching issues and rate anomalies.
              </p>
            </div>
            {/* Visual AI report box */}
            <div className="p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] border border-purple-200/60">
                  Invoice: AL-029
                </span>
                <span className="font-mono text-zinc-500 text-[11px]">AED 4,700 ($1,280 USD)</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-600 font-medium">
                  <span>Verifying document...</span>
                  <span className="text-purple-600 font-bold">88%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                  <div className="bg-[#582be8] h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Arabic text recognized &amp; FX rate calculated ($0.2724)</span>
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-sm space-y-4">
            <span className="text-xs font-bold text-purple-600 font-mono">04</span>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Approve and split.</h3>
              <p className="text-xs text-zinc-500 mt-1">
                The group approves, PayPal sends the money, and AI splits goods and shared costs after the trip.
              </p>
            </div>
            {/* Visual approval progress */}
            <div className="p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-700 font-medium">Dubai Gadget Wholesale</span>
                <span className="font-bold text-emerald-600 text-[11px]">2/3 approved</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-700 font-medium">Release funds to traveler</span>
                <span className="font-bold text-blue-600 text-[11px]">Payout sent via PayPal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-700 font-medium">Guangzhou Fabric Co.</span>
                <span className="font-semibold text-zinc-500 text-[11px]">Approved &amp; settled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: "ARTIFICIAL INTELLIGENCE" Deep Dive */}
      <section id="ai-verification" className="py-20 bg-white border-y border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                ARTIFICIAL INTELLIGENCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
                AI that reads the invoice so you do not have to.
              </h2>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center shrink-0">
                    <GlobeIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Multilingual scanning</h3>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Reads invoices and receipts in Chinese, Arabic, Turkish, English, and more.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center shrink-0">
                    <CoinsIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Real-time exchange</h3>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Converts foreign currencies to your group’s base currency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center shrink-0">
                    <ShieldIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Transparent reasoning</h3>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Explains every flag in plain words.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Verification Report Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#FBFBFE] rounded-2xl border border-zinc-200/90 shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-200/80">
                  <span className="font-bold text-[#582be8] bg-purple-100 px-2.5 py-0.5 rounded text-[10px]">
                    CONFIRMATION REPORT
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <RefreshIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900">
                  Dubai Gadget Wholesale, AED 4,700
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                      <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Discrepancy: Quantity does not match</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900/90">
                      Receipt states quantity 200, but group order listed 150.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                      <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Discrepancy: Mathematical Error</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900/90">
                      Subtotals don’t sum to the total: off by AED 120.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-800">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verified line items</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-900/90">
                      Matched 3 item codes to original order request.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-zinc-500 text-center font-medium">
                  AI confidence: 96% · Flag applied to release record
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: "BUILT ON PAYPAL INFRASTRUCTURE" */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="max-w-xl space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            BUILT ON PAYPAL INFRASTRUCTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
            Your money moves only when the group says so.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center">
              <CoinsIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Staged release</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Money is released in agreed instalments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Group approval</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Nothing moves without your approval on record.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Live ledger</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Every naira has a PayPal transaction reference.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#582be8] flex items-center justify-center">
              <PayPalIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Full and exact</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Leftover funds return to each member automatically.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Section: "VERSATILE BY DESIGN & EXTENSION" */}
      <section id="use-cases" className="py-20 bg-white border-y border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="max-w-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              VERSATILE BY DESIGN &amp; EXTENSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              Built for any group that pools money.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Core Hackathon Card */}
            <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-200/90 shadow-sm space-y-3 relative">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                Core Hackathon
              </span>
              <h3 className="font-bold text-sm text-zinc-900">Buying trips abroad</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                China, Dubai, Turkey, the UK and beyond.
              </p>
              <button
                type="button"
                onClick={onEnterApp}
                className="text-xs font-bold text-[#582be8] hover:underline flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>See how TrustLoad fits</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-zinc-200/80 space-y-3">
              <h3 className="font-bold text-sm text-zinc-900">Community projects</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Boreholes, maintenance, neighbourhood funds.
              </p>
              <button
                type="button"
                onClick={onEnterApp}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>Read extension</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-zinc-200/80 space-y-3">
              <h3 className="font-bold text-sm text-zinc-900">Events and family contributions</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Weddings, memorials, seasonal family funds.
              </p>
              <button
                type="button"
                onClick={onEnterApp}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>Explore use case</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#FBFBFE] border border-zinc-200/80 space-y-3">
              <h3 className="font-bold text-sm text-zinc-900">Trade associations</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Market unions, bulk purchase clubs, cooperatives.
              </p>
              <button
                type="button"
                onClick={onEnterApp}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 pt-2 cursor-pointer"
              >
                <span>Explore use case</span>
                <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section: 3 Value Pillars */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#582be8] mx-auto flex items-center justify-center">
              <CoinsIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Any currency</h3>
            <p className="text-xs text-zinc-500">
              Output FX conversion rates for all major wholesale markets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#582be8] mx-auto flex items-center justify-center">
              <GlobeIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Any language</h3>
            <p className="text-xs text-zinc-500">
              Automatic OCR extracts text in foreign invoices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#582be8] mx-auto flex items-center justify-center">
              <PayPalIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Every payment on the record</h3>
            <p className="text-xs text-zinc-500">
              Immutable audit trail backed by PayPal payment IDs.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Section: "COMMON QUESTIONS" - FAQ */}
      <section id="faq" className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              COMMON QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200/80 overflow-hidden bg-[#FBFBFE] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-900 hover:text-purple-700 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        isOpen ? 'rotate-180 text-purple-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <section className="bg-gradient-to-r from-[#4A1FB8] via-[#582be8] to-[#431fb3] text-white py-16 px-4 sm:px-6 text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Start your first group in two minutes.
        </h2>
        <p className="text-xs sm:text-sm text-purple-100 max-w-md mx-auto font-normal">
          Create a pool, invite members, and connect PayPal in seconds.
        </p>
        <button
          type="button"
          onClick={onStartGroup}
          className="bg-white hover:bg-zinc-100 text-[#582be8] text-xs sm:text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg cursor-pointer transition-all"
        >
          Start a group
        </button>
      </section>

      {/* 11. Footer */}
      <footer className="bg-[#0f1019] text-zinc-400 py-12 px-4 sm:px-6 text-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldIcon className="w-4 h-4 text-purple-400" />
              <span>TrustLoad</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Pool money. Buy together. Everyone sees every naira.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it works
            </a>
            <a href="#use-cases" className="hover:text-white transition-colors">
              Use cases
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <button
              type="button"
              onClick={onEnterApp}
              className="text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
            >
              App Dashboard →
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-zinc-800/80 flex flex-wrap justify-between text-[11px] text-zinc-500">
          <span>Built for the PayPal AI Hackathon 2026.</span>
          <span>© 2026 TrustLoad. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
