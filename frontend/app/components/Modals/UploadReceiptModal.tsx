'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Group } from '../../types';
import { CloseIcon, ReceiptIcon, SparklesIcon, UploadIcon } from '../Icons';

interface UploadReceiptModalProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
}

export function UploadReceiptModal({
  isOpen,
  group,
  onClose,
  onUpload,
}: UploadReceiptModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [currency, setCurrency] = useState('CNY');
  const [originalAmount, setOriginalAmount] = useState('19620.00');
  const [sourceLanguage, setSourceLanguage] = useState('zh-CN');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('currency', currency);
      fd.append('originalAmount', originalAmount);
      fd.append('sourceLanguage', sourceLanguage);

      if (file) {
        fd.append('receiptFile', file);
      } else {
        const blob = new Blob(
          [`Receipt\nTotal: ${currency} ${originalAmount}\nGoods: 18900\nShared Freight: 720`],
          { type: 'text/plain' }
        );
        fd.append('receiptFile', blob, 'final-receipt.txt');
      }

      await onUpload(fd);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to upload trip receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="upload-receipt-title"
      className="fixed inset-0 m-auto max-w-lg w-[95%] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <ReceiptIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="upload-receipt-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Upload Final Trip Receipt (FR6)
            </h2>
            <p className="text-xs text-zinc-500">
              AI extracts goods and shared costs (cargo freight, customs) for per-vendor split
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Receipt Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="CNY">CNY (¥ Chinese Yuan)</option>
              <option value="AED">AED (د.إ UAE Dirham)</option>
              <option value="TRY">TRY (₺ Turkish Lira)</option>
              <option value="USD">USD ($ US Dollar)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Receipt Grand Total
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

        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Receipt File (Photo or PDF)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 cursor-pointer"
          />
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
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <SparklesIcon className="w-4 h-4" />
            {isSubmitting ? 'Uploading...' : 'Upload & Run AI Allocation'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
