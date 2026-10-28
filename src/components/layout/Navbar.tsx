import React from 'react';
import { Scale, BookOpen, FolderOpen, LifeBuoy, FileText, ShieldAlert, Library, Settings } from 'lucide-react';

export type AppView =
  | 'dashboard'
  | 'know-your-case'
  | 'manage-your-case'
  | 'saved-cases'
  | 'legal-aid'
  | 'law-library'
  | 'settings';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  caseCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, caseCount }) => {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      {/* Top emergency & regulatory compliance bar */}
      <div className="bg-neutral-900 text-white text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-neutral-300">National Legal Aid Helpline:</span>
          <a href="tel:15100" className="font-bold text-white hover:underline">
            15100 (24x7 Toll-Free)
          </a>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-300">Cyber Fraud:</span>
          <a href="tel:1930" className="font-bold text-amber-300 hover:underline">
            1930
          </a>
        </div>
        <div className="flex items-center space-x-3 text-neutral-400">
          <span>Informational Legal Tech Platform (India)</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300">DPDP Act Compliant</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2.5 text-left focus:outline-none group"
              aria-label="Nyaya Home"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
                  न्याय <span className="text-blue-600">Nyaya</span>
                </span>
                <span className="text-[11px] text-neutral-500 block -mt-0.5 tracking-wide uppercase font-medium">
                  Legal Case Intelligence
                </span>
              </div>
            </button>
          </div>

          {/* Primary Action Buttons: The Two Core Pillars */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => onNavigate('know-your-case')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                currentView === 'know-your-case'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Know Your Case</span>
            </button>

            <button
              onClick={() => onNavigate('manage-your-case')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                currentView === 'manage-your-case'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Manage Your Case</span>
            </button>
          </div>

          {/* Secondary Nav & Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => onNavigate('saved-cases')}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                currentView === 'saved-cases' ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              title={`Saved Cases (${caseCount})`}
              aria-label={`Saved Cases (${caseCount})`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Cases ({caseCount})</span>
            </button>

            <button
              onClick={() => onNavigate('legal-aid')}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                currentView === 'legal-aid' ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              title="Legal Aid Directory"
              aria-label="Legal Aid Directory"
            >
              <LifeBuoy className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Legal Aid</span>
            </button>

            <button
              onClick={() => onNavigate('law-library')}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                currentView === 'law-library' ? 'bg-neutral-200 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              title="Statutes & Transition"
              aria-label="Statutes"
            >
              <Library className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Statutes</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition ${
                currentView === 'settings' ? 'bg-neutral-200 text-neutral-900' : ''
              }`}
              title="Settings & Privacy"
              aria-label="Settings and Privacy"
            >
              <Settings className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
