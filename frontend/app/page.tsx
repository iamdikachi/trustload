'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Group, CombinedOrderItem, Member, ReleaseRequest } from './types';
import { api } from './lib/api';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { Metrics } from './components/Metrics';
import { TripOrdersTab } from './components/Tabs/TripOrdersTab';
import { FundingTab } from './components/Tabs/FundingTab';
import { ReleasesTab } from './components/Tabs/ReleasesTab';
import { AllocationTab } from './components/Tabs/AllocationTab';
import { SettlementTab } from './components/Tabs/SettlementTab';
import { LedgerTab } from './components/Tabs/LedgerTab';
import { CreateGroupModal } from './components/Modals/CreateGroupModal';
import { SubmitReleaseModal } from './components/Modals/SubmitReleaseModal';
import { AiReportModal } from './components/Modals/AiReportModal';
import { PayPalMockModal } from './components/Modals/PayPalMockModal';
import { AddMemberModal } from './components/Modals/AddMemberModal';
import { AddOrderModal } from './components/Modals/AddOrderModal';
import { UploadReceiptModal } from './components/Modals/UploadReceiptModal';
import {
  FileTextIcon,
  PayPalIcon,
  SparklesIcon,
  ReceiptIcon,
  ShieldIcon,
  CoinsIcon,
} from './components/Icons';

