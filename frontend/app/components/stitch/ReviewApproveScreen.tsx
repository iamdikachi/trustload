'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';
import { Modal } from './Modal';
import { api } from '../../lib/api';

interface ReviewApproveScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onApproveRelease?: () => void;
  isApproved?: boolean;
  releaseRequestId?: string;
  memberId?: string;
}

export function ReviewApproveScreen({
  onNavigate,
  onApproveRelease,
  isApproved = false,
  releaseRequestId,
  memberId,
}: ReviewApproveScreenProps) {
  const [approved, setApproved] = useState(isApproved);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Quantity overage (600 billed vs 500 ordered)');
  const [disputeLogged, setDisputeLogged] = useState(false);

  const handleApprove = async () => {
    setApproved(true);
    if (releaseRequestId) {
      try {
        await api.submitApproval(releaseRequestId, {
          memberId: memberId || 'default-member',
          decision: 'APPROVED',
          comment: 'Approved after checking line items and discrepancy resolution.',
        }).catch(() => null);
        await api.triggerPayout(releaseRequestId).catch(() => null);
      } catch (err) {
        console.warn('Live approval notice:', err);
      }
    }
    if (onApproveRelease) {
      onApproveRelease();
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-2 space-y-6">
      {/* Top Banner & Context Header */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 font-label-md text-[13px] text-[#431fb9] hover:text-[#5b3fd1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Group Dashboard</span>
          </button>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
              approved
                ? 'bg-[#dcfce7] text-[#15803d]'
                : 'bg-[#fef3c7] text-[#b45309]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                approved ? 'bg-[#15803d]' : 'bg-[#b45309] animate-ping'
              }`}
            ></span>
            <span>{approved ? 'Consensus Cleared • 3 of 3 Consents' : 'Needs Review • 2 of 3 Consents Collected'}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-[#1d1833] tracking-tight">
              Dubai Gadget Wholesale
            </h1>
            <p className="text-[13px] text-[#797586] mt-0.5">
              Invoice #DGW-7741 • Submitted by Traveler Chidi Okonkwo • Consensus 3 of 5
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onNavigate('new-release')}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#e6deff] text-[#1d1833] text-[12px] font-semibold hover:bg-[#f2ebff] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-[#5b3fd1]">add_circle</span>
              <span>Upload New Invoice</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {/* Metric 1: Amount */}
          <div className="p-4 rounded-xl bg-white shadow-sm border border-[#e6deff] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#484554]">
              <span className="text-[11px] uppercase tracking-wide">Requested Claim Amount</span>
              <span className="material-symbols-outlined text-[#431fb9] text-[20px]">payments</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-[#1d1833]">
                AED 6,100 <span className="text-[14px] text-[#484554] font-normal">(≈ $1,661 USD)</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#484554]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#431fb9]"></span>
                Single-batch supplier invoice settlement
              </div>
            </div>
          </div>

          {/* Metric 2: Assigned Traveler */}
          <div className="p-4 rounded-xl bg-white shadow-sm border border-[#e6deff] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#484554]">
              <span className="text-[11px] uppercase tracking-wide">Assigned On-Ground Traveler</span>
              <span className="material-symbols-outlined text-[#633fce] text-[20px]">person_pin_circle</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5b3fd1] text-white text-[14px] flex items-center justify-center font-bold shadow-sm">
                CO
              </div>
              <div>
                <div className="font-bold text-[14px] text-[#1d1833]">Chidi O.</div>
                <div className="text-[11px] text-[#484554] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  At Deira Wholesale Market, Dubai
                </div>
              </div>
            </div>
          </div>

          {/* Metric 3: Liquidity Bar */}
          <div className="p-4 rounded-xl bg-white shadow-sm border border-[#e6deff] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#484554]">
              <span className="text-[11px] uppercase tracking-wide">Pool Liquidity</span>
              <span className="text-[11px] font-semibold text-[#431fb9]">71.7% Committed</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline justify-between text-[12px] mb-1.5">
                <span className="font-bold text-[#1d1833]">AED 6,100</span>
                <span className="text-[#484554]">of AED 8,500 Available</span>
              </div>
              <div className="h-3 w-full bg-[#e6deff] rounded-full overflow-hidden flex p-0.5">
                <div className="h-full bg-[#5b3fd1] rounded-l-full" style={{ width: '71.7%' }}></div>
                <div className="h-full bg-[#c9beff] rounded-r-full" style={{ width: '28.3%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Audited Invoice & Manifest Viewer */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-[#e6deff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#431fb9] text-[20px]">receipt_long</span>
              <span className="font-bold text-[13px] text-[#1d1833]">Audited Invoice &amp; Manifest</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-semibold">
                Inv #DXB-98442
              </span>
            </div>
            <span className="text-[11px] text-[#15803d] font-bold">OCR Parsed 99.4%</span>
          </div>

          {/* Invoice Document Simulation */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e6deff] p-5 space-y-4">
            <div className="flex justify-between items-start border-b border-[#e6deff] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#1d1833]">DUBAI GADGET WHOLESALE LLC</h2>
                <p className="text-[11px] text-[#484554]">Deira Wholesale Market, Zone B, Dubai, UAE</p>
                <div className="text-[10px] text-[#797586] pt-1">
                  TRN: 1004928190003 • Date: 15 Nov 2026
                </div>
              </div>
              <div className="text-right text-[11px] text-[#484554]">
                <div className="text-[10px] uppercase text-[#797586]">Billed To</div>
                <div className="font-bold text-[#1d1833]">TrustLoad Group Pool DXB</div>
                <div>C/O Chidi O. (Bearer)</div>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-[#f7f1ff] text-[#484554] text-[10px] uppercase">
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Unit Rate</th>
                  <th className="py-2 px-3 text-right">Total AED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6deff]">
                <tr className="bg-[#fef3c7]/30">
                  <td className="py-2 px-3">
                    <span className="font-bold text-[#1d1833] block">MagSafe Slim Phone Cases</span>
                    <span className="text-[10px] text-[#b45309]">⚠️ Over manifest by +100 units</span>
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-[#b45309]">600</td>
                  <td className="py-2 px-2 text-right">5.30 AED</td>
                  <td className="py-2 px-3 text-right font-bold">3,180.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-[#1d1833]">9D Privacy Glass Screen Protectors</td>
                  <td className="py-2 px-2 text-center">1,200</td>
                  <td className="py-2 px-2 text-right">1.50 AED</td>
                  <td className="py-2 px-3 text-right font-bold">1,800.00</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-[#1d1833]">Braided 65W Fast Charging Cables</td>
                  <td className="py-2 px-2 text-center">800</td>
                  <td className="py-2 px-2 text-right">1.70 AED</td>
                  <td className="py-2 px-3 text-right font-bold">1,360.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-[#1d1833] font-bold">
                  <td colSpan={3} className="py-2 px-3 text-right">Claimed Total:</td>
                  <td className="py-2 px-3 text-right text-base text-[#431fb9]">AED 6,100.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Verification Inspector & Approval */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#e6deff] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6deff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#431fb9] text-[20px]">auto_awesome</span>
                <h3 className="font-bold text-sm text-[#1d1833]">AI Inspector Anomaly Report</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] font-bold">
                2 Flags Pending Review
              </span>
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="p-3 rounded-xl bg-[#fef3c7]/60 border border-[#fef3c7] text-[#b45309] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">rule</span>
                  <span>Quantity Mismatch (+100 Units)</span>
                </div>
                <p className="leading-relaxed">
                  Supplier invoiced 600 phone cases; group order manifest specified only 500 units.
                  Surplus cost is AED 620 (~$168 USD).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#fef3c7]/60 border border-[#fef3c7] text-[#b45309] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calculate</span>
                  <span>Arithmetic Discount Offset</span>
                </div>
                <p className="leading-relaxed">
                  Sum of line items is AED 6,340, but invoice bottom total is AED 6,100 (AED 240 cash wholesale discount applied).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#dcfce7]/60 border border-[#dcfce7] text-[#15803d] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Market Fair Price Cleared</span>
                </div>
                <p className="leading-relaxed">
                  Screen protectors and USB-C cables are priced 8% below Deira wholesale benchmark averages.
                </p>
              </div>
            </div>

            {/* Voting Section */}
            <div className="pt-3 border-t border-[#e6deff] space-y-3">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-bold text-[#1d1833]">Consensus Vote Progress:</span>
                <span className="font-bold text-[#431fb9]">
                  {approved ? '3 of 3 Approved' : '2 of 3 Approved (Your vote pending)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(true)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#ece4ff] text-[#484554] hover:bg-[#e6deff] text-[13px] font-semibold transition-all cursor-pointer"
                >
                  Reject / Hold
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approved}
                  className={`w-1/2 py-2.5 rounded-xl text-[13px] font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    approved
                      ? 'bg-[#15803d] text-white'
                      : 'bg-[#5b3fd1] hover:bg-[#431fb9] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {approved ? 'check_circle' : 'how_to_vote'}
                  </span>
                  <span>{approved ? 'Approved ✓' : 'Approve Release'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Dispute Release Claim"
        subtitle="Dubai Gadget Wholesale • Invoice #DGW-7741 (AED 6,100)"
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
                'Quantity overage (600 billed vs 500 ordered)',
                'Line items total mismatch (AED 6,340 vs 6,100 claimed)',
                'Unauthorized item / price deviation',
              ].map((reason, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#e6deff] hover:bg-[#fdf8ff] cursor-pointer text-[12px] text-[#1d1833]"
                >
                  <input
                    type="radio"
                    name="review-dispute-reason"
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
              className="px-4 py-2 rounded-xl bg-white border border-[#e6deff] text-[#484554] text-[13px] font-semibold hover:bg-[#f2ebff] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setDisputeLogged(true);
                setIsDisputeModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[13px] font-bold shadow-xs cursor-pointer transition-colors"
            >
              Submit Dispute &amp; Hold
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

