'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ScreenPath } from './StitchHeader';
import { api } from '../../lib/api';

interface StitchTopBarProps {
  currentPath: ScreenPath;
  onOpenMobileSidebar: () => void;
  onGoToLanding?: () => void;
  tripName?: string;
}

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  ratePerUsd: number;
  inversePerUnit: string;
  marketNote: string;
}

const FX_RATES: CurrencyRate[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    ratePerUsd: 1500,
    inversePerUnit: '$0.00067',
    marketNote: 'Central Bank of Nigeria / P2P Average',
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    flag: '🇦🇪',
    ratePerUsd: 3.67,
    inversePerUnit: '$0.2724',
    marketNote: 'Pegged Official Rate (Dubai wholesale)',
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    flag: '🇨🇳',
    ratePerUsd: 7.20,
    inversePerUnit: '$0.1389',
    marketNote: 'PBOC Interbank / Yiwu & Guangzhou market',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    ratePerUsd: 0.79,
    inversePerUnit: '$1.2658',
    marketNote: 'Bank of England Reference Rate',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    ratePerUsd: 0.92,
    inversePerUnit: '$1.0870',
    marketNote: 'European Central Bank (ECB) Reference',
  },
];

interface NotificationItem {
  id: string;
  type: 'WARNING' | 'AI_FLAG' | 'SUCCESS' | 'INFO';
  icon: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

export function StitchTopBar({
  currentPath,
  onOpenMobileSidebar,
  tripName = 'Phone accessories, Dubai run',
}: StitchTopBarProps) {
  const [fxList, setFxList] = useState<CurrencyRate[]>(FX_RATES);
  const [isLiveFx, setIsLiveFx] = useState(false);
  const [isFxOpen, setIsFxOpen] = useState(false);
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0);
  const [calcUsdAmount, setCalcUsdAmount] = useState('100');
  const fxDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getFxRates('USD')
      .then((res: any) => {
        if (res && res.rates) {
          setIsLiveFx(true);
          const rateMap: Record<string, number> = {};
          if (Array.isArray(res.rates)) {
            res.rates.forEach((r: any) => {
              rateMap[r.currency] = r.unitsPerBase || (1 / r.fxRate);
            });
          } else {
            Object.assign(rateMap, res.rates);
          }
          setFxList((prev) =>
            prev.map((item) => {
              const liveVal = rateMap[item.code];
              if (liveVal) {
                return {
                  ...item,
                  ratePerUsd: Math.round(liveVal * 100) / 100,
                  inversePerUnit: `$${(1 / liveVal).toFixed(4)}`,
                  marketNote: `Live Spot Rate (Backend /fx-rates)`,
                };
              }
              return item;
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  // Slide-over Notifications Drawer State
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'WARNING',
      icon: 'fact_check',
      title: 'Review Required: Dubai Gadget Wholesale',
      desc: 'AED 6,100 ($1,661.12 USD) release request from traveler Chidi O. awaiting your consensus vote.',
      time: '12m ago',
      unread: true,
    },
    {
      id: '2',
      type: 'AI_FLAG',
      icon: 'auto_awesome',
      title: 'AI Audit Flag on Invoice AL-029',
      desc: 'Multimodal OCR detected quantity mismatch (600 vs 500 ordered) & line items total discrepancy (AED 6,340 vs 6,100).',
      time: '45m ago',
      unread: true,
    },
    {
      id: '3',
      type: 'SUCCESS',
      icon: 'payments',
      title: 'PayPal Deposit Confirmed',
      desc: 'Ibrahim deposited $1,000 share into the group vault. 4 of 5 member pledges fulfilled.',
      time: '2h ago',
      unread: true,
    },
    {
      id: '4',
      type: 'INFO',
      icon: 'currency_exchange',
      title: 'Live FX Rate Locked for Dubai Run',
      desc: 'Market exchange rate locked at 1 USD = 3.67 AED (fair market rate: $0.2724).',
      time: '4h ago',
      unread: false,
    },
  ]);

  // Load persisted notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trustload_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveNotifications = (newList: NotificationItem[]) => {
    setNotifications(newList);
    try {
      localStorage.setItem('trustload_notifications', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  const deleteNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const restoreDefaultNotifications = () => {
    const defaults: NotificationItem[] = [
      {
        id: '1',
        type: 'WARNING',
        icon: 'fact_check',
        title: 'Review Required: Dubai Gadget Wholesale',
        desc: 'AED 6,100 ($1,661.12 USD) release request from traveler Chidi O. awaiting your consensus vote.',
        time: '12m ago',
        unread: true,
      },
      {
        id: '2',
        type: 'AI_FLAG',
        icon: 'auto_awesome',
        title: 'AI Audit Flag on Invoice AL-029',
        desc: 'Multimodal OCR detected quantity mismatch (600 vs 500 ordered) & line items total discrepancy (AED 6,340 vs 6,100).',
        time: '45m ago',
        unread: true,
      },
      {
        id: '3',
        type: 'SUCCESS',
        icon: 'payments',
        title: 'PayPal Deposit Confirmed',
        desc: 'Ibrahim deposited $1,000 share into the group vault. 4 of 5 member pledges fulfilled.',
        time: '2h ago',
        unread: true,
      },
      {
        id: '4',
        type: 'INFO',
        icon: 'currency_exchange',
        title: 'Live FX Rate Locked for Dubai Run',
        desc: 'Market exchange rate locked at 1 USD = 3.67 AED (fair market rate: $0.2724).',
        time: '4h ago',
        unread: false,
      },
    ];
    saveNotifications(defaults);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const titles: Record<ScreenPath, string> = {
    dashboard: 'Trip Overview',
    'review-approve': 'Purchases & Invoices',
    'pay-contribution': 'Pool Contributions',
    ledger: 'Transaction Ledger',
    'final-split': 'Final Settlement',
    'create-group': 'Start New Trip Pool',
    'new-release': 'Upload Purchase Invoice',
  };

  // Close FX dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        fxDropdownRef.current &&
        !fxDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeRate = fxList[selectedCurrencyIndex] || fxList[0];
  const numAmount = parseFloat(calcUsdAmount) || 0;
  const convertedTotal = (numAmount * activeRate.ratePerUsd).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e6deff] shadow-[0_1px_6px_rgba(42,27,99,0.03)]">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="md:hidden p-2 rounded-lg text-[#1d1833] hover:bg-[#f2ebff] transition-colors cursor-pointer border-0 bg-transparent"
              title="Open Sidebar Menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Bricolage_Grotesque',sans-serif] text-base sm:text-lg font-bold text-[#1d1833] tracking-tight">
                  {titles[currentPath] || 'TrustLoad'}
                </h1>
              </div>
              <p className="text-[11px] text-[#484554] hidden sm:block">
                {tripName}
              </p>
            </div>
          </div>

          {/* Right: FX Conversion Rate Dropdown & Notifications */}
          <div className="flex items-center gap-3">
            {/* FX Conversion Rate Dropdown */}
            <div className="relative" ref={fxDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFxOpen(!isFxOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f7f1ff] hover:bg-[#ece4ff] border border-[#e6deff] text-[12px] text-[#1d1833] transition-all cursor-pointer shadow-xs border-0"
                title="Live FX Conversion Rates"
              >
                <div className="w-5 h-5 rounded-full bg-[#5b3fd1] flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[13px]">currency_exchange</span>
                </div>
                <span className="text-[#797586] font-medium text-[11px]">FX:</span>
                <span className="font-semibold text-[#15803d]">
                  1 USD = {activeRate.symbol}
                  {activeRate.ratePerUsd.toLocaleString()} {activeRate.code}
                </span>
                <span
                  className={`material-symbols-outlined text-[16px] text-[#797586] transition-transform duration-200 ${
                    isFxOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* FX Dropdown Popover */}
              {isFxOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#e6deff] shadow-[0_16px_48px_rgba(91,63,209,0.18)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6deff]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#f2ebff] text-[#5b3fd1] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                      </div>
                      <div>
                        <h4 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[14px] text-[#1d1833]">
                          Conversion Rates
                        </h4>
                        <p className="text-[10px] text-[#797586]">Base currency: 1.00 USD ($)</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                      Live FX
                    </span>
                  </div>

                  {/* Conversion Rates List */}
                  <div className="py-2.5 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-[#797586] px-1 pb-0.5">
                      Select Display Rate
                    </div>
                    {fxList.map((curr, idx) => {
                      const isSelected = selectedCurrencyIndex === idx;
                      return (
                        <div
                          key={curr.code}
                          onClick={() => setSelectedCurrencyIndex(idx)}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#f7f1ff] border-[#5b3fd1] shadow-xs'
                              : 'hover:bg-[#fbf9fe] border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base select-none">{curr.flag}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[13px] text-[#1d1833]">{curr.code}</span>
                                <span className="text-[11px] text-[#797586]">{curr.name}</span>
                              </div>
                              <div className="text-[10px] text-[#797586]">
                                1 {curr.code} = {curr.inversePerUnit} USD
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-[13px] text-[#15803d] font-mono">
                              {curr.symbol}
                              {curr.ratePerUsd.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-[#5b3fd1] font-semibold">
                              {isSelected ? '✓ Active' : 'Switch'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Instant Converter Tool */}
                  <div className="mt-2 pt-3 border-t border-[#e6deff] bg-[#fdf8ff] -mx-4 -mb-4 p-4 rounded-b-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#1d1833] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#5b3fd1]">calculate</span>
                        Instant Estimator
                      </span>
                      <span className="text-[10px] text-[#797586]">
                        Target: {activeRate.flag} {activeRate.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2 text-[12px] font-bold text-[#797586]">$</span>
                        <input
                          type="number"
                          min="1"
                          value={calcUsdAmount}
                          onChange={(e) => setCalcUsdAmount(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-white border border-[#e6deff] text-[12px] font-bold text-[#1d1833] focus:outline-none focus:ring-1 focus:ring-[#5b3fd1]"
                          placeholder="USD amount"
                        />
                      </div>
                      <span className="text-[12px] font-bold text-[#797586]">→</span>
                      <div className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#e6deff] text-[12px] font-bold text-[#15803d] truncate font-mono text-right">
                        {activeRate.symbol} {convertedTotal}
                      </div>
                    </div>

                    <p className="text-[10px] text-[#797586] leading-tight pt-1">
                      Rates are locked per release receipt and recorded on the group ledger.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell Button */}
            <button
              type="button"
              onClick={() => setIsNotificationsDrawerOpen(true)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#484554] hover:bg-[#f2ebff] hover:text-[#1d1833] transition-colors cursor-pointer border border-[#e6deff] bg-[#fdf8ff]"
              title="Open Notifications Panel"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Notifications Drawer (Slides from the RIGHT side) */}
      <div
        className={`fixed inset-0 z-50 transition-visibility duration-300 ${
          isNotificationsDrawerOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
            isNotificationsDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsNotificationsDrawerOpen(false)}
        />

        {/* Drawer panel sliding in from the right */}
        <aside
          className={`fixed top-0 bottom-0 right-0 w-full sm:w-[420px] max-w-full bg-white border-l border-[#e6deff] shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out ${
            isNotificationsDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="h-16 px-5 border-b border-[#e6deff] flex items-center justify-between bg-[#fdf8ff]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f2ebff] text-[#5b3fd1] flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">notifications</span>
              </div>
              <div>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[16px] text-[#1d1833]">
                  Notifications &amp; Activity
                </h3>
                <p className="text-[11px] text-[#797586]">
                  {notifications.length === 0
                    ? 'All caught up'
                    : unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
                    : `${notifications.length} update${notifications.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-[#5b3fd1] hover:underline cursor-pointer bg-transparent border-0"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-[11px] font-semibold text-[#ba1a1a] hover:underline cursor-pointer bg-transparent border-0 flex items-center gap-0.5"
                  title="Delete all notifications"
                >
                  <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                  <span>Clear all</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsNotificationsDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#797586] hover:bg-[#f2ebff] hover:text-[#1d1833] transition-colors cursor-pointer border-0 bg-transparent"
                title="Close drawer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Drawer Body / Activity List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#797586]">
                Recent Updates
              </span>
              {notifications.length > 0 && (
                <span className="text-[10px] text-[#797586] font-medium">
                  {notifications.length} item{notifications.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#f2ebff] text-[#5b3fd1] flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[28px]">notifications_off</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[15px] text-[#1d1833]">No Notifications</h4>
                  <p className="text-[12px] text-[#797586] max-w-[260px] leading-relaxed mx-auto">
                    You have cleared all activity alerts. New updates will appear here automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={restoreDefaultNotifications}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2ebff] text-[#5b3fd1] hover:bg-[#e6deff] text-[12px] font-semibold transition-colors cursor-pointer border border-[#e6deff]"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  <span>Restore Demo Alerts</span>
                </button>
              </div>
            ) : (
              notifications.map((item) => {
                let badgeBg = 'bg-[#f2ebff] text-[#5b3fd1]';
                if (item.type === 'WARNING') badgeBg = 'bg-[#fef3c7] text-[#b45309]';
                if (item.type === 'SUCCESS') badgeBg = 'bg-[#dcfce7] text-[#15803d]';
                if (item.type === 'INFO') badgeBg = 'bg-[#eff6ff] text-[#2563eb]';

                return (
                  <div
                    key={item.id}
                    className={`group relative p-3.5 rounded-xl transition-all border ${
                      item.unread
                        ? 'bg-[#fdf8ff] border-[#e6deff] shadow-xs'
                        : 'bg-white border-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${badgeBg}`}
                      >
                        <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-[13px] text-[#1d1833] leading-snug">
                            {item.title}
                          </h4>
                          {item.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#5b3fd1] shrink-0" title="Unread" />
                          )}
                        </div>
                        <p className="text-[12px] text-[#484554] leading-relaxed mt-1">
                          {item.desc}
                        </p>
                        <div className="flex items-center justify-between mt-2.5 pt-1 text-[11px] text-[#797586]">
                          <span className="font-medium">{item.time}</span>
                          <button
                            type="button"
                            onClick={(e) => deleteNotification(item.id, e)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#797586] hover:text-[#ba1a1a] transition-colors cursor-pointer border-0 bg-transparent font-medium"
                            title="Delete this notification"
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Dismiss / Delete cross on top right */}
                    <button
                      type="button"
                      onClick={(e) => deleteNotification(item.id, e)}
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center text-[#797586] hover:text-[#ba1a1a] hover:bg-[#fee2e2] opacity-60 hover:opacity-100 transition-all cursor-pointer border-0 bg-transparent"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <span className="material-symbols-outlined text-[15px]">close</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[#e6deff] bg-[#f7f1ff] flex items-center justify-between text-[11px] text-[#797586]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ledger Active
            </span>
            <button
              type="button"
              onClick={() => setIsNotificationsDrawerOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#e6deff] text-[#1d1833] font-semibold hover:bg-[#f2ebff] cursor-pointer text-[11px] transition-colors"
            >
              Close panel
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
