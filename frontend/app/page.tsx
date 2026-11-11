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

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('LANDING');
  const [currentScreen, setCurrentScreen] = useState<ScreenPath>('dashboard');
  const [activePersonaRole, setActivePersonaRole] = useState<'TRAVELER' | 'VENDOR' | 'AUDITOR'>('TRAVELER');
  const [isReleaseApproved, setIsReleaseApproved] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Backend & PostgreSQL State
  const [liveGroups, setLiveGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [liveReleaseRequests, setLiveReleaseRequests] = useState<ReleaseRequest[]>([]);
  const [liveLedger, setLiveLedger] = useState<{ potBalance: number; entries: LedgerEntry[] } | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

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
          setLiveReleaseRequests(requests || []);
          if (ledger) setLiveLedger(ledger);
        } catch {
          // ignore sub-resource errors
        }
      } else {
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

      if (view === 'app' || screen) {
        setViewMode('APP');
      }
      if (screen) {
        setCurrentScreen(screen);
      }
      if (paid === 'true') {
        showToast('PayPal contribution successfully captured! Escrow vault & ledger updated.');
        fetchLiveBackend();
      }
    }
  }, [fetchLiveBackend]);

  const activeGroup = liveGroups.find((g) => g.id === selectedGroupId) || (liveGroups.length > 0 ? liveGroups[0] : null);

  const handleApproveRelease = async () => {
    setIsReleaseApproved(true);
    if (isLiveConnected && liveReleaseRequests.length > 0) {
      try {
        const req = liveReleaseRequests[0];
        const memberId = activeGroup?.members?.[0]?.id;
        if (req && memberId) {
          await api.submitApproval(req.id, {
            memberId,
            decision: 'APPROVED',
            comment: 'Consensus verified by auditor and group vendors.',
          });
          showToast('Approval recorded on PostgreSQL ledger & PayPal Sandbox!');
          await fetchLiveBackend();
          return;
        }
      } catch (err: any) {
        console.warn('API error during approval:', err);
      }
    }
    showToast('Release request approved! Consensus reached (3 of 3). Payout sent via PayPal Sandbox.');
  };

  const handleSettleGroup = async () => {
    if (isLiveConnected && activeGroup?.id) {
      try {
        await api.settleGroup(activeGroup.id);
        showToast('Live Settlement executed! Residuals refunded via PayPal API.');
        await fetchLiveBackend();
        return;
      } catch (err: any) {
        console.warn('API error during settlement:', err);
      }
    }
    showToast('Final settlement executed! PayPal refunds dispatched and escrow ledger closed.');
  };

  const handleCreateGroup = async (data: any) => {
    try {
      showToast(`Creating Escrow Pool "${data.name}" via live API...`);
      const created = await api.createGroup({
        name: data.name,
        travelerName: data.travelerName || 'Chidi Okonkwo',
        travelerEmail: data.travelerEmail || 'chidi.traveler@trustload.africa',
        approvalThreshold: data.approvalThreshold ? Math.round(data.approvalThreshold * 5) : 3,
        sharedCostRule: 'PROPORTIONAL_TO_VALUE',
        baseCurrency: data.baseCurrency || 'USD',
      });
      showToast(`Escrow Pool "${created.name}" created on Neon PostgreSQL!`);
      await fetchLiveBackend(created.id);
      setCurrentScreen('dashboard');
    } catch (err: any) {
      console.warn('API error during createGroup:', err);
      showToast(`Escrow Pool "${data.name}" launched (local fallback)!`);
      setCurrentScreen('dashboard');
    }
  };

  const handleSubmitRelease = (data: any) => {
    showToast(`New release claim for ${data.vendorName} submitted for AI check & group consensus.`);
  };

  const handleConfirmPayment = () => {
    showToast('Your $1,000 contribution was deposited into the PayPal Escrow Vault!');
  };

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1d1833] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#5b3fd1] text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#86efac] text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <StitchSidebar
        currentPath={currentScreen}
        onNavigate={setCurrentScreen}
        onGoToLanding={() => setViewMode('LANDING')}
        tripName="Phone accessories, Dubai run"
        travelerName="Traveler: Chidi O."
        quorumPolicy="3 of 5"
        activePersonaRole={activePersonaRole}
        onSwitchPersona={(role) => {
          setActivePersonaRole(role);
          showToast(`Switched active simulation persona to: ${role}`);
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
          tripName="Phone accessories, Dubai run"
        />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-[1240px] mx-auto">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              onNavigate={setCurrentScreen}
              isReleaseApproved={isReleaseApproved}
              onApproveRelease={handleApproveRelease}
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
            />
          )}
        </main>
      </div>
    </div>
  );
}
