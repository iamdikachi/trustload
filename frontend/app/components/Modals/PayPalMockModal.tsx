'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Member } from '../../types';
import { formatDualCurrency } from '../../lib/utils';
import { PayPalIcon, CloseIcon, CheckCircleIcon, ShieldIcon } from '../Icons';

interface PayPalMockModalProps {
  isOpen: boolean;
  member: Member | null;
  amount: number;
  orderId?: string;
  onClose: () => void;
  onConfirmCapture: (orderId: string) => Promise<void>;
}

export function PayPalMockModal({
  isOpen,
  member,
  amount,
  orderId = `PAYPAL-ORD-SBX-${Math.floor(1000 + Math.random() * 9000)}`,
  onClose,
  onConfirmCapture,
}: PayPalMockModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setIsDone(false);
      setIsProcessing(false);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const dual = formatDualCurrency(amount);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await onConfirmCapture(orderId);
      setIsDone(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
      alert('PayPal capture failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="paypal-modal-title"
      className="fixed inset-0 m-auto max-w-md w-[95%] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      {/* PayPal Top Banner */}
      <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <PayPalIcon className="w-6 h-6" />
          <span id="paypal-modal-title" className="font-extrabold text-base tracking-tight">
            PayPal Sandbox Checkout
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 text-xs space-y-4">
        {isDone ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Payment Captured Successfully!
            </h3>
            <p className="text-zinc-500 text-xs">
              Recorded in TrustLoad ledger with PayPal capture reference.
            </p>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Vendor:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {member.user.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>PayPal Sandbox Order ID:</span>
                <span className="font-mono text-[11px] text-blue-600 font-semibold">
                  {orderId}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-baseline">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Total Due:</span>
                <div className="text-right">
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono">
                    {dual.usd}
                  </span>
                  <span className="block text-emerald-600 font-semibold text-[11px]">
                    ≈ {dual.ngn}
                  </span>
                </div>
              </div>
            </div>

            {/* Sandbox Notice */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-[11px]">
              <ShieldIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Simulating verified payment from {member.user.email} into TrustLoad Escrow.
              </span>
            </div>

            {/* PayPal Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-sm shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PayPalIcon className="w-5 h-5" />
                {isProcessing ? 'Capturing PayPal Order...' : 'Pay with PayPal'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium text-xs"
              >
                Cancel and return to TrustLoad
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
