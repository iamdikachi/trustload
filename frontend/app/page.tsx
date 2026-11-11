'use client';

import React, { useState } from 'react';
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  const handleApproveRelease = async () => {
    setIsReleaseApproved(true);
    showToast('Release request approved! Consensus reached (3 of 3). Payout sent via PayPal Sandbox.');
  };

  const handleSettleGroup = async () => {
    showToast('Final settlement executed! PayPal refunds dispatched and escrow ledger closed.');
  };

  const handleCreateGroup = (data: any) => {
    showToast(`Escrow Pool "${data.name}" launched successfully!`);
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
        {/* Top Announcement Bar */}
        <div className="bg-[#431fb9] text-white text-[11px] py-1.5 px-4 sm:px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PayPal AI Hackathon 2026 — Luminous Ledger Multi-Party Escrow Protocol</span>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('LANDING')}
            className="font-bold underline hover:text-[#d6cdff] cursor-pointer"
          >
            ← Return to Landing Page
          </button>
        </div>

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
            <LedgerScreen onNavigate={setCurrentScreen} />
          )}

          {currentScreen === 'final-split' && (
            <FinalSplitScreen
              onNavigate={setCurrentScreen}
              onSettleGroup={handleSettleGroup}
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
            />
          )}

          {currentScreen === 'review-approve' && (
            <ReviewApproveScreen
              onNavigate={setCurrentScreen}
              isApproved={isReleaseApproved}
              onApproveRelease={handleApproveRelease}
            />
          )}

          {currentScreen === 'pay-contribution' && (
            <PayContributionScreen
              onNavigate={setCurrentScreen}
              onConfirmPayment={handleConfirmPayment}
            />
          )}
        </main>
      </div>
    </div>
  );
}