type TabKey = 'orders' | 'funding' | 'releases' | 'allocations' | 'settlement' | 'ledger';
type ViewMode = 'LANDING' | 'APP';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('LANDING');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [combinedOrders, setCombinedOrders] = useState<CombinedOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabKey>('orders');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persona State
  const [activePersona, setActivePersona] = useState<{
    role: 'TRAVELER' | 'VENDOR' | 'AUDITOR';
    memberId?: string;
    name: string;
  }>({
    role: 'TRAVELER',
    name: 'Chidi Okonkwo (Traveler)',
  });

  // Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isSubmitReleaseOpen, setIsSubmitReleaseOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [selectedReleaseForReport, setSelectedReleaseForReport] =
    useState<ReleaseRequest | null>(null);
  const [isPayPalMockOpen, setIsPayPalMockOpen] = useState(false);
  const [payPalMember, setPayPalMember] = useState<Member | null>(null);
  const [payPalAmount, setPayPalAmount] = useState<number>(500);
  const [payPalOrderId, setPayPalOrderId] = useState<string>('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [orderTargetMember, setOrderTargetMember] = useState<Member | null>(null);
  const [isUploadReceiptOpen, setIsUploadReceiptOpen] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  // Fetch full group details
  const refreshGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      const groupData = await api.getGroupById(groupId);
      setSelectedGroup(groupData);

      // fetch combined orders
      try {
        const ordersData = await api.getCombinedOrders(groupId);
        setCombinedOrders(ordersData.items || []);
      } catch (e) {
        console.warn('Could not fetch combined orders', e);
      }
    } catch (err) {
      console.error('Error fetching group data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: fetch list of groups
  useEffect(() => {
    async function loadInitial() {
      try {
        setIsLoading(true);
        const allGroups = await api.getGroups();
        setGroups(allGroups);
        if (allGroups.length > 0) {
          const targetId = allGroups[0].id;
          setSelectedGroupId(targetId);
          await refreshGroup(targetId);
        }
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, [refreshGroup]);

  // Handle group change
  const handleSelectGroup = async (id: string) => {
    setSelectedGroupId(id);
    await refreshGroup(id);
  };

  // Group creation
  const handleCreateGroup = async (data: any) => {
    const newGroup = await api.createGroup(data);
    const all = await api.getGroups();
    setGroups(all);
    setSelectedGroupId(newGroup.id);
    await refreshGroup(newGroup.id);
    showToast(`Buying trip "${newGroup.name}" created successfully!`);
  };

  // Add Member
  const handleAddMember = async (data: any) => {
    if (!selectedGroup) return;
    await api.addMemberToGroup(selectedGroup.id, data);
    await refreshGroup(selectedGroup.id);
    showToast(`Added vendor "${data.name}" with contribution target $${data.contributionExpected}!`);
  };

  // Add Order line
  const handleAddOrder = async (memberId: string, orders: any[]) => {
    if (!selectedGroup) return;
    await api.addMemberOrders(selectedGroup.id, memberId, orders);
    await refreshGroup(selectedGroup.id);
    showToast(`Added ${orders.length} order items!`);
  };

  // Initiate PayPal sandbox payment
  const handleInitiatePayPal = async (member: Member, amount: number) => {
    if (!selectedGroup) return;
    try {
      const res = await api.createContributionOrder(
        selectedGroup.id,
        member.id,
        amount
      );
      setPayPalMember(member);
      setPayPalAmount(amount);
      setPayPalOrderId(res.orderId || `PAYPAL-ORD-SBX-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsPayPalMockOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not initiate PayPal contribution');
    }
  };

  // Confirm PayPal capture
  const handleConfirmPayPalCapture = async (orderId: string) => {
    if (!selectedGroup) return;
    await api.captureContributionOrder(orderId);
    await refreshGroup(selectedGroup.id);
    showToast(`PayPal payment captured! Added to live ledger.`);
  };

  // Submit staged release request
  const handleSubmitRelease = async (formData: FormData) => {
    if (!selectedGroup) return;
    await api.createReleaseRequest(selectedGroup.id, formData);
    await refreshGroup(selectedGroup.id);
    showToast('Invoice submitted and AI verification triggered!');
  };

  // Approve or Reject Release
  const handleApproveRelease = async (
    releaseId: string,
    memberId: string,
    decision: 'APPROVED' | 'REJECTED'
  ) => {
    if (!selectedGroup) return;
    try {
      const res = await api.submitApproval(releaseId, {
        memberId,
        decision,
        comment: decision === 'APPROVED' ? 'Vendor verified and approved' : 'Discrepancy noted',
      });
      await refreshGroup(selectedGroup.id);
      showToast(
        decision === 'APPROVED'
          ? `Approval recorded! (${res.approvalCount}/${res.approvalThreshold} threshold met)`
          : 'Rejection recorded.'
      );
    } catch (err) {
      console.error(err);
      alert('Failed to submit approval vote');
    }
  };

  // Trigger PayPal Payout
  const handleTriggerPayout = async (releaseId: string) => {
    if (!selectedGroup) return;
    try {
      await api.triggerPayout(releaseId);
      await refreshGroup(selectedGroup.id);
      showToast('Staged PayPal Payout released to Traveler!');
    } catch (err) {
      console.error(err);
      alert('Failed to trigger payout');
    }
  };

  // Upload trip receipt
  const handleUploadReceipt = async (formData: FormData) => {
    if (!selectedGroup) return;
    await api.uploadReceipt(selectedGroup.id, formData);
    await refreshGroup(selectedGroup.id);
    showToast('Receipt uploaded and extracted!');
  };

  // Run AI allocation
  const handleRunAiAllocation = async () => {
    if (!selectedGroup) return;
    setIsAllocating(true);
    try {
      await api.allocateReceipts(selectedGroup.id, {
        rule: selectedGroup.sharedCostRule,
      });
      await refreshGroup(selectedGroup.id);
      showToast('AI per-vendor cost allocation completed!');
    } catch (err) {
      console.error(err);
      alert('Failed to calculate allocation');
    } finally {
      setIsAllocating(false);
    }
  };

  // Execute Final Settlement
  const handleExecuteSettlement = async () => {
    if (!selectedGroup) return;
    setIsSettling(true);
    try {
      await api.settleGroup(selectedGroup.id);
      await refreshGroup(selectedGroup.id);
      showToast('Group settled! PayPal refunds dispatched and ledger closed.');
    } catch (err) {
      console.error(err);
      alert('Failed to settle group');
    } finally {
      setIsSettling(false);
    }
  };

  const tabs: Array<{ id: TabKey; label: string; icon: React.ReactNode; badge?: string | number }> = [
    {
      id: 'orders',
      label: 'Trip & Orders',
      icon: <FileTextIcon className="w-4 h-4" />,
      badge: combinedOrders.length,
    },
    {
      id: 'funding',
      label: 'PayPal Pot',
      icon: <PayPalIcon className="w-4 h-4" />,
      badge: `${selectedGroup?.members?.length || 0} Vendors`,
    },
    {
      id: 'releases',
      label: 'Staged Releases & AI Checks',
      icon: <SparklesIcon className="w-4 h-4" />,
      badge: selectedGroup?.pendingReleaseRequests?.length ? `${selectedGroup.pendingReleaseRequests.length} Pending` : undefined,
    },
    {
      id: 'allocations',
      label: 'Receipts & AI Split',
      icon: <ReceiptIcon className="w-4 h-4" />,
      badge: selectedGroup?.receipts?.length || undefined,
    },
    {
      id: 'settlement',
      label: 'Settlement & Refunds',
      icon: <CoinsIcon className="w-4 h-4" />,
      badge: selectedGroup?.status === 'CLOSED' ? 'Closed' : undefined,
    },
    {
      id: 'ledger',
      label: 'Audited Ledger',
      icon: <ShieldIcon className="w-4 h-4" />,
      badge: selectedGroup?.ledgerEntries?.length || undefined,
    },
  ];

  if (viewMode === 'LANDING') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setViewMode('APP')}
          onStartGroup={() => {
            setViewMode('APP');
            setIsCreateGroupOpen(true);
          }}
        />
        {/* Quick App Switcher Float */}
        <div className="fixed bottom-4 left-4 z-50">
          <button
            type="button"
            onClick={() => setViewMode('APP')}
            className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2 rounded-full shadow-2xl border border-zinc-700 font-bold text-xs hover:scale-105 transition-all cursor-pointer"
          >
            <ShieldIcon className="w-4 h-4 text-purple-400" />
            <span>Open Interactive App Dashboard →</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2.5 rounded-xl shadow-xl border border-zinc-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <SparklesIcon className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back to Landing Banner */}
      <div className="bg-[#582be8] text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <span className="font-medium">
          TrustLoad Interactive Dashboard — Live PayPal Sandbox & AI Protocol
        </span>
        <button
          type="button"
          onClick={() => setViewMode('LANDING')}
          className="font-bold underline hover:text-purple-200 cursor-pointer"
        >
          ← Return to Landing Page
        </button>
      </div>

      {/* Main App Header */}
      <Header
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        onRefresh={() => selectedGroupId && refreshGroup(selectedGroupId)}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onGoToLanding={() => setViewMode('LANDING')}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {selectedGroup ? (
          <>
            {/* Summary Metrics Cards */}
            <Metrics group={selectedGroup} />

            {/* Navigation Tabs Bar */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 flex overflow-x-auto gap-2 text-xs font-semibold no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 rounded-t-lg'
                        : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="pt-2">
              {activeTab === 'orders' && (
                <TripOrdersTab
                  group={selectedGroup}
                  combinedOrders={combinedOrders}
                  onOpenAddMember={() => setIsAddMemberOpen(true)}
                  onOpenAddOrder={(member) => {
                    setOrderTargetMember(member);
                    setIsAddOrderOpen(true);
                  }}
                />
              )}

              {activeTab === 'funding' && (
                <FundingTab
                  group={selectedGroup}
                  onInitiatePayPalContribution={handleInitiatePayPal}
                />
              )}

              {activeTab === 'releases' && (
                <ReleasesTab
                  group={selectedGroup}
                  activePersona={activePersona}
                  onOpenSubmitRelease={() => setIsSubmitReleaseOpen(true)}
                  onOpenAiReport={(release) => {
                    setSelectedReleaseForReport(release);
                    setIsAiReportOpen(true);
                  }}
                  onApproveRelease={handleApproveRelease}
                  onTriggerPayout={handleTriggerPayout}
                />
              )}

              {activeTab === 'allocations' && (
                <AllocationTab
                  group={selectedGroup}
                  onOpenUploadReceipt={() => setIsUploadReceiptOpen(true)}
                  onRunAiAllocation={handleRunAiAllocation}
                  isAllocating={isAllocating}
                />
              )}

              {activeTab === 'settlement' && (
                <SettlementTab
                  group={selectedGroup}
                  onExecuteSettlement={handleExecuteSettlement}
                  isSettling={isSettling}
                />
              )}

              {activeTab === 'ledger' && <LedgerTab group={selectedGroup} />}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <ShieldIcon className="w-12 h-12 text-purple-600 mx-auto" />
            <h2 className="text-xl font-bold">No Buying Groups Available</h2>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Create your first pooled buying trip abroad to start collecting PayPal contributions and verifying invoices with AI.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow"
            >
              Create First Trip Group
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      {selectedGroup && (
        <SubmitReleaseModal
          isOpen={isSubmitReleaseOpen}
          group={selectedGroup}
          onClose={() => setIsSubmitReleaseOpen(false)}
          onSubmit={handleSubmitRelease}
        />
      )}

      <AiReportModal
        release={selectedReleaseForReport}
        onClose={() => {
          setIsAiReportOpen(false);
          setSelectedReleaseForReport(null);
        }}
      />

      <PayPalMockModal
        isOpen={isPayPalMockOpen}
        member={payPalMember}
        amount={payPalAmount}
        orderId={payPalOrderId}
        onClose={() => setIsPayPalMockOpen(false)}
        onConfirmCapture={handleConfirmPayPalCapture}
      />

      {selectedGroup && (
        <AddMemberModal
          isOpen={isAddMemberOpen}
          group={selectedGroup}
          onClose={() => setIsAddMemberOpen(false)}
          onAddMember={handleAddMember}
        />
      )}

      <AddOrderModal
        isOpen={isAddOrderOpen}
        member={orderTargetMember}
        onClose={() => {
          setIsAddOrderOpen(false);
          setOrderTargetMember(null);
        }}
        onAddOrder={handleAddOrder}
      />

      {selectedGroup && (
        <UploadReceiptModal
          isOpen={isUploadReceiptOpen}
          group={selectedGroup}
          onClose={() => setIsUploadReceiptOpen(false)}
          onUpload={handleUploadReceipt}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">
          TrustLoad — Transparent group money for pooled buying trips abroad.
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">
          Built for the PayPal AI Hackathon 2026. Pool money. Buy together. Everyone sees every naira.
        </p>
      </footer>
    </div>
  );
}
