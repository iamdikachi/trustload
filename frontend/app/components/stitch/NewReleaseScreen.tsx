'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';

interface NewReleaseScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onSubmitRelease?: (data: any) => void;
}

export function NewReleaseScreen({ onNavigate, onSubmitRelease }: NewReleaseScreenProps) {
  const [vendorName, setVendorName] = useState('Dubai Gadget Wholesale LLC');
  const [currency, setCurrency] = useState('AED');
  const [amountForeign, setAmountForeign] = useState('6100.00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmitRelease) {
        onSubmitRelease({
          vendorName,
          currency,
          amountForeign: Number(amountForeign),
          amountBaseUSD: 1661,
        });
      }
      onNavigate('dashboard');
    }, 600);
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto py-2">
      {/* Top Context & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 font-label-md text-[13px] text-[#431fb9] hover:text-[#5b3fd1] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Group Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ece4ff] text-[#431fb9] font-label-sm text-[11px] shadow-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#431fb9] animate-pulse"></span>
            Pool status: Active
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-sm border border-[#e6deff] text-[#1d1833] font-label-sm text-[11px]">
            <span className="material-symbols-outlined text-[16px] text-[#431fb9]">account_balance</span>
            Escrow liquidity available: <span className="font-bold text-[#431fb9]">$2,040.00 USD</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="mb-8 relative">
        <span className="font-label-sm text-[11px] uppercase tracking-widest text-[#431fb9] font-bold">
          Consensus Disbursement Protocol
        </span>
        <h1 className="font-headline-lg text-3xl sm:text-4xl font-black text-[#1d1833] tracking-tight mt-1">
          New Release Request
        </h1>
        <p className="font-body-md text-[14px] text-[#484554] mt-1.5">
          Batch #DXB-89 • Phone accessories, Dubai run • Submitted by Traveler:{' '}
          <span className="text-[#1d1833] font-medium">Chidi O.</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Expense details, Document Ingestion, Line Items (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. Supplier & Settlement Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6deff]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e6deff]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#5b3fd1] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h2 className="text-base font-bold text-[#1d1833]">Supplier &amp; settlement details</h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] font-semibold">
                Deira Registry #4928
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                  Verified wholesale supplier
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#f7f1ff] border border-[#e6deff]">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#431fb9] text-[20px]">storefront</span>
                    <div>
                      <span className="text-[13px] font-bold text-[#1d1833] block">
                        {vendorName}
                      </span>
                      <span className="text-[11px] text-[#484554]">
                        Shop 14, Al Sabkha Bldg, Deira Market, Dubai
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#ece4ff] text-[#431fb9] font-semibold">
                    Verified merchant
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                  Claim currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-11 px-3 bg-[#f7f1ff] rounded-lg border border-[#e6deff] text-[13px] text-[#1d1833] font-semibold"
                >
                  <option value="AED">AED (د.إ) — UAE Dirham</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="CNY">CNY (¥) — Chinese Yuan</option>
                  <option value="TRY">TRY (₺) — Turkish Lira</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                  Invoiced release claim
                </label>
                <div className="h-11 px-3.5 rounded-lg bg-[#f7f1ff] border border-[#e6deff] flex items-center justify-between">
                  <span className="font-bold text-[#1d1833] text-[15px]">
                    {amountForeign} <span className="text-[11px] text-[#797586] font-normal">{currency}</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5b3fd1] text-white font-bold">
                    ≈ $1,661.00 USD
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-lg bg-[#f7f1ff] p-3 flex items-center justify-between text-[#484554] text-[12px] border border-[#e6deff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#431fb9]">
                    currency_exchange
                  </span>
                  <span>Interbank Spot Peg: <strong className="text-[#1d1833] font-semibold">1 USD = 3.6725 AED</strong></span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] font-semibold">
                  0.0% spread applied
                </span>
              </div>
            </div>
          </div>

          {/* 2. Invoice Document Ingestion & AI Line Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e6deff]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e6deff]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#5b3fd1] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h2 className="text-base font-bold text-[#1d1833]">Supplier invoice &amp; OCR ingestion</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ece4ff] text-[#431fb9] text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">document_scanner</span>
                99.4% confidence
              </div>
            </div>

            <div className="bg-[#f7f1ff] rounded-xl p-4 border border-[#e6deff]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#5b3fd1] text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">description</span>
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-[#1d1833]">
                      invoice_dubai_gadget_wholesale_dxb89.pdf
                    </div>
                    <div className="text-[11px] text-[#484554] flex items-center gap-2 mt-0.5">
                      <span>1.4 MB</span>
                      <span>•</span>
                      <span className="text-[#431fb9] font-semibold">Dual Arabic &amp; English parsed</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#dcfce7] text-[#15803d] text-[11px] font-bold">
                  Uploaded ✓
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-[#ece4ff] text-[#484554] hover:bg-[#e6deff] text-[13px] font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{isSubmitting ? 'Verifying with AI...' : 'Submit for Consensus Sign-off ($1,661)'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Verification Preview & Quorum Rules (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6deff]">
            <span className="font-bold text-[13px] text-[#1d1833]">AI Pre-Flight Check</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] font-bold">
              1 Anomaly Flagged
            </span>
          </div>

          <div className="space-y-2 text-[12px]">
            <div className="p-3 bg-[#fef3c7]/60 rounded-xl border border-[#fef3c7] text-[#b45309]">
              <div className="font-bold mb-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                <span>Quantity Discrepancy</span>
              </div>
              <span>Invoice specifies 600 phone cases; agreed manifest quota is 500 units (+100 extra).</span>
            </div>

            <div className="p-3 bg-[#dcfce7]/60 rounded-xl border border-[#dcfce7] text-[#15803d]">
              <div className="font-bold mb-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                <span>FX Rate Validated</span>
              </div>
              <span>Converted AED 6,100 at 3.6725 AED/USD to exactly $1,661.00 USD.</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#f7f1ff] rounded-xl border border-[#e6deff] text-[11px] text-[#484554]">
            <strong>Consensus Notice:</strong> At least 3 of 5 members must vote approve before PayPal dispatches payout to Chidi O.
          </div>
        </div>
      </form>
    </div>
  );
}

