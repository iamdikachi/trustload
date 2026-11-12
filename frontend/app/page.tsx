'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';
import { Group, ReleaseRequest, LedgerEntry } from './types';
import { LandingPage } from './components/LandingPage';
import { StitchSidebar } from './components/stitch/StitchSidebar';
import { StitchTopBar } from './components/stitch/StitchTopBar';
import { ScreenPath } from './components/stitch/StitchHeader';
import { DashboardScreen } from './components/stitch/DashboardScreen';
import { LedgerScreen } from './components/stitch/LedgerScreen';
import { FinalSplitScreen } from './components/stitch/FinalSplitScreen';
import { CreateGroupScreen } from './components/stitch/CreateGroupScreen';
import { NewReleaseScreen } from './components/stitch/NewReleaseScreen';
import { ReviewApproveScreen } from './components/stitch/ReviewApproveScreen';
import { PayContributionScreen } from './components/stitch/PayContributionScreen';

type ViewMode = 'LANDING' | 'APP';
type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('LANDING');
  const [currentScreen, setCurrentScreen] = useState<ScreenPath>('dashboard');
  const [activePersonaRole, setActivePersonaRole] = useState<'TRAVELER' | 'VENDOR' | 'AUDITOR'>('TRAVELER');
  const [isReleaseApproved, setIsReleaseApproved] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Live Backend & PostgreSQL State
  const [liveGroups, setLiveGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [liveReleaseRequests, setLiveReleaseRequests] = useState<ReleaseRequest[]>([]);
  const [liveLedger, setLiveLedger] = useState<{ potBalance: number; entries: LedgerEntry[] } | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  }, []);

  const fetchLiveBackend = useCallback(async (preferredGroupId?: string) => {
    try {
      setIsSyncing(true);
      const groups = await api.getGroups();
      if (groups && Array.isArray(groups) && groups.length > 0) {
        setLiveGroups(groups);
        setIsLiveConnected(true);
        const activeId = preferredGroupId || selectedGroupId || groups[0].id;
        setSelectedGroupId(activeId);

        try {
          const [requests, ledger] = await Promise.all([
            api.getReleaseRequests(activeId).catch(() => []),
            api.getGroupLedger(activeId).catch(() => null),
          ]);
          setLiveReleaseRequests(Array.isArray(requests) ? requests : []);
          if (ledger) setLiveLedger(ledger);
        } catch {
          // ignore sub-resource errors
        }
      } else {
        setLiveGroups([]);
        setIsLiveConnected(true);
      }
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    fetchLiveBackend();
  }, [fetchLiveBackend]);

  // Deep linking & handling redirect returns (e.g. from PayPal)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const screen = params.get('screen') as ScreenPath | null;
      const paid = params.get('paid');
      const groupIdParam = params.get('groupId');

      if (view === 'app' || screen) {
        setViewMode('APP');
      }
      if (screen) {
        setCurrentScreen(screen);
      }
      if (groupIdParam) {
        setSelectedGroupId(groupIdParam);
      }
      if (paid === 'true') {
        showToast('Payment confirmed! Vault & ledger updated.', 'success');
        fetchLiveBackend(groupIdParam || undefined);
      }
    }
  }, [fetchLiveBackend, showToast]);

  const activeGroup =
    liveGroups.find((g) => g.id === selectedGroupId) ||
    (liveGroups.length > 0 ? liveGroups[0] : null);

  const handleSelectGroup = useCallback(
    (groupId: string) => {
      setSelectedGroupId(groupId);
      setIsReleaseApproved(false);
      fetchLiveBackend(groupId);
      setCurrentScreen('dashboard');
    },
    [fetchLiveBackend]
  );

  const handleApproveRelease = async (releaseRequestId?: string) => {
    const targetId = releaseRequestId || liveReleaseRequests?.[0]?.id;
    const memberId = activeGroup?.members?.[0]?.id;

    if (!targetId || !memberId) {
      showToast('No pending release request or member available to vote.', 'error');
      return;
    }

    try {
      const res = await api.submitApproval(targetId, {
        memberId,
        decision: 'APPROVED',
        comment: 'Consensus verified via TrustLoad dashboard.',
      });
      if (res.isThresholdMet) {
        setIsReleaseApproved(true);
        showToast(`Consensus reached (${res.approvalCount}/${res.approvalThreshold})! Payout triggered.`, 'success');
      } else {
        showToast(`Vote recorded (${res.approvalCount}/${res.approvalThreshold} approvals).`, 'success');
      }
      await fetchLiveBackend(activeGroup?.id);
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit approval vote.', 'error');
    }
  };

  const handleSettleGroup = async () => {
    if (!activeGroup?.id) {
      showToast('No active group selected.', 'error');
      return;
    }
    try {
      await api.settleGroup(activeGroup.id);
      showToast('Settlement executed! Residuals refunded and pool closed.', 'success');
      await fetchLiveBackend(activeGroup.id);
    } catch (err: any) {
      showToast(err?.message || 'Failed to settle group.', 'error');
    }
  };

  const handleCreateGroup = async (data: {
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
  }) => {
    try {
      const created = await api.createGroup({
        name: data.name,
        travelerName: data.travelerName,
        travelerEmail: data.travelerEmail,
        approvalThreshold: data.approvalThreshold,
        sharedCostRule: 'PROPORTIONAL_TO_VALUE',
        baseCurrency: data.baseCurrency || 'USD',
        members: data.members,
      });
      showToast(`Trip pool "${created.name}" created!`, 'success');
      setSelectedGroupId(created.id);
      await fetchLiveBackend(created.id);
      setCurrentScreen('dashboard');
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Could not create trip pool. Please check backend connection.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleSubmitRelease = async (data: any) => {
    showToast(`Purchase claim for ${data.vendorName} uploaded for AI check & group consensus.`, 'success');
    await fetchLiveBackend(activeGroup?.id);
  };

  const handleConfirmPayment = async () => {
    showToast('Contribution recorded in the group vault!', 'success');
    await fetchLiveBackend(activeGroup?.id);
  };

  // Dynamic Sidebar Counts from Real Data
  const membersList = activeGroup?.members || [];
  const paidCount = membersList.filter((m) => {
    const exp = Number(m.contributionExpected || 0);
    const paid = (m.contributions || [])
      .filter((c) => c.status === 'COMPLETED')
      .reduce((s, c) => s + Number(c.amount || 0), 0);
    return exp > 0 ? paid >= exp : paid > 0;
  }).length;

  const pendingReviewsCount = (
    liveReleaseRequests.length > 0
      ? liveReleaseRequests
      : activeGroup?.pendingReleaseRequests || []
  ).filter(
    (r) =>
      r.status === 'AWAITING_APPROVAL' ||
      r.status === 'PENDING_VERIFICATION' ||
      r.status === 'PENDING'
  ).length;

  const ledgerCount =
    liveLedger?.entries?.length ??
    activeGroup?.ledgerEntries?.length ??
    undefined;

  if (viewMode === 'LANDING') {
    return (
      <LandingPage
        onEnterApp={() => {
          setCurrentScreen('dashboard');
          setViewMode('APP');
        }}
        onStartGroup={() => {
          setCurrentScreen('create-group');
          setViewMode('APP');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8ff] text-[#1d1833] flex font-sans selection:bg-[#5b3fd1] selection:text-white">
      {/* Real Top Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] px-4 py-3 rounded-xl shadow-xl border text-[13px] font-semibold flex items-center justify-between gap-3 transition-all duration-200 ${
            toast.type === 'error'
              ? 'bg-[#7f1d1d] text-white border-red-400/50'
              : toast.type === 'info'
              ? 'bg-[#1d1833] text-white border-[#7c5be8]/60'
              : 'bg-[#1d1833] text-white border-emerald-500/60'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`material-symbols-outlined text-[20px] shrink-0 ${
                toast.type === 'error'
                  ? 'text-red-300'
                  : toast.type === 'info'
                  ? 'text-[#c9beff]'
                  : 'text-[#86efac]'
              }`}
            >
              {toast.type === 'error'
                ? 'error'
                : toast.type === 'info'
                ? 'info'
                : 'check_circle'}
            </span>
            <span className="leading-snug">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-white/70 hover:text-white p-0.5 rounded-md cursor-pointer bg-transparent border-0 shrink-0"
            aria-label="Dismiss notification"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <StitchSidebar
        currentPath={currentScreen}
        onNavigate={setCurrentScreen}
        onGoToLanding={() => setViewMode('LANDING')}
        tripName={activeGroup?.name || 'No Active Trip'}
        travelerName={
          activeGroup?.traveler?.name
            ? `Traveler: ${activeGroup.traveler.name}`
            : 'Traveler'
        }
        quorumPolicy={
          activeGroup
            ? `${activeGroup.approvalThreshold} of ${membersList.length}`
            : '3 of 5'
        }
        groups={liveGroups}
        selectedGroupId={activeGroup?.id}
        onSelectGroup={handleSelectGroup}
        pendingReviewsCount={pendingReviewsCount}
        paidMembersLabel={membersList.length > 0 ? `${paidCount}/${membersList.length} paid` : undefined}
        ledgerCount={ledgerCount}
        activePersonaRole={activePersonaRole}
        onSwitchPersona={(role) => {
          setActivePersonaRole(role);
          showToast(`Switched active simulation role to: ${role}`, 'info');
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 lg:pl-72 transition-all">
        {/* Top Sticky Navigation Bar */}
        <StitchTopBar
          currentPath={currentScreen}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onGoToLanding={() => setViewMode('LANDING')}
          tripName={activeGroup?.name || 'TrustLoad'}
        />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              onNavigate={setCurrentScreen}
              isReleaseApproved={isReleaseApproved}
              onApproveRelease={handleApproveRelease}
              group={activeGroup}
              releaseRequests={liveReleaseRequests}
              isLoading={isSyncing && !activeGroup}
              onRefresh={() => fetchLiveBackend(activeGroup?.id)}
              onNotify={showToast}
            />
          )}

          {currentScreen === 'ledger' && (
            <LedgerScreen
              onNavigate={setCurrentScreen}
              groupId={activeGroup?.id}
              liveLedger={liveLedger}
            />
          )}

          {currentScreen === 'final-split' && (
            <FinalSplitScreen
              onNavigate={setCurrentScreen}
              onSettleGroup={handleSettleGroup}
              groupId={activeGroup?.id}
            />
          )}

          {currentScreen === 'create-group' && (
            <CreateGroupScreen
              onNavigate={setCurrentScreen}
              onCreateGroup={handleCreateGroup}
            />
          )}

          {currentScreen === 'new-release' && (
            <NewReleaseScreen
              onNavigate={setCurrentScreen}
              onSubmitRelease={handleSubmitRelease}
              groupId={activeGroup?.id}
              groupName={activeGroup?.name}
              travelerName={activeGroup?.traveler?.name}
              potBalance={activeGroup?.summary?.potBalance ?? 0}
              baseCurrency={activeGroup?.baseCurrency || 'USD'}
            />
          )}

          {currentScreen === 'review-approve' && (
            <ReviewApproveScreen
              onNavigate={setCurrentScreen}
              isApproved={isReleaseApproved}
              onApproveRelease={handleApproveRelease}
              releaseRequestId={liveReleaseRequests?.[0]?.id}
              memberId={activeGroup?.members?.[0]?.id}
            />
          )}

          {currentScreen === 'pay-contribution' && (
            <PayContributionScreen
              onNavigate={setCurrentScreen}
              onConfirmPayment={handleConfirmPayment}
              groupId={activeGroup?.id}
              memberId={activeGroup?.members?.[0]?.id}
              group={activeGroup}
              onNotify={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
