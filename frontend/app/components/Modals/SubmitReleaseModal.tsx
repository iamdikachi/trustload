'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Group } from '../../types';
import { formatDualCurrency } from '../../lib/utils';
import { SparklesIcon, CloseIcon, UploadIcon, CoinsIcon } from '../Icons';

interface SubmitReleaseModalProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const FX_RATES: Record<string, number> = {
  USD: 1.0,
  CNY: 0.138889, // 7.20 CNY/USD
  AED: 0.272294, // 3.6725 AED/USD
  TRY: 0.02924,  // 34.20 TRY/USD
  EUR: 1.087,    // 0.92 EUR/USD
  GBP: 1.282,    // 0.78 GBP/USD
};

export function SubmitReleaseModal({
  isOpen,
  group,
  onClose,
  onSubmit,
}: SubmitReleaseModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [supplier, setSupplier] = useState('Istanbul Merter Wholesale Tekstil Ltd.');
  const [currency, setCurrency] = useState('TRY');
  const [originalAmount, setOriginalAmount] = useState('17100.00');
  const [sourceLanguage, setSourceLanguage] = useState('tr-TR');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const rate = FX_RATES[currency] || 1.0;
  const numOrig = parseFloat(originalAmount) || 0;
  const convertedUsd = numOrig * rate;
  const dual = formatDualCurrency(convertedUsd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || numOrig <= 0) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('groupId', group.id);
      fd.append('supplier', supplier);
      fd.append('currency', currency);
      fd.append('originalAmount', String(numOrig));
      fd.append('amount', String(convertedUsd.toFixed(2)));
      fd.append('fxRate', String(rate.toFixed(6)));
      fd.append('sourceLanguage', sourceLanguage);

      if (file) {
        fd.append('invoiceFile', file);
      } else {
        // Create a mock text file blob if user hasn't selected a local file
        const blob = new Blob([`Invoice for ${supplier}\nTotal: ${currency} ${numOrig}`], {
          type: 'text/plain',
        });
        fd.append('invoiceFile', blob, 'invoice-sample.txt');
      }

      await onSubmit(fd);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to submit release request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="submit-release-title"
      className="fixed inset-0 m-auto max-w-xl w-[95%] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <UploadIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="submit-release-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Submit Staged Release Request (FR3)
            </h2>
            <p className="text-xs text-zinc-500">
              Traveler submits invoice for AI verification before vendor payout vote
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
          aria-label="Close dialog"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        {/* Preset quick test buttons */}
        <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
          <span className="font-semibold text-zinc-500 text-[11px] block">
            Demo Presets (Quick Fill for Hackathon Video):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setSupplier('Shenzhen Huaqiangbei Golden Tech Co., Ltd.');
                setCurrency('CNY');
                setOriginalAmount('18900.00');
                setSourceLanguage('zh-CN');
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-medium hover:border-blue-500"
            >
              🇨🇳 China Electronics (¥18,900)
            </button>
            <button
              type="button"
              onClick={() => {
                setSupplier('Al Ras Royal Textiles Trading LLC (Dubai)');
                setCurrency('AED');
                setOriginalAmount('4700.00');
                setSourceLanguage('ar-AE');
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-medium hover:border-blue-500"
            >
              🇦🇪 Dubai Textiles (AED 4,700)
            </button>
            <button
              type="button"
              onClick={() => {
                setSupplier('Istanbul Merter Wholesale Tekstil Ltd.');
                setCurrency('TRY');
                setOriginalAmount('17100.00');
                setSourceLanguage('tr-TR');
              }}
              className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-medium hover:border-blue-500"
            >
              🇹🇷 Turkey Garments (₺17,100)
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Supplier / Vendor Name abroad
          </label>
          <input
            type="text"
            required
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Shenzhen Golden Tech Co."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Invoice Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="CNY">CNY (¥ Chinese Yuan - 7.20)</option>
              <option value="AED">AED (د.إ UAE Dirham - 3.67)</option>
              <option value="TRY">TRY (₺ Turkish Lira - 34.20)</option>
              <option value="EUR">EUR (€ Euro - 0.92)</option>
              <option value="GBP">GBP (£ British Pound - 0.78)</option>
              <option value="USD">USD ($ US Dollar - 1.00)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Original Invoice Total
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={originalAmount}
              onChange={(e) => setOriginalAmount(e.target.value)}
              className="w-full font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Live FX Rate Conversion Box */}
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoinsIcon className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Deterministic Code Conversion:
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-sm text-blue-900 dark:text-blue-100">
              {dual.usd}
            </span>
            <span className="block font-mono text-emerald-600 font-semibold text-[11px]">
              ≈ {dual.ngn}
            </span>
          </div>
        </div>

        {/* Invoice File Upload */}
        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Supplier Invoice File (Photo or PDF)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 cursor-pointer"
          />
          <p className="text-[11px] text-zinc-400 mt-1">
            Accepts Chinese, Arabic, Turkish, or multilingual invoices. If left empty, a test invoice document will be generated automatically.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            {isSubmitting ? 'Uploading & AI Verifying...' : 'Submit & Trigger AI Verification'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
