'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Group } from '../../types';
import { CloseIcon, PlusIcon, UsersIcon } from '../Icons';

interface AddMemberModalProps {
  isOpen: boolean;
  group: Group;
  onClose: () => void;
  onAddMember: (data: {
    name: string;
    email: string;
    contributionExpected: number;
    orders?: Array<{ item: string; quantity: number; budget: number }>;
  }) => Promise<void>;
}

export function AddMemberModal({
  isOpen,
  group,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contributionExpected, setContributionExpected] = useState('1000.00');
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(10);
  const [itemBudget, setItemBudget] = useState('1000.00');
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
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      const orders = itemName
        ? [
            {
              item: itemName,
              quantity: Number(itemQuantity) || 1,
              budget: parseFloat(itemBudget) || parseFloat(contributionExpected) || 0,
            },
          ]
        : [];

      await onAddMember({
        name,
        email,
        contributionExpected: parseFloat(contributionExpected) || 0,
        orders,
      });
      setName('');
      setEmail('');
      setItemName('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add vendor member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="add-member-title"
      className="fixed inset-0 m-auto max-w-md w-[95%] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="add-member-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Add Vendor Member (FR1)
            </h2>
            <p className="text-xs text-zinc-500">
              Add a vendor contributor and their shopping order line
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
            Vendor Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Kolawole Johnson"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Vendor Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. kolawole@trustload.africa"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Expected PayPal Pot Contribution ($ USD)
          </label>
          <input
            type="number"
            step="10.00"
            required
            value={contributionExpected}
            onChange={(e) => {
              setContributionExpected(e.target.value);
              setItemBudget(e.target.value);
            }}
            className="w-full font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Initial Order Line */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] block">
            Initial Item to Buy Abroad (Optional):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. 100W Power Banks"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <input
                type="number"
                min={1}
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 text-center"
              />
            </div>
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
            {isSubmitting ? 'Adding...' : 'Add Vendor'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
