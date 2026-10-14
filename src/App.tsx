import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, CivicIssue } from './types/issue';
import { getStoredIssues, resetToDemoData } from './services/storageService';
import { ToastProvider, useToast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ReportIssue } from './components/ReportIssue';
import { MapView } from './components/MapView';
import { ManageIssues } from './components/ManageIssues';
import { Analytics } from './components/Analytics';
import { IssueDetailModal } from './components/IssueDetailModal';
import { GeminiSettingsModal } from './components/GeminiSettingsModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [issues, setIssues] = useState<CivicIssue[]>(getStoredIssues());
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [highlightMapIssueId, setHighlightMapIssueId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { showToast } = useToast();

  // Sync state whenever storage changes
  const refreshIssues = useCallback(() => {
    setIssues(getStoredIssues());
  }, []);

  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshIssues();
    };
    window.addEventListener('civicpulse_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('civicpulse_storage_updated', handleStorageUpdate);
    };
  }, [refreshIssues]);

  // Keep selected issue in sync if updated
  useEffect(() => {
    if (selectedIssue) {
      const current = issues.find((i) => i.id === selectedIssue.id);
      if (current) {
        setSelectedIssue(current);
      }
    }
  }, [issues, selectedIssue]);

  const handleResetDemo = () => {
    const resetList = resetToDemoData();
    setIssues(resetList);
    showToast({
      title: 'Demo Dataset Reset',
      message: 'Restored authentic sample issues for potholes, garbage, blocked drains, and water leaks.',
      type: 'info'
    });
  };

  const handleReportCreated = (newIssue: CivicIssue) => {
    refreshIssues();
    setSelectedIssue(newIssue);
    setActiveTab('dashboard');
  };

  const handleSelectOnMap = (issue: CivicIssue) => {
    setHighlightMapIssueId(issue.id);
    setActiveTab('map');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setHighlightMapIssueId(undefined);
        }}
        issues={issues}
        onResetDemo={handleResetDemo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onResetDemo={handleResetDemo}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (activeTab !== 'manage' && q.trim().length > 0) {
              setActiveTab('manage');
            }
          }}
        />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              issues={issues}
              setActiveTab={setActiveTab}
              onSelectIssue={(issue) => setSelectedIssue(issue)}
            />
          )}

          {activeTab === 'report' && (
            <ReportIssue
              existingIssues={issues}
              onReportCreated={handleReportCreated}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'map' && (
            <div className="h-[calc(100vh-140px)] w-full">
              <MapView
                issues={issues}
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                highlightIssueId={highlightMapIssueId}
              />
            </div>
          )}

          {activeTab === 'manage' && (
            <ManageIssues
              issues={issues}
              onSelectIssue={(issue) => setSelectedIssue(issue)}
              onRefresh={refreshIssues}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'analytics' && <Analytics issues={issues} />}
        </main>
      </div>

      {/* Issue Detail & Audit Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={refreshIssues}
        onSelectOnMap={handleSelectOnMap}
      />

      {/* Gemini AI Settings Dialog */}
      <GeminiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={refreshIssues}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
