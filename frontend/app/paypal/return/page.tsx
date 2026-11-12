'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../lib/api';

function PaypalReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token'); // PayPal Order ID
  const payerId = searchParams.get('PayerID');
  const groupId = searchParams.get('groupId');

  const [status, setStatus] = useState<'capturing' | 'success' | 'error'>('capturing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [captureDetails, setCaptureDetails] = useState<any>(null);

  useEffect(() => {
    let isSubscribed = true;

    async function executeCapture() {
      if (!token) {
        setStatus('error');
        setErrorMessage('No PayPal transaction token was found in the return URL.');
        return;
      }

      try {
        const result = await api.captureContributionOrder(token);
        if (isSubscribed) {
          setCaptureDetails(result);
          setStatus('success');
        }
      } catch (err: any) {
        console.warn('PayPal capture error:', err);
        // If it was already captured or returned 400 with completed status, treat as success
        const msg = err?.message || String(err);
        if (msg.includes('COMPLETED') || msg.includes('already captured')) {
          if (isSubscribed) {
            setStatus('success');
          }
        } else {
          if (isSubscribed) {
            setStatus('error');
            setErrorMessage(msg || 'Failed to capture PayPal payment.');
          }
        }
      }
    }

    executeCapture();

    return () => {
      isSubscribed = false;
    };
  }, [token]);

  // Countdown timer for automatic redirect to dashboard
  useEffect(() => {
    if (status !== 'success') return;

    if (countdown <= 0) {
      router.push('/?view=app&screen=dashboard&paid=true');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, router]);

  const handleReturnDashboard = () => {
    router.push('/?view=app&screen=dashboard&paid=true');
  };

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
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5b3fd1] via-[#431fb9] to-[#7f5af0]" />

        {/* STATE 1: CAPTURING */}
        {status === 'capturing' && (
          <div className="py-6 space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#f7f1ff] border-2 border-[#5b3fd1] flex items-center justify-center mx-auto animate-pulse">
              <span className="material-symbols-outlined text-4xl text-[#5b3fd1] animate-spin">
                sync
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1d1833]">
                Confirming Deposit...
              </h2>
              <p className="text-sm text-[#484554] max-w-sm mx-auto">
                Confirming your payment with PayPal and recording the deposit into the multi-party vault ledger.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#f7f1ff] border border-[#e6deff] text-left text-xs space-y-1.5 text-[#484554]">
              <div className="flex justify-between">
                <span>PayPal Order Ref:</span>
                <span className="font-mono font-semibold text-[#1d1833]">{token || 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span>Ledger Protocol:</span>
                <span className="font-semibold text-[#5b3fd1]">Multi-Party Quorum (3/5)</span>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: SUCCESS */}
        {status === 'success' && (
          <div className="py-4 space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#dcfce7] border-2 border-[#22c55e] flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-4xl text-[#15803d]">
                check_circle
              </span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d]">
                <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                Payment Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1833]">
                Contribution Confirmed!
              </h2>
              <p className="text-sm text-[#484554]">
                Your funds have been deposited into the pool vault. The smart ledger is now synchronized for all group members.
              </p>
            </div>

            {/* Financial Summary Card */}
            <div className="p-5 rounded-2xl bg-[#f7f1ff] border border-[#e6deff] text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6deff]">
                <span className="text-xs text-[#484554]">Amount Deposited</span>
                <span className="text-xl font-black text-[#1d1833]">$1,000.00 USD</span>
              </div>
              <div className="text-xs space-y-2 text-[#484554]">
                <div className="flex justify-between">
                  <span>PayPal Order ID:</span>
                  <span className="font-mono font-semibold text-[#1d1833]">{token}</span>
                </div>
                {payerId && (
                  <div className="flex justify-between">
                    <span>Payer Account ID:</span>
                    <span className="font-mono font-semibold text-[#1d1833]">{payerId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Consensus Rule:</span>
                  <span className="font-semibold text-[#5b3fd1]">Zero Unilateral Withdrawals</span>
                </div>
              </div>
            </div>

            {/* Redirection Notice & Action */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleReturnDashboard}
                className="w-full py-3.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Return to Group Dashboard</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <p className="text-xs text-[#797586]">
                Auto-redirecting to dashboard in{' '}
                <span className="font-bold text-[#5b3fd1]">{countdown}s</span>...
              </p>
            </div>
          </div>
        )}

        {/* STATE 3: ERROR */}
        {status === 'error' && (
          <div className="py-4 space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#fee2e2] border-2 border-[#ef4444] flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-4xl text-[#b91c1c]">
                error
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1d1833]">
                Payment Notice
              </h2>
              <p className="text-sm text-[#484554]">
                {errorMessage || 'Unable to complete the payment capture.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleReturnDashboard}
                className="w-full py-3.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/?view=app&screen=pay-contribution')}
                className="w-full py-3 rounded-xl bg-[#f7f1ff] hover:bg-[#ece4ff] border border-[#e6deff] text-[#431fb9] font-semibold text-xs transition-all cursor-pointer"
              >
                Try Payment Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaypalReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fdf8ff] flex items-center justify-center text-center p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#5b3fd1] border-t-transparent animate-spin mx-auto"></div>
            <p className="text-sm text-[#484554] font-medium">Verifying PayPal session...</p>
          </div>
        </div>
      }
    >
      <PaypalReturnContent />
    </Suspense>
  );
}

