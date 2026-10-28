import React, { useState, useEffect } from 'react';
import { Navbar, AppView } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardView } from './components/dashboard/DashboardView';
import { KnowYourCaseView } from './components/know-your-case/KnowYourCaseView';
import { ManageYourCaseView } from './components/manage-your-case/ManageYourCaseView';
import { SavedCasesView } from './components/saved-cases/SavedCasesView';
import { LegalAidDirectoryView } from './components/legal-aid/LegalAidDirectoryView';
import { LawLibraryView } from './components/law-library/LawLibraryView';
import { SettingsView } from './components/settings/SettingsView';
import { CaseRecord } from './types/legal';
import { caseStore } from './lib/db/caseStore';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(undefined);

  // Load cases from caseStore on mount
  useEffect(() => {
    refreshCases();
  }, []);

  const refreshCases = () => {
    const list = caseStore.getCases();
    setCases(list);
    if (!activeCaseId && list.length > 0) {
      setActiveCaseId(list[0].id);
    }
  };

  const handleSelectCase = (caseId: string, targetView: 'know-your-case' | 'manage-your-case') => {
    setActiveCaseId(caseId);
    setCurrentView(targetView);
  };

  const handleLoadDemoCase = (caseId: string) => {
    setActiveCaseId(caseId);
    setCurrentView('know-your-case');
  };

  const handleCaseCreatedOrUpdated = (updatedCase: CaseRecord) => {
    setActiveCaseId(updatedCase.id);
    refreshCases();
  };

  const activeCase = cases.find((c) => c.id === activeCaseId);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        caseCount={cases.length}
      />

      <main className="flex-1">
        {currentView === 'dashboard' && (
          <DashboardView
            cases={cases}
            onNavigate={(view) => setCurrentView(view)}
            onSelectCase={handleSelectCase}
            onLoadDemoCase={handleLoadDemoCase}
          />
        )}

        {currentView === 'know-your-case' && (
          <KnowYourCaseView
            caseRecord={activeCase}
            onCaseCreatedOrUpdated={handleCaseCreatedOrUpdated}
            onNavigateToManage={(caseId) => {
              setActiveCaseId(caseId);
              setCurrentView('manage-your-case');
            }}
          />
        )}

        {currentView === 'manage-your-case' && (
          <ManageYourCaseView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(id) => setActiveCaseId(id)}
            onCaseUpdated={handleCaseCreatedOrUpdated}
          />
        )}

        {currentView === 'saved-cases' && (
          <SavedCasesView
            cases={cases}
            onSelectCase={handleSelectCase}
            onNavigate={(view) => setCurrentView(view)}
            onRefreshCases={refreshCases}
          />
        )}

        {currentView === 'legal-aid' && <LegalAidDirectoryView />}

        {currentView === 'law-library' && <LawLibraryView />}

        {currentView === 'settings' && (
          <SettingsView cases={cases} onRefreshCases={refreshCases} />
        )}
      </main>

      <Footer />
    </div>
  );
}
