'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, PlusIcon, PlaneIcon } from '../Icons';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (data: {
    name: string;
    travelerName: string;
    travelerEmail: string;
    approvalThreshold: number;
    sharedCostRule: string;
    baseCurrency: string;
    members?: Array<{
      name: string;
      email: string;
      contributionExpected: number;
      orders?: Array<{ item: string; quantity: number; budget: number }>;
    }>;
  }) => Promise<void>;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('Istanbul & London Luxury Wholesale Trip (Dec 2026)');
  const [travelerName, setTravelerName] = useState('Chidi Okonkwo');
  const [travelerEmail, setTravelerEmail] = useState('chidi.traveler@trustload.africa');
  const [approvalThreshold, setApprovalThreshold] = useState(3);
  const [sharedCostRule, setSharedCostRule] = useState('PROPORTIONAL_TO_VALUE');
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
      await onCreateGroup({
        name,
        travelerName,
        travelerEmail,
        approvalThreshold,
        sharedCostRule,
        baseCurrency: 'USD',
        members: [
          {
            name: 'Amaka Nwosu',
            email: 'amaka@trustload.africa',
            contributionExpected: 1200,
            orders: [{ item: 'Cashmere Knit Sweaters', quantity: 40, budget: 1200 }],
          },
          {
            name: 'Tunde Bakare',
            email: 'tunde@trustload.africa',
            contributionExpected: 1500,
            orders: [{ item: 'Leather Chelsea Boots', quantity: 25, budget: 1500 }],
          },
          {
            name: 'Ngozi Eze',
            email: 'ngozi@trustload.africa',
            contributionExpected: 900,
            orders: [{ item: 'Designer Silk Scarves', quantity: 50, budget: 900 }],
          },
        ],
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create buying trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="create-group-title"
      className="fixed inset-0 m-auto max-w-lg w-[95%] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <PlaneIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="create-group-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Create New Buying Trip Run (FR1)
            </h2>
            <p className="text-xs text-zinc-500">
              Setup a pooled cross-border trip with traveler and vendor orders
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
        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Trip Name & Destination
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Designated Traveler Name
            </label>
            <input
              type="text"
              required
              value={travelerName}
              onChange={(e) => setTravelerName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Traveler Email
            </label>
            <input
              type="email"
              required
              value={travelerEmail}
              onChange={(e) => setTravelerEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Approval Threshold (Votes)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              required
              value={approvalThreshold}
              onChange={(e) => setApprovalThreshold(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[10px] text-zinc-400">
              Number of vendor approvals required before payout release
            </span>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Shared Cost Rule
            </label>
            <select
              value={sharedCostRule}
              onChange={(e) => setSharedCostRule(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="PROPORTIONAL_TO_VALUE">Proportional to Goods Value</option>
              <option value="EQUAL">Equal Split</option>
              <option value="BY_CONTRIBUTION">By Contribution</option>
            </select>
          </div>
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
            <PlusIcon className="w-4 h-4" />
            {isSubmitting ? 'Creating Trip...' : 'Create Trip Group'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
