'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Member } from '../../types';
import { CloseIcon, PlusIcon, FileTextIcon } from '../Icons';

interface AddOrderModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onAddOrder: (
    memberId: string,
    orders: Array<{ item: string; quantity: number; budget: number }>
  ) => Promise<void>;
}

export function AddOrderModal({
  isOpen,
  member,
  onClose,
  onAddOrder,
}: AddOrderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [budget, setBudget] = useState('300.00');
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
    if (!member || !item || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddOrder(member.id, [
        {
          item,
          quantity: Number(quantity),
          budget: parseFloat(budget) || 0,
        },
      ]);
      setItem('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add order line');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="add-order-title"
      className="fixed inset-0 m-auto max-w-md w-[95%] rounded-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
            <FileTextIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="add-order-title" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Add Shopping Item (FR1)
            </h2>
            <p className="text-xs text-zinc-500">
              For Vendor: <strong className="text-zinc-800 dark:text-zinc-200">{member.user.name}</strong>
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
            Item Description / SKU
          </label>
          <input
            type="text"
            required
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. 100W USB-C Braided Cables"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Max Budget ($ USD)
            </label>
            <input
              type="number"
              step="1.00"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full font-mono rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            {isSubmitting ? 'Adding...' : 'Add Order Line'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
