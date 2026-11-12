'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaypalCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-[#fdf8ff] text-[#1d1833] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push('/')}>
        <div className="w-10 h-10 rounded-xl bg-[#431fb9] flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-[24px]">account_balance</span>
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-[#1d1833]">
          Trust<span className="text-[#5b3fd1]">Load</span>
        </span>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#e6deff] shadow-xl p-8 sm:p-10 text-center relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d97706] to-[#f59e0b]" />

        <div className="py-4 space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#fef3c7] border-2 border-[#f59e0b] flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-4xl text-[#b45309]">
              cancel
            </span>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#b45309]">
              Checkout Cancelled
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1833]">
              PayPal Checkout Cancelled
            </h2>
            <p className="text-sm text-[#484554]">
              You cancelled the transaction on PayPal. No funds were debited, and your group share remains unfunded.
            </p>
          </div>

          {token && (
            <div className="p-4 rounded-2xl bg-[#f7f1ff] border border-[#e6deff] text-left text-xs text-[#484554] space-y-1">
              <span className="font-semibold text-[#1d1833] block">Cancelled Reference:</span>
              <span className="font-mono">{token}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/?view=app&screen=pay-contribution')}
              className="w-full py-3.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Try Payment Again</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/?view=app&screen=dashboard')}
              className="w-full py-3 rounded-xl bg-[#f7f1ff] hover:bg-[#ece4ff] border border-[#e6deff] text-[#431fb9] font-semibold text-xs transition-all cursor-pointer"
            >
              Return to Group Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaypalCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fdf8ff] flex items-center justify-center text-center p-6">
          <div className="w-12 h-12 rounded-full border-4 border-[#5b3fd1] border-t-transparent animate-spin mx-auto"></div>
        </div>
      }
    >
      <PaypalCancelContent />
    </Suspense>
  );
}

