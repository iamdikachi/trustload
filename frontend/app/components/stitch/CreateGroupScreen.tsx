'use client';

import React, { useState } from 'react';
import { ScreenPath } from './StitchHeader';

interface MemberDraft {
  name: string;
  email: string;
  item: string;
  quantity: number;
  contributionExpected: number;
}

interface CreateGroupScreenProps {
  onNavigate: (path: ScreenPath) => void;
  onCreateGroup?: (data: {
    name: string;
    travelerName: string;
    travelerEmail: string;
    baseCurrency: string;
    approvalThreshold: number;
    members: Array<{
      name: string;
      email: string;
      contributionExpected: number;
      orders: Array<{ item: string; quantity: number; budget: number }>;
    }>;
  }) => Promise<boolean | void> | void;
}

export function CreateGroupScreen({ onNavigate, onCreateGroup }: CreateGroupScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [groupName, setGroupName] = useState('');
  const [travelerName, setTravelerName] = useState('Chidi Okonkwo');
  const [travelerEmail, setTravelerEmail] = useState('chidi.traveler@trustload.africa');
  const [currency, setCurrency] = useState<'USD' | 'AED' | 'NGN' | 'EUR' | 'GBP'>('USD');
  const [consensus, setConsensus] = useState<'majority' | 'unanimous'>('majority');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [members, setMembers] = useState<MemberDraft[]>([
    { name: 'Amaka Nwosu', email: 'amaka@trustload.africa', item: '65W USB-C Chargers', quantity: 50, contributionExpected: 1000 },
    { name: 'Tunde Bakare', email: 'tunde@trustload.africa', item: 'MagSafe Phone Cases', quantity: 200, contributionExpected: 1000 },
    { name: 'Ngozi Eze', email: 'ngozi@trustload.africa', item: 'Tempered Glass Packs', quantity: 300, contributionExpected: 1000 },
  ]);

  const totalTarget = members.reduce((sum, m) => sum + (Number(m.contributionExpected) || 0), 0);
  const approvalThreshold =
    consensus === 'unanimous'
      ? Math.max(1, members.length)
      : Math.max(1, Math.ceil(members.length * 0.6));

  const addMemberRow = () => {
    setMembers((prev) => [
      ...prev,
      { name: '', email: '', item: '', quantity: 10, contributionExpected: 500 },
    ]);
  };

  const removeMemberRow = (idx: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateMember = (idx: number, field: keyof MemberDraft, value: string | number) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!groupName.trim()) {
      setFormError('Please enter a Group Trip Title.');
      setStep(1);
      return;
    }
    if (!travelerName.trim() || !travelerEmail.trim()) {
      setFormError('Traveler name and email are required.');
      setStep(1);
      return;
    }

    const validMembers = members
      .filter((m) => m.name.trim() && m.email.trim())
      .map((m) => ({
        name: m.name.trim(),
        email: m.email.trim(),
        contributionExpected: Math.max(1, Number(m.contributionExpected) || 0),
        orders: m.item.trim()
          ? [
              {
                item: m.item.trim(),
                quantity: Math.max(1, Number(m.quantity) || 1),
                budget: Math.max(1, Number(m.contributionExpected) || 1),
              },
            ]
          : [],
      }));

    if (validMembers.length === 0) {
      setFormError('Add at least one group member with name and email.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onCreateGroup) {
        await onCreateGroup({
          name: groupName.trim(),
          travelerName: travelerName.trim(),
          travelerEmail: travelerEmail.trim(),
          baseCurrency: currency,
          approvalThreshold: Math.min(approvalThreshold, validMembers.length),
          members: validMembers,
        });
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create group pool.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-2">
      {/* Back Navigation */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e6deff] text-[#431fb9] hover:bg-[#f2ebff] text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Overview</span>
        </button>
      </div>

      {/* Page Header & Stepper Track */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="font-label-sm text-[11px] px-2.5 py-0.5 rounded-full bg-[#e7deff] text-[#1f005f] font-semibold tracking-wide uppercase">
            New Buying Trip
          </span>
          <h1 className="font-headline-lg text-3xl sm:text-4xl font-black text-[#1d1833] tracking-tight mt-2">
            Start New Trip Pool
          </h1>
          <p className="font-body-md text-[14px] text-[#484554] max-w-xl mt-1">
            Set the trip title, designate the traveler, and add participating buyers with their item budgets.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-[#e6deff] flex items-center gap-1 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              step === 1 ? 'bg-[#f2ebff] text-[#431fb9]' : 'text-[#484554]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#431fb9] text-white text-[11px] flex items-center justify-center font-bold">
              1
            </span>
            <span>Trip &amp; Traveler</span>
          </button>
          <span className="material-symbols-outlined text-[#797586] text-[18px]">chevron_right</span>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              step === 2 ? 'bg-[#f2ebff] text-[#431fb9]' : 'text-[#484554] opacity-70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#e6deff] text-[#1d1833] text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span>Members &amp; Orders</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[13px] font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Form Parameters & Manifest Builder (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {step === 1 ? (
            <>
              {/* Card 1: Core Parameters & Traveler Identity */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff]">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#e6deff]">
                  <span className="w-7 h-7 rounded-lg bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                  </span>
                  <h2 className="text-base font-bold text-[#1d1833]">Pool Configuration</h2>
                </div>

                <div className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                      Group Trip Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dubai Electronics & Accessories Run (Dec 2026)"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-lg bg-[#f7f1ff] text-[#1d1833] border border-[#e6deff] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#c9beff]"
                    />
                  </div>

                  {/* Base Settlement Currency */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                      Base Settlement Currency
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['USD', 'AED', 'NGN', 'EUR', 'GBP'] as const).map((c) => {
                        const symbols: Record<string, string> = {
                          USD: '($)',
                          AED: '(د.إ)',
                          NGN: '(₦)',
                          EUR: '(€)',
                          GBP: '(£)',
                        };
                        const isSelected = currency === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCurrency(c)}
                            className={`h-11 rounded-lg text-[13px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#5b3fd1] text-white font-bold shadow-sm'
                                : 'bg-[#f7f1ff] hover:bg-[#ece4ff] text-[#484554] border border-[#e6deff]'
                            }`}
                          >
                            <span className="font-bold">{c}</span>
                            <span className="text-[10px] opacity-80">{symbols[c]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Designated Procurement Traveler */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                        Traveler Full Name
                      </label>
                      <input
                        type="text"
                        value={travelerName}
                        onChange={(e) => setTravelerName(e.target.value)}
                        required
                        className="w-full h-10 px-3 rounded-lg bg-[#f7f1ff] text-[#1d1833] border border-[#e6deff] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c9beff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1d1833] mb-1.5">
                        Traveler Email
                      </label>
                      <input
                        type="email"
                        value={travelerEmail}
                        onChange={(e) => setTravelerEmail(e.target.value)}
                        required
                        className="w-full h-10 px-3 rounded-lg bg-[#f7f1ff] text-[#1d1833] border border-[#e6deff] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#c9beff]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Card 2: Consensus Policy */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e6deff]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#f2ebff] flex items-center justify-center text-[#431fb9]">
                      <span className="material-symbols-outlined text-[18px]">how_to_vote</span>
                    </span>
                    <h2 className="text-base font-bold text-[#1d1833]">Approval Quorum Rule</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setConsensus('majority')}
                    className={`flex items-start p-3.5 rounded-xl cursor-pointer transition-all border ${
                      consensus === 'majority'
                        ? 'bg-[#f7f1ff] border-[#5b3fd1] shadow-sm'
                        : 'bg-white border-[#e6deff] hover:bg-[#f7f1ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consensus"
                      checked={consensus === 'majority'}
                      onChange={() => setConsensus('majority')}
                      className="mt-1 w-4 h-4 text-[#5b3fd1] accent-[#5b3fd1]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#1d1833]">
                          Majority Sign-off (Recommended)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#431fb9] font-bold">
                          {Math.max(1, Math.ceil(members.length * 0.6))} of {members.length} Quorum
                        </span>
                      </div>
                      <p className="text-[12px] text-[#484554] mt-1">
                        At least 60% of members must approve supplier invoices before payout.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setConsensus('unanimous')}
                    className={`flex items-start p-3.5 rounded-xl cursor-pointer transition-all border ${
                      consensus === 'unanimous'
                        ? 'bg-[#f7f1ff] border-[#5b3fd1] shadow-sm'
                        : 'bg-white border-[#e6deff] hover:bg-[#f7f1ff]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="consensus"
                      checked={consensus === 'unanimous'}
                      onChange={() => setConsensus('unanimous')}
                      className="mt-1 w-4 h-4 text-[#5b3fd1] accent-[#5b3fd1]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#1d1833]">
                          Unanimous Clearance (100%)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ebff] text-[#797586] font-semibold">
                          {members.length} of {members.length} Quorum
                        </span>
                      </div>
                      <p className="text-[12px] text-[#484554] mt-1">
                        Every member must approve each supplier invoice before funds are released.
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </>
          ) : (
            /* Step 2: Members & Orders Builder */
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6deff]">
                <div>
                  <h2 className="text-base font-bold text-[#1d1833]">Participating Members &amp; Orders</h2>
                  <p className="text-[11px] text-[#797586]">Each buyer contributes their budget into the shared pool.</p>
                </div>
                <button
                  type="button"
                  onClick={addMemberRow}
                  className="px-3 py-1.5 rounded-lg bg-[#f2ebff] hover:bg-[#e6deff] text-[#431fb9] text-[12px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Add Member</span>
                </button>
              </div>

              <div className="space-y-3">
                {members.map((m, idx) => (
                  <div key={idx} className="p-3.5 bg-[#fdf8ff] rounded-xl border border-[#e6deff] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b3fd1]">
                        Member #{idx + 1}
                      </span>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMemberRow(idx)}
                          className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer bg-transparent border-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={m.name}
                        onChange={(e) => updateMember(idx, 'name', e.target.value)}
                        required
                        className="h-9 px-3 rounded-lg bg-white border border-[#e6deff] text-[12px] text-[#1d1833]"
                      />
                      <input
                        type="email"
                        placeholder="Member Email"
                        value={m.email}
                        onChange={(e) => updateMember(idx, 'email', e.target.value)}
                        required
                        className="h-9 px-3 rounded-lg bg-white border border-[#e6deff] text-[12px] text-[#1d1833]"
                      />
                    </div>
                    <div className="grid grid-cols-12 gap-2.5">
                      <input
                        type="text"
                        placeholder="Item to buy (e.g. Phone Cases)"
                        value={m.item}
                        onChange={(e) => updateMember(idx, 'item', e.target.value)}
                        className="col-span-6 h-9 px-3 rounded-lg bg-white border border-[#e6deff] text-[12px] text-[#1d1833]"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={m.quantity}
                        onChange={(e) => updateMember(idx, 'quantity', Number(e.target.value))}
                        className="col-span-3 h-9 px-3 rounded-lg bg-white border border-[#e6deff] text-[12px] text-[#1d1833]"
                      />
                      <input
                        type="number"
                        min={1}
                        placeholder={`Budget (${currency})`}
                        value={m.contributionExpected}
                        onChange={(e) => updateMember(idx, 'contributionExpected', Number(e.target.value))}
                        required
                        className="col-span-3 h-9 px-3 rounded-lg bg-white border border-[#e6deff] text-[12px] font-semibold text-[#1d1833]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => (step === 2 ? setStep(1) : onNavigate('dashboard'))}
              className="px-5 py-2.5 rounded-xl bg-[#ece4ff] hover:bg-[#e6deff] text-[#484554] text-[13px] font-semibold transition-all cursor-pointer"
            >
              {step === 2 ? '← Back to Trip Setup' : 'Cancel'}
            </button>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (!groupName.trim()) {
                    setFormError('Please enter a Group Trip Title before continuing.');
                    return;
                  }
                  setFormError(null);
                  setStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] text-white text-[13px] font-bold shadow-md transition-all cursor-pointer"
              >
                Continue to Members &amp; Orders →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#5b3fd1] hover:bg-[#431fb9] disabled:opacity-60 text-white text-[13px] font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                )}
                <span>{isSubmitting ? 'Creating Trip Pool...' : 'Create Trip Pool'}</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-[#e6deff] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e6deff]">
            <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
            <span className="font-bold text-[13px] text-[#1d1833]">Trip Pool Summary</span>
          </div>

          <div>
            <span className="text-[11px] text-[#797586] uppercase tracking-wider block">Trip Title</span>
            <span className="text-base font-bold text-[#1d1833]">
              {groupName.trim() || 'Untitled Buying Trip'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff]">
              <span className="text-[#797586] block text-[10px] uppercase">Base Currency</span>
              <span className="font-bold text-[#1d1833]">{currency}</span>
            </div>
            <div className="p-3 bg-[#f7f1ff] rounded-xl border border-[#e6deff]">
              <span className="text-[#797586] block text-[10px] uppercase">Approval Quorum</span>
              <span className="font-bold text-[#1d1833]">
                {approvalThreshold} of {members.length} votes
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-[#f2ebff] rounded-xl border border-[#e6deff] space-y-1">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#484554]">Total Target Pool:</span>
              <span className="font-bold text-[#431fb9] text-base">
                {currency} {totalTarget.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[#484554]">
              {members.length} participating members · Traveler: {travelerName || 'Not set'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
